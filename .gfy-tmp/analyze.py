import json
from pathlib import Path
from collections import Counter

root = Path(r"D:\code\resume bulder")
res = json.loads((root / "graphify-out" / ".graphify_detect.json").read_text(encoding="utf-8"))
scan_root = Path(res["scan_root"])

buckets = Counter()
words = Counter()
by_cat = {}
for cat, files in (res.get("files") or {}).items():
    by_cat[cat] = Counter()
    for f in files:
        p = Path(f)
        try:
            rel = p.relative_to(scan_root)
        except ValueError:
            rel = p
        parts = rel.parts
        top = parts[0] if len(parts) > 1 else "(root)"
        if top == "graphify-out":
            continue
        buckets[top] += 1
        by_cat[cat][top] += 1

print("TOP-LEVEL (excluding graphify-out):")
for name, n in buckets.most_common(15):
    detail = ", ".join(f"{c}={by_cat[c][name]}" for c in by_cat if by_cat[c][name])
    print(f"  {name:28s} {n:5d}   ({detail})")

print("\nskipped_sensitive:")
for s in (res.get("skipped_sensitive") or []):
    print("  ", s)

# extensions for code/docs
exts = Counter()
for cat in ("code", "document", "paper"):
    for f in (res.get("files") or {}).get(cat, []):
        exts[Path(f).suffix.lower()] += 1
print("\nexts:", dict(exts.most_common(20)))
