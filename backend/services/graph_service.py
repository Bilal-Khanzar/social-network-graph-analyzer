import networkx as nx
import numpy as np
from typing import Dict, List, Tuple, Optional, Set
from backend.models.graph_models import (
    GraphInput, IsomorphismResult, AnomalyNode, AnomalyResult,
    ForensicMetrics, KCliqueInfo, NodeMappingDetail
)


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
    Yapısal imzalar ve ayrıntılı düğüm eşleşmelerini sağlar.
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

    # Yapısal imza oluştur (adli bilişim raporlaması için)
    def compute_structural_signature(G: nx.Graph) -> Dict:
        """Grafın yapısal özelliklerini imzalayan bir özet oluştur."""
        return {
            "density": float(nx.density(G)),
            "avg_clustering": float(nx.average_clustering(G)) if G.number_of_nodes() > 0 else 0.0,
            "degree_sequence": sorted([d for _, d in G.degree()]),
            "num_connected_components": nx.number_connected_components(G)
        }

    sig_a = compute_structural_signature(G1)
    sig_b = compute_structural_signature(G2)

    # VF2 ile tam izomorfizm kontrolü
    gm = nx.algorithms.isomorphism.GraphMatcher(G1, G2)
    if gm.is_isomorphic():
        mapping = gm.mapping
        
        # Ayrıntılı düğüm eşleşmesi hesapla
        degree_centrality_a = nx.degree_centrality(G1)
        degree_centrality_b = nx.degree_centrality(G2)
        
        node_mapping_details = []
        for node_a, node_b in mapping.items():
            neighbors_a = set(G1.neighbors(node_a))
            neighbors_b = set(G2.neighbors(node_b))
            mapped_neighbors_b = {mapping.get(n, n) for n in neighbors_a if n in mapping}
            common_neighbors = len(neighbors_b & mapped_neighbors_b)
            
            # Yapısal skor hesapla
            structural_score = (
                (degree_centrality_a[node_a] + degree_centrality_b[node_b]) / 2.0
            )
            
            node_mapping_details.append(NodeMappingDetail(
                node_a=node_a,
                node_b=node_b,
                degree_a=dict(G1.degree())[node_a],
                degree_b=dict(G2.degree())[node_b],
                common_neighbors=common_neighbors,
                structural_score=round(float(structural_score), 4)
            ))
        
        similarity_percentage = round(100.0, 2)  # Tam izomorfizm = 100%
        
        return IsomorphismResult(
            is_isomorphic=True,
            mapping=mapping,
            node_mapping_details=node_mapping_details,
            reason="VF2 algoritması ile izomorfizm doğrulandı (Tam yapısal eşdeğerlik).",
            similarity_percentage=similarity_percentage,
            structural_signature_a=sig_a,
            structural_signature_b=sig_b
        )
    else:
        return IsomorphismResult(
            is_isomorphic=False,
            reason="Graflар yapısal olarak eşdeğer değil (VF2 doğrulaması başarısız).",
            structural_signature_a=sig_a,
            structural_signature_b=sig_b
        )


