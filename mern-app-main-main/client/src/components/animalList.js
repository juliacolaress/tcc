import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import API_BASE_URL from "../api/config";

const AnimalRecord = (props) => {
    const getStatusBadge = (status) => {
        switch (status) {
            case "Disponível": return "bg-success-subtle text-success border border-success-subtle";
            case "Adotado": return "bg-primary-subtle text-primary border border-primary-subtle";
            case "Tratamento": return "bg-warning-subtle text-warning-emphasis border border-warning-subtle";
            default: return "bg-secondary-subtle text-secondary border border-secondary-subtle";
        }
    };

    const primaryColor = '#5c3a21';

    return (
        <tr className="align-middle">
            <td className="fw-semibold text-dark" style={{ paddingLeft: '1.5rem' }}>{props.record.nome}</td>
            <td>
                <span className="badge bg-light text-dark border px-2 py-1">
                    {props.record.especie}
                </span>
            </td>
            <td className="text-muted">{props.record.raca || "---"}</td>
            <td className="text-muted">{props.record.porte || "---"}</td>
            <td>
                <span className={`badge px-2 py-1.5 rounded ${getStatusBadge(props.record.status)}`} style={{ fontSize: '0.85rem' }}>
                    {props.record.status || "Disponível"}
                </span>
            </td>
            <td>
                <div className="d-flex gap-2">
                    <Link 
                        className="btn btn-sm btn-outline-secondary d-inline-flex align-items-center" 
                        to={`/edit-animal/${props.record._id}`}
                        title="Editar"
                        style={{ borderRadius: '6px' }}
                    >
                        <i className="bi bi-pencil-square me-1"></i> Editar
                    </Link>
                    <button 
                        className="btn btn-sm btn-outline-danger d-inline-flex align-items-center" 
                        onClick={() => props.deleteAnimal(props.record._id)}
                        title="Excluir"
                        style={{ borderRadius: '6px' }}
                    >
                        <i className="bi bi-trash me-1"></i> Excluir
                    </button>
                </div>
            </td>
        </tr>
    );
};

export default function AnimalList() {
    const [animais, setAnimais] = useState([]);
    const [pesquisa, setPesquisa] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function getAnimais() {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch(`${API_BASE_URL}/animal`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (!response.ok) {
                    if (response.status === 401) {
                        setError("Sessão expirada. Por favor, faça login novamente.");
                    } else {
                        setError(`Erro ao buscar dados: ${response.statusText}`);
                    }
                    setLoading(false);
                    return;
                }

                const result = await response.json();
                
                // Suporte para resposta direta (array) ou envelopada { data: [] }
                const data = Array.isArray(result) ? result : (result.data || []);
                setAnimais(data);
            } catch (error) {
                console.error("Erro de conexão:", error);
                setError("Não foi possível conectar ao servidor.");
            } finally {
                setLoading(false);
            }
        }
        getAnimais();
    }, []); 

    async function deleteAnimal(id) {
        if (!window.confirm("Deseja remover permanentemente este animal do sistema?")) return;
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/animal/${id}`, { 
                method: "DELETE",
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (response.ok) {
                setAnimais(animais.filter((el) => el._id !== id));
            } else {
                window.alert("Erro ao excluir o animal.");
            }
        } catch (error) {
            console.error("Erro ao deletar:", error);
        }
    }

    // Filtro mais robusto (não quebra se campos forem nulos)
    const animaisFiltrados = (animais && Array.isArray(animais)) ? animais.filter((animal) => {
        if (!animal) return false;
        const termo = (pesquisa || "").toLowerCase();
        const nome = (animal.nome || "").toString().toLowerCase();
        const especie = (animal.especie || "").toString().toLowerCase();
        const raca = (animal.raca || "").toString().toLowerCase();
        const status = (animal.status || "").toString().toLowerCase();

        return nome.includes(termo) || especie.includes(termo) || raca.includes(termo) || status.includes(termo);
    }) : [];

    const primaryColor = '#5c3a21';

    return (
        <div className="container-fluid py-2">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h3 style={{ color: primaryColor, fontWeight: 'bold' }}>
                        <i className="bi bi-paw-fill me-2"></i> Animais Abrigados
                    </h3>
                    <p className="text-muted mb-0">Gerencie os peludos sob a proteção do Patas & Lares</p>
                </div>
                <Link 
                    className="btn text-white px-4 py-2 d-inline-flex align-items-center shadow-sm" 
                    to="/cadastrar-animal" 
                    style={{ backgroundColor: primaryColor, fontWeight: '500', borderRadius: '6px' }}
                >
                    <i className="bi bi-plus-lg me-2"></i> Novo Animal
                </Link>
            </div>
            
            {error && (
                <div className="alert alert-danger shadow-sm border-0 mb-4" style={{ borderRadius: '8px' }}>
                    <i className="bi bi-exclamation-triangle me-2"></i> {error}
                </div>
            )}

            <div className="card border-0 shadow-sm p-3 mb-4" style={{ borderRadius: '8px' }}>
                <div className="input-group">
                    <span className="input-group-text bg-white border-end-0 text-muted px-3">
                        <i className="bi bi-search"></i>
                    </span>
                    <input
                        type="text"
                        className="form-control border-start-0 py-2"
                        placeholder="Pesquisar por nome, espécie, raça ou status..."
                        value={pesquisa}
                        onChange={(e) => setPesquisa(e.target.value)}
                        style={{ boxShadow: 'none', borderRadius: '0 6px 6px 0', border: '1px solid #ced4da' }}
                    />
                </div>
                {!loading && !error && (
                    <div className="mt-2 ps-1">
                        <small className="text-muted">
                            Exibindo <strong>{animaisFiltrados.length}</strong> de {animais.length} animais.
                        </small>
                    </div>
                )}
            </div>

            <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: '8px', overflow: 'hidden' }}>
                <div className="table-responsive">
                    <table className="table table-hover mb-0">
                        <thead className="table-light">
                            <tr style={{ borderBottom: '2px solid #e9ecef' }}>
                                <th style={{ paddingLeft: '1.5rem', color: primaryColor, fontWeight: '600' }}>Nome</th>
                                <th style={{ color: primaryColor, fontWeight: '600' }}>Espécie</th>
                                <th style={{ color: primaryColor, fontWeight: '600' }}>Raça</th>
                                <th style={{ color: primaryColor, fontWeight: '600' }}>Porte</th>
                                <th style={{ color: primaryColor, fontWeight: '600' }}>Status</th>
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
                            ) : animaisFiltrados.length > 0 ? (
                                animaisFiltrados.map((animal) => (
                                    <AnimalRecord 
                                        record={animal} 
                                        deleteAnimal={deleteAnimal} 
                                        key={animal._id} 
                                    />
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="text-center text-muted py-5">
                                        <i className="bi bi-heartbreak text-muted d-block mb-2" style={{ fontSize: '2rem' }}></i>
                                        Nenhum animal cadastrado ou encontrado.
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
