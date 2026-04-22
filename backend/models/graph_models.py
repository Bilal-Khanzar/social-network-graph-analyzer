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

class NodeMappingDetail(BaseModel):
    """İzomorfik düğüm eşleşmesinin detayları."""
    node_a: str
    node_b: str
    degree_a: int
    degree_b: int
    common_neighbors: int
    structural_score: float

class IsomorphismResult(BaseModel):
    is_isomorphic: bool
    mapping: Optional[Dict[str, str]] = None
    node_mapping_details: Optional[List[NodeMappingDetail]] = None
    reason: Optional[str] = None
    similarity_percentage: Optional[float] = None
    structural_signature_a: Optional[Dict[str, Any]] = None
    structural_signature_b: Optional[Dict[str, Any]] = None

class ForensicMetrics(BaseModel):
    """Adli bilişim temelli düğüm metrikleri."""
    betweenness_centrality: float
    degree_centrality: float
    clustering_coefficient: float
    closeness_centrality: float
    eigenvector_centrality: Optional[float] = None
    degree: int
    z_score_degree: float
    z_score_betweenness: float

class AnomalyNode(BaseModel):
    node: str
    score: float
    reason: str
    forensic_metrics: Optional[ForensicMetrics] = None
    anomaly_type: Optional[str] = None  # "outlier_hub", "bridge_node", "isolated", vb.

class KCliqueInfo(BaseModel):
    """K-clique (yoğun alt-graf) bilgisi."""
    clique_id: int
    nodes: List[str]
    size: int
    density: float
    node_count_in_clique: int
    forensic_significance: str

class AnomalyResult(BaseModel):
    graph_name: str
    anomalies: List[AnomalyNode]
    total_nodes: int
    anomaly_count: int
    cliques: Optional[List[KCliqueInfo]] = None
    max_clique_size: Optional[int] = None
    forensic_summary: Optional[str] = None

class AnalysisRequest(BaseModel):
    graph_a: GraphInput
    graph_b: GraphInput

class UploadResponse(BaseModel):
    success: bool
    graph: GraphInput
    message: str

class MatrixComparison(BaseModel):
    """İki komşuluk matrisinin karşılaştırılması."""
    graph_a_name: str
    graph_b_name: str
    adjacency_matrix_a: List[List[float]]
    adjacency_matrix_b: List[List[float]]
    nodes_a: List[str]
    nodes_b: List[str]
    hamming_distance: int
    normalized_difference: float
    are_identical: bool