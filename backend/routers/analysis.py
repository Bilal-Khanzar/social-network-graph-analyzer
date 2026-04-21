from fastapi import APIRouter, HTTPException

from backend.models.graph_models import (
    AnalysisRequest,
    IsomorphismResult,
    AnomalyResult,
    GraphInput
)

from backend.services.graph_service import (
    check_isomorphism,
    detect_anomalies
)
router = APIRouter()


@router.post("/isomorphism", response_model=IsomorphismResult)
async def analyze_isomorphism(request: AnalysisRequest):
    """İki grafın izomorfik olup olmadığını analiz et (VF2 algoritması)."""
    try:
        result = check_isomorphism(request.graph_a, request.graph_b)
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/anomaly", response_model=AnomalyResult)
async def analyze_anomaly(graph: GraphInput):
    """Tek bir grafta anomali tespiti yap."""
    try:
        result = detect_anomalies(graph)
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/full")
async def full_analysis(request: AnalysisRequest):
    """Tam analiz: izomorfizm + her iki grafta anomali tespiti."""
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