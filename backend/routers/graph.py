from fastapi import APIRouter, HTTPException, UploadFile, File

from backend.models.graph_models import GraphInput, GraphResponse, UploadResponse
from backend.services.graph_service import (
    get_adjacency_matrix,
    build_nx_graph,
    get_graph_stats
)
import json
import csv
import io

router = APIRouter()


@router.post("/create", response_model=GraphResponse)
async def create_graph(graph: GraphInput):
    """Manuel veri girişi ile graf oluştur."""
    try:
        matrix = get_adjacency_matrix(graph)
        return GraphResponse(
            nodes=graph.nodes,
            edges=graph.edges,
            name=graph.name,
            node_count=len(graph.nodes),
            edge_count=len(graph.edges),
            adjacency_matrix=matrix
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/upload/json", response_model=UploadResponse)
async def upload_graph_json(file: UploadFile = File(...)):
    """JSON dosyasından graf yükle.
    
    Beklenen format:
    {
        "name": "Graf A",
        "nodes": ["A", "B", "C"],
        "edges": [{"source": "A", "target": "B", "weight": 1.0}]
    }
    """
    if not file.filename.endswith(".json"):
        raise HTTPException(status_code=400, detail="Sadece .json dosyası kabul edilir.")
    content = await file.read()
    try:
        data = json.loads(content)
        graph = GraphInput(**data)
        return UploadResponse(success=True, graph=graph, message="JSON başarıyla yüklendi.")
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"JSON parse hatası: {str(e)}")


@router.post("/upload/csv", response_model=UploadResponse)
async def upload_graph_csv(file: UploadFile = File(...)):
    """CSV dosyasından graf yükle.
    
    Beklenen format (kenar listesi):
    source,target,weight
    A,B,1.0
    B,C,2.0
    """
    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Sadece .csv dosyası kabul edilir.")
    content = await file.read()
    try:
        text = content.decode("utf-8")
        reader = csv.DictReader(io.StringIO(text))
        edges = []
        nodes_set = set()
        from models.graph_models import Edge
        for row in reader:
            src = row.get("source", row.get("Source", row.get("kaynak", "")))
            tgt = row.get("target", row.get("Target", row.get("hedef", "")))
            wgt = float(row.get("weight", row.get("Weight", 1.0)))
            if src and tgt:
                edges.append(Edge(source=src, target=tgt, weight=wgt))
                nodes_set.add(src)
                nodes_set.add(tgt)
        graph = GraphInput(
            nodes=list(nodes_set),
            edges=edges,
            name=file.filename.replace(".csv", "")
        )
        return UploadResponse(success=True, graph=graph, message=f"CSV başarıyla yüklendi. {len(edges)} kenar bulundu.")
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"CSV parse hatası: {str(e)}")


@router.post("/stats")
async def graph_stats(graph: GraphInput):
    """Graf istatistiklerini hesapla."""
    try:
        return get_graph_stats(graph)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))