from pathlib import Path
import re

candidates = [Path("edutrack/frontend/index.html"), Path("frontend/index.html")]
page = next((p for p in candidates if p.is_file()), None)
if page is None:
    raise SystemExit("EduTrack frontend/index.html not found after ZIP extraction")

html = page.read_text(encoding="utf-8")
if 'name="viewport"' not in html.lower():
    tag = '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">'
    html = re.sub(r"</head\s*>", tag + "\n</head>", html, count=1, flags=re.I) if re.search(r"</head\s*>", html, re.I) else tag + "\n" + html

marker = "EDUTRACK_MOBILE_COMPATIBILITY_PATCH"
if marker not in html:
    css = """
<style>
/* EDUTRACK_MOBILE_COMPATIBILITY_PATCH */
html { -webkit-text-size-adjust: 100%; text-size-adjust: 100%; }
*, *::before, *::after { box-sizing: border-box; }
body { min-width: 0; max-width: 100%; }
img, video, canvas, svg { max-width: 100%; }
input, select, textarea, button { max-width: 100%; font: inherit; }
pre, code { overflow-wrap: anywhere; }
@media (max-width: 768px) {
  html, body { width: 100%; min-height: 100%; overflow-x: clip; }
  body { margin-left: 0; margin-right: 0; }
  main, section, article, header, footer, nav, form, .container, .content, .page,
  .app, .app-container, .main-content, .dashboard, .dashboard-content, .auth-container {
    min-width: 0; max-width: 100%;
  }
  .container, .content, .page, .app-container, .main-content, .dashboard-content, .auth-container {
    width: 100%; margin-left: auto; margin-right: auto;
  }
  [style*="grid-template-columns"] { grid-template-columns: minmax(0, 1fr) !important; }
  table { max-width: 100%; }
  .table-container, .table-responsive, [class*="table-wrap"] { max-width: 100%; overflow-x: auto; }
  input, select, textarea { min-width: 0; }
  button { touch-action: manipulation; }
}
</style>
"""
    html = re.sub(r"</head\s*>", css + "\n</head>", html, count=1, flags=re.I) if re.search(r"</head\s*>", html, re.I) else html + "\n" + css
page.write_text(html, encoding="utf-8")
print("Applied EduTrack mobile compatibility patch")
