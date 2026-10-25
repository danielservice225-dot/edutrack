import ast
import importlib.util
import os
import pathlib
import sys
import types
import uvicorn

ROOT = pathlib.Path(__file__).resolve().parent
candidates = []
for path in ROOT.rglob("*.py"):
    if ".git" in path.parts or ".venv" in path.parts or "site-packages" in path.parts:
        continue
    try:
        tree = ast.parse(path.read_text(encoding="utf-8"))
    except (OSError, SyntaxError, UnicodeDecodeError):
        continue
    for node in ast.walk(tree):
        if not isinstance(node, (ast.Assign, ast.AnnAssign)) or not isinstance(node.value, ast.Call):
            continue
        fn = node.value.func
        is_fastapi = (isinstance(fn, ast.Name) and fn.id == "FastAPI") or (
            isinstance(fn, ast.Attribute) and fn.attr == "FastAPI"
        )
        if not is_fastapi:
            continue
        targets = node.targets if isinstance(node, ast.Assign) else [node.target]
        for target in targets:
            if isinstance(target, ast.Name):
                candidates.append((0 if target.id in ("app", "application", "api") else 1, path, target.id))

if not candidates:
    raise RuntimeError("Aucune instance FastAPI = FastAPI(...) trouvée dans les fichiers Python.")

_, path, variable = sorted(candidates, key=lambda item: (item[0], len(item[1].parts)))[0]
package_name = "_edutrack_runtime"
package = types.ModuleType(package_name)
package.__path__ = [str(path.parent)]
package.__package__ = package_name
sys.modules[package_name] = package

spec = importlib.util.spec_from_file_location(
    f"{package_name}.main", path, submodule_search_locations=[str(path.parent)]
)
if spec is None or spec.loader is None:
    raise RuntimeError(f"Impossible de charger le backend depuis {path}")
module = importlib.util.module_from_spec(spec)
sys.modules[spec.name] = module
spec.loader.exec_module(module)

app = getattr(module, variable)

# Add the adaptive course tutor API and inject its responsive study widget into HTML pages.
sys.path.insert(0, str(ROOT))
from edutrack_features import router as study_router
app.include_router(study_router)

