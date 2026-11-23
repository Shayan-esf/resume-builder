import sys, glob, os
from pypdf import PdfReader

files = sys.argv[1:]
for f in files:
    try:
        r = PdfReader(f)
    except Exception as e:
        print(f"\n=== {os.path.basename(f)} ===\n  ERROR {e}")
        continue
    print(f"\n=== {os.path.basename(f)}  ({os.path.getsize(f)/1024/1024:.2f} MB) ===")
    print(f"  pages: {len(r.pages)}  producer: {r.metadata.get('/Producer') if r.metadata else None}")
    p0 = r.pages[0]
    mb = p0.mediabox
    print(f"  page1 size: {float(mb.width)/72*25.4:.0f} x {float(mb.height)/72*25.4:.0f} mm")
    total_txt = 0
    for i, p in enumerate(r.pages):
        res = p.get("/Resources") or {}
        fonts = res.get("/Font") or {}
        xo = res.get("/XObject") or {}
        imgs = [k for k in xo.keys() if (xo[k].get_object().get("/Subtype") == "/Image")]
        t = p.extract_text() or ""
        total_txt += len(t.strip())
        print(f"   p{i+1}: fonts={len(fonts)} images={len(imgs)} textchars={len(t.strip())}")
        if i == 0:
            print("   sample:", repr(t[:200]))
    print(f"  TOTAL text chars: {total_txt}")
