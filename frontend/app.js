const API = "http://localhost:8000/api";

const graph_A = {
    name: "Telefon Trafigi",
    nodes: ["Lider", "Kurye1", "Kurye2", "Satici", "Yabanci"],
    edges: [
        {source: "Lider", target: "Kurye1", weight: 5},
        {source: "Lider", target: "Kurye2", weight: 5},
        {source: "Kurye1", target: "Satici", weight: 2},
        {source: "Kurye2", target: "Satici", weight: 2},
        {source: "Yabanci", target: "Satici", weight: 1}
    ]
};

const graph_B = {
    name: "Maskeli Mesajlasma Agi",
    nodes: ["Dugum_101", "Dugum_102", "Dugum_103", "Dugum_104", "Dugum_105"],
    edges: [
        {source: "Dugum_101", target: "Dugum_102", weight: 3},
        {source: "Dugum_101", target: "Dugum_103", weight: 3},
        {source: "Dugum_102", target: "Dugum_104", weight: 1},
        {source: "Dugum_103", target: "Dugum_104", weight: 1},
        {source: "Dugum_105", target: "Dugum_104", weight: 1}
    ]
};

// ================== UTILITY FUNCTIONS ==================

async function sendRequest(endpoint, body, method = "POST") {
    try {
        const res = await fetch(`${API}${endpoint}`, {
            method: method,
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(body)
        });
        const data = await res.json();
        return data;
    } catch (error) {
        output.innerHTML = `<p style='color: red;'>❌ Hata: Backend'e bağlanılamadı!</p><pre>${error}</pre>`;
        return null;
    }
}

function renderJSON(data, title = "Sonuç") {
    const output = document.getElementById("output");
    output.innerHTML = `<h3>${title}</h3><pre>${JSON.stringify(data, null, 2)}</pre>`;
}

// ================== GRAPH VISUALIZATION (CYTOSCAPE) ==================

function visualizeNetwork(graphData, containerId = 'cy', highlights = [], nodeColor = '#007bff') {
    const output = document.getElementById(containerId);
    if (!output) return;
    output.style.display = 'block';

    const elements = [];
    
    // Düğümleri ekle
    graphData.nodes.forEach(node => {
        const isHighlighted = highlights.includes(node);
        elements.push({
            data: { id: node, label: node },
            classes: isHighlighted ? 'highlighted' : ''
        });
    });
    
    // Kenarları ekle
    graphData.edges.forEach(edge => {
        elements.push({
            data: { 
                id: `${edge.source}-${edge.target}`, 
                source: edge.source, 
                target: edge.target,
                weight: edge.weight || 1
            }
        });
    });

    const cy = cytoscape({
        container: document.getElementById(containerId),
        elements: elements,
        style: [
            {
                selector: 'node',
                style: {
                    'background-color': nodeColor,
                    'label': 'data(label)',
                    'color': '#333',
                    'font-size': '12px',
                    'text-valign': 'center',
                    'text-halign': 'center',
                    'width': '35px',
                    'height': '35px',
                    'border-width': '2px',
                    'border-color': '#fff'
                }
            },
            {
                selector: '.highlighted',
                style: {
                    'background-color': '#dc3545',
                    'line-color': '#dc3545',
                    'target-arrow-color': '#dc3545',
                    'transition-property': 'background-color',
                    'transition-duration': '0.5s'
                }
            },
            {
                selector: 'edge',
                style: {
                    'width': 2,
                    'line-color': '#999',
                    'curve-style': 'bezier',
                    'target-arrow-shape': 'triangle',
                    'label': 'data(weight)',
                    'font-size': '10px'
                }
            }
        ],
        layout: {
            name: 'cose',
            padding: 50
        }
    });
}

// ================== MATRIX VISUALIZATION ==================

