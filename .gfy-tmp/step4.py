import json
from pathlib import Path

ROOT = Path(r"D:\code\resume bulder")
OUT = ROOT / "graphify-out"
IS_DIRECTED = False


def main():
    from graphify.build import build_from_json
    from graphify.cluster import cluster, score_all
    from graphify.analyze import god_nodes, surprising_connections, suggest_questions
    from graphify.report import generate
    from graphify.export import to_json

    extraction = json.loads((OUT / ".graphify_extract.json").read_text(encoding="utf-8"))
    detection = json.loads((OUT / ".graphify_detect.json").read_text(encoding="utf-8"))

    G = build_from_json(extraction, root=str(ROOT), directed=IS_DIRECTED)
    if G.number_of_nodes() == 0:
        print("ERROR: Graph is empty - extraction produced no nodes.")
        raise SystemExit(1)

    communities = cluster(G)
    cohesion = score_all(G, communities)
    tokens = {"input": extraction.get("input_tokens", 0), "output": extraction.get("output_tokens", 0)}
    gods = god_nodes(G)
    surprises = surprising_connections(G, communities)
    labels = {cid: "Community " + str(cid) for cid in communities}
    questions = suggest_questions(G, communities, labels)

    wrote = to_json(G, communities, str(OUT / "graph.json"))
    if not wrote:
        print("ERROR: refused to shrink graph.json (#479).")
        raise SystemExit(1)

    report = generate(G, communities, cohesion, labels, gods, surprises, detection, tokens,
                      str(ROOT), suggested_questions=questions)
    (OUT / "GRAPH_REPORT.md").write_text(report, encoding="utf-8")
    analysis = {
        "communities": {str(k): v for k, v in communities.items()},
        "cohesion": {str(k): v for k, v in cohesion.items()},
        "gods": gods,
        "surprises": surprises,
        "questions": questions,
    }
    (OUT / ".graphify_analysis.json").write_text(json.dumps(analysis, indent=2, ensure_ascii=False), encoding="utf-8")
    print(f"Graph: {G.number_of_nodes()} nodes, {G.number_of_edges()} edges, {len(communities)} communities")


if __name__ == "__main__":
    main()
