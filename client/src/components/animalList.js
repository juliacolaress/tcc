import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import API_BASE_URL from "../api/config";
import { normalizeFotos, aoErrarImagem } from "../utils/fotos";

// Componente do Card do Animal
const AnimalCard = ({ record, deleteAnimal, marcarComoAdotado }) => {
    const primaryColor = '#4a2511';
    const brownColor = '#aa7a44';
    const badgeStyle = { backgroundColor: '#fdf7f2', color: primaryColor, border: '1px solid #eadfcf' };
    const fotos = normalizeFotos(record);
    const [imagemAtual, setImagemAtual] = useState(0);
    const imagemPadrao = (record.especie || "").toLowerCase() === "gato"
        ? "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?q=80&w=500"
        : "https://images.unsplash.com/photo-1543466835-00a7907e9de1?q=80&w=500";
    const imagem = fotos.length > 0 ? fotos[imagemAtual] : imagemPadrao;
    const generoLabel = record.genero === "M" ? "Macho" : record.genero === "F" ? "Fêmea" : "---";

    return (
        <div className="card shadow-sm h-100" style={{ borderRadius: '10px', overflow: 'hidden', backgroundColor: '#fff', border: '1px solid #eadfcf' }}>
            <div style={{ height: '220px', overflow: 'hidden', backgroundColor: '#f8f9fa', position: 'relative' }}>
                <img src={imagem} className="w-100 h-100" style={{ objectFit: 'cover' }} alt={record.nome} onError={aoErrarImagem} />
                {fotos.length > 1 && (
                    <div className="position-absolute bottom-0 start-0 end-0 d-flex justify-content-center gap-1 pb-2" style={{ background: 'linear-gradient(transparent, rgba(0,0,0,0.5))' }}>
                        {fotos.map((url, index) => (
                            <img
                                key={index}
                                src={url}
                                alt={`Thumbnail ${index + 1}`}
                                onClick={() => setImagemAtual(index)}
                                onError={aoErrarImagem}
                                style={{
                                    width: '40px',
                                    height: '40px',
                                    objectFit: 'cover',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    border: index === imagemAtual ? '2px solid white' : '2px solid transparent',
                                    opacity: index === imagemAtual ? 1 : 0.7
                                }}
                            />
                        ))}
                    </div>
                )}
            </div>
            <div className="card-body d-flex flex-column p-3">
                <h5 className="fw-bold mb-2" style={{ color: primaryColor }}>{record.nome}</h5>
                <div className="d-flex flex-wrap gap-2 mb-3">
                    <span className="badge px-2 py-1" style={badgeStyle}>{record.especie || "---"}</span>
                    <span className="badge px-2 py-1" style={badgeStyle}>{record.raca || "Sem raça"}</span>
                    <span className="badge px-2 py-1" style={badgeStyle}>{generoLabel}</span>
                    <span className="badge px-2 py-1" style={badgeStyle}>Porte {record.porte || "---"}</span>
                </div>
                <div className="mt-auto d-flex flex-column gap-2">
                    <button
                        className="btn text-white w-100 d-inline-flex align-items-center justify-content-center gap-2"
                        style={{ backgroundColor: brownColor, borderRadius: '6px', fontWeight: '500' }}
                        onClick={() => marcarComoAdotado(record._id)}
                        title="Marcar como Adotado"
                    >
                        <i className="bi bi-heart-fill"></i> Adotar
                    </button>
                    <div className="d-flex gap-2">
                        <Link
                            className="btn btn-sm btn-outline-secondary flex-fill d-inline-flex align-items-center justify-content-center"
                            to={`/edit-animal/${record._id}`}
                            style={{ borderRadius: '6px' }}
                        >
                            <i className="bi bi-pencil me-1"></i> Editar
                        </Link>
                        <button
                            className="btn btn-sm btn-outline-danger flex-fill d-inline-flex align-items-center justify-content-center"
                            onClick={() => deleteAnimal(record._id)}
                            style={{ borderRadius: '6px' }}
                        >
                            <i className="bi bi-trash me-1"></i> Excluir
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default function AnimalList() {
    const [animais, setAnimais] = useState([]);
    const [pesquisa, setPesquisa] = useState("");
    const [filtroEspecie, setFiltroEspecie] = useState("Todos");
    const [filtroGenero, setFiltroGenero] = useState("Todos");
    const [filtroPorte, setFiltroPorte] = useState("Todos");
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

    // 4. FILTRO ROBUSTO: ESCONDE OS "ADOTADOS" E FILTRA POR TERMO DE PESQUISA + FILTROS
    const animaisFiltrados = (animais && Array.isArray(animais)) ? animais.filter((animal) => {
        if (!animal || animal.status === "Adotado") return false; // Esconde os adotados desta view
        
        const termo = (pesquisa || "").toLowerCase();
        const nome = (animal.nome || "").toString().toLowerCase();
        const especie = (animal.especie || "").toString().toLowerCase();
        const raca = (animal.raca || "").toString().toLowerCase();

        const correspondeBusca = nome.includes(termo) || especie.includes(termo) || raca.includes(termo);
        const correspondeEspecie = filtroEspecie === "Todos" || (animal.especie || "").toLowerCase() === filtroEspecie.toLowerCase();
        const correspondeGenero = filtroGenero === "Todos" || (animal.genero || "") === filtroGenero;
        const correspondePorte = filtroPorte === "Todos" || (animal.porte || "").toLowerCase() === filtroPorte.toLowerCase();

        return correspondeBusca && correspondeEspecie && correspondeGenero && correspondePorte;
    }) : [];

    return (
        <div className="container mt-4">
            {/* Cabeçalho */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h3 style={{ color: primaryColor, fontWeight: 'bold' }}>
                        Animais Abrigados
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

                {/* Filtros */}
                <div className="row g-2 mt-2">
                    <div className="col-md-4 col-sm-6">
                        <select
                            className="form-select py-2"
                            value={filtroEspecie}
                            onChange={(e) => setFiltroEspecie(e.target.value)}
                            style={{ boxShadow: 'none', border: '1px solid #ced4da' }}
                        >
                            <option value="Todos">Espécie: Todos</option>
                            <option value="Cachorro">Cachorro</option>
                            <option value="Gato">Gato</option>
                        </select>
                    </div>
                    <div className="col-md-4 col-sm-6">
                        <select
                            className="form-select py-2"
                            value={filtroGenero}
                            onChange={(e) => setFiltroGenero(e.target.value)}
                            style={{ boxShadow: 'none', border: '1px solid #ced4da' }}
                        >
                            <option value="Todos">Gênero: Todos</option>
                            <option value="M">Macho</option>
                            <option value="F">Fêmea</option>
                        </select>
                    </div>
                    <div className="col-md-4 col-sm-12">
                        <select
                            className="form-select py-2"
                            value={filtroPorte}
                            onChange={(e) => setFiltroPorte(e.target.value)}
                            style={{ boxShadow: 'none', border: '1px solid #ced4da' }}
                        >
                            <option value="Todos">Porte: Todos</option>
                            <option value="Pequeno">Pequeno</option>
                            <option value="Médio">Médio</option>
                            <option value="Grande">Grande</option>
                        </select>
                    </div>
                </div>

                {!loading && !error && (
                    <div className="mt-2 ps-1">
                        <small className="text-muted">
                            Abrigados atualmente: <strong>{animaisFiltrados.length}</strong> peludos.
                        </small>
                    </div>
                )}
            </div>

            {/* Grid de Cards de Animais */}
            {loading ? (
                <div className="text-center py-5">
                    <div className="spinner-border" style={{ color: primaryColor }} role="status"></div>
                </div>
            ) : animaisFiltrados.length > 0 ? (
                <div className="row row-cols-1 row-cols-md-2 row-cols-xl-3 g-4">
                    {animaisFiltrados.map((animal) => (
                        <div className="col" key={animal._id}>
                            <AnimalCard
                                record={animal}
                                deleteAnimal={deleteAnimal}
                                marcarComoAdotado={marcarComoAdotado}
                            />
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center text-muted py-5">
                    <i className="bi bi-heartbreak text-muted d-block mb-2" style={{ fontSize: '2rem' }}></i>
                    Nenhum animal abrigado no momento.
                </div>
            )}
        </div>
    );
}