function renderMatrix(matrix, nodes, title) {
    let html = `<h4>${title}</h4>`;
    html += `<div style="overflow-x: auto;">`;
    html += `<table border="1" cellpadding="5" style="border-collapse: collapse; font-size: 12px;">`;
    
    // Header
    html += `<tr><th>→↓</th>`;
    nodes.forEach(node => {
        html += `<th style="background: #e0e0e0; width: 30px;">${node}</th>`;
    });
    html += `</tr>`;
    
    // Rows
    matrix.forEach((row, i) => {
        html += `<tr><th style="background: #e0e0e0;">${nodes[i]}</th>`;
        row.forEach((val, j) => {
            const bgColor = val > 0 ? "#c8e6c9" : "#ffffff";
            html += `<td style="background: ${bgColor}; text-align: center; width: 30px;">`;
            html += val > 0 ? "1" : "0";
            html += `</td>`;
        });
        html += `</tr>`;
    });
    
    html += `</table></div>`;
    return html;
}

// ================== MATRIX COMPARISON ==================

function compareMatrices() {
    (async () => {
        const result = await sendRequest("/analysis/matrix-comparison", {
            graph_a: graph_A,
            graph_b: graph_B
        });
        
        if (!result) return;
        
        const output = document.getElementById("output");
        let html = `<h2>🔍 Matris Karşılaştırması</h2>`;
        
        html += `<div style="background: #f5f5f5; padding: 10px; margin: 10px 0; border-radius: 5px;">`;
        html += `<p><strong>Hamming Mesafesi:</strong> ${result.hamming_distance} hücre farklı</p>`;
        html += `<p><strong>Normalize Fark:</strong> ${(result.normalized_difference * 100).toFixed(2)}%</p>`;
        html += `<p><strong>Özdeş:</strong> ${result.are_identical ? "✅ EVET" : "❌ HAYIR"}</p>`;
        html += `</div>`;
        
        html += `<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">`;
        html += `<div>` + renderMatrix(result.adjacency_matrix_a, result.nodes_a, "Graf A Matrisi") + `</div>`;
        html += `<div>` + renderMatrix(result.adjacency_matrix_b, result.nodes_b, "Graf B Matrisi") + `</div>`;
        html += `</div>`;
        
        output.innerHTML = html;
    })();
}

// ================== ISOMORPHISM ANALYSIS ==================

