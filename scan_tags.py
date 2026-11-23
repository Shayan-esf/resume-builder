import io, re

files = ["src/types/tailoring.ts", "src/types/resume.ts", "src/utils/skillDisplay.ts"]
for p in files:
    s = io.open(p, encoding="utf-8").read()
    for mm in re.finditer(r"tags:\s*\[(.*?)\]", s, re.S):
        body = mm.group(1)
        bad = [(c, hex(ord(c))) for c in body if ord(c) > 127 and c not in " \n\t"]
        if bad:
            print("BAD TAGS", p, bad, body.strip()[:90])

s = io.open("src/utils/skillDisplay.ts", encoding="utf-8").read()
for name in ["DEFAULT_CURATED_SKILLS", "SUPPLEMENTARY_ATS_KEYWORDS", "AI_WORKFLOW_ATS_KEYWORDS"]:
    i = s.find(name)
    if i == -1:
        continue
    chunk = s[i:i + 6000]
    bad = sorted({c for c in chunk if ord(c) > 127 and c not in " \n\t"})
    print(name, "non-ascii chars:", [(c, hex(ord(c))) for c in bad][:20])

t = io.open("src/components/ExecutiveTwoPageTemplate.tsx", encoding="utf-8").read()
suspicious = sorted({c for c in t if 0x0600 <= ord(c) <= 0x06FF or 0x0900 <= ord(c) <= 0x097F or ord(c) in (0x200B, 0x200E, 0x200F, 0xFEFF)})
print("exec template suspicious chars:", [(c, hex(ord(c))) for c in suspicious])
print("OK scan done")
