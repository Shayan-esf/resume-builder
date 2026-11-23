import os, sys, json
from pathlib import Path

root = Path(r"D:\code\resume bulder")
out = root / "graphify-out"
out.mkdir(exist_ok=True)
(out / ".graphify_python").write_text(sys.executable, encoding="utf-8")
(out / ".graphify_root").write_text(os.path.abspath(root), encoding="utf-8")

from graphify.detect import detect

EXCLUDES = ["tmp-chrome-profile/", ".gfy-tmp/"]
res = detect(root, extra_excludes=EXCLUDES)
(out / ".graphify_detect.json").write_text(json.dumps(res, ensure_ascii=False), encoding="utf-8")

print("total_files", res.get("total_files"), "| total_words", res.get("total_words"))
for k, v in (res.get("files") or {}).items():
    print(f"  {k}: {len(v)}")
print("skipped_sensitive:", len(res.get("skipped_sensitive") or []))
print()
for cat in ("document", "paper", "image", "video"):
    for f in (res.get("files") or {}).get(cat, []):
        p = Path(f)
        sz = p.stat().st_size // 1024 if p.exists() else -1
        print(f"  {cat:9s} {sz:6d}KB  {p.relative_to(root)}")