function checkIso() {
    (async () => {
        const result = await sendRequest("/analysis/isomorphism", {
            graph_a: graph_A,
            graph_b: graph_B
        });
        
        if (!result) return;
        
        const output = document.getElementById("output");
        let html = `<h2>🔗 İzomorfizm Analizi (VF2 Algoritması)</h2>`;
        
        // Sonuç özeti
        const status = result.is_isomorphic ? "✅ İZOMORFİK" : "❌ İZOMORFİK DEĞİL";
        const statusColor = result.is_isomorphic ? "green" : "red";
        
        html += `<div style="background: ${statusColor}22; padding: 10px; margin: 10px 0; border-radius: 5px; border-left: 5px solid ${statusColor};">`;
        html += `<h3 style="color: ${statusColor};">${status}</h3>`;
        html += `<p><strong>Açıklama:</strong> ${result.reason}</p>`;
        if (result.similarity_percentage !== null) {
            html += `<p><strong>Benzerlik:</strong> ${result.similarity_percentage}%</p>`;
        }
        html += `</div>`;
        
        // Yapısal imzalar
        if (result.structural_signature_a) {
            html += `<h3>📊 Yapısal İmzalar</h3>`;
            html += `<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">`;
            html += `<div style="background: #e3f2fd; padding: 10px; border-radius: 5px;">`;
            html += `<h4>${result.graph_a_name || "Graf A"}</h4>`;
            html += `<p>Yoğunluk: ${result.structural_signature_a.density}</p>`;
            html += `<p>Ort. Kümeleme: ${result.structural_signature_a.avg_clustering}</p>`;
            html += `<p>Derece Dizisi: [${result.structural_signature_a.degree_sequence.join(", ")}]</p>`;
            html += `</div>`;
            html += `<div style="background: #f3e5f5; padding: 10px; border-radius: 5px;">`;
            html += `<h4>${result.graph_b_name || "Graf B"}</h4>`;
            html += `<p>Yoğunluk: ${result.structural_signature_b.density}</p>`;
            html += `<p>Ort. Kümeleme: ${result.structural_signature_b.avg_clustering}</p>`;
            html += `<p>Derece Dizisi: [${result.structural_signature_b.degree_sequence.join(", ")}]</p>`;
            html += `</div>`;
            html += `</div>`;
        }
        
        // Düğüm eşleşmeleri
        if (result.node_mapping_details && result.node_mapping_details.length > 0) {
            html += `<h3>🎯 Düğüm Eşleşme Detayları</h3>`;
            html += `<table border="1" cellpadding="8" style="width: 100%; border-collapse: collapse;">`;
            html += `<tr style="background: #ffebee;">`;
            html += `<th>Graf A</th><th>Graf B</th><th>Derece A</th><th>Derece B</th><th>Ortak Komşu</th><th>Yapısal Skor</th>`;
            html += `</tr>`;
            
            result.node_mapping_details.forEach(detail => {
                html += `<tr>`;
                html += `<td><strong>${detail.node_a}</strong></td>`;
                html += `<td><strong>${detail.node_b}</strong></td>`;
                html += `<td>${detail.degree_a}</td>`;
                html += `<td>${detail.degree_b}</td>`;
                html += `<td>${detail.common_neighbors}</td>`;
                html += `<td>${detail.structural_score}</td>`;
                html += `</tr>`;
            });
            
            html += `</table>`;
        }
        
        output.innerHTML = html;
        
        // AVANTAJLI GÖRÜNÜM: İki ağı yan yana çiz
        visualizeNetwork(graph_A, 'cy', [], '#007bff'); 
        visualizeNetwork(graph_B, 'cy2', [], '#28a745');
    })();
}

// ================== ANOMALY DETECTION ==================

