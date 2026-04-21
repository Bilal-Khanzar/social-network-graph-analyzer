const API = "http://127.0.0.1:8000/api";

async function loadGraph() {
    const res = await fetch(`${API}/graph/stats`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
            nodes: ["A", "B", "C"],
            edges: [
                {source: "A", target: "B", weight: 1},
                {source: "B", target: "C", weight: 1}
            ]
        })
    });

    const data = await res.json();
    document.getElementById("output").innerText =
        "Graph Stats:\n" + JSON.stringify(data, null, 2);
}

async function checkIso() {
    const res = await fetch(`${API}/analysis/isomorphism`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
            graph_a: {
                nodes: ["A", "B", "C"],
                edges: [{source: "A", target: "B"}, {source: "B", target: "C"}]
            },
            graph_b: {
                nodes: ["1", "2", "3"],
                edges: [{source: "1", target: "2"}, {source: "2", target: "3"}]
            }
        })
    });

    const data = await res.json();
    document.getElementById("output").innerText =
        "Isomorphism:\n" + JSON.stringify(data, null, 2);
}

async function findAnomalies() {
    const res = await fetch(`${API}/analysis/anomaly`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
            nodes: ["A", "B", "C", "D"],
            edges: [
                {source: "A", target: "B"},
                {source: "B", target: "C"},
                {source: "C", target: "A"},
                {source: "D", target: "A"} // anomaly
            ]
        })
    });

    const data = await res.json();
    document.getElementById("output").innerText =
        "Anomalies:\n" + JSON.stringify(data, null, 2);
}