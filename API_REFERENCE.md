# API Referans Dökümantasyonu

## 🌐 Base URL
```
http://localhost:8000
```

---

## 📊 Graf İşlemleri (`/api/graph`)

### 1. Graf Oluştur
```http
POST /api/graph/create
Content-Type: application/json

{
  "name": "Örnek Ağ",
  "nodes": ["A", "B", "C"],
  "edges": [
    {"source": "A", "target": "B", "weight": 1.0},
    {"source": "B", "target": "C", "weight": 1.0}
  ]
}
```

**Cevap (200 OK):**
```json
{
  "nodes": ["A", "B", "C"],
  "edges": [...],
  "name": "Örnek Ağ",
  "node_count": 3,
  "edge_count": 2,
  "adjacency_matrix": [
    [0.0, 1.0, 0.0],
    [1.0, 0.0, 1.0],
    [0.0, 1.0, 0.0]
  ]
}
```

### 2. Graf İstatistikleri
```http
POST /api/graph/stats
Content-Type: application/json

{
  "name": "Örnek Ağ",
  "nodes": ["A", "B", "C"],
  "edges": [
    {"source": "A", "target": "B"},
    {"source": "B", "target": "C"}
  ]
}
```

**Cevap:**
```json
{
  "node_count": 3,
  "edge_count": 2,
  "is_connected": false,
  "density": 0.3333,
  "avg_degree": 1.333,
  "diameter": null,
  "avg_clustering": 0.0
}
```

---

## 🔍 Analiz İşlemleri (`/api/analysis`)

### 1. İzomorfizm Tespiti (VF2)
```http
POST /api/analysis/isomorphism
Content-Type: application/json

{
  "graph_a": {
    "name": "Ağ A",
    "nodes": ["A", "B", "C"],
    "edges": [
      {"source": "A", "target": "B"},
      {"source": "B", "target": "C"},
      {"source": "C", "target": "A"}
    ]
  },
  "graph_b": {
    "name": "Ağ B",
    "nodes": ["X", "Y", "Z"],
    "edges": [
      {"source": "X", "target": "Y"},
      {"source": "Y", "target": "Z"},
      {"source": "Z", "target": "X"}
    ]
  }
}
```

**Cevap (İzomorfik):**
```json
{
  "is_isomorphic": true,
  "mapping": {
    "A": "X",
    "B": "Y",
    "C": "Z"
  },
  "node_mapping_details": [
    {
      "node_a": "A",
      "node_b": "X",
      "degree_a": 2,
      "degree_b": 2,
      "common_neighbors": 1,
      "structural_score": 0.6667
    }
  ],
  "reason": "VF2 algoritması ile izomorfizm doğrulandı",
  "similarity_percentage": 100.0,
  "structural_signature_a": {
    "density": 1.0,
    "avg_clustering": 1.0,
    "degree_sequence": [2, 2, 2]
  },
  "structural_signature_b": {
    "density": 1.0,
    "avg_clustering": 1.0,
    "degree_sequence": [2, 2, 2]
  }
}
```

**Cevap (İzomorfik Değil):**
```json
{
  "is_isomorphic": false,
  "mapping": null,
  "reason": "Derece dizileri farklı: [1, 2, 3] vs [2, 2, 2]",
  "similarity_percentage": null
}
```

---

### 2. Anomali ve K-Clique Tespiti
```http
POST /api/analysis/anomaly
Content-Type: application/json

{
  "name": "Suçlu Ağı",
  "nodes": ["A", "B", "C", "D", "E", "F"],
  "edges": [
    {"source": "A", "target": "B"},
    {"source": "B", "target": "C"},
    {"source": "C", "target": "A"},
    {"source": "D", "target": "A"},
    {"source": "D", "target": "B"},
    {"source": "D", "target": "C"},
    {"source": "D", "target": "E"},
    {"source": "E", "target": "F"}
  ]
}
```

**Cevap:**
```json
{
  "graph_name": "Suçlu Ağı",
  "anomalies": [
    {
      "node": "D",
      "score": 1.85,
      "reason": "Aşırı bağlantı noktası (z=3.21); Köprü düğüm/Kanal operatörü",
      "forensic_metrics": {
        "betweenness_centrality": 0.4286,
        "degree_centrality": 0.8,
        "clustering_coefficient": 0.5,
        "closeness_centrality": 0.5714,
        "eigenvector_centrality": 0.7234,
        "degree": 4,
        "z_score_degree": 2.1633,
        "z_score_betweenness": 1.8742
      },
      "anomaly_type": "outlier_hub"
    },
    {
      "node": "A",
      "score": 0.7,
      "reason": "Yoğun alt-grafta üye (K-clique size=3)",
      "forensic_metrics": { ... },
      "anomaly_type": "clique_member"
    }
  ],
  "total_nodes": 6,
  "anomaly_count": 2,
  "cliques": [
    {
      "clique_id": 1,
      "nodes": ["A", "B", "C"],
      "size": 3,
      "density": 1.0,
      "node_count_in_clique": 3,
      "forensic_significance": "Tam bağlantılı grup (3-clique): Yüksek koordinasyon göstergesi"
    }
  ],
  "max_clique_size": 3,
  "forensic_summary": "Graf: Suçlu Ağı | Düğümler: 6 | Kenarlar: 8 | Yoğunluk: 0.533 | Anomali: 2 | K-Clique: 1 (max: 3 düğüm)"
}
```

---

### 3. Matris Karşılaştırması
```http
POST /api/analysis/matrix-comparison
Content-Type: application/json

{
  "graph_a": { ... },
  "graph_b": { ... }
}
```

