import os, sys, json
from pathlib import Path

root = Path(r"D:\code\resume bulder")
out = root / "graphify-out"
out.mkdir(exist_ok=True)
(out / ".graphify_python").write_text(sys.executable, encoding="utf-8")
(out / ".graphify_root").write_text(os.path.abspath(root), encoding="utf-8")

import graphify
from graphify.detect import detect

res = detect(root)
(out / ".graphify_detect.json").write_text(json.dumps(res, ensure_ascii=False), encoding="utf-8")

print("graphify", getattr(graphify, "__version__", "?"), "| py", sys.version.split()[0])
print("total_files", res.get("total_files"), "| total_words", res.get("total_words"))
print("scan_root", res.get("scan_root"))
for k, v in (res.get("files") or {}).items():
    print(f"  {k}: {len(v)}")
print("skipped_sensitive:", len(res.get("skipped_sensitive") or []))
