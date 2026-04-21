import networkx as nx
import numpy as np
from typing import Dict, List, Tuple, Optional
from backend.models.graph_models import GraphInput, IsomorphismResult, AnomalyNode, AnomalyResult


def build_nx_graph(graph_input: GraphInput) -> nx.Graph:
    """GraphInput'u NetworkX grafına çevirir."""
    G = nx.Graph()
    G.add_nodes_from(graph_input.nodes)
    for edge in graph_input.edges:
        G.add_edge(edge.source, edge.target, weight=edge.weight)
    return G


def get_adjacency_matrix(graph_input: GraphInput) -> List[List[float]]:
    """Komşuluk matrisini döndürür."""
    G = build_nx_graph(graph_input)
    nodes = sorted(G.nodes())
    n = len(nodes)
    matrix = [[0.0] * n for _ in range(n)]
    node_idx = {node: i for i, node in enumerate(nodes)}
    for u, v, data in G.edges(data=True):
        i, j = node_idx[u], node_idx[v]
        w = data.get("weight", 1.0)
        matrix[i][j] = w
        matrix[j][i] = w
    return matrix


def check_isomorphism(graph_a: GraphInput, graph_b: GraphInput) -> IsomorphismResult:
    """
    İki grafın izomorfik olup olmadığını kontrol eder.
    NetworkX'in VF2 algoritmasını kullanır.
    """
    G1 = build_nx_graph(graph_a)
    G2 = build_nx_graph(graph_b)

    # Hızlı ön kontroller
    if G1.number_of_nodes() != G2.number_of_nodes():
        return IsomorphismResult(
            is_isomorphic=False,
            reason=f"Düğüm sayıları farklı: {G1.number_of_nodes()} vs {G2.number_of_nodes()}"
        )
    if G1.number_of_edges() != G2.number_of_edges():
        return IsomorphismResult(
            is_isomorphic=False,
            reason=f"Kenar sayıları farklı: {G1.number_of_edges()} vs {G2.number_of_edges()}"
        )

    # Derece dizisi kontrolü
    deg1 = sorted([d for _, d in G1.degree()])
    deg2 = sorted([d for _, d in G2.degree()])
    if deg1 != deg2:
        return IsomorphismResult(
            is_isomorphic=False,
            reason=f"Derece dizileri farklı: {deg1} vs {deg2}"
        )

    # VF2 ile tam izomorfizm kontrolü
    gm = nx.algorithms.isomorphism.GraphMatcher(G1, G2)
    if gm.is_isomorphic():
        mapping = gm.mapping
        return IsomorphismResult(
            is_isomorphic=True,
            mapping=mapping,
            reason="VF2 algoritması ile izomorfizm doğrulandı."
        )
    else:
        return IsomorphismResult(
            is_isomorphic=False,
            reason="Graflар yapısal olarak eşdeğer değil (VF2 doğrulaması başarısız)."
        )


def detect_anomalies(graph_input: GraphInput) -> AnomalyResult:
    """
    Anomali tespiti:
    - K-clique (yoğun bağlantı grupları)
    - Normal akıştan düzensiz düğümler
    - Merkezi olmayan ama aşırı bağlı düğümler
    """
    G = build_nx_graph(graph_input)
    anomalies: List[AnomalyNode] = []

    if G.number_of_nodes() == 0:
        return AnomalyResult(
            graph_name=graph_input.name,
            anomalies=[],
            total_nodes=0,
            anomaly_count=0
        )

    degrees = dict(G.degree())
    degree_values = list(degrees.values())
    mean_deg = np.mean(degree_values) if degree_values else 0
    std_deg = np.std(degree_values) if len(degree_values) > 1 else 0

    # Betweenness centrality
    betweenness = nx.betweenness_centrality(G)
    mean_bet = np.mean(list(betweenness.values())) if betweenness else 0
    std_bet = np.std(list(betweenness.values())) if len(betweenness) > 1 else 0

    # Clustering coefficient
    clustering = nx.clustering(G)

    for node in G.nodes():
        score = 0.0
        reasons = []

        # Aşırı bağlantı anomalisi (Z-score > 2)
        if std_deg > 0:
            z_deg = (degrees[node] - mean_deg) / std_deg
            if abs(z_deg) > 2:
                score += abs(z_deg) * 0.4
                reasons.append(f"Derece anomalisi (z={z_deg:.2f})")

        # Yüksek betweenness (köprü düğüm)
        if std_bet > 0:
            z_bet = (betweenness[node] - mean_bet) / std_bet
            if z_bet > 1.5:
                score += z_bet * 0.3
                reasons.append(f"Köprü düğüm (betweenness z={z_bet:.2f})")

        # Düşük clustering ama yüksek derece (anomalous hub)
        if degrees[node] > mean_deg and clustering[node] < 0.2:
            score += 0.3
            reasons.append("Düşük kümeleme + yüksek derece (anomalous hub)")

        if score > 0.5:
            anomalies.append(AnomalyNode(
                node=node,
                score=round(float(score), 3),
                reason="; ".join(reasons) if reasons else "Anomali tespit edildi"
            ))

    anomalies.sort(key=lambda x: x.score, reverse=True)

    return AnomalyResult(
        graph_name=graph_input.name,
        anomalies=anomalies,
        total_nodes=G.number_of_nodes(),
        anomaly_count=len(anomalies)
    )


def get_graph_stats(graph_input: GraphInput) -> Dict:
    """Graf istatistiklerini döndürür."""
    G = build_nx_graph(graph_input)
    node_count = G.number_of_nodes()
    stats = {
        "node_count": node_count,
        "edge_count": G.number_of_edges(),
        "is_connected": nx.is_connected(G) if node_count > 0 else False,
        "density": round(nx.density(G), 4),
        "avg_degree": round(sum(d for _, d in G.degree()) / max(node_count, 1), 3),
    }
    if node_count > 0 and nx.is_connected(G):
        stats["diameter"] = nx.diameter(G)
        stats["avg_clustering"] = round(nx.average_clustering(G), 4)
    else:
        stats["diameter"] = None
        stats["avg_clustering"] = round(nx.average_clustering(G), 4) if node_count > 0 else 0
    return stats