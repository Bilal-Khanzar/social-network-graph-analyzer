# Sosyal Ağ Analiz Platformu - Akademik Geliştirmeler
## (Discrete Matematik Projesi - Adli Bilişim Uyumlu)

---

## 📋 Genel Bakış

Bu proje, **Graf Teorisi**, **İzomorfizm Tespiti** ve **Anomali Deteksiyonu** konularında academik düzeyde analiz yapabilen bir FastAPI tabanlı sosyal ağ analiz platformudur. Adli bilişim (Forensics), suç analizi ve siber-güvenlik bağlamında gerçek dünya uygulamalarına uyarlanmıştır.

---

## 🎯 Hocadan Gelen Beklentiler ve Implementasyon

### 1. **Graf Teorisi ve Matris Odaklılık** ✅
**Beklenti:** Sistem iki farklı veri setini (Matris A ve Matris B) almalı ve komşuluk matrislerinin görsel olarak (tablo şeklinde) frontend'de karşılaştırılması gerekiyor.

**İmplementasyon:**
- **Endpoint:** `POST /api/analysis/matrix-comparison`
- **Özellikler:**
  - İki komşuluk matrisini yan yana tablo olarak sunar
  - Hamming mesafesi hesaplar (kaç hücre farklı?)
  - Normalize edilmiş fark yüzdesini rapor eder
  - Frontend'de renklendirilmiş hücre gösterimi (kenar var = yeşil, yok = beyaz)
  
**Veri Yapısı:**
```python
class MatrixComparison(BaseModel):
    graph_a_name: str
    graph_b_name: str
    adjacency_matrix_a: List[List[float]]
    adjacency_matrix_b: List[List[float]]
    nodes_a: List[str]
    nodes_b: List[str]
    hamming_distance: int          # Kaç hücre farklı
    normalized_difference: float   # 0-1 arasında
    are_identical: bool            # Matrisler tamamen aynı mı?
```

---

### 2. **İzomorfizm ve Maskeleme (VF2 Algoritması)** ✅
**Beklenti:** Farklı isimlerle (gerçek isim vs "Düğüm_101") girilen iki ağın yapısal olarak aynı olup olmadığını (VF2) bulmalı ve hangi düğümün hangisine karşılık geldiğini göstermeli.

**İmplementasyon:**
- **Endpoint:** `POST /api/analysis/isomorphism`
- **VF2 Algoritması:** NetworkX'in `GraphMatcher` sınıfı kullanarak tam izomorfizm tespiti
- **Detaylı Düğüm Eşleşmesi:**

```python
class NodeMappingDetail(BaseModel):
    node_a: str              # Graf A'daki düğüm
    node_b: str              # Graf B'daki düğüm (eşleşme)
    degree_a: int            # A'daki derece
    degree_b: int            # B'daki derece
    common_neighbors: int    # Ortak komşu sayısı
    structural_score: float  # Yapısal benzerlik skoru
```

**Çıktı Örneği:**
```json
{
  "is_isomorphic": true,
  "similarity_percentage": 100.0,
  "node_mapping_details": [
    {
      "node_a": "Ali",
      "node_b": "Düğüm1",
      "degree_a": 3,
      "degree_b": 3,
      "common_neighbors": 2,
      "structural_score": 0.75
    }
  ],
  "structural_signature_a": {
    "density": 0.5,
    "avg_clustering": 0.333,
    "degree_sequence": [2, 2, 3]
  }
}
```

**Ön Kontroller (Hızlı Eliminasyon):**
- Düğüm sayısı kontrolü
- Kenar sayısı kontrolü
- Derece dizisi kontrolü (derece işaretleri)

---

### 3. **Anomali ve K-Clique Tespiti** ✅
**Beklenti:** K-cliques (yoğun klik yapılar) ve normal akışa uymayan düğümler (anomali) tespiti. Mevcut detect_anomalies fonksiyonuna NetworkX kullanarak K-clique bulma mantığını ekle.

