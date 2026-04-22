from fastapi import APIRouter, HTTPException

from backend.models.graph_models import (
    AnalysisRequest,
    IsomorphismResult,
    AnomalyResult,
    GraphInput,
    MatrixComparison
)

from backend.services.graph_service import (
    check_isomorphism,
    detect_anomalies,
    compare_adjacency_matrices,
    get_forensic_report
)
router = APIRouter()


@router.post("/isomorphism", response_model=IsomorphismResult)
async def analyze_isomorphism(request: AnalysisRequest):
    """
    İki grafın izomorfik olup olmadığını analiz et (VF2 algoritması).
    
    Çıktı:
    - is_isomorphic: İzomorfizm durumu
    - mapping: Düğüm eşleşmeleri (varsa)
    - node_mapping_details: Her düğün çifti için yapısal metrikler
    - similarity_percentage: Yapısal benzerlik yüzdesi
    """
    try:
        result = check_isomorphism(request.graph_a, request.graph_b)
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/anomaly", response_model=AnomalyResult)
async def analyze_anomaly(graph: GraphInput):
    """
    Tek bir grafta adli bilişim temelli anomali tespiti.
    
    Tespit ettiği anomaliler:
    - K-cliques: Yoğun alt-graflar (suçlu çeteler, koordinasyon grupları)
    - Outlier hubs: Ağdan çok farklı bağlantı desenleri
    - Bridge nodes: Farklı grupları bağlayan kritik düğümler
    - Anomalous hubs: Yüksek derece ama düşük yerel kümeleme
    """
    try:
        result = detect_anomalies(graph)
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/full")
async def full_analysis(request: AnalysisRequest):
    """
    Tam analiz: izomorfizm + her iki grafta anomali tespiti.
    """
    try:
        iso_result = check_isomorphism(request.graph_a, request.graph_b)
        anomaly_a = detect_anomalies(request.graph_a)
        anomaly_b = detect_anomalies(request.graph_b)
        return {
            "isomorphism": iso_result,
            "anomalies_graph_a": anomaly_a,
            "anomalies_graph_b": anomaly_b,
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/matrix-comparison", response_model=MatrixComparison)
async def compare_matrices(request: AnalysisRequest):
    """
    İki grafın komşuluk matrislerini karşılaştırır.
    
    Çıktı:
    - adjacency_matrix_a, adjacency_matrix_b: Komşuluk matrisleri
    - hamming_distance: Kaç hücre farklı
    - normalized_difference: Normalize edilmiş fark (0-1)
    - are_identical: Matrisler tamamen aynı mı?
    """
    try:
        result = compare_adjacency_matrices(request.graph_a, request.graph_b)
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/forensic-report")
async def generate_forensic_report(graph: GraphInput):
    """
    Adli bilişim raporu: Detaylı graf analizi.
    
    Raporun içeriği:
    - Anomali özeti ve K-clique analizi
    - En tehlikeli düğümler (anomali skorları)
    - Komuta-kontrol merkezleri (merkezi düğümler)
    - Kritik iletişim kanalları (önemli kenarlar)
    - Genel risk değerlendirmesi
    """
    try:
        result = get_forensic_report(graph)
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))