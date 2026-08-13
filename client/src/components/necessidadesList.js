import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import API_BASE_URL from "../api/config";

export default function NecessidadesList() {
    const [necessidades, setNecessidades] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const primaryColor = '#4a2511';
    const badgeStyle = { backgroundColor: '#fdf7f2', color: primaryColor, border: '1px solid #eadfcf' };

    useEffect(() => {
        async function getNecessidades() {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch(`${API_BASE_URL}/necessidades`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (!response.ok) {
                    setError(`Erro ao carregar necessidades: ${response.statusText}`);
                    return;
                }
                const data = await response.json();
                setNecessidades(Array.isArray(data) ? data : (data.data || []));
            } catch (error) {
                console.error("Erro de conexão:", error);
                setError("Não foi possível conectar ao servidor.");
            } finally {
                setLoading(false);
            }
        }
        getNecessidades();
    }, []);

    async function deleteNecessidade(id) {
        if (!window.confirm("Deseja remover permanentemente esta necessidade?")) return;
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/necessidades/${id}`, {
                method: "DELETE",
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                setNecessidades(necessidades.filter((el) => el._id !== id));
            } else {
                window.alert("Erro ao excluir necessidade.");
            }
        } catch (error) {
            console.error("Erro ao deletar:", error);
            window.alert("Não foi possível conectar ao servidor.");
        }
    }

    return (
        <div className="container-fluid py-2">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h3 style={{ color: primaryColor, fontWeight: 'bold' }}>
                        <i className="bi bi-box-seam-fill me-2"></i> Necessidades de Doação Material
                    </h3>
                    <p className="text-muted mb-0">Itens que a ONG precisa — exibidos no site para os doadores</p>
                </div>
                <Link
                    className="btn text-white px-4 py-2 d-inline-flex align-items-center shadow-sm"
                    to="/cadastrar-necessidade"
                    style={{ backgroundColor: primaryColor, fontWeight: '500', borderRadius: '6px' }}
                >
                    <i className="bi bi-plus-lg me-2"></i> Nova Necessidade
                </Link>
            </div>

            {error && (
                <div className="alert alert-danger shadow-sm border-0 mb-4" style={{ borderRadius: '8px' }}>
                    <i className="bi bi-exclamation-triangle me-2"></i> {error}
                </div>
            )}

            <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: '8px', overflow: 'hidden' }}>
                <div className="table-responsive">
                    <table className="table table-hover mb-0">
                        <thead className="table-light">
                            <tr style={{ borderBottom: '2px solid #e9ecef' }}>
                                <th style={{ paddingLeft: '1.5rem', color: primaryColor, fontWeight: '600', width: '80px' }}>Imagem</th>
                                <th style={{ color: primaryColor, fontWeight: '600' }}>Item</th>
                                <th style={{ color: primaryColor, fontWeight: '600' }}>Categoria</th>
                                <th style={{ color: primaryColor, fontWeight: '600' }}>Quantidade Desejada</th>
                                <th style={{ color: primaryColor, fontWeight: '600' }}>Descrição</th>
                                <th style={{ color: primaryColor, fontWeight: '600', width: '180px' }}>Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="text-center py-5">
                                        <div className="spinner-border text-primary" role="status"></div>
                                    </td>
                                </tr>
                            ) : necessidades.length > 0 ? (
                                necessidades.map((item) => (
                                    <tr className="align-middle" key={item._id}>
                                        <td style={{ paddingLeft: '1.5rem' }}>
                                            {item.imagem ? (
                                                <img
                                                    src={item.imagem}
                                                    alt={item.titulo}
                                                    style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '6px', border: '1px solid #eadfcf' }}
                                                />
                                            ) : (
                                                <div className="d-flex align-items-center justify-content-center" style={{ width: '60px', height: '60px', borderRadius: '6px', backgroundColor: '#fdf7f2' }}>
                                                    <i className="bi bi-box text-muted" style={{ fontSize: '1.4rem', opacity: '0.5' }}></i>
                                                </div>
                                            )}
                                        </td>
                                        <td className="fw-semibold text-dark">{item.titulo}</td>
                                        <td>
                                            <span className="badge px-2 py-1" style={badgeStyle}>{item.categoria}</span>
                                        </td>
                                        <td className="text-secondary">{item.quantidade_desejada || "---"}</td>
                                        <td className="text-muted" style={{ maxWidth: '300px' }}>
                                            {item.descricao ? (
                                                <span className="d-inline-block text-truncate" style={{ maxWidth: '280px' }}>{item.descricao}</span>
                                            ) : "---"}
                                        </td>
                                        <td>
                                            <div className="d-flex gap-2">
                                                <Link
                                                    className="btn btn-sm btn-outline-secondary d-inline-flex align-items-center"
                                                    to={`/edit-necessidade/${item._id}`}
                                                    title="Editar"
                                                    style={{ borderRadius: '6px' }}
                                                >
                                                    <i className="bi bi-pencil-square me-1"></i> Editar
                                                </Link>
                                                <button
                                                    className="btn btn-sm btn-outline-danger d-inline-flex align-items-center"
                                                    onClick={() => deleteNecessidade(item._id)}
                                                    title="Excluir"
                                                    style={{ borderRadius: '6px' }}
                                                >
                                                    <i className="bi bi-trash me-1"></i> Excluir
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="text-center text-muted py-5">
                                        <i className="bi bi-box-seam text-muted d-block mb-2" style={{ fontSize: '2rem' }}></i>
                                        Nenhuma necessidade cadastrada. Clique em "Nova Necessidade" para começar.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