function findAnomalies() {
    (async () => {
        const result = await sendRequest("/analysis/anomaly", graph_A);
        
        if (!result) return;
        
        const output = document.getElementById("output");
        let html = `<h2>⚠️ Anomali ve K-Clique Tespiti</h2>`;
        
        // Forensic özeti
        if (result.forensic_summary) {
            html += `<div style="background: #fff3e0; padding: 10px; margin: 10px 0; border-radius: 5px; border-left: 5px solid #ff9800;">`;
            html += `<h4>📋 Adli Bilişim Özeti</h4>`;
            html += `<p>${result.forensic_summary}</p>`;
            html += `</div>`;
        }
        
        // K-Cliques
        if (result.cliques && result.cliques.length > 0) {
            html += `<h3>🔴 K-Cliques (Yoğun Alt-Graflar)</h3>`;
            html += `<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">`;
            result.cliques.forEach(clique => {
                html += `<div style="background: #ffebee; padding: 10px; border-radius: 5px; border: 2px solid #f44336;">`;
                html += `<h5>Clique #${clique.clique_id} (${clique.size} düğüm)</h5>`;
                html += `<p><strong>Düğümler:</strong> ${clique.nodes.join(", ")}</p>`;
                html += `<p><strong>Yoğunluk:</strong> ${clique.density}</p>`;
                html += `<p><strong>🔍 Adli Not:</strong> ${clique.forensic_significance}</p>`;
                html += `</div>`;
            });
            html += `</div>`;
        }
        
        // Anomalies
        if (result.anomalies && result.anomalies.length > 0) {
            html += `<h3>🚨 Anomali Düğümleri</h3>`;
            html += `<table border="1" cellpadding="8" style="width: 100%; border-collapse: collapse;">`;
            html += `<tr style="background: #ffcdd2;">`;
            html += `<th>Düğüm</th><th>Anomali Tipi</th><th>Skor</th><th>Açıklama</th>`;
            html += `</tr>`;
            
            result.anomalies.forEach(anomaly => {
                const typeIcon = {
                    "outlier_hub": "📍",
                    "bridge_node": "🌉",
                    "anomalous_hub": "🔄",
                    "clique_member": "🔴",
                    "isolated": "🔒"
                }[anomaly.anomaly_type] || "⚠️";
                
                html += `<tr>`;
                html += `<td><strong>${anomaly.node}</strong></td>`;
                html += `<td>${typeIcon} ${anomaly.anomaly_type || "Bilinmiyor"}</td>`;
                html += `<td style="color: #d32f2f; font-weight: bold;">${anomaly.score}</td>`;
                html += `<td>${anomaly.reason}</td>`;
                html += `</tr>`;
            });
            
            html += `</table>`;
            
            // Forensic metrikler
            if (result.anomalies[0] && result.anomalies[0].forensic_metrics) {
                html += `<h3>📊 Adli Bilişim Metrikleri (En Yüksek Anomali)</h3>`;
                const metrics = result.anomalies[0].forensic_metrics;
                html += `<div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px;">`;
                html += `<div style="background: #e1f5fe; padding: 10px; border-radius: 5px;">`;
                html += `<p><strong>Betweenness:</strong> ${metrics.betweenness_centrality}</p>`;
                html += `<p><strong>Degree Centrality:</strong> ${metrics.degree_centrality}</p>`;
                html += `<p><strong>Z-Score Derece:</strong> ${metrics.z_score_degree}</p>`;
                html += `</div>`;
                html += `<div style="background: #f3e5f5; padding: 10px; border-radius: 5px;">`;
                html += `<p><strong>Clustering Coeff:</strong> ${metrics.clustering_coefficient}</p>`;
                html += `<p><strong>Closeness:</strong> ${metrics.closeness_centrality}</p>`;
                html += `<p><strong>Z-Score Betweenness:</strong> ${metrics.z_score_betweenness}</p>`;
                html += `</div>`;
                html += `<div style="background: #fce4ec; padding: 10px; border-radius: 5px;">`;
                html += `<p><strong>Eigenvector:</strong> ${metrics.eigenvector_centrality}</p>`;
                html += `<p><strong>Derece:</strong> ${metrics.degree}</p>`;
                html += `</div>`;
                html += `</div>`;
            }
        } else {
            html += `<p style="color: green; font-weight: bold;">✅ Anomali tespit edilmedi.</p>`;
        }
        
        output.innerHTML = html;
        
        // Şüphelileri kırmızı ile vurgula
        const suspects = result.anomalies.map(a => a.node);
        document.getElementById('cy2').style.display = 'none'; // Tek grafik odağı
        visualizeNetwork(graph_A, 'cy', suspects);
    })();
}

// ================== FORENSIC REPORT ==================