**Cevap:**
```json
{
  "graph_a_name": "Graf A",
  "graph_b_name": "Graf B",
  "adjacency_matrix_a": [
    [0.0, 1.0, 0.0],
    [1.0, 0.0, 1.0],
    [0.0, 1.0, 0.0]
  ],
  "adjacency_matrix_b": [
    [0.0, 1.0, 1.0],
    [1.0, 0.0, 1.0],
    [1.0, 1.0, 0.0]
  ],
  "nodes_a": ["A", "B", "C"],
  "nodes_b": ["X", "Y", "Z"],
  "hamming_distance": 2,
  "normalized_difference": 0.2222,
  "are_identical": false
}
```

**Açıklamalar:**
- `hamming_distance`: Kaç hücre farklı (0-9 arasında, 3x3 matris için)
- `normalized_difference`: 0-1 arasında, 0 = özdeş, 1 = tamamen farklı
- `are_identical`: Matrisler tamamen aynı mı?

---

### 4. Adli Bilişim Raporu
```http
POST /api/analysis/forensic-report
Content-Type: application/json

{
  "name": "Suçlu Ağı",
  "nodes": ["A", "B", "C", "D", "E"],
  "edges": [ ... ]
}
```

**Cevap:**
```json
{
  "graph_name": "Suçlu Ağı",
  "total_nodes": 5,
  "total_edges": 7,
  "density": 0.7,
  "is_connected": true,
  "anomaly_summary": "Graf: Suçlu Ağı | ...",
  "overall_risk_assessment": "YÜKSEK RİSK",
  "top_anomalies": [
    {
      "node": "A",
      "score": 1.85,
      "type": "outlier_hub",
      "reasons": "Aşırı bağlantı noktası; Köprü düğüm"
    }
  ],
  "central_nodes": [
    {
      "node": "A",
      "centrality": 0.8,
      "degree": 4,
      "role": "Komuta-kontrol merkezi"
    }
  ],
  "important_edges": [
    {
      "edge": "A -> B",
      "betweenness": 0.333,
      "significance": "Kritik kanal"
    }
  ],
  "k_cliques": [
    {
      "clique_id": 1,
      "nodes": ["A", "B", "C"],
      "size": 3,
      "density": 1.0,
      "forensic_note": "Yoğun koordinasyon göstergesi"
    }
  ]
}
```

---

### 5. Tam Analiz
```http
POST /api/analysis/full
Content-Type: application/json

{
  "graph_a": { ... },
  "graph_b": { ... }
}
```

**Cevap:**
```json
{
  "isomorphism": { ... },
  "anomalies_graph_a": { ... },
  "anomalies_graph_b": { ... }
}
```

---

## 📋 Veri Yapıları

### Edge (Kenar)
```json
{
  "source": "A",           // Başlangıç düğümü
  "target": "B",           // Bitiş düğümü
  "weight": 1.0            // Ağırlık (opsiyonel, default: 1.0)
}
```

### GraphInput (Grafik Girdisi)
```json
{
  "name": "Ağ Adı",        // Grafik adı (opsiyonel)
  "nodes": ["A", "B"],     // Düğümler listesi
  "edges": [...]           // Kenarlar listesi
}
```

### ForensicMetrics (Adli Metrikler)
```json
{
  "betweenness_centrality": 0.5,        // Kaç en kısa yolun üzerinden geçiyor
  "degree_centrality": 0.8,             // Ağda merkeziliği
  "clustering_coefficient": 0.6,        // Komşuların bağlılığı
  "closeness_centrality": 0.7,          // Diğer düğümlere yakınlığı
  "eigenvector_centrality": 0.5,        // Merkezi düğümlere yakınlığı
  "degree": 4,                          // Doğrudan bağlı düğüm sayısı
  "z_score_degree": 2.5,                // Derece standart sapması
  "z_score_betweenness": 1.8            // Betweenness standart sapması
}
```

### AnomalyNode (Anomali Düğümü)
```json
{
  "node": "A",                          // Düğüm adı
  "score": 1.85,                        // Anomali skoru (0-10)
  "reason": "Aşırı bağlantı...",       // Açıklama
  "anomaly_type": "outlier_hub",       // Anomali tipi
  "forensic_metrics": { ... }          // Adli metrikleri
}
```

---

## 🎯 Status Kodları

| Kod | Anlamı | Örnek |
|-----|--------|-------|
| 200 | OK | İstek başarılı |
| 400 | Bad Request | Hatalı JSON formatı |
| 404 | Not Found | Endpoint yok |
| 500 | Server Error | Backend hatası |

---

## ⏱️ Performans Notları

- **İzomorfizm (VF2)**: 
  - < 10 düğüm: < 100ms
  - 10-50 düğüm: 100ms - 1s
  - > 50 düğüm: Timeout riski (NP-complete)

- **Anomali Tespiti**:
  - < 100 düğüm: Hızlı
  - K-clique: Büyük graflarda yavaş olabilir

- **Matris Karşılaştırması**:
  - O(n²) - Hızlı

---

## 💡 Best Practices

1. **Düğüm Adları**: Benzersiz ve anlamlı olmalı
2. **Kenar Ağırlıkları**: Pozitif sayılar kullanın
3. **Büyük Graflarda**: İzomorfizm yerine strukturel imzalar karşılaştırın
4. **Anomali Analizi**: Ağın özelliğini bilin (sosyal, suç, vb.)

---

## 🔐 Güvenlik Notları

- API açık (CORS açık) - Üretim ortamında IP kısıtlaması yapın
- Input validasyonu yapılıyor (Pydantic)
- DOS riski: Çok büyük graflara karşı timeout var

