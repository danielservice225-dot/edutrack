import ast
import pathlib
import sys
import uvicorn

ROOT = pathlib.Path(__file__).resolve().parent
candidates = []
for path in ROOT.rglob("*.py"):
    if ".git" in path.parts or "site-packages" in path.parts:
        continue
    try:
        tree = ast.parse(path.read_text(encoding="utf-8"))
    except (OSError, SyntaxError, UnicodeDecodeError):
        continue
    for node in ast.walk(tree):
        if isinstance(node, (ast.Assign, ast.AnnAssign)):
            value = node.value
            if not isinstance(value, ast.Call):
                continue
            fn = value.func
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
    raise RuntimeError("Aucune instance FastAPI = FastAPI(...) trouvée dans les fichiers Python extraits.")

_, path, variable = sorted(candidates, key=lambda item: (item[0], len(item[1].parts)))[0]
package_root = path.parent
while package_root != ROOT and (package_root / "__init__.py").exists():
    package_root = package_root.parent
sys.path.insert(0, str(package_root))
module = ".".join(path.relative_to(package_root).with_suffix("").parts)
print(f"EduTrack: lancement de {module}:{variable}", flush=True)
uvicorn.run(f"{module}:{variable}", host="0.0.0.0", port=int(__import__("os").environ.get("PORT", "10000")))