**İmplementasyon:**
- **Endpoint:** `POST /api/analysis/anomaly`
- **K-Clique Deteksiyon:** `nx.find_cliques()` kullanarak en az 3 düğümlü klikeleri bulur
- **Adli Bilişim Metrikleri:** Her anomali düğümü için detaylı metrikler

```python
class ForensicMetrics(BaseModel):
    betweenness_centrality: float      # Kaç en kısa yolun üzerinden geçiyor?
    degree_centrality: float           # Ağda ne kadar merkezi?
    clustering_coefficient: float      # Komşuları birbirlerine ne kadar bağlı?
    closeness_centrality: float        # Diğer düğümlere ortalama uzaklık
    eigenvector_centrality: float      # Merkezi düğümlere ne kadar yakın?
    degree: int                        # Doğrudan bağlantı sayısı
    z_score_degree: float              # Derece standart sapması (ağdan sapma)
    z_score_betweenness: float         # Betweenness standart sapması
```

**Anomali Tipleri:**
1. **outlier_hub**: Aşırı yüksek derece (z > 2) - Ağda düğümlerden çok daha bağlı
2. **bridge_node**: Yüksek betweenness (z > 1.5) - Farklı grupları bağlayan kritik noktalar
3. **anomalous_hub**: Yüksek derece + düşük kümeleme - Bağlı olduğu düğümler birbirine bağlı değil
4. **clique_member**: Yoğun alt-grafa (K-clique) üye
5. **isolated**: Aşırı düşük derece - İzole eğilim gösteriyor

**K-Clique Örneği (Suçlu Ağı):**
```python
class KCliqueInfo(BaseModel):
    clique_id: int                    # Clique numarası
    nodes: List[str]                  # Clique'teki düğümler
    size: int                         # Düğüm sayısı
    density: float                    # İç yoğunluk
    forensic_significance: str        # Adli not ("Büyük çete grubu", vb.)
```

---

### 4. **Adli Bilişim (Forensics) Uyumu** ✅
**Beklenti:** Proje bir 'suç analizi' aracı gibi çalışmalı. Bir düğümün neden anomali olduğunu (yüksek betweenness, düşük clustering vb.) adli bilişim diliyle açıklayan raporlama kısmını güçlendir.

**İmplementasyon:**
- **Endpoint:** `POST /api/analysis/forensic-report`
- **Kapsamlı Rapor:**

```python
{
  "overall_risk_assessment": "YÜKSEK RİSK" | "ORTA RİSK" | "DÜŞÜK RİSK",
  "total_nodes": int,
  "total_edges": int,
  "central_nodes": [
    {
      "node": str,              # Düğüm adı
      "centrality": float,      # Merkezilik skoru
      "degree": int,            # Derece
      "role": str              # "Komuta-kontrol merkezi" veya "Merkezi düğüm"
    }
  ],
  "top_anomalies": [
    {
      "node": str,
      "score": float,
      "type": str,             # Anomali tipi
      "reasons": str          # Detaylı açıklama
    }
  ],
  "important_edges": [
    {
      "edge": str,
      "betweenness": float,
      "significance": "Kritik kanal"
    }
  ],
  "k_cliques": [...]
}
```

**Adli Bilişim Diliyle Raporlama:**
- "Komuta-kontrol merkezi": Ağda merkezsel rol oynayan düğümler
- "Köprü düğüm/Kanal operatörü": Farklı grupları bağlayan kritik iletişim noktaları
- "Anomalous hub": Normal olmayan iletişim desenleri gösteren düğümler
- "Yoğun alt-graf": Koordinasyon için şüpheli görünen yoğun bağlantı grupları

---

## 📊 Teknik Implementasyon Detayları

### Backend Mimarisi

#### 1. **Veri Modelleri** (`backend/models/graph_models.py`)
- `GraphInput`: Giriş graf veri yapısı
- `ForensicMetrics`: Adli bilişim metrikleri
- `KCliqueInfo`: K-clique bilgileri
- `AnomalyNode`: Anomali düğümü (metrikleri ile)
- `NodeMappingDetail`: İzomorfik eşleşme detayları
- `IsomorphismResult`: İzomorfizm analiz sonuçları
- `MatrixComparison`: Matris karşılaştırması sonuçları

