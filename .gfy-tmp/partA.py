import json
from pathlib import Path

root = Path(r"D:\code\resume bulder")
out = root / "graphify-out"

from graphify.extract import collect_files, extract

detect = json.loads((out / ".graphify_detect.json").read_text(encoding="utf-8"))
code_files = []
for f in detect.get("files", {}).get("code", []):
    p = Path(f)
    code_files.extend(collect_files(p) if p.is_dir() else [p])

print("code files:", len(code_files))
result = extract(code_files, cache_root=root)
(out / ".graphify_ast.json").write_text(
    json.dumps(result, indent=2, ensure_ascii=False), encoding="utf-8"
)
print(f"AST: {len(result['nodes'])} nodes, {len(result['edges'])} edges")
