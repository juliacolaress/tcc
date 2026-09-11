import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import API_BASE_URL from "../api/config";

const statusCor = (status) => {
    const mapa = {
        'Pendente': { bg: '#fff3cd', color: '#856404', border: '#ffe69c' },
        'Aprovado': { bg: '#d4edda', color: '#155724', border: '#c3e6cb' },
        'Rejeitado': { bg: '#f8d7da', color: '#721c24', border: '#f5c6cb' },
        'Ativo': { bg: '#FAF6F0', color: '#3D2314', border: '#eadfcf' }
    };
    return mapa[status] || mapa['Ativo'];
};

const VoluntarioRecord = (props) => {
    const primaryColor = '#3D2314';
    const badgeStyle = { backgroundColor: '#FAF6F0', color: primaryColor, border: '1px solid #eadfcf' };

    const interesses = Array.isArray(props.record.interesses) ? props.record.interesses : [];
    const disponibilidade = Array.isArray(props.record.disponibilidade) ? props.record.disponibilidade : [];
    const status = props.record.status || 'Ativo';
    const corStatus = statusCor(status);

    return (
        <tr className="align-middle">
            <td className="fw-semibold text-dark" style={{ paddingLeft: '1.5rem' }}>{props.record.nome}</td>
            <td className="text-muted">{props.record.email}</td>
            <td className="text-secondary">
                {props.record.ddd && props.record.telefone ? `(${props.record.ddd}) ${props.record.telefone}` : "---"}
            </td>
            <td className="text-muted">{props.record.cidade ? `${props.record.cidade} - ${props.record.estado}` : "---"}</td>
            <td>
                {interesses.length > 0 ? (
                    <div className="d-flex flex-wrap gap-1">
                        {interesses.map((interesse) => (
                            <span key={interesse} className="badge px-2 py-1" style={badgeStyle}>{interesse}</span>
                        ))}
                    </div>
                ) : (
                    <span className="text-muted">---</span>
                )}
            </td>
            <td>
                {disponibilidade.length > 0 ? (
                    <div className="d-flex flex-wrap gap-1">
                        {disponibilidade.map((disp, index) => (
                            <span key={index} className="badge px-2 py-1" style={badgeStyle}>
                                {disp.dia} · {disp.horario}
                            </span>
                        ))}
                    </div>
                ) : (
                    <span className="text-muted">---</span>
                )}
            </td>
            <td>
                <span className="badge px-2 py-1" style={{ backgroundColor: corStatus.bg, color: corStatus.color, border: `1px solid ${corStatus.border}` }}>
                    {status}
                </span>
            </td>
            <td>
                <div className="d-flex flex-wrap gap-2" style={{ minWidth: '260px' }}>
                    <Link
                        className="btn btn-sm btn-outline-secondary d-inline-flex align-items-center"
                        to={`/edit-voluntarios/${props.record._id}`}
                        title="Editar"
                        style={{ borderRadius: '6px' }}
                    >
                        <i className="bi bi-pencil-square me-1"></i> Editar
                    </Link>
                    <button
                        className="btn btn-sm btn-outline-danger d-inline-flex align-items-center"
                        onClick={() => props.deleteVoluntario(props.record._id)}
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

export default function VoluntarioList() {
    const location = useLocation();
    const [voluntarios, setVoluntarios] = useState([]);
    const [pesquisa, setPesquisa] = useState("");
    const [filtroDia, setFiltroDia] = useState("");
    const [filtroHorario, setFiltroHorario] = useState("");
    const [filtroAplicado, setFiltroAplicado] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [caixaAberta, setCaixaAberta] = useState(false);

    const DIAS_SEMANA = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"];
    const TURNOS = ["Manhã", "Tarde", "Noite"];

    async function carregarVoluntarios() {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/voluntarios`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) {
                setError(`Erro ao carregar voluntários: ${response.statusText}`);
                return;
            }
            const data = await response.json();
            setVoluntarios(data);
        } catch (error) {
            console.error("Erro de conexão:", error);
            setError("Não foi possível conectar ao servidor.");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        carregarVoluntarios();
        if (location.state && location.state.abrirCaixa) {
            setCaixaAberta(true);
            window.history.replaceState({}, '');
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    function handleFiltrar(e) {
        e.preventDefault();
        setFiltroAplicado(Boolean(filtroDia || filtroHorario));
    }

    function handleLimpar() {
        setFiltroDia("");
        setFiltroHorario("");
        setFiltroAplicado(false);
    }

    async function deleteVoluntario(id) {
        if (!window.confirm("Deseja excluir permanentemente este voluntário?")) return;
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/voluntario/${id}`, { 
                method: "DELETE",
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (response.ok) {
                setVoluntarios(voluntarios.filter((el) => el._id !== id));
            } else {
                window.alert("Erro ao excluir voluntário.");
            }
        } catch (error) {
            console.error("Erro ao deletar:", error);
        }
    }

    async function atualizarStatus(id, status) {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/voluntario/status/${id}`, {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status })
            });
            if (response.ok) {
                setVoluntarios(voluntarios.map((v) => v._id === id ? { ...v, status } : v));
            } else {
                let mensagem = "Erro ao atualizar o status.";
                try {
                    const data = await response.json();
                    if (data && data.mensagem) mensagem = data.mensagem;
                } catch (err) {
                    // resposta não é JSON
                }
                window.alert(mensagem);
            }
        } catch (error) {
            console.error("Erro ao atualizar status:", error);
            window.alert("Não foi possível conectar ao servidor.");
        }
    }

    const voluntariosFiltrados = voluntarios.filter((v) => {
        const termo = pesquisa.toLowerCase();
        const correspondeBusca = (
            (v.nome && v.nome.toLowerCase().includes(termo)) ||
            (v.email && v.email.toLowerCase().includes(termo)) ||
            (v.cidade && v.cidade.toLowerCase().includes(termo))
        );

        const disp = Array.isArray(v.disponibilidade) ? v.disponibilidade : [];
        const correspondeDia = filtroDia === "" || disp.some((d) => d.dia === filtroDia);
        const correspondeHorario = filtroHorario === "" || disp.some((d) => d.horario === filtroHorario);

        return correspondeBusca && correspondeDia && correspondeHorario;
    });

    const primaryColor = '#3D2314';
    const badgeStyle = { backgroundColor: '#FAF6F0', color: primaryColor, border: '1px solid #eadfcf' };
    const pendentes = voluntarios.filter((v) => (v.status || 'Ativo') === 'Pendente');

    return (
        <div className="container-fluid py-2">
            {/* Cabeçalho */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h3 style={{ color: primaryColor, fontWeight: 'bold' }}>Voluntários Cadastrados</h3>
                    <p className="text-muted mb-0">Gerencie a equipe de apoio do Patas & Lares</p>
                </div>
                <Link 
                    className="btn text-white px-4 py-2 d-inline-flex align-items-center shadow-sm" 
                    to="/cadastrar-voluntarios" 
                    style={{ backgroundColor: primaryColor, fontWeight: '500', borderRadius: '6px' }}
                >
                    <i className="bi bi-plus-lg me-2"></i> Novo Voluntário
                </Link>
            </div>

            {/* Alerta/Botão: Solicitações Pendentes */}
            {pendentes.length > 0 && (
                <button
                    type="button"
                    className="btn btn-block w-100 d-flex justify-content-between align-items-center border-0 shadow-sm mb-4 px-4 py-3"
                    onClick={() => setCaixaAberta(true)}
                    style={{ backgroundColor: '#fff8e6', borderLeft: '6px solid #f0ad4e', borderRadius: '8px', textAlign: 'left' }}
                >
                    <span className="d-inline-flex align-items-center gap-2" style={{ color: '#8a6d1d', fontWeight: '600' }}>
                        <i className="bi bi-inbox-fill fs-5"></i>
                        Solicitações de Voluntários Pendentes
                    </span>
                    <span className="badge fs-6 px-3 py-2" style={{ backgroundColor: '#856404', color: '#fff', borderRadius: '20px' }}>
                        {pendentes.length}
                    </span>
                </button>
            )}

            {/* Campo de Pesquisa e Filtro por Disponibilidade */}
            <div className="card border-0 shadow-sm p-3 mb-4" style={{ borderRadius: '8px' }}>
                <div className="input-group">
                    <span className="input-group-text bg-white border-end-0 text-muted px-3">
                        <i className="bi bi-search"></i>
                    </span>
                    <input
                        type="text"
                        className="form-control border-start-0 py-2"
                        placeholder="Pesquisar por nome, e-mail ou cidade..."
                        value={pesquisa}
                        onChange={(e) => setPesquisa(e.target.value)}
                        style={{ boxShadow: 'none', borderRadius: '0 6px 6px 0', border: '1px solid #ced4da' }}
                    />
                </div>

                <form onSubmit={handleFiltrar} className="row g-2 mt-3 align-items-end">
                    <div className="col-md-4 col-sm-6">
                        <select
                            className="form-select py-2"
                            value={filtroDia}
                            onChange={(e) => setFiltroDia(e.target.value)}
                            style={{ boxShadow: 'none', border: '1px solid #ced4da' }}
                        >
                            <option value="">Dia da semana: Todos</option>
                            {DIAS_SEMANA.map((dia) => (
                                <option key={dia} value={dia}>{dia}</option>
                            ))}
                        </select>
                    </div>
                    <div className="col-md-4 col-sm-6">
                        <select
                            className="form-select py-2"
                            value={filtroHorario}
                            onChange={(e) => setFiltroHorario(e.target.value)}
                            style={{ boxShadow: 'none', border: '1px solid #ced4da' }}
                        >
                            <option value="">Horário: Todos</option>
                            {TURNOS.map((turno) => (
                                <option key={turno} value={turno}>{turno}</option>
                            ))}
                        </select>
                    </div>
                    <div className="col-md-4 col-sm-12 d-flex gap-2">
                        <button type="submit" className="btn text-white px-4 flex-fill" style={{ backgroundColor: primaryColor, borderRadius: '6px', fontWeight: '500' }}>
                            <i className="bi bi-funnel me-1"></i> Filtrar
                        </button>
                        {filtroAplicado && (
                            <button type="button" className="btn btn-outline-secondary px-4" onClick={handleLimpar} style={{ borderRadius: '6px' }}>
                                <i className="bi bi-x-lg me-1"></i> Limpar
                            </button>
                        )}
                    </div>
                </form>

                <div className="mt-2 ps-1">
                    <small className="text-muted">
                        Exibindo <strong>{voluntariosFiltrados.length}</strong> de {voluntarios.length} registros.
                        {filtroAplicado && " (filtro por disponibilidade aplicado)"}
                    </small>
                </div>
            </div>

            {/* Tabela */}
            <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: '8px', overflow: 'hidden' }}>
                <div className="table-responsive">
                    <table className="table table-hover mb-0">
                        <thead className="table-light">
                            <tr style={{ borderBottom: '2px solid #e9ecef' }}>
                                <th style={{ paddingLeft: '1.5rem', color: primaryColor, fontWeight: '600' }}>Nome</th>
                                <th style={{ color: primaryColor, fontWeight: '600' }}>E-mail</th>
                                <th style={{ color: primaryColor, fontWeight: '600' }}>Telefone</th>
                                <th style={{ color: primaryColor, fontWeight: '600' }}>Cidade/UF</th>
                                <th style={{ color: primaryColor, fontWeight: '600' }}>Interesses</th>
                                <th style={{ color: primaryColor, fontWeight: '600' }}>Disponibilidade</th>
                                <th style={{ color: primaryColor, fontWeight: '600' }}>Status</th>
                                <th style={{ color: primaryColor, fontWeight: '600', width: '300px' }}>Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="8" className="text-center py-5">
                                        <div className="spinner-border text-primary" role="status"></div>
                                    </td>
                                </tr>
                            ) : error ? (
                                <tr>
                                    <td colSpan="8" className="text-center text-danger py-5">
                                        <i className="bi bi-exclamation-triangle d-block mb-2" style={{ fontSize: '2rem' }}></i>
                                        {error}
                                    </td>
                                </tr>
                            ) : voluntariosFiltrados.length > 0 ? (
                                voluntariosFiltrados.map((voluntario) => (
                                    <VoluntarioRecord 
                                        record={voluntario} 
                                        deleteVoluntario={deleteVoluntario} 
                                        key={voluntario._id} 
                                    />
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="8" className="text-center text-muted py-5">
                                        <i className="bi bi-people text-muted d-block mb-2" style={{ fontSize: '2rem' }}></i>
                                        Nenhum voluntário encontrado.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal: Solicitações Pendentes */}
            {caixaAberta && (
                <div className="modal show d-block" tabIndex="-1" role="dialog" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} onClick={() => setCaixaAberta(false)}>
                    <div className="modal-dialog modal-dialog-centered modal-lg" role="document" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-content" style={{ borderRadius: '10px', maxHeight: '85vh', display: 'flex', flexDirection: 'column' }}>
                            <div className="modal-header" style={{ borderBottom: '2px solid #e9ecef', backgroundColor: '#fff8e6', borderTopLeftRadius: '10px', borderTopRightRadius: '10px' }}>
                                <h5 className="modal-title fw-bold" style={{ color: '#8a6d1d' }}>
                                    <i className="bi bi-inbox-fill me-2"></i> Caixa de Entrada
                                </h5>
                                <span className="badge fs-6 px-3 py-2 me-2" style={{ backgroundColor: '#856404', color: '#fff', borderRadius: '20px' }}>
                                    {pendentes.length} pendente(s)
                                </span>
                                <button type="button" className="btn-close ms-2" onClick={() => setCaixaAberta(false)}></button>
                            </div>
                            <div className="modal-body" style={{ overflowY: 'auto', padding: '1.25rem' }}>
                                {loading ? (
                                    <div className="text-center text-muted py-5">
                                        <div className="spinner-border text-primary" role="status"></div>
                                    </div>
                                ) : pendentes.length === 0 ? (
                                    <div className="text-center text-muted py-5">
                                        <i className="bi bi-check2-circle d-block mb-2" style={{ fontSize: '2.2rem', color: '#28a745' }}></i>
                                        Todas as solicitações foram analisadas!
                                    </div>
                                ) : (
                                    pendentes.map((v) => {
                                        const telefone = v.ddd && v.telefone ? `(${v.ddd}) ${v.telefone}` : null;
                                        return (
                                            <div key={v._id} className="border rounded-3 p-3 mb-3" style={{ backgroundColor: '#fdfbf7', borderLeft: '4px solid #ffc107' }}>
                                                <div className="d-flex flex-wrap justify-content-between align-items-center gap-2">
                                                    <div className="d-flex align-items-center gap-2">
                                                        <div className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0" style={{ width: '42px', height: '42px', backgroundColor: '#fff3cd' }}>
                                                            <i className="bi bi-person-fill fs-5" style={{ color: '#856404' }}></i>
                                                        </div>
                                                        <div>
                                                            <strong className="d-block" style={{ color: primaryColor }}>{v.nome}</strong>
                                                            <small className="text-muted">
                                                                {v.email}{telefone ? ` · ${telefone}` : ""}{v.cidade ? ` · ${v.cidade}${v.estado ? ` - ${v.estado}` : ""}` : ""}
                                                            </small>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="mt-3 pt-3 border-top">
                                                    <div className="row g-3">
                                                        <div className="col-md-6">
                                                            <small className="text-muted text-uppercase fw-bold d-block mb-1" style={{ fontSize: '0.7rem', letterSpacing: '0.5px' }}>Interesses</small>
                                                            {v.interesses && v.interesses.length > 0 ? (
                                                                <div className="d-flex flex-wrap gap-1">
                                                                    {v.interesses.map((interesse) => (
                                                                        <span key={interesse} className="badge px-2 py-1" style={badgeStyle}>{interesse}</span>
                                                                    ))}
                                                                </div>
                                                            ) : (
                                                                <span className="text-muted">---</span>
                                                            )}
                                                        </div>
                                                        <div className="col-md-6">
                                                            <small className="text-muted text-uppercase fw-bold d-block mb-1" style={{ fontSize: '0.7rem', letterSpacing: '0.5px' }}>Disponibilidade</small>
                                                            {v.disponibilidade && v.disponibilidade.length > 0 ? (
                                                                <div className="d-flex flex-wrap gap-1">
                                                                    {v.disponibilidade.map((disp, index) => (
                                                                        <span key={index} className="badge px-2 py-1" style={badgeStyle}>{disp.dia} · {disp.horario}</span>
                                                                    ))}
                                                                </div>
                                                            ) : (
                                                                <span className="text-muted">---</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="mt-3">
                                                        <small className="text-muted text-uppercase fw-bold d-block mb-1" style={{ fontSize: '0.7rem', letterSpacing: '0.5px' }}>Observações</small>
                                                        <div className="bg-light p-3 rounded" style={{ borderLeft: '4px solid #A67C52', whiteSpace: 'pre-wrap' }}>
                                                            {v.observacoes && v.observacoes.trim() ? v.observacoes : <span className="text-muted">Nenhuma observação enviada.</span>}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="d-flex flex-wrap justify-content-end gap-2 mt-3 pt-3 border-top">
                                                    <button
                                                        type="button"
                                                        className="btn btn-sm btn-outline-danger d-inline-flex align-items-center"
                                                        onClick={() => {
                                                            atualizarStatus(v._id, 'Rejeitado');
                                                            if (pendentes.length === 1) setCaixaAberta(false);
                                                        }}
                                                        style={{ borderRadius: '6px' }}
                                                    >
                                                        <i className="bi bi-x-lg me-1"></i> Rejeitar
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="btn btn-sm btn-success d-inline-flex align-items-center text-white"
                                                        onClick={() => {
                                                            atualizarStatus(v._id, 'Aprovado');
                                                            if (pendentes.length === 1) setCaixaAberta(false);
                                                        }}
                                                        style={{ borderRadius: '6px' }}
                                                    >
                                                        <i className="bi bi-check-lg me-1"></i> Aprovar
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