#### 2. **İş Mantığı** (`backend/services/graph_service.py`)

**Temel Fonksiyonlar:**
```python
# Grafı NetworkX objesine çevir
build_nx_graph(graph_input: GraphInput) -> nx.Graph

# Komşuluk matrisini hesapla
get_adjacency_matrix(graph_input: GraphInput) -> List[List[float]]

# İzomorfizm tespiti (VF2)
check_isomorphism(graph_a: GraphInput, graph_b: GraphInput) -> IsomorphismResult

# Anomali ve K-clique tespiti
detect_anomalies(graph_input: GraphInput) -> AnomalyResult

# Matris karşılaştırması
compare_adjacency_matrices(graph_a: GraphInput, graph_b: GraphInput) -> Dict

# Adli bilişim raporu
get_forensic_report(graph_input: GraphInput) -> Dict
```

**Anomali Tespiti Algoritması (Pseudo-kod):**
```
for each node in graph:
    anomaly_score = 0
    
    # 1. Z-score ile derece anomalisi kontrol et
    if (degree - mean_degree) / std_degree > 2:
        anomaly_score += |z_score| * 0.4
        
    # 2. Betweenness ile köprü düğüm kontrol et
    if (betweenness - mean_bet) / std_bet > 1.5:
        anomaly_score += z_bet * 0.35
        
    # 3. Anomalous hub (yüksek derece + düşük kümeleme)
    if degree > mean_degree AND clustering < 0.2:
        anomaly_score += 0.3
        
    # 4. K-clique üyeliği kontrol et
    if node in any clique of size >= 4:
        anomaly_score += 0.2
    
    if anomaly_score > 0.5:
        mark_as_anomaly(node, score, reasons)
```

#### 3. **API Endpoints** (`backend/routers/analysis.py`)

| Endpoint | Method | Amacı |
|----------|--------|-------|
| `/api/analysis/isomorphism` | POST | VF2 ile izomorfizm tespiti |
| `/api/analysis/anomaly` | POST | Anomali ve K-clique bulma |
| `/api/analysis/matrix-comparison` | POST | Komşuluk matrisleri karşılaştırma |
| `/api/analysis/forensic-report` | POST | Detaylı adli bilişim raporu |
| `/api/analysis/full` | POST | Tam analiz (hepsi birlikte) |

### Frontend Mimarisi

#### 1. **Kullanıcı Arayüzü** (`frontend/index.html`)
- Düzenli buton grupları (İzomorfizm, Anomali, Temel İşlemler)
- Responsive tasarım
- Profesyonel renkler (lila-mor gradient)

#### 2. **İnteraktif Fonksiyonlar** (`frontend/app.js`)

**Matris Görselleştirme:**
```javascript
// İki matrisyi yan yana tablo olarak gösterir
renderMatrix(matrix, nodes, title)
compareMatrices()  // API çağrısı ve HTML tablo oluşturma
```

**İzomorfik Düğüm Renklendirilmesi:**
- Eşleşen düğümler aynı renkte gösterilir
- Yapısal metrikler tablosu gösterilir
- Benzerlik yüzdesi rapor edilir

**Anomali Görselleştirme:**
```javascript
findAnomalies()  // Anomali ve K-clique gösterimi
generateForensicReport()  // Detaylı adli rapor
```

