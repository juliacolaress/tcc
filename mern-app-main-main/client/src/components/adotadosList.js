import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import API_BASE_URL from "../api/config";

const AdoptedRow = ({ record }) => {
    return (
        <tr className="align-middle">
            <td className="fw-semibold text-dark ps-3">{record.nome}</td>
            <td>
                <span className="badge bg-light text-dark border px-2 py-1" style={{ borderRadius: '4px' }}>
                    {record.especie}
                </span>
            </td>
            <td className="text-muted">{record.raca || "---"}</td>
            <td className="text-muted">{record.porte || "---"}</td>
            <td>
                <span className="badge bg-secondary-subtle text-secondary border border-secondary-subtle px-2 py-1">
                    Adotado
                </span>
            </td>
            <td>
             
                <Link 
                    className="btn btn-sm btn-outline-primary d-inline-flex align-items-center" 
                    to={`/adotados/editar/${record._id}`}
                    style={{ borderRadius: '4px' }}
                >
                    <i className="bi bi-pencil-square me-1"></i> Gerenciar / Devolver
                </Link>
            </td>
        </tr>
    );
};

export default function AdotadosList() {
    const [animais, setAnimais] = useState([]);
    const [pesquisa, setPesquisa] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    const navigate = useNavigate();
    const primaryColor = '#5c3a21';

    useEffect(() => {
        async function getAdotados() {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch(`${API_BASE_URL}/animal`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (!response.ok) {
                    setError("Erro ao carregar o histórico de adotados.");
                    setLoading(false);
                    return;
                }

                const result = await response.json();
                const data = Array.isArray(result) ? result : (result.data || []);
                setAnimais(data);
            } catch (error) {
                console.error(error);
                setError("Erro de conexão com o servidor.");
            } finally {
                setLoading(false);
            }
        }
        getAdotados();
    }, []);

    const filtrados = animais.filter((animal) => {
        if (!animal || animal.status !== "Adotado") return false;
        const termo = pesquisa.toLowerCase();
        return (animal.nome || "").toLowerCase().includes(termo) || 
               (animal.especie || "").toLowerCase().includes(termo) ||
               (animal.raca || "").toLowerCase().includes(termo);
    });

    return (
        <div className="container mt-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h3 style={{ color: primaryColor, fontWeight: 'bold' }}>
                        <i className="bi bi-heart-fill me-2"></i> Histórico de Adotados
                    </h3>
                </div>
                <button className="btn btn-outline-secondary px-4 py-2" onClick={() => navigate("/animais")} style={{ borderRadius: '6px' }}>
                    <i className="bi bi-arrow-left me-2"></i> Voltar aos Abrigados
                </button>
            </div>
            <hr />

            <div className="card border-0 shadow-sm p-3 mb-4" style={{ borderRadius: '8px' }}>
                <div className="input-group">
                    <span className="input-group-text bg-white border-end-0 text-muted px-3"><i className="bi bi-search"></i></span>
                    <input
                        type="text"
                        className="form-control border-start-0 py-2"
                        placeholder="Pesquisar por nome, espécie ou raça..."
                        value={pesquisa}
                        onChange={(e) => setPesquisa(e.target.value)}
                        style={{ boxShadow: 'none', borderRadius: '0 6px 6px 0', border: '1px solid #ced4da' }}
                    />
                </div>
            </div>

            <div className="table-responsive shadow-sm" style={{ borderRadius: '8px' }}>
                <table className="table table-hover table-striped mb-0">
                    <thead className="text-white" style={{ backgroundColor: primaryColor }}>
                        <tr>
                            <th className="py-3 ps-3">Nome</th>
                            <th className="py-3">Espécie</th>
                            <th className="py-3">Raça</th>
                            <th className="py-3">Porte</th>
                            <th className="py-3">Status</th>
                            <th className="py-3 pe-3" style={{ width: '200px' }}>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="6" className="text-center py-5"><div className="spinner-border" style={{ color: primaryColor }}></div></td></tr>
                        ) : filtrados.length > 0 ? (
                            filtrados.map((animal) => <AdoptedRow record={animal} key={animal._id} />)
                        ) : (
                            <tr><td colSpan="6" className="text-center text-muted py-5">Nenhum pet adotado encontrado.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}