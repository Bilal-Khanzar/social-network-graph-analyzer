const API = "http://localhost:8000/api";

async function sendRequest(endpoint, body) {
    const output = document.getElementById("output");
    output.innerText = "İstek gönderiliyor...";
    
    try {
        const res = await fetch(`${API}${endpoint}`, {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(body)
        });
        const data = await res.json();
        output.innerText = JSON.stringify(data, null, 2);
    } catch (error) {
        output.innerText = "Hata: Backend'e bağlanılamadı! \n" + error;
    }
}

function loadGraph() {
    sendRequest("/graph/stats", {
        nodes: ["Ali", "Veli", "Ayşe"],
        edges: [{source: "Ali", target: "Veli", weight: 1}, {source: "Veli", target: "Ayşe", weight: 1}]
    });
}

function checkIso() {
    sendRequest("/analysis/isomorphism", {
        graph_a: {
            nodes: ["Ali", "Veli", "Ayşe"],
            edges: [{source: "Ali", target: "Veli"}, {source: "Veli", target: "Ayşe"}]
        },
        graph_b: {
            nodes: ["Dugum1", "Dugum2", "Dugum3"],
            edges: [{source: "Dugum1", target: "Dugum2"}, {source: "Dugum2", target: "Dugum3"}]
        }
    });
}

function findAnomalies() {
    sendRequest("/analysis/anomaly", {
        name: "Test Agi",
        nodes: ["A", "B", "C", "D", "E"],
        edges: [
            {source: "A", target: "B"}, {source: "B", target: "C"}, 
            {source: "C", target: "A"}, {source: "D", target: "A"},
            {source: "E", target: "A"}
        ]
    });
}