const API = "http://localhost:8000/api";

// ================== UTILITY FUNCTIONS ==================

async function sendRequest(endpoint, body, method = "POST") {
    const output = document.getElementById("output");
    output.innerHTML = "<p style='color: blue;'>📡 İstek gönderiliyor...</p>";
    
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
    const graph_a = {
        name: "Graf A",
        nodes: ["Ali", "Veli", "Ayşe", "Mehmet"],
        edges: [
            {source: "Ali", target: "Veli", weight: 1},
            {source: "Veli", target: "Ayşe", weight: 1},
            {source: "Ayşe", target: "Mehmet", weight: 1},
            {source: "Ali", target: "Mehmet", weight: 1}
        ]
    };
    
    const graph_b = {
        name: "Graf B",
        nodes: ["Düğüm1", "Düğüm2", "Düğüm3", "Düğüm4"],
        edges: [
            {source: "Düğüm1", target: "Düğüm2", weight: 1},
            {source: "Düğüm2", target: "Düğüm3", weight: 1},
            {source: "Düğüm3", target: "Düğüm4", weight: 1},
            {source: "Düğüm1", target: "Düğüm4", weight: 1}
        ]
    };
    
    (async () => {
        const result = await sendRequest("/analysis/matrix-comparison", {
            graph_a: graph_a,
            graph_b: graph_b
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
    const graph_a = {
        name: "Suçlu Ağı A (Gerçek İsimler)",
        nodes: ["Ali", "Veli", "Ayşe"],
        edges: [
            {source: "Ali", target: "Veli"},
            {source: "Veli", target: "Ayşe"},
            {source: "Ayşe", target: "Ali"}
        ]
    };
    
    const graph_b = {
        name: "Maskeli Ağ B (Düğüm Kodları)",
        nodes: ["Dugum1", "Dugum2", "Dugum3"],
        edges: [
            {source: "Dugum1", target: "Dugum2"},
            {source: "Dugum2", target: "Dugum3"},
            {source: "Dugum3", target: "Dugum1"}
        ]
    };
    
    (async () => {
        const result = await sendRequest("/analysis/isomorphism", {
            graph_a: graph_a,
            graph_b: graph_b
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
    })();
}

// ================== ANOMALY DETECTION ==================

function findAnomalies() {
    const testGraph = {
        name: "Test Ağı (Anomali Deteksiyonu)",
        nodes: ["A", "B", "C", "D", "E", "F", "G"],
        edges: [
            // Clique: A-B-C (üçgen)
            {source: "A", target: "B"},
            {source: "B", target: "C"},
            {source: "C", target: "A"},
            // D yüksek derece hub
            {source: "D", target: "A"},
            {source: "D", target: "B"},
            {source: "D", target: "C"},
            {source: "D", target: "E"},
            {source: "D", target: "F"},
            // Köprü: G
            {source: "G", target: "D"},
            {source: "G", target: "E"}
        ]
    };
    
    (async () => {
        const result = await sendRequest("/analysis/anomaly", testGraph);
        
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
    })();
}

// ================== FORENSIC REPORT ==================

function generateForensicReport() {
    const testGraph = {
        name: "Suçlu Ağı - Adli Analiz",
        nodes: ["A", "B", "C", "D", "E", "F", "G", "H"],
        edges: [
            {source: "A", target: "B"}, {source: "B", target: "C"},
            {source: "C", target: "A"}, {source: "D", target: "A"},
            {source: "D", target: "B"}, {source: "D", target: "E"},
            {source: "E", target: "F"}, {source: "F", target: "G"},
            {source: "G", target: "H"}, {source: "H", target: "D"}
        ]
    };
    
    (async () => {
        const result = await sendRequest("/analysis/forensic-report", testGraph);
        
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
    })();
}

// ================== SAMPLE TESTS ==================

function loadGraph() {
    sendRequest("/graph/stats", {
        nodes: ["Ali", "Veli", "Ayşe"],
        edges: [{source: "Ali", target: "Veli", weight: 1}, {source: "Veli", target: "Ayşe", weight: 1}]
    }).then(data => renderJSON(data, "📊 Graf İstatistikleri"));
}