function generateForensicReport() {
    (async () => {
        const result = await sendRequest("/analysis/forensic-report", graph_A);
        
        if (!result) return;
        
        const output = document.getElementById("output");
        let html = `<h2>🔐 Adli Bilişim Raporu</h2>`;
        
        // Risk Değerlendirmesi
        const riskColor = {
            "YÜKSEK RİSK": "#f44336",
            "ORTA RİSK": "#ff9800",
            "DÜŞÜK RİSK": "#4caf50"
        }[result.overall_risk_assessment] || "#999";
        
        html += `<div style="background: ${riskColor}22; padding: 15px; margin: 10px 0; border-radius: 5px; border-left: 5px solid ${riskColor};">`;
        html += `<h3 style="color: ${riskColor};">⚠️ GENEL RİSK DEĞERLENDİRMESİ: ${result.overall_risk_assessment}</h3>`;
        html += `</div>`;
        
        // Temel İstatistikler
        html += `<h3>📊 Ağ İstatistikleri</h3>`;
        html += `<div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px;">`;
        html += `<div style="background: #e3f2fd; padding: 10px; border-radius: 5px;">`;
        html += `<p><strong>Toplam Düğüm:</strong> ${result.total_nodes}</p>`;
        html += `<p><strong>Toplam Kenar:</strong> ${result.total_edges}</p>`;
        html += `</div>`;
        html += `<div style="background: #f3e5f5; padding: 10px; border-radius: 5px;">`;
        html += `<p><strong>Yoğunluk:</strong> ${result.density}</p>`;
        html += `<p><strong>Bağlı Mı:</strong> ${result.is_connected ? "✅ Evet" : "❌ Hayır"}</p>`;
        html += `</div>`;
        html += `<div style="background: #fce4ec; padding: 10px; border-radius: 5px;">`;
        html += `<p><strong>K-Cliques:</strong> ${result.k_cliques ? result.k_cliques.length : 0}</p>`;
        html += `</div>`;
        html += `</div>`;
        
        // Komuta-Kontrol Merkezleri
        if (result.central_nodes && result.central_nodes.length > 0) {
            html += `<h3>🎯 Komuta-Kontrol Merkezleri</h3>`;
            html += `<table border="1" cellpadding="8" style="width: 100%; border-collapse: collapse; margin: 10px 0;">`;
            html += `<tr style="background: #b3e5fc;">`;
            html += `<th>Düğüm</th><th>Merkezilik</th><th>Derece</th><th>Rol</th>`;
            html += `</tr>`;
            
            result.central_nodes.forEach(node => {
                html += `<tr>`;
                html += `<td><strong>${node.node}</strong></td>`;
                html += `<td>${node.centrality}</td>`;
                html += `<td>${node.degree}</td>`;
                html += `<td style="color: #d32f2f; font-weight: bold;">${node.role}</td>`;
                html += `</tr>`;
            });
            
            html += `</table>`;
        }
        
        // En Tehlikeli Düğümler
        if (result.top_anomalies && result.top_anomalies.length > 0) {
            html += `<h3>🚨 En Tehlikeli Düğümler</h3>`;
            result.top_anomalies.forEach((anomaly, idx) => {
                html += `<div style="background: #ffebee; padding: 10px; margin: 10px 0; border-radius: 5px; border-left: 4px solid #f44336;">`;
                html += `<h5>#${idx + 1}: Düğüm <strong>${anomaly.node}</strong> (Skor: ${anomaly.score})</h5>`;
                html += `<p><strong>Tip:</strong> ${anomaly.type}</p>`;
                html += `<p><strong>Açıklama:</strong> ${anomaly.reasons}</p>`;
                html += `</div>`;
            });
        }
        
        // Kritik İletişim Kanalları
        if (result.important_edges && result.important_edges.length > 0) {
            html += `<h3>📡 Kritik İletişim Kanalları</h3>`;
            html += `<ul>`;
            result.important_edges.forEach(edge => {
                html += `<li><strong>${edge.edge}</strong> (Betweenness: ${edge.betweenness}) - ${edge.significance}</li>`;
            });
            html += `</ul>`;
        }
        
        output.innerHTML = html;
        
        // Komuta merkezlerini kırmızı ile işaretle
        const centers = result.central_nodes.map(c => c.node);
        document.getElementById('cy2').style.display = 'none';
        visualizeNetwork(graph_A, 'cy', centers);
    })();
}

// ================== SAMPLE TESTS ==================

function loadGraph() {
    (async () => {
        const statsA = await sendRequest("/graph/stats", graph_A);
        const statsB = await sendRequest("/graph/stats", graph_B);
        
        if (!statsA || !statsB) return;
        
        const combinedResults = {
            "Graph_A_Telefon": statsA,
            "Graph_B_Mesajlasma": statsB
        };
        
        renderJSON(combinedResults, "📊 Graf İstatistikleri (A ve B)");
        visualizeNetwork(graph_A); // Varsayılan olarak A'yı çiz
    })();
}