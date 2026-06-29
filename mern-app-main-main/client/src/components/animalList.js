import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import API_BASE_URL from "../api/config";

// Componente da Linha da Tabela (AnimalRecord) com o novo botão de Ação rápida para Adoção
const AnimalRecord = (props) => {
    return (
        <tr className="align-middle">
            <td className="fw-semibold text-dark ps-3">{props.record.nome}</td>
            <td>
                <span className="badge bg-light text-dark border px-2 py-1" style={{ borderRadius: '4px' }}>
                    {props.record.especie}
                </span>
            </td>
            <td className="text-muted">{props.record.raca || "---"}</td>
            <td className="text-muted">{props.record.porte || "---"}</td>
            <td>
                {/* Botão de ação rápida que altera o status para Adotado */}
                <button 
                    className="btn btn-sm btn-outline-success d-inline-flex align-items-center"
                    onClick={() => props.marcarComoAdotado(props.record._id)}
                    title="Marcar como Adotado"
                    style={{ borderRadius: '4px' }}
                >
                    <i className="bi bi-heart-fill me-1"></i> Adotar
                </button>
            </td>
            <td>
                <div className="d-flex gap-2">
                    <Link 
                        className="btn btn-sm btn-outline-secondary d-inline-flex align-items-center" 
                        to={`/edit-animal/${props.record._id}`}
                        style={{ borderRadius: '4px' }}
                    >
                        <i className="bi bi-pencil me-1"></i> Editar
                    </Link>
                    <button 
                        className="btn btn-sm btn-outline-danger d-inline-flex align-items-center" 
                        onClick={() => props.deleteAnimal(props.record._id)}
                        style={{ borderRadius: '4px' }}
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
    
    const primaryColor = '#4a2511';

    // 1. BUSCA TODOS OS ANIMAIS DO BANCO
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

    // 2. FUNÇÃO PARA MARCAR COMO ADOTADO (Move para o Histórico)
    async function marcarComoAdotado(id) {
        const adotante = window.prompt("Digite o nome do adotante:");
        if (adotante === null) return; // Cancelou
        
        if (!adotante.trim()) {
            window.alert("O nome do adotante é obrigatório para registrar a adoção.");
            return;
        }

        if (!window.confirm(`Confirmar a adoção de este animal por ${adotante}?`)) return;

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/animal/update/${id}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ 
                    status: "Adotado",
                    adotante: adotante,
                    data_adocao: new Date().toISOString().split('T')[0] // Data de hoje
                })
            });

            if (response.ok) {
                // Remove visualmente da tela atual na mesma hora
                setAnimais(animais.filter((el) => el._id !== id));
                window.alert("Adoção registrada com sucesso!");
            } else {
                window.alert("Erro ao registrar adoção.");
            }
        } catch (error) {
            console.error("Erro ao atualizar status:", error);
            window.alert("Erro ao conectar ao servidor.");
        }
    }

    // 3. FUNÇÃO PARA EXCLUIR PERMANENTEMENTE
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

    // 4. FILTRO ROBUSTO: ESCONDE OS "ADOTADOS" E FILTRA POR TERMO DE PESQUISA
    const animaisFiltrados = (animais && Array.isArray(animais)) ? animais.filter((animal) => {
        if (!animal || animal.status === "Adotado") return false; // Esconde os adotados desta view
        
        const termo = (pesquisa || "").toLowerCase();
        const nome = (animal.nome || "").toString().toLowerCase();
        const especie = (animal.especie || "").toString().toLowerCase();
        const raca = (animal.raca || "").toString().toLowerCase();

        return nome.includes(termo) || especie.includes(termo) || raca.includes(termo);
    }) : [];

    return (
        <div className="container mt-4">
            {/* Cabeçalho */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h3 style={{ color: primaryColor, fontWeight: 'bold' }}>
                        <i className="bi bi-paw-fill me-2"></i> Animais Abrigados
                    </h3>
                </div>
                <div className="d-flex gap-2">
                    {/* Atalho para ver a nova tela de Histórico */}
                    <Link 
                        className="btn btn-outline-secondary px-3 py-2 d-inline-flex align-items-center"
                        to="/adotados"
                        style={{ fontWeight: '500', borderRadius: '6px' }}
                    >
                        <i className="bi bi-archive me-2"></i> Histórico de Adoções
                    </Link>
                    <Link 
                        className="btn text-white px-4 py-2 d-inline-flex align-items-center shadow-sm" 
                        to="/cadastrar-animal" 
                        style={{ backgroundColor: primaryColor, fontWeight: '500', borderRadius: '6px' }}
                    >
                        <i className="bi bi-plus-lg me-2"></i> Novo Animal
                    </Link>
                </div>
            </div>
            <hr />
            
            {error && (
                <div className="alert alert-danger shadow-sm border-0 mb-4" style={{ borderRadius: '8px' }}>
                    <i className="bi bi-exclamation-triangle me-2"></i> {error}
                </div>
            )}

            {/* Barra de Pesquisa */}
            <div className="card border-0 shadow-sm p-3 mb-4" style={{ borderRadius: '8px' }}>
                <div className="input-group">
                    <span className="input-group-text bg-white border-end-0 text-muted px-3">
                        <i className="bi bi-search"></i>
                    </span>
                    <input
                        type="text"
                        className="form-control border-start-0 py-2"
                        placeholder="Pesquisar por nome, espécie ou raça..."
                        value={pesquisa}
                        onChange={(e) => setPesquisa(e.target.value)}
                        style={{ boxShadow: 'none', borderRadius: '0 6px 6px 0', border: '1px solid #ced4da' }}
                    />
                </div>
                {!loading && !error && (
                    <div className="mt-2 ps-1">
                        <small className="text-muted">
                            Abrigados atualmente: <strong>{animaisFiltrados.length}</strong> peludos.
                        </small>
                    </div>
                )}
            </div>

            {/* Tabela de Animais Ativos */}
            <div className="table-responsive shadow-sm" style={{ borderRadius: '8px' }}>
                <table className="table table-hover table-striped mb-0">
                    <thead className="text-white" style={{ backgroundColor: primaryColor }}>
                        <tr>
                            <th className="py-3 ps-3">Nome</th>
                            <th className="py-3">Espécie</th>
                            <th className="py-3">Raça</th>
                            <th className="py-3">Porte</th>
                            <th className="py-3">Ação Rápida</th>
                            <th className="py-3 pe-3" style={{ width: '180px' }}>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan="6" className="text-center py-5">
                                    <div className="spinner-border" style={{ color: primaryColor }} role="status"></div>
                                </td>
                            </tr>
                        ) : animaisFiltrados.length > 0 ? (
                            animaisFiltrados.map((animal) => (
                                <AnimalRecord 
                                    record={animal} 
                                    deleteAnimal={deleteAnimal} 
                                    marcarComoAdotado={marcarComoAdotado}
                                    key={animal._id} 
                                />
                            ))
                        ) : (
                            <tr>
                                <td colSpan="6" className="text-center text-muted py-5">
                                    <i className="bi bi-heartbreak text-muted d-block mb-2" style={{ fontSize: '2rem' }}></i>
                                    Nenhum animal abrigado no momento.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}