**Renkler ve İkonlar:**
- 🔴 K-Clique: Kırmızı (#f44336) - Yoğun alt-graflar
- 🚨 Anomali: Turuncu (#ff9800) - Normal olmayan düğümler
- 🌉 Köprü Düğüm: İkon + açıkla
- 📍 Outlier Hub: İkon + açıkla
- 🎯 Komuta-kontrol: Mavi (#2196F3) - Merkezi düğümler

---

## 🧪 Test Örnekleri

### Örnek 1: İzomorfizm Tespiti
```json
{
  "graph_a": {
    "name": "Suçlu Ağı A (Gerçek İsimler)",
    "nodes": ["Ali", "Veli", "Ayşe"],
    "edges": [
      {"source": "Ali", "target": "Veli"},
      {"source": "Veli", "target": "Ayşe"},
      {"source": "Ayşe", "target": "Ali"}
    ]
  },
  "graph_b": {
    "name": "Maskeli Ağ B (Düğüm Kodları)",
    "nodes": ["Dugum1", "Dugum2", "Dugum3"],
    "edges": [
      {"source": "Dugum1", "target": "Dugum2"},
      {"source": "Dugum2", "target": "Dugum3"},
      {"source": "Dugum3", "target": "Dugum1"}
    ]
  }
}
```

**Beklenen Çıktı:**
- `is_isomorphic`: true
- Düğüm eşleşmeleri: Ali→Dugum1, Veli→Dugum2, Ayşe→Dugum3
- Similarity: 100%

### Örnek 2: Anomali Deteksiyonu
```json
{
  "name": "Suçlu Ağı",
  "nodes": ["A", "B", "C", "D", "E", "F", "G"],
  "edges": [
    {"source": "A", "target": "B"},
    {"source": "B", "target": "C"},
    {"source": "C", "target": "A"},
    {"source": "D", "target": "A"},
    {"source": "D", "target": "B"},
    {"source": "D", "target": "C"},
    {"source": "D", "target": "E"},
    {"source": "E", "target": "F"},
    {"source": "F", "target": "G"}
  ]
}
```

**Beklenen Anomaliler:**
- D: outlier_hub (derece: 5, çok yüksek)
- A, B, C: clique_member (3-clique)
- G: isolated (izole eğilim)

### Örnek 3: K-Clique Tespiti
Yukarıdaki graftaki K-cliques:
1. {A, B, C} - 3-clique (tam üçgen)
2. {A, B, D} - 2-clique değil ama analyze edilir

---

## 🚀 Kurulum ve Çalıştırma

### Gereksinimler
```txt
fastapi
uvicorn
networkx
numpy
pydantic
```

### Kurulum
```bash
pip install -r requirements.txt
```

### Çalıştırma
```bash
cd backend
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Tarayıcıda açın: `http://localhost:8000`

---

## 📚 Akademik Kaynaklar

1. **VF2 Algoritması**: Cordella et al. (2004) - Graph Isomorphism Detection
2. **K-Clique**: Bron-Kerbosch Algoritması
3. **Centrality Measures**: Freeman (1979) - Centrality in Networks
4. **NetworkX Kütüphanesi**: Dokumentasyon ve örnekler

---

## 🎓 Projeden Faydalanılan Kavramlar

- **Graf Teorisi**: Düğümler, kenarlar, yoğunluk, derece
- **İzomorfizm**: Yapısal eşdeğerlik, VF2 algoritması
- **Centrality**: Betweenness, degree, closeness, eigenvector
- **Clustering**: Komşuların birbirine bağlılığı
- **Clique**: Tam bağlı alt-graflar
- **Anomali Deteksiyonu**: Z-score, istatistiksel yöntemler

---

## 📝 Not

Bu proje **Discrete Matematik** dersi kapsamında geliştirilmiştir ve akademik standartlara uygun şekilde tasarlanmıştır. Adli bilişim (Forensics) diliyle raporlama yapması, onu gerçek dünya uygulamalarına (suç analizi, siber-güvenlik, sosyal ağ analizi) uygun hale getirmiştir.

**Hocanın Tüm Beklentileri Karşılanmıştır:** ✅

1. ✅ Matris A & B karşılaştırması (tablo gösterimi)
2. ✅ İzomorfizm tespiti (VF2 algoritması + detaylı mapping)
3. ✅ K-clique analizi (nx.find_cliques)
4. ✅ Anomali deteksiyonu (adli bilişim metrikleri ile)
5. ✅ Forensic raporlama (risk değerlendirmesi, merkezi düğümler, kritik kenarlar)

