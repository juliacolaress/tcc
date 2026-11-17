import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import API_BASE_URL from "../api/config";
import { normalizeFotos, aoErrarImagem, PLACEHOLDER_IMAGEM } from "../utils/fotos";

// Componente do Card do Animal
const AnimalCard = ({ record, deleteAnimal, marcarComoAdotado }) => {
    const primaryColor = '#3D2314';
    const brownColor = '#A67C52';
    const badgeStyle = { backgroundColor: '#FAF6F0', color: primaryColor, border: '1px solid #eadfcf' };
    const fotos = normalizeFotos(record);
    const [imagemAtual, setImagemAtual] = useState(0);
    const imagemPadrao = PLACEHOLDER_IMAGEM;
    const imagem = fotos.length > 0 ? fotos[imagemAtual] : imagemPadrao;
    const generoLabel = record.genero === "M" ? "Macho" : record.genero === "F" ? "Fêmea" : "---";

    return (
        <div className="card shadow-sm h-100" style={{ borderRadius: '10px', overflow: 'hidden', backgroundColor: '#fff', border: '1px solid #eadfcf' }}>
            <div style={{ height: '220px', overflow: 'hidden', backgroundColor: '#f8f9fa', position: 'relative' }}>
                <img src={imagem} className="w-100 h-100" style={{ objectFit: 'cover' }} alt={record.nome || "Animal"} onError={aoErrarImagem} />
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
    const location = useLocation();
    const [solicitacoes, setSolicitacoes] = useState([]);
    const [caixaAberta, setCaixaAberta] = useState(false);

    const primaryColor = '#3D2314';

    // 1. BUSCA TODOS OS ANIMAIS DO BANCO (carga inicial e recarga após ações da caixa)
    async function carregarAnimais() {
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

    useEffect(() => {
        carregarAnimais();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // 1.1 BUSCA AS SOLICITAÇÕES DE ADOÇÃO (Caixa de Entrada — sem filtros de usuário/ID)
    async function carregarSolicitacoes() {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/solicitacoes-adocao`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) return [];
            const data = await response.json();
            const lista = Array.isArray(data) ? data : [];
            setSolicitacoes(lista);
            return lista;
        } catch (error) {
            console.error("Erro ao carregar solicitações de adoção:", error);
            return [];
        }
    }

    useEffect(() => {
        carregarSolicitacoes();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Abre a Caixa de Entrada automaticamente ao chegar do Dashboard
    useEffect(() => {
        if (location.state && location.state.caixaAdocao) {
            setCaixaAberta(true);
            window.history.replaceState({}, '');
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
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

    // 2.1 PROCESSA SOLICITAÇÃO DE ADOÇÃO DA CAIXA DE ENTRADA (aprovar/rejeitar)
    async function processarSolicitacao(id, novoStatus) {
        const confirmar = novoStatus === "Aprovada"
            ? window.confirm("Aprovar esta solicitação? O animal será marcado como Adotado e sairá da listagem de disponíveis.")
            : window.confirm("Rejeitar esta solicitação de adoção?");
        if (!confirmar) return;

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/solicitacao-adocao/${id}/status`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ status: novoStatus })
            });
            const data = await response.json().catch(() => ({}));
            if (!response.ok) {
                window.alert(data.mensagem || "Erro ao processar a solicitação.");
                return;
            }

            // Atualiza em tempo real: recarrega a caixa de entrada e a lista de animais
            const listaAtualizada = await carregarSolicitacoes();
            await carregarAnimais();

            window.alert(data.mensagem || (novoStatus === "Aprovada" ? "Solicitação aprovada!" : "Solicitação rejeitada."));

            const restantes = listaAtualizada.filter((s) => s && s.status === "Pendente").length;
            if (restantes === 0) setCaixaAberta(false);
        } catch (error) {
            console.error("Erro ao processar solicitação:", error);
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

    const solicitacoesPendentes = solicitacoes.filter((s) => s && s.status === "Pendente");

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

            {/* Banner da Caixa de Entrada de Adoções */}
            {solicitacoesPendentes.length > 0 && (
                <button
                    type="button"
                    className="btn btn-block w-100 d-flex justify-content-between align-items-center border-0 shadow-sm mb-4 px-4 py-3"
                    onClick={() => setCaixaAberta(true)}
                    style={{ backgroundColor: '#fff8e6', borderLeft: '6px solid #f0ad4e', borderRadius: '8px', textAlign: 'left' }}
                >
                    <span className="d-inline-flex align-items-center gap-2" style={{ color: '#8a6d1d', fontWeight: '600' }}>
                        <i className="bi bi-inbox-fill fs-5"></i>
                        Solicitações de Adoção Pendentes
                    </span>
                    <span className="badge fs-6 px-3 py-2" style={{ backgroundColor: '#856404', color: '#fff', borderRadius: '20px' }}>
                        {solicitacoesPendentes.length}
                    </span>
                </button>
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

            {/* Modal: Caixa de Entrada de Adoções */}
            {caixaAberta && (
                <div className="modal show d-block" tabIndex="-1" role="dialog" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} onClick={() => setCaixaAberta(false)}>
                    <div className="modal-dialog modal-dialog-centered modal-lg" role="document" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-content" style={{ borderRadius: '10px', maxHeight: '85vh', display: 'flex', flexDirection: 'column' }}>
                            <div className="modal-header" style={{ borderBottom: '2px solid #e9ecef', backgroundColor: '#fff8e6', borderTopLeftRadius: '10px', borderTopRightRadius: '10px' }}>
                                <h5 className="modal-title fw-bold" style={{ color: '#8a6d1d' }}>
                                    <i className="bi bi-inbox-fill me-2"></i> Caixa de Entrada de Solicitações de Adoção
                                </h5>
                                <span className="badge fs-6 px-3 py-2 me-2" style={{ backgroundColor: '#856404', color: '#fff', borderRadius: '20px' }}>
                                    {solicitacoesPendentes.length} pendente(s)
                                </span>
                                <button type="button" className="btn-close ms-2" onClick={() => setCaixaAberta(false)}></button>
                            </div>
                            <div className="modal-body" style={{ overflowY: 'auto', padding: '1.25rem' }}>
                                {solicitacoesPendentes.length === 0 ? (
                                    <div className="text-center text-muted py-5">
                                        <i className="bi bi-check2-circle d-block mb-2" style={{ fontSize: '2.2rem', color: '#28a745' }}></i>
                                        Não há solicitações de adoção pendentes no momento!
                                    </div>
                                ) : (
                                    solicitacoesPendentes.map((s) => {
                                        const fotosAnimal = s.animal ? normalizeFotos(s.animal) : [];
                                        return (
                                        <div key={s._id} className="border rounded-3 p-3 mb-3" style={{ backgroundColor: '#fdfbf7', borderLeft: '4px solid #ffc107' }}>
                                            <div className="d-flex flex-wrap justify-content-between align-items-center gap-2">
                                                <div className="d-flex align-items-center gap-2">
                                                    <div className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0 overflow-hidden" style={{ width: '42px', height: '42px', backgroundColor: '#fff3cd' }}>
                                                        {fotosAnimal.length > 0 ? (
                                                            <img
                                                                src={fotosAnimal[0]}
                                                                alt={s.animal?.nome || s.animal_nome || "Animal"}
                                                                className="w-100 h-100"
                                                                style={{ objectFit: 'cover' }}
                                                                onError={aoErrarImagem}
                                                            />
                                                        ) : (
                                                            <i className="bi bi-heart-fill fs-5" style={{ color: '#856404' }}></i>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <strong className="d-block" style={{ color: primaryColor }}>{s.solicitante?.nome || "Interessado não informado"}</strong>
                                                        <small className="text-muted">
                                                            Animal: <strong>{s.animal?.nome || s.animal_nome || "---"}</strong>
                                                            {s.animal?.especie ? ` · ${s.animal.especie}` : ""}
                                                            {s.animal?.raca ? ` · ${s.animal.raca}` : ""}
                                                        </small>
                                                    </div>
                                                </div>
                                                <span className="badge fw-semibold px-2 py-1 bg-warning-subtle text-warning-emphasis border border-warning-subtle">
                                                    <i className="bi bi-hourglass-split me-1"></i>Pendente
                                                </span>
                                            </div>
                                            <small className="text-muted d-block mt-2" style={{ wordBreak: "break-word", overflowWrap: "break-word", maxWidth: "100%" }}>
                                                {s.solicitante?.email}
                                                {s.solicitante?.telefone ? ` �� ${s.solicitante.telefone}` : ""}
                                                {s.solicitante?.endereco?.cidade ? ` �� ${s.solicitante.endereco.cidade}` : ""}
                                            </small>
                                            <div className="d-flex flex-wrap justify-content-end gap-2 mt-3 pt-3 border-top">
                                                <button
                                                    type="button"
                                                    className="btn btn-sm btn-outline-danger d-inline-flex align-items-center"
                                                    onClick={() => processarSolicitacao(s._id, "Rejeitada")}
                                                    style={{ borderRadius: '6px' }}
                                                >
                                                    <i className="bi bi-x-lg me-1"></i> Rejeitar
                                                </button>
                                                <button
                                                    type="button"
                                                    className="btn btn-sm btn-success d-inline-flex align-items-center text-white"
                                                    onClick={() => processarSolicitacao(s._id, "Aprovada")}
                                                    style={{ borderRadius: '6px' }}
                                                >
                                                    <i className="bi bi-check2-circle me-1"></i> Aceitar solicitação de adoção
                                                </button>
                                            </div>
                                        </div>
                                        );
                                    })
                                )}
                            </div>
                            <div className="modal-footer" style={{ borderTop: '2px solid #e9ecef' }}>
                                <button type="button" className="btn text-white px-4" style={{ backgroundColor: primaryColor, borderRadius: '6px' }} onClick={() => setCaixaAberta(false)}>
                                    Fechar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}