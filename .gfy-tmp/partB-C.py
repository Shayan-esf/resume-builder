import json, glob
from pathlib import Path

root = Path(r"D:\code\resume bulder")
out = root / "graphify-out"

# --- B3: merge chunk files ---
chunks = sorted(glob.glob(str(out / ".graphify_chunk_*.json")))
nodes, edges, hyper = [], [], []
tin = tout = 0
for c in chunks:
    d = json.loads(Path(c).read_text(encoding="utf-8"))
    assert isinstance(d.get("nodes"), list) and isinstance(d.get("edges"), list), c
    nodes += d.get("nodes", [])
    edges += d.get("edges", [])
    hyper += d.get("hyperedges", [])
    tin += d.get("input_tokens", 0)
    tout += d.get("output_tokens", 0)
sem = {"nodes": nodes, "edges": edges, "hyperedges": hyper,
       "input_tokens": tin, "output_tokens": tout}
(out / ".graphify_semantic.json").write_text(json.dumps(sem, indent=2, ensure_ascii=False), encoding="utf-8")
print(f"chunks merged: {len(chunks)} -> {len(nodes)} nodes, {len(edges)} edges, {len(hyper)} hyperedges")

ids = {n["id"] for n in nodes}
dangling = [e for e in edges if e["source"] not in ids or e["target"] not in ids]
print("semantic dangling edges:", len(dangling))
for e in dangling[:5]:
    print("   ", e["source"], "->", e["target"])

# --- Part C: merge AST + semantic ---
ast = json.loads((out / ".graphify_ast.json").read_text(encoding="utf-8"))
seen = {n["id"] for n in ast["nodes"]}
merged_nodes = list(ast["nodes"])
dup = 0
for n in sem["nodes"]:
    if n["id"] not in seen:
        merged_nodes.append(n)
        seen.add(n["id"])
    else:
        dup += 1
extract = {
    "nodes": merged_nodes,
    "edges": ast["edges"] + sem["edges"],
    "hyperedges": sem.get("hyperedges", []),
    "input_tokens": sem.get("input_tokens", 0),
    "output_tokens": sem.get("output_tokens", 0),
}
(out / ".graphify_extract.json").write_text(json.dumps(extract, indent=2, ensure_ascii=False), encoding="utf-8")
print(f"Merged: {len(merged_nodes)} nodes, {len(extract['edges'])} edges "
      f"({len(ast['nodes'])} AST + {len(sem['nodes'])} semantic, {dup} id collisions dropped)")
