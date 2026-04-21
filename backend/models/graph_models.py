from pydantic import BaseModel
from typing import List, Optional, Dict, Any

class Edge(BaseModel):
    source: str
    target: str
    weight: Optional[float] = 1.0

class GraphInput(BaseModel):
    nodes: List[str]
    edges: List[Edge]
    name: Optional[str] = "Graf"

class GraphResponse(BaseModel):
    nodes: List[str]
    edges: List[Edge]
    name: str
    node_count: int
    edge_count: int
    adjacency_matrix: List[List[float]]

class IsomorphismResult(BaseModel):
    is_isomorphic: bool
    mapping: Optional[Dict[str, str]] = None
    reason: Optional[str] = None

class AnomalyNode(BaseModel):
    node: str
    score: float
    reason: str

class AnomalyResult(BaseModel):
    graph_name: str
    anomalies: List[AnomalyNode]
    total_nodes: int
    anomaly_count: int

class AnalysisRequest(BaseModel):
    graph_a: GraphInput
    graph_b: GraphInput

class UploadResponse(BaseModel):
    success: bool
    graph: GraphInput
    message: str