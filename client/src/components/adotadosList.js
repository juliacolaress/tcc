import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import API_BASE_URL from "../api/config";
import { normalizeFotos, aoErrarImagem, PLACEHOLDER_IMAGEM } from "../utils/fotos";

// Componente do Card do Animal Adotado
const AdoptedCard = ({ record, onExcluir }) => {
    const primaryColor = '#3D2314';
    const fotos = normalizeFotos(record);
    const imagemPadrao = PLACEHOLDER_IMAGEM;
    const imagem = fotos.length > 0 ? fotos[0] : imagemPadrao;

    // Formata a data de adoção para o padrão brasileiro
    const formatDate = (dateStr) => {
        if (!dateStr) return "---";
        const date = new Date(dateStr);
        return date.toLocaleDateString('pt-BR');
    };

    // Valores reais do documento do animal; fallback só quando o campo está ausente no banco
    const generoLabel = record.genero === "M" ? "Macho"
        : record.genero === "F" ? "Fêmea"
        : (record.genero || "Não informado");

    return (
        <div className="card border-0 shadow-sm h-100" style={{ borderRadius: '10px', overflow: 'hidden', backgroundColor: '#fff' }}>
            <div style={{ height: '220px', overflow: 'hidden', backgroundColor: '#f8f9fa' }}>
                <img src={imagem} className="w-100 h-100" style={{ objectFit: 'cover' }} alt={record.nome || "Animal"} onError={aoErrarImagem} />
            </div>
            <div className="card-body d-flex flex-column p-3">
                <h5 className="fw-bold mb-1" style={{ color: primaryColor }}>{record.nome}</h5>
                <span className="badge bg-success-subtle text-success border border-success-subtle align-self-start mb-2">
                    Adotado
                </span>
                <div className="d-flex flex-wrap gap-2 mb-2">
                    <span className="badge bg-light text-dark border px-2 py-1">{record.especie || "Não informado"}</span>
                    <span className="badge bg-light text-dark border px-2 py-1">{record.raca || "Sem raça"}</span>
                    <span className="badge bg-light text-dark border px-2 py-1">{generoLabel}</span>
                    <span className="badge bg-light text-dark border px-2 py-1">Porte {record.porte || "Não informado"}</span>
                </div>
                <div className="text-muted small mb-3">
                    <div><i className="bi bi-person-heart me-1"></i> Adotante: <strong>{record.adotante || "Não informado"}</strong></div>
                    <div><i className="bi bi-calendar-check me-1"></i> Adoção: <strong>{formatDate(record.data_adocao)}</strong></div>
                </div>
                <div className="mt-auto d-flex flex-column gap-2">
                    <Link
                        className="btn btn-sm btn-outline-secondary w-100 d-inline-flex align-items-center justify-content-center gap-2"
                        to={`/edit-animal/${record._id}`}
                        style={{ borderRadius: '6px', fontWeight: '500' }}
                    >
                        <i className="bi bi-pencil"></i> Editar
                    </Link>
                    <div className="d-flex gap-2">
                        <Link
                            className="btn btn-sm text-white flex-fill d-inline-flex align-items-center justify-content-center gap-2"
                            to={`/adotados/editar/${record._id}`}
                            style={{ backgroundColor: primaryColor, borderRadius: '6px', fontWeight: '500' }}
                        >
                            <i className="bi bi-arrow-return-left"></i> Devolver
                        </Link>
                        <button
                            type="button"
                            className="btn btn-sm btn-outline-danger flex-fill d-inline-flex align-items-center justify-content-center gap-2"
                            onClick={() => onExcluir(record._id)}
                            style={{ borderRadius: '6px' }}
                        >
                            <i className="bi bi-trash"></i> Excluir
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default function AdotadosList() {
    const [animais, setAnimais] = useState([]);
    const [pesquisa, setPesquisa] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    const navigate = useNavigate();
    const primaryColor = '#3D2314';

    useEffect(() => {
        async function getAdotados() {
            try {
                const token = localStorage.getItem('token');
                // Rota dedicada do Histórico: traz o documento completo dos animais adotados
                const response = await fetch(`${API_BASE_URL}/adocoes`, {
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

    // Remove o registro (DELETE genérico /animal/:id) após confirmação
    async function excluirAnimal(id) {
        const animal = animais.find((el) => el && el._id === id);
        const nome = animal?.nome || "este pet";
        if (!window.confirm(`Deseja remover "${nome}" do histórico de adoções?`)) {
            return;
        }
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/animal/${id}`, {
                method: "DELETE",
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                setAnimais((atual) => atual.filter((el) => el && el._id !== id));
            } else {
                window.alert("Erro ao excluir o registro. Tente novamente.");
            }
        } catch (error) {
            console.error("Erro ao excluir animal:", error);
            window.alert("Erro de conexão com o servidor.");
        }
    }

    // Filtragem apenas por termo de busca — o backend já retorna somente animais adotados
    const filtrados = animais.filter((animal) => {
        if (!animal) return false;
        const termo = pesquisa.toLowerCase();
        return (animal.nome || "").toLowerCase().includes(termo) || 
               (animal.especie || "").toLowerCase().includes(termo) ||
               (animal.raca || "").toLowerCase().includes(termo) ||
               (animal.adotante || "").toLowerCase().includes(termo);
    });

    return (
        <div className="container mt-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h3 style={{ color: primaryColor, fontWeight: 'bold' }}>
                        <i className="bi bi-heart-fill me-2"></i> Histórico de Adoções
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
                        placeholder="Pesquisar por nome, espécie, raça ou adotante..."
                        value={pesquisa}
                        onChange={(e) => setPesquisa(e.target.value)}
                        style={{ boxShadow: 'none', borderRadius: '0 6px 6px 0', border: '1px solid #ced4da' }}
                    />
                </div>
            </div>

            {error && <div className="alert alert-danger">{error}</div>}

            {/* Grid de Cards de Adotados */}
            {loading ? (
                <div className="text-center py-5">
                    <div className="spinner-border" style={{ color: primaryColor }} role="status"></div>
                </div>
            ) : filtrados.length > 0 ? (
                <div className="row row-cols-1 row-cols-md-2 row-cols-xl-3 g-4">
                    {filtrados.map((animal) => (
                        <div className="col" key={animal._id}>
                            <AdoptedCard record={animal} onExcluir={excluirAnimal} />
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center text-muted py-5">
                    <i className="bi bi-heart text-muted d-block mb-2" style={{ fontSize: '2rem' }}></i>
                    Nenhum pet adotado encontrado.
                </div>
            )}
        </div>
    );
}