try:
    from starlette.middleware.base import BaseHTTPMiddleware
    from starlette.responses import Response

    study_script = (ROOT / "static" / "edutrack-study.js").read_text(encoding="utf-8")

    import base64
    import json
    import httpx

    class StudyCoachWidgetMiddleware(BaseHTTPMiddleware):
        async def dispatch(self, request, call_next):
            # Route the site's existing chat API to Groq instead of its built-in demo mode.
            if request.url.path == "/api/chat" and request.method == "POST":
                key = os.getenv("GROQ_API_KEY", "").strip()
                if not key:
                    return Response(
                        content=json.dumps({
                            "error": "L'IA réelle n'est pas encore activée : ajoute GROQ_API_KEY dans les variables d'environnement du service EduTrack sur Render.",
                            "detail": "Clé Groq manquante côté serveur."
                        }, ensure_ascii=False),
                        status_code=503,
                        media_type="application/json"
                    )
                try:
                    payload = await request.json()
                    incoming = payload.get("messages")
                    if isinstance(incoming, list) and incoming:
                        messages = [{"role": "system", "content": (
                            "Tu es EduTrack, un assistant scolaire polyvalent pour les élèves. "
                            "Réponds en français par défaut. Donne des réponses précises et bien structurées, adaptées au niveau indiqué. Commence par l'essentiel, puis organise l'explication en sections courtes. Pour une méthode, utilise des étapes numérotées; pour un calcul, montre la formule, les valeurs remplacées, le résultat et les unités. "
                            "aide en toutes matières, notamment mathématiques, français, sciences, "
                            "électronique et informatique. Explique clairement étape par étape, avec "
                            "exemples concrets et un bref résumé si utile. Si un cours est fourni, base-toi dessus. Évite les répétitions, les symboles décoratifs inutiles et les faits non vérifiés. Pour les exercices, "
                            "laisse l'élève essayer avant de donner la correction complète. Ne prétends "
                            "pas être en mode démo et n'invente pas de faits."
                        )}]
                        for item in incoming[-16:]:
                            if isinstance(item, dict) and item.get("role") in ("user", "assistant"):
                                content = item.get("content", item.get("message", ""))
                                if isinstance(content, str) and content.strip():
                                    messages.append({"role": item["role"], "content": content[:12000]})
                    else:
                        prompt = next((payload.get(k) for k in ("message", "prompt", "question", "text", "input") if isinstance(payload.get(k), str) and payload.get(k).strip()), "")
                        if not prompt:
                            prompt = json.dumps(payload, ensure_ascii=False)[:12000]
                        messages = [
                            {"role": "system", "content": (
                                "Tu es EduTrack, un assistant scolaire polyvalent. Réponds en français avec précision et une structure claire. Donne d'abord l'essentiel, puis des sections courtes et des étapes numérotées. Pour les calculs, montre la formule, les valeurs remplacées, le résultat et les unités. "
                                "adapte-toi au niveau de l'élève, explique étape par étape avec des exemples concrets. Évite les répétitions, les symboles décoratifs inutiles et les faits inventés. "
                                "Aide dans toutes les matières, y compris maths, français, sciences, électronique "
                                "et informatique. Pour un cours fourni, explique-le puis propose des exercices. "
                                "Pour un exercice, demande d'abord à l'élève d'essayer avant de donner la correction."
                            )},
                            {"role": "user", "content": prompt[:12000]}
                        ]
                    async with httpx.AsyncClient(timeout=50) as client:
                        upstream = await client.post(
                            "https://api.groq.com/openai/v1/chat/completions",
                            headers={"Authorization": "Bearer " + key, "Content-Type": "application/json"},
                            json={"model": os.getenv("GROQ_MODEL", "openai/gpt-oss-120b"), "messages": messages, "temperature": 0.4, "max_tokens": 1800}
                        )
                    if upstream.status_code >= 400:
                        return Response(
                            content=json.dumps({"error": "Le service IA a refusé la demande. Vérifie GROQ_API_KEY et GROQ_MODEL dans Render.", "detail": upstream.text[:500]}, ensure_ascii=False),
                            status_code=502,
                            media_type="application/json"
                        )
                    answer = upstream.json()["choices"][0]["message"]["content"]
                    return Response(
                        content=json.dumps({"response": answer, "answer": answer, "reply": answer, "message": answer, "content": answer}, ensure_ascii=False),
                        status_code=200,
                        media_type="application/json"
                    )
                except Exception as exc:
                    print(f"EduTrack Groq chat error: {exc}", flush=True)
                    return Response(
                        content=json.dumps({"error": "EduTrack ne parvient pas à joindre le service IA. Réessaie dans un instant."}, ensure_ascii=False),
                        status_code=502,
                        media_type="application/json"
                    )

            response = await call_next(request)
            content_type = response.headers.get("content-type", "")
            if response.status_code != 200 or "text/html" not in content_type:
                return response
            chunks = [chunk async for chunk in response.body_iterator]
            body = b"".join(chunks)
            script_tag = ("<script>" + study_script + "</script>").encode("utf-8")
            logo_path = ROOT / "static" / "edutrack-logo.svg"
            if logo_path.exists():
                logo_data = base64.b64encode(logo_path.read_bytes()).decode("ascii")
                logo_tag = (
                    '<a id="edutrack-brand-logo" href="/" aria-label="EduTrack accueil" '
                    'style="position:fixed;z-index:99990;top:10px;left:12px;display:flex;align-items:center;'
                    'background:rgba(255,255,255,.96);padding:4px 10px;border-radius:14px;'
                    'box-shadow:0 4px 20px rgba(15,23,42,.12);border:1px solid #e2e8f0">'
                    '<img alt="EduTrack" style="display:block;width:150px;max-width:38vw;height:auto" '
                    'src="data:image/svg+xml;base64,' + logo_data + '"></a>'
                ).encode("utf-8")
                body_open = body.lower().find(b"<body")
                body_open_end = body.find(b">", body_open) if body_open >= 0 else -1
                if body_open_end >= 0 and b'id="edutrack-brand-logo"' not in body:
                    body = body[:body_open_end + 1] + logo_tag + body[body_open_end + 1:]
            lower_body = body.lower()
            closing = lower_body.rfind(b"</body>")
            if closing >= 0:
                body = body[:closing] + script_tag + body[closing:]
            else:
                body += script_tag
            headers = dict(response.headers)
            for header in ("content-length", "content-encoding", "etag", "content-md5"):
                headers.pop(header, None)
            return Response(content=body, status_code=response.status_code, headers=headers, media_type="text/html")

    app.add_middleware(StudyCoachWidgetMiddleware)
    print("EduTrack: coach de révision et interface vocale activés", flush=True)
except Exception as exc:
    # Keep the academic platform available even if optional UI injection fails.
    print(f"EduTrack: widget d'étude non chargé: {exc}", flush=True)

print(f"EduTrack: backend chargé depuis {path} (objet {variable})", flush=True)
uvicorn.run(app, host="0.0.0.0", port=int(os.environ.get("PORT", "10000")))