def detect_anomalies(graph_input: GraphInput) -> AnomalyResult:
    """
    Adli bilişim temelli anomali tespiti:
    - K-clique (yoğun alt-graflar): Şüpheli grupları tespit eder
    - Derece anomalileri: Ağın normal yapısından sapan düğümler
    - Köprü düğümler (Betweenness): Iletişim merkezleri
    - Anomalous hub'lar: Düşük kümeleme ama yüksek derece
    
    Her anomali detaylı adli bilişim metriksleri ile sunulur.
    """
    G = build_nx_graph(graph_input)
    anomalies: List[AnomalyNode] = []

    if G.number_of_nodes() == 0:
        return AnomalyResult(
            graph_name=graph_input.name,
            anomalies=[],
            total_nodes=0,
            anomaly_count=0,
            cliques=[],
            max_clique_size=0,
            forensic_summary="Boş graf - anomali analizi yapılamadı."
        )

    # Temel metrikleri hesapla
    degrees = dict(G.degree())
    degree_values = list(degrees.values())
    mean_deg = np.mean(degree_values) if degree_values else 0
    std_deg = np.std(degree_values) if len(degree_values) > 1 else 0

    betweenness = nx.betweenness_centrality(G)
    mean_bet = np.mean(list(betweenness.values())) if betweenness else 0
    std_bet = np.std(list(betweenness.values())) if len(betweenness) > 1 else 0

    clustering = nx.clustering(G)
    
    # Degree centrality
    degree_centrality = nx.degree_centrality(G)
    
    # Closeness centrality
    if nx.is_connected(G):
        closeness = nx.closeness_centrality(G)
    else:
        closeness = {node: 0.0 for node in G.nodes()}
    
    # K-CLIQUE ANALIZI (Yoğun Alt-graflar)
    # ====================================
    all_cliques = list(nx.find_cliques(G))
    cliques_info: List[KCliqueInfo] = []
    
    if all_cliques:
        max_clique_size = max(len(c) for c in all_cliques)
        
        # En az 3 düğümlü klikeleri analiz et (suçlu çeteler, yoğun iletişim grupları)
        significant_cliques = [c for c in all_cliques if len(c) >= 3]
        
        for clique_idx, clique_nodes in enumerate(significant_cliques[:10]):  # Top 10
            subgraph = G.subgraph(clique_nodes)
            clique_density = nx.density(subgraph)
            
            forensic_sig = ""
            if len(clique_nodes) >= 4:
                forensic_sig = f"Büyük çete grubu (n={len(clique_nodes)}): Düğünler arasında yoğun koordinasyon"
            else:
                forensic_sig = f"Küçük grup (n={len(clique_nodes)}): Direkt iletişim ve koordinasyon"
            
            cliques_info.append(KCliqueInfo(
                clique_id=clique_idx + 1,
                nodes=list(clique_nodes),
                size=len(clique_nodes),
                density=round(float(clique_density), 4),
                node_count_in_clique=len(clique_nodes),
                forensic_significance=forensic_sig
            ))
    else:
        max_clique_size = 1

    # ANOMALI TESPİTİ (Her düğün için ayrıntılı adli bilişim metrikleri)
    # ==================================================================
    for node in G.nodes():
        score = 0.0
        reasons = []
        anomaly_type = None
        
        # Eigenvector centrality (ağda merkez düğüme yakınlık)
        try:
            eigenvector = nx.eigenvector_centrality(G, max_iter=1000)
        except:
            eigenvector = {n: 0.0 for n in G.nodes()}

        # Adli bilişim metrikleri hazırla
        forensic_metrics = ForensicMetrics(
            betweenness_centrality=round(float(betweenness[node]), 4),
            degree_centrality=round(float(degree_centrality[node]), 4),
            clustering_coefficient=round(float(clustering[node]), 4),
            closeness_centrality=round(float(closeness[node]), 4),
            eigenvector_centrality=round(float(eigenvector.get(node, 0.0)), 4),
            degree=degrees[node],
            z_score_degree=round(float((degrees[node] - mean_deg) / max(std_deg, 1e-6)), 3),
            z_score_betweenness=round(float((betweenness[node] - mean_bet) / max(std_bet, 1e-6)), 3)
        )

        # DERECE ANOMALISI (Z-score > 2): Ağdan çok daha yüksek/düşük bağlantı
        if std_deg > 0:
            z_deg = (degrees[node] - mean_deg) / std_deg
            if abs(z_deg) > 2:
                score += abs(z_deg) * 0.4
                if z_deg > 2:
                    reasons.append(f"Aşırı bağlantı noktası (z={z_deg:.2f})")
                    anomaly_type = "outlier_hub"
                else:
                    reasons.append(f"İzole eğilim (z={z_deg:.2f})")
                    anomaly_type = "isolated"

        # KÖPRÜ DÜĞÜM ANALİZİ (Z-score > 1.5): Farklı grupları bağlayan merkezi konumlar
        if std_bet > 0:
            z_bet = (betweenness[node] - mean_bet) / std_bet
            if z_bet > 1.5:
                score += z_bet * 0.35
                reasons.append(f"Köprü düğüm/Kanal operatörü (betweenness z={z_bet:.2f})")
                if not anomaly_type:
                    anomaly_type = "bridge_node"

        # ANOMALOUS HUB: Düşük kümeleme ama yüksek derece
        # (Bağlı olduğu düğümler birbirine bağlı değil = Köprü rolü)
        if degrees[node] > mean_deg and clustering[node] < 0.2 and degree_centrality[node] > 0.15:
            score += 0.3
            reasons.append("Anomalous hub: Yüksek derece + düşük yerel kümeleme")
            if not anomaly_type:
                anomaly_type = "anomalous_hub"

        # CLIQUE MEMBERSHIP: Yoğun alt-grafa üye ise
        if all_cliques:
            for clique in significant_cliques:
                if node in clique and len(clique) >= 4:
                    score += 0.2
                    reasons.append(f"Yoğun alt-grafta üye (K-clique size={len(clique)})")
                    if not anomaly_type:
                        anomaly_type = "clique_member"
                    break

        # Anomali eşiği: 0.5+
        if score > 0.5:
            anomalies.append(AnomalyNode(
                node=node,
                score=round(float(score), 3),
                reason="; ".join(reasons) if reasons else "Anomali tespit edildi",
                forensic_metrics=forensic_metrics,
                anomaly_type=anomaly_type or "unknown"
            ))

    anomalies.sort(key=lambda x: x.score, reverse=True)

    # ADLI BİLİŞİM ÖZETİ
    forensic_summary = (
        f"Graf: {graph_input.name} | Düğümler: {G.number_of_nodes()} | Kenarlar: {G.number_of_edges()} | "
        f"Yoğunluk: {nx.density(G):.3f} | "
        f"Anomali: {len(anomalies)} | "
        f"K-Clique: {len(cliques_info)} (max: {max_clique_size} düğüm)"
    )

    return AnomalyResult(
        graph_name=graph_input.name,
        anomalies=anomalies,
        total_nodes=G.number_of_nodes(),
        anomaly_count=len(anomalies),
        cliques=cliques_info,
        max_clique_size=max_clique_size,
        forensic_summary=forensic_summary
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


def compare_adjacency_matrices(graph_a: GraphInput, graph_b: GraphInput) -> Dict:
    """
    İki grafın komşuluk matrislerini karşılaştırır.
    Adli bilişim amaçlı yapısal benzerlikleri ve farklılıkları rapor eder.
    """
    from backend.models.graph_models import MatrixComparison
    
    matrix_a = get_adjacency_matrix(graph_a)
    matrix_b = get_adjacency_matrix(graph_b)
    
    nodes_a = sorted(graph_a.nodes)
    nodes_b = sorted(graph_b.nodes)
    
    # Matrisler aynı boyuta getirilmeli
    len_a = len(matrix_a)
    len_b = len(matrix_b)
    
    hamming_distance = 0
    if len_a == len_b:
        # Hamming distance: kaç hücre farklı?
        for i in range(len_a):
            for j in range(len_a):
                if abs(matrix_a[i][j] - matrix_b[i][j]) > 0.01:
                    hamming_distance += 1
        are_identical = hamming_distance == 0
        max_diff = len_a * len_a
        normalized_diff = hamming_distance / max(max_diff, 1)
    else:
        hamming_distance = -1  # Karşılaştırılamaz
        normalized_diff = 1.0
        are_identical = False
    
    return MatrixComparison(
        graph_a_name=graph_a.name,
        graph_b_name=graph_b.name,
        adjacency_matrix_a=matrix_a,
        adjacency_matrix_b=matrix_b,
        nodes_a=nodes_a,
        nodes_b=nodes_b,
        hamming_distance=hamming_distance,
        normalized_difference=round(normalized_diff, 4),
        are_identical=are_identical
    ).dict()


def get_forensic_report(graph_input: GraphInput) -> Dict:
    """
    Adli bilişim raporu: Graf yapısının detaylı analizi
    Suç analizi, terörle mücadele, siber-güvenlik bağlamında kullanılabilir.
    """
    G = build_nx_graph(graph_input)
    
    if G.number_of_nodes() == 0:
        return {
            "status": "error",
            "message": "Boş graf - rapor oluşturulamadı"
        }
    
    # Anomali tespiti (K-clique ve merkezi olmayan düğümler)
    anomaly_result = detect_anomalies(graph_input)
    
    # En tehlikeli düğümler (yüksek anomali skoru)
    top_threats = anomaly_result.anomalies[:5] if anomaly_result.anomalies else []
    
    # Istatistikler
    degree_centrality = nx.degree_centrality(G)
    betweenness = nx.betweenness_centrality(G)
    
    # En merkezi düğümler (komuta-kontrol merkezleri)
    central_nodes = sorted(degree_centrality.items(), key=lambda x: x[1], reverse=True)[:5]
    
    # En önemli kenarlar (betweenness edge)
    edge_betweenness = nx.edge_betweenness_centrality(G)
    important_edges = sorted(edge_betweenness.items(), key=lambda x: x[1], reverse=True)[:5]
    
    report = {
        "graph_name": graph_input.name,
        "total_nodes": G.number_of_nodes(),
        "total_edges": G.number_of_edges(),
        "density": round(float(nx.density(G)), 4),
        "is_connected": nx.is_connected(G) if G.number_of_nodes() > 0 else False,
        "anomaly_summary": anomaly_result.forensic_summary,
        "top_anomalies": [
            {
                "node": a.node,
                "score": a.score,
                "type": a.anomaly_type,
                "reasons": a.reason
            } for a in top_threats
        ],
        "central_nodes": [
            {
                "node": node,
                "centrality": round(float(cent), 4),
                "degree": dict(G.degree())[node],
                "role": "Komuta-kontrol merkezi" if cent > 0.5 else "Merkezi düğüm"
            } for node, cent in central_nodes
        ],
        "important_edges": [
            {
                "edge": f"{edge[0]} -> {edge[1]}",
                "betweenness": round(float(bet), 4),
                "significance": "Kritik kanal"
            } for (edge_pair, bet) in important_edges
            for edge in [edge_pair]
        ],
        "k_cliques": [
            {
                "clique_id": c.clique_id,
                "nodes": c.nodes,
                "size": c.size,
                "density": c.density,
                "forensic_note": c.forensic_significance
            } for c in (anomaly_result.cliques or [])
        ] if anomaly_result.cliques else [],
        "overall_risk_assessment": (
            "YÜKSEK RİSK" if len(top_threats) >= 3 else
            "ORTA RİSK" if len(top_threats) >= 1 else
            "DÜŞÜK RİSK"
        )
    }
    
    return report