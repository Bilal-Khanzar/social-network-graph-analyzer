# Hızlı Başlangıç - Sosyal Ağ Analiz Platformu

## 🚀 Projeyi Başlat

### 1. Backend'i Çalıştır
```bash
cd backend
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Çıktı:
```
INFO:     Uvicorn running on http://0.0.0.0:8000
```

### 2. Browser'da Aç
```
http://localhost:8000
```

---

## 🧪 Temel Test Senaryoları

### Test 1: 📊 Matris Karşılaştırması

**Button:** "🔲 Matris Karşılaştırması"

**Ne Yapıyor?**
- İki grafın komşuluk matrislerini hesaplar
- Yan yana tablo olarak gösterir
- Hamming mesafesini rapor eder

**Örnek Çıktı:**
```
Hamming Mesafesi: 2 hücre farklı
Normalize Fark: 12.50%
Özdeş: ❌ HAYIR

[Tablo gösterimi]
Graf A Matrisi         Graf B Matrisi
→↓ Ali Veli Ayşe      →↓ D1 D2 D3
Ali 0  1   1           D1 0  1  1
Veli 1 0   1           D2 1  0  1
Ayşe 1 1   0           D3 1  1  0
```

---

### Test 2: 🔗 İzomorfizm Testi (VF2)

**Button:** "🔗 İzomorfizm Testi (VF2)"

**Ne Yapıyor?**
- İki grafın yapısal olarak aynı olup olmadığını kontrol eder
- Düğüm eşleşmelerini gösterir
- Yapısal imzaları karşılaştırır

**Örnek Çıktı:**
```
✅ İZOMORFİK
Açıklama: VF2 algoritması ile izomorfizm doğrulandı (Tam yapısal eşdeğerlik).
Benzerlik: 100%

Yapısal İmzalar
───────────────
Graf A                  Graf B
Yoğunluk: 0.667        Yoğunluk: 0.667
Ort. Kümeleme: 0.333   Ort. Kümeleme: 0.333
Derece: [2, 2, 2]      Derece: [2, 2, 2]

Düğüm Eşleşme Detayları
─────────────────────────────────────────────
Graf A  | Graf B   | Derece A | Derece B | Ortak | Skor
Ali     | Dugum1   | 2        | 2        | 1     | 0.75
Veli    | Dugum2   | 2        | 2        | 1     | 0.75
Ayşe    | Dugum3   | 2        | 2        | 1     | 0.75
```

---

### Test 3: 🚨 Anomali & K-Clique Tespiti

**Button:** "🚨 Anomali & K-Clique Tespiti"

**Ne Yapıyor?**
- Ağdaki yoğun alt-grafları (K-cliques) bulur
- Normal dışı davranış gösteren düğümleri tespit eder
- Her anomali için adli bilişim metrikleri rapor eder

**Örnek Çıktı:**
```
📋 Adli Bilişim Özeti
─────────────────────
Graf: Test Ağı (Anomali Deteksiyonu)
Düğümler: 7 | Kenarlar: 10 | Yoğunluk: 0.476
Anomali: 3 | K-Clique: 1 (max: 3 düğüm)

🔴 K-Cliques (Yoğun Alt-Graflar)
────────────────────────────────
Clique #1 (3 düğüm)
Düğümler: A, B, C
Yoğunluk: 1.0
🔍 Adli Not: Tam üçgen (3-clique). Yüksek koordinasyon göstergesi.

🚨 Anomali Düğümleri
────────────────────────────────────────────────────────
Düğüm | Anomali Tipi   | Skor | Açıklama
───────────────────────────────────────────────────────
D     | outlier_hub    | 2.14 | Aşırı bağlantı noktası (z=3.21); Köprü düğüm
A     | clique_member  | 1.20 | Yoğun alt-grafta üye (K-clique size=3)
G     | bridge_node    | 0.85 | Köprü düğüm/Kanal operatörü (betweenness z=1.70)

📊 Adli Bilişim Metrikleri (En Yüksek Anomali: D)
──────────────────────────────────────────────────
Betweenness: 0.3333           Clustering Coeff: 0.6667   Eigenvector: 0.4821
Degree Centrality: 0.8333     Closeness: 0.5714         Z-Score Derece: 3.21
```

---

### Test 4: 🔐 Adli Bilişim Raporu

**Button:** "🔐 Adli Bilişim Raporu"

**Ne Yapıyor?**
- Detaylı güvenlik analizi raporu üretir
- Risk seviyesini değerlendirir (DÜŞÜK/ORTA/YÜKSEK)
- En tehlikeli düğümleri ve kritik kanalları tanımlar

**Örnek Çıktı:**
```
🔐 Adli Bilişim Raporu
═════════════════════════════════════════════════════════

⚠️ GENEL RİSK DEĞERLENDİRMESİ: YÜKSEK RİSK

📊 Ağ İstatistikleri
─────────────────
Toplam Düğüm: 8      Yoğunluk: 0.357
Toplam Kenar: 10     Bağlı Mı: Evet
K-Cliques: 1

🎯 Komuta-Kontrol Merkezleri
────────────────────────────────────────────
Düğüm | Merkezilik | Derece | Rol
──────────────────────────────────────────────
D     | 0.8333     | 5      | Komuta-kontrol merkezi
E     | 0.4167     | 3      | Merkezi düğüm
A     | 0.3333     | 2      | Merkezi düğüm

🚨 En Tehlikeli Düğümler
─────────────────────────────────────────────
#1: Düğüm D (Skor: 2.14)
Tip: outlier_hub
Açıklama: Aşırı bağlantı noktası; Köprü düğüm

#2: Düğüm A (Skor: 1.20)
Tip: clique_member
Açıklama: Yoğun alt-grafta üye

📡 Kritik İletişim Kanalları
─────────────────────────────────────────────
• D -> E (Betweenness: 0.3333) - Kritik kanal
• E -> F (Betweenness: 0.2222) - Kritik kanal
• F -> G (Betweenness: 0.2222) - Kritik kanal

🔴 Yoğun Alt-Graflar (K-Cliques)
────────────────────────────────────────────
Clique #1: {A, B, C} - Density: 1.0
Forensic Note: Tam bağlantılı grup - Yüksek koordinasyon
```

---

## 📊 JSON İstekleri (cURL / Postman)

### İzomorfizm Tespiti
```bash
curl -X POST http://localhost:8000/api/analysis/isomorphism \
  -H "Content-Type: application/json" \
  -d '{
    "graph_a": {
      "name": "Grafik A",
      "nodes": ["A", "B", "C"],
      "edges": [
        {"source": "A", "target": "B"},
        {"source": "B", "target": "C"},
        {"source": "C", "target": "A"}
      ]
    },
    "graph_b": {
      "name": "Grafik B",
      "nodes": ["X", "Y", "Z"],
      "edges": [
        {"source": "X", "target": "Y"},
        {"source": "Y", "target": "Z"},
        {"source": "Z", "target": "X"}
      ]
    }
  }'
```

### Anomali Deteksiyonu
```bash
curl -X POST http://localhost:8000/api/analysis/anomaly \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Ağı",
    "nodes": ["A", "B", "C", "D", "E"],
    "edges": [
      {"source": "A", "target": "B"},
      {"source": "B", "target": "C"},
      {"source": "C", "target": "A"},
      {"source": "D", "target": "A"},
      {"source": "D", "target": "B"},
      {"source": "D", "target": "C"},
      {"source": "D", "target": "E"}
    ]
  }'
```

### Matris Karşılaştırması
```bash
curl -X POST http://localhost:8000/api/analysis/matrix-comparison \
  -H "Content-Type: application/json" \
  -d '{
    "graph_a": { ... },
    "graph_b": { ... }
  }'
```

---

## 🎯 Sonraki Adımlar (İsteğe Bağlı Geliştirmeler)

1. **Grafik Görselleştirme**: Cytoscape.js veya D3.js ile
2. **Dinamik Renklendirilme**: İzomorfik düğümleri aynı renge boyama
3. **Gerçek Veri İçe Aktarma**: CSV/JSON dosyasından veri yükleme
4. **Gelişmiş Filtreleme**: Anomali türüne göre filtreleme
5. **İstatistik Grafiğe**: Derece dağılımı, kümeleme dağılımı vb.

---

## ❓ Sıkça Sorulan Sorular

**S: Hamming mesafesi neyi ifade ediyor?**
A: İki matrisin kaç hücresinin farklı olduğunu gösterir. Düşük değer = daha benzer graflardır.

**S: VF2 algoritması ne kadar hızlı?**
A: NP-complete problem olduğu için büyük graflarda yavaşlayabilir. 100+ düğümlü graflarda timeout risk vardır.

**S: Z-score > 2 neden anomali eşiği?**
A: İstatistiksel olarak %95 güven düzeyi. Değer > 2 ise normal dağılımda %5 ihtimalle hata.

**S: K-clique neden önemli?**
A: Sosyal ağlarda yoğun bağlantı grupları belirler. Suçu analizi için "çete" veya "koordinasyon grubu" göstergesi.

---

## 🐛 Hata Giderme

**Sorun:** Backend'e bağlanılamıyor
```
Çözüm: http://localhost:8000 açıldığını kontrol et. 
Backend komutu: python -m uvicorn main:app --reload
```

**Sorun:** JSON parse hatası
```
Çözüm: JSON formatını kontrol et. Tüm alanların doğru tipte olduğundan emin ol.
```

**Sorun:** İzomorfizm sonucu her zaman false
```
Çözüm: 
1. Düğüm sayısı eşit mi? (nodes_a.length == nodes_b.length)
2. Kenar sayısı eşit mi? (edges_a.length == edges_b.length)
3. Derece dizileri eşit mi? (sorted degree sequences aynı mı?)
```

---

## 📞 Destek

Herhangi bir sorun için:
1. Proje README'sini kontrol et
2. ENHANCEMENT_DOCS.md'den teknik detayları oku
3. Backend loglarını kontrol et (`--reload` modunda çalışırken)

**Başarılar! 🚀**

