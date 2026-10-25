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

    class StudyCoachWidgetMiddleware(BaseHTTPMiddleware):
        async def dispatch(self, request, call_next):
            response = await call_next(request)
            content_type = response.headers.get("content-type", "")
            if response.status_code != 200 or "text/html" not in content_type:
                return response
            chunks = [chunk async for chunk in response.body_iterator]
            body = b"".join(chunks)
            script_tag = ("<script>" + study_script + "</script>").encode("utf-8")
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
