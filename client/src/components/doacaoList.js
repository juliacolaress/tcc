import React, { useState, useEffect } from "react";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import API_BASE_URL from "../api/config";

const isFinanceira = (record) =>
    record.categoria === "financeira" || (!record.categoria && record.tipo_doacao === "Dinheiro");

const formatCurrency = (value) =>
    `R$ ${parseFloat(value || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;

const formatDate = (dateStr) => {
    if (!dateStr) return "---";
    const date = new Date(dateStr);
    return isNaN(date.getTime()) ? "---" : date.toLocaleDateString('pt-BR');
};

const getBadgeClass = (tipo) => {
    switch (tipo) {
        case "Ração": return "bg-warning-subtle text-warning-emphasis border border-warning-subtle";
        case "Medicamento": return "bg-primary-subtle text-primary border border-primary-subtle";
        case "Suprimentos": return "bg-info-subtle text-info-emphasis border border-info-subtle";
        default: return "bg-secondary-subtle text-secondary border border-secondary-subtle";
    }
};

const getStatusBadge = (status) => {
    switch (status) {
        case "Pendente": return { classe: "bg-warning-subtle text-warning-emphasis border border-warning-subtle", icone: "bi-hourglass-split" };
        case "Confirmado": return { classe: "bg-success-subtle text-success border border-success-subtle", icone: "bi-check-circle" };
        case "Entregue": return { classe: "bg-success-subtle text-success border border-success-subtle", icone: "bi-box-seam" };
        case "Cancelado": return { classe: "bg-danger-subtle text-danger border border-danger-subtle", icone: "bi-x-circle" };
        default: return { classe: "bg-secondary-subtle text-secondary border border-secondary-subtle", icone: "bi-circle" };
    }
};

const ComprovanteLink = ({ comprovante }) => {
    if (!comprovante) return <span className="text-muted">Sem comprovante</span>;
    const ehPdf = comprovante.toLowerCase().endsWith(".pdf");
    return (
        <a
            href={API_BASE_URL + comprovante}
            target="_blank"
            rel="noreferrer"
            className="btn btn-sm btn-outline-primary d-inline-flex align-items-center"
            title="Abrir comprovante"
            style={{ borderRadius: '6px' }}
        >
            <i className={`${ehPdf ? 'bi bi-file-earmark-pdf' : 'bi bi-image'} me-1`}></i> Ver comprovante
        </a>
    );
};

const ComprovantePreview = ({ comprovante }) => {
    if (!comprovante) return <span className="text-muted small">Sem comprovante</span>;
    const ehPdf = comprovante.toLowerCase().endsWith(".pdf");
    if (ehPdf) {
        return (
            <a href={API_BASE_URL + comprovante} target="_blank" rel="noreferrer" className="btn btn-sm btn-outline-danger d-inline-flex align-items-center" title="Abrir PDF" style={{ borderRadius: '6px' }}>
                <i className="bi bi-file-earmark-pdf me-1"></i> Ver PDF
            </a>
        );
    }
    return (
        <a href={API_BASE_URL + comprovante} target="_blank" rel="noreferrer" title="Ampliar comprovante">
            <img src={API_BASE_URL + comprovante} alt="Comprovante" style={{ maxWidth: '130px', maxHeight: '100px', borderRadius: '6px', border: '1px solid #dee2e6', cursor: 'pointer' }} />
        </a>
    );
};

const AcaoButtons = ({ record, deleteDoacao, confirmarRecebimento }) => (
    <div className="d-flex gap-2 flex-wrap">
        {record.status !== "Confirmado" && record.status !== "Entregue" && record.status !== "Cancelado" && (
            <button
                className="btn btn-sm btn-outline-success d-inline-flex align-items-center"
                onClick={() => confirmarRecebimento(record._id, isFinanceira(record) ? "Confirmado" : "Entregue")}
                title={isFinanceira(record) ? "Confirmar recebimento do valor" : "Confirmar entrega dos itens"}
                style={{ borderRadius: '6px' }}
            >
                <i className="bi bi-check2-circle me-1"></i> Confirmar
            </button>
        )}
        <Link
            className="btn btn-sm btn-outline-secondary d-inline-flex align-items-center"
            to={`/edit-doacao/${record._id}`}
            title="Editar"
            style={{ borderRadius: '6px' }}
        >
            <i className="bi bi-pencil-square me-1"></i> Editar
        </Link>
        <button
            className="btn btn-sm btn-outline-danger d-inline-flex align-items-center"
            onClick={() => deleteDoacao(record._id)}
            title="Excluir"
            style={{ borderRadius: '6px' }}
        >
            <i className="bi bi-trash me-1"></i> Excluir
        </button>
    </div>
);

export default function DoacaoList() {
    const [doacoes, setDoacoes] = useState([]);
    const [pesquisa, setPesquisa] = useState("");
    const [searchParams, setSearchParams] = useSearchParams();
    const abaInicial = searchParams.get("aba") === "material" ? "material" : "financeira";
    const [abaAtiva, setAbaAtiva] = useState(abaInicial);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const location = useLocation();
    const [caixaAberta, setCaixaAberta] = useState(false);
    const [selecionada, setSelecionada] = useState(null);

    function trocarAba(aba) {
        setAbaAtiva(aba);
        setPesquisa("");
        setSearchParams({ aba });
    }

    useEffect(() => {
        async function getDoacoes() {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch(`${API_BASE_URL}/doacoes`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (!response.ok) {
                    setError(`Erro ao carregar doações: ${response.statusText}`);
                    return;
                }
                const data = await response.json();
                setDoacoes(data);
            } catch (error) {
                console.error("Erro de conexão:", error);
                setError("Não foi possível conectar ao servidor.");
            } finally {
                setLoading(false);
            }
        }
        getDoacoes();
    }, []);

    useEffect(() => {
        if (location.state && location.state.caixaEntrada) {
            setCaixaAberta(true);
            window.history.replaceState({}, '');
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    async function deleteDoacao(id) {
        if (!window.confirm("Deseja excluir permanentemente esta doação?")) return;
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/doacao/${id}`, {
                method: "DELETE",
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                setDoacoes(doacoes.filter((el) => el._id !== id));
            } else {
                window.alert("Erro ao excluir doação.");
            }
        } catch (error) {
            console.error("Erro ao deletar:", error);
        }
    }

    async function atualizarStatusDoacao(id, status) {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/doacao/${id}/status`, {
                method: "PATCH",
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status })
            });
            if (response.ok) {
                setDoacoes(doacoes.map((el) => el._id === id ? { ...el, status } : el));
                return true;
            }
            const data = await response.json().catch(() => ({}));
            window.alert(data.mensagem || "Erro ao atualizar o status da doação.");
            return false;
        } catch (error) {
            console.error("Erro ao atualizar status:", error);
            window.alert("Não foi possível conectar ao servidor.");
            return false;
        }
    }

    async function confirmarRecebimento(id, status) {
        const ok = await atualizarStatusDoacao(id, status);
        if (!ok) return;
        window.alert(status === "Entregue"
            ? "Entrega confirmada! O recebimento foi registrado no histórico de doações."
            : "Doação confirmada! O valor foi registrado no histórico oficial de doações.");
    }

    async function confirmarCaixaEntrada(id, ehFinanceira) {
        const ok = await atualizarStatusDoacao(id, "Confirmado");
        if (!ok) return;
        window.alert(ehFinanceira
            ? "Doação confirmada! O valor foi registrado no histórico oficial de doações."
            : "Doação confirmada! O recebimento foi registrado no histórico de doações.");
        setSelecionada(null);
        const restantes = doacoes.filter((d) => (d.status || 'Pendente') === 'Pendente' && d._id !== id).length;
        if (restantes === 0) setCaixaAberta(false);
    }

    async function cancelarCaixaEntrada(id) {
        const ok = await atualizarStatusDoacao(id, "Cancelado");
        if (!ok) return;
        setSelecionada(null);
        const restantes = doacoes.filter((d) => (d.status || 'Pendente') === 'Pendente' && d._id !== id).length;
        if (restantes === 0) setCaixaAberta(false);
    }

    const ordemStatus = { Pendente: 0, Confirmado: 1, Entregue: 1, Cancelado: 2 };
    const financeiras = doacoes
        .filter((d) => isFinanceira(d))
        .sort((a, b) => (ordemStatus[a.status] ?? 3) - (ordemStatus[b.status] ?? 3));
    const materiais = doacoes
        .filter((d) => !isFinanceira(d))
        .sort((a, b) => (ordemStatus[a.status] ?? 3) - (ordemStatus[b.status] ?? 3));

    const pendentesFinanceiras = financeiras.filter((d) => d.status === "Pendente").length;
    const pendentesMateriais = materiais.filter((d) => d.status === "Pendente").length;
    const totalPendentes = pendentesFinanceiras + pendentesMateriais;
    const pendentes = doacoes.filter((d) => (d.status || 'Pendente') === 'Pendente');

    const totalAcumulado = financeiras.reduce((acc, d) => acc + (parseFloat(d.valor) || 0), 0);

    const listaAtiva = abaAtiva === "financeira" ? financeiras : materiais;

    const listaFiltrada = listaAtiva.filter((doacao) => {
        const termo = pesquisa.toLowerCase();
        return (
            (doacao.nome && doacao.nome.toLowerCase().includes(termo)) ||
            (doacao.tipo_doacao && doacao.tipo_doacao.toLowerCase().includes(termo)) ||
            (doacao.item && doacao.item.toLowerCase().includes(termo)) ||
            (doacao.quantidade && doacao.quantidade.toLowerCase().includes(termo))
        );
    });

    const primaryColor = '#3D2314';

    return (
        <div className="container-fluid py-2">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h3 style={{ color: primaryColor, fontWeight: 'bold' }}>Doações Recebidas</h3>
                    <p className="text-muted mb-0">Gerencie as entradas de recursos e insumos do Patas & Lares</p>
                </div>
                <div className="d-flex gap-2">
                    <Link
                        className="btn btn-outline-secondary px-3 py-2 d-inline-flex align-items-center"
                        to="/cadastrar-doacao-material"
                        style={{ borderRadius: '6px', fontWeight: '500' }}
                    >
                        <i className="bi bi-box-seam me-2"></i> Doação Material
                    </Link>
                    <Link
                        className="btn btn-outline-secondary px-3 py-2 d-inline-flex align-items-center"
                        to="/cadastrar-doacao-financeira"
                        style={{ borderRadius: '6px', fontWeight: '500' }}
                    >
                        <i className="bi bi-cash-coin me-2"></i> Doação Financeira
                    </Link>
                    <Link
                        className="btn text-white px-4 py-2 d-inline-flex align-items-center shadow-sm"
                        to="/cadastrar-doacao"
                        style={{ backgroundColor: primaryColor, fontWeight: '500', borderRadius: '6px' }}
                    >
                        <i className="bi bi-plus-lg me-2"></i> Nova Doação
                    </Link>
                </div>
            </div>

            {error && (
                <div className="alert alert-danger shadow-sm border-0 mb-4" style={{ borderRadius: '8px' }}>
                    <i className="bi bi-exclamation-triangle me-2"></i> {error}
                </div>
            )}

            {totalPendentes > 0 && (
                <button
                    type="button"
                    className="btn btn-block w-100 d-flex justify-content-between align-items-center border-0 shadow-sm mb-4 px-4 py-3"
                    onClick={() => { setSelecionada(null); setCaixaAberta(true); }}
                    style={{ backgroundColor: '#fff8e6', borderLeft: '6px solid #f0ad4e', borderRadius: '8px', textAlign: 'left' }}
                >
                    <span className="d-inline-flex align-items-center gap-2" style={{ color: '#8a6d1d', fontWeight: '600' }}>
                        <i className="bi bi-inbox-fill fs-5"></i>
                        Doações Pendentes de Confirmação
                    </span>
                    <span className="badge fs-6 px-3 py-2" style={{ backgroundColor: '#856404', color: '#fff', borderRadius: '20px' }}>
                        {totalPendentes}
                    </span>
                </button>
            )}

            {/* Abas */}
            <ul className="nav nav-tabs mb-4" style={{ borderBottom: '2px solid #eadfcf' }}>
                <li className="nav-item">
                    <button
                        type="button"
                        className={`nav-link ${abaAtiva === "financeira" ? "active" : ""}`}
                        onClick={() => trocarAba("financeira")}
                        style={{
                            color: abaAtiva === "financeira" ? primaryColor : '#555555',
                            fontWeight: '600',
                            borderBottom: abaAtiva === "financeira" ? '3px solid ' + primaryColor : 'none',
                            borderRadius: 0
                        }}
                    >
                        <i className="bi bi-cash-coin me-2"></i> Doações Financeiras
                        <span className={`badge ms-2 ${abaAtiva === "financeira" ? 'text-white' : 'bg-light text-dark border'}`} style={{ backgroundColor: abaAtiva === "financeira" ? primaryColor : undefined }}>
                            {financeiras.length}
                        </span>
                        {pendentesFinanceiras > 0 && (
                            <span className="badge bg-warning-subtle text-warning-emphasis border border-warning-subtle ms-1" title="Doações pendentes de confirmação">
                                <i className="bi bi-hourglass-split me-1"></i>{pendentesFinanceiras} pendentes
                            </span>
                        )}
                    </button>
                </li>
                <li className="nav-item">
                    <button
                        type="button"
                        className={`nav-link ${abaAtiva === "material" ? "active" : ""}`}
                        onClick={() => trocarAba("material")}
                        style={{
                            color: abaAtiva === "material" ? primaryColor : '#555555',
                            fontWeight: '600',
                            borderBottom: abaAtiva === "material" ? '3px solid ' + primaryColor : 'none',
                            borderRadius: 0
                        }}
                    >
                        <i className="bi bi-box-seam me-2"></i> Doações Materiais
                        <span className={`badge ms-2 ${abaAtiva === "material" ? 'text-white' : 'bg-light text-dark border'}`} style={{ backgroundColor: abaAtiva === "material" ? primaryColor : undefined }}>
                            {materiais.length}
                        </span>
                        {pendentesMateriais > 0 && (
                            <span className="badge bg-warning-subtle text-warning-emphasis border border-warning-subtle ms-1" title="Doações pendentes de confirmação">
                                <i className="bi bi-hourglass-split me-1"></i>{pendentesMateriais} pendentes
                            </span>
                        )}
                    </button>
                </li>
            </ul>

            {abaAtiva === "financeira" && (
                <div className="card border-0 shadow-sm p-4 mb-4" style={{ borderRadius: '8px', backgroundColor: '#FAF6F0' }}>
                    <div className="d-flex align-items-center gap-3">
                        <div style={{ backgroundColor: '#fff', borderRadius: '50%', padding: '15px', border: '1px solid #eadfcf' }}>
                            <i className="bi bi-piggy-bank fs-3" style={{ color: primaryColor }}></i>
                        </div>
                        <div>
                            <small className="text-muted text-uppercase fw-bold">Total acumulado em doações financeiras</small>
                            <h3 className="fw-bold mb-0" style={{ color: primaryColor }}>
                                {loading ? <span className="spinner-border spinner-border-sm" role="status"></span> : formatCurrency(totalAcumulado)}
                            </h3>
                        </div>
                    </div>
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
                        placeholder={abaAtiva === "financeira" ? "Pesquisar por doador, tipo ou forma de pagamento..." : "Pesquisar por doador, item ou tipo..."}
                        value={pesquisa}
                        onChange={(e) => setPesquisa(e.target.value)}
                        style={{ boxShadow: 'none', borderRadius: '0 6px 6px 0', border: '1px solid #ced4da' }}
                    />
                </div>
                <div className="mt-2 ps-1">
                    <small className="text-muted">
                        Exibindo <strong>{listaFiltrada.length}</strong> de {listaAtiva.length} registros.
                    </small>
                </div>
            </div>

            <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: '8px', overflow: 'hidden' }}>
                <div className="table-responsive">
                    {abaAtiva === "financeira" ? (
                        <table className="table table-hover mb-0">
                            <thead className="table-light">
                                <tr style={{ borderBottom: '2px solid #e9ecef' }}>
                                    <th style={{ paddingLeft: '1.5rem', color: primaryColor, fontWeight: '600' }}>Doador</th>
                                    <th style={{ color: primaryColor, fontWeight: '600' }}>Forma de Pagamento</th>
                                    <th style={{ color: primaryColor, fontWeight: '600' }}>Status</th>
                                    <th style={{ color: primaryColor, fontWeight: '600' }}>Comprovante</th>
                                    <th className="text-end" style={{ color: primaryColor, fontWeight: '600' }}>Valor</th>
                                    <th style={{ color: primaryColor, fontWeight: '600' }}>Data</th>
                                    <th style={{ color: primaryColor, fontWeight: '600', width: '230px' }}>Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan="7" className="text-center py-5">
                                            <div className="spinner-border text-primary" role="status"></div>
                                        </td>
                                    </tr>
                                ) : listaFiltrada.length > 0 ? (
                                    listaFiltrada.map((doacao) => (
                                        <tr className="align-middle" key={doacao._id}>
                                            <td className="fw-semibold text-dark" style={{ paddingLeft: '1.5rem' }}>{doacao.nome}</td>
                                            <td>
                                                <span className="badge bg-success-subtle text-success border border-success-subtle px-2 py-1">
                                                    {doacao.forma_pagamento || "Não informado"}
                                                </span>
                                            </td>
                                            <td>
                                                {getStatusBadge(doacao.status).classe.startsWith("bg-warning") ? (
                                                    <span className="badge fw-semibold px-2 py-1" style={{ backgroundColor: '#fff3cd', color: '#7a5c00', border: '1px solid #ffe69c' }}>
                                                        <i className={`${getStatusBadge(doacao.status).icone} me-1`}></i>
                                                        {doacao.status || "Pendente"}
                                                    </span>
                                                ) : (
                                                    <span className={`badge fw-semibold px-2 py-1 ${getStatusBadge(doacao.status).classe}`}>
                                                        <i className={`${getStatusBadge(doacao.status).icone} me-1`}></i>
                                                        {doacao.status || "Pendente"}
                                                    </span>
                                                )}
                                            </td>
                                            <td>
                                                <ComprovanteLink comprovante={doacao.comprovante} />
                                            </td>
                                            <td className="fw-bold text-end text-secondary" style={{ paddingRight: '1.5rem' }}>
                                                {formatCurrency(doacao.valor)}
                                            </td>
                                            <td className="text-muted">{formatDate(doacao.data_criacao)}</td>
                                            <td>
                                                <AcaoButtons record={doacao} deleteDoacao={deleteDoacao} confirmarRecebimento={confirmarRecebimento} />
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="7" className="text-center text-muted py-5">
                                            <i className="bi bi-inbox text-muted d-block mb-2" style={{ fontSize: '2rem' }}></i>
                                            Nenhuma doação financeira encontrada.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    ) : (
                        <table className="table table-hover mb-0">
                            <thead className="table-light">
                                <tr style={{ borderBottom: '2px solid #e9ecef' }}>
                                    <th style={{ paddingLeft: '1.5rem', color: primaryColor, fontWeight: '600' }}>Doador</th>
                                    <th style={{ color: primaryColor, fontWeight: '600' }}>Tipo</th>
                                    <th style={{ color: primaryColor, fontWeight: '600' }}>Item Doado</th>
                                    <th style={{ color: primaryColor, fontWeight: '600' }}>Quantidade</th>
                                    <th style={{ color: primaryColor, fontWeight: '600' }}>Status</th>
                                    <th style={{ color: primaryColor, fontWeight: '600' }}>Comprovante</th>
                                    <th style={{ color: primaryColor, fontWeight: '600' }}>Data</th>
                                    <th style={{ color: primaryColor, fontWeight: '600', width: '230px' }}>Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan="6" className="text-center py-5">
                                            <div className="spinner-border text-primary" role="status"></div>
                                        </td>
                                    </tr>
                                ) : listaFiltrada.length > 0 ? (
                                    listaFiltrada.map((doacao) => (
                                        <tr className="align-middle" key={doacao._id}>
                                            <td className="fw-semibold text-dark" style={{ paddingLeft: '1.5rem' }}>{doacao.nome}</td>
                                            <td>
                                                <span className={`badge px-2 py-1 rounded ${getBadgeClass(doacao.tipo_doacao)}`} style={{ fontSize: '0.85rem' }}>
                                                    {doacao.tipo_doacao}
                                                </span>
                                            </td>
                                            <td className="text-muted">{doacao.item || "---"}</td>
                                            <td className="text-secondary">{doacao.quantidade || "---"}</td>
                                            <td>
                                                <span className={`badge fw-semibold px-2 py-1 ${getStatusBadge(doacao.status).classe}`}>
                                                    <i className={`${getStatusBadge(doacao.status).icone} me-1`}></i>
                                                    {doacao.status || "Pendente"}
                                                </span>
                                            </td>
                                            <td>
                                                <ComprovanteLink comprovante={doacao.comprovante} />
                                            </td>
                                            <td className="text-muted">{formatDate(doacao.data_criacao)}</td>
                                            <td>
                                                <AcaoButtons record={doacao} deleteDoacao={deleteDoacao} confirmarRecebimento={confirmarRecebimento} />
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="8" className="text-center text-muted py-5">
                                            <i className="bi bi-inbox text-muted d-block mb-2" style={{ fontSize: '2rem' }}></i>
                                            Nenhuma doação material encontrada.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* Modal: Caixa de Entrada de Doações */}
            {caixaAberta && (
                <div className="modal show d-block" tabIndex="-1" role="dialog" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} onClick={() => { setCaixaAberta(false); setSelecionada(null); }}>
                    <div className="modal-dialog modal-dialog-centered modal-lg" role="document" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-content" style={{ borderRadius: '10px', maxHeight: '85vh', display: 'flex', flexDirection: 'column' }}>
                            <div className="modal-header" style={{ borderBottom: '2px solid #e9ecef', backgroundColor: '#fff8e6', borderTopLeftRadius: '10px', borderTopRightRadius: '10px' }}>
                                <h5 className="modal-title fw-bold" style={{ color: '#8a6d1d' }}>
                                    <i className="bi bi-inbox-fill me-2"></i> Caixa de Entrada de Doações
                                </h5>
                                {!selecionada && (
                                    <span className="badge fs-6 px-3 py-2 me-2" style={{ backgroundColor: '#856404', color: '#fff', borderRadius: '20px' }}>
                                        {pendentes.length} pendente(s)
                                    </span>
                                )}
                                <button type="button" className="btn-close ms-2" onClick={() => { setCaixaAberta(false); setSelecionada(null); }}></button>
                            </div>
                            <div className="modal-body" style={{ overflowY: 'auto', padding: '1.25rem' }}>
                                {loading ? (
                                    <div className="text-center text-muted py-5">
                                        <div className="spinner-border text-primary" role="status"></div>
                                    </div>
                                ) : selecionada ? (
                                    isFinanceira(selecionada) ? (
                                        // ---- DOAÇÃO FINANCEIRA ----
                                        <div>
                                            <div className="border rounded-3 p-3 mb-3" style={{ backgroundColor: '#fdfbf7', borderLeft: '4px solid #198754' }}>
                                                <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
                                                    <div>
                                                        <h6 className="fw-bold mb-1" style={{ color: primaryColor }}>
                                                            <i className="bi bi-cash-coin me-2"></i> Doação Financeira
                                                        </h6>
                                                        <small className="text-muted">Recebida em {formatDate(selecionada.data_criacao)}</small>
                                                    </div>
                                                    <span className="badge fw-semibold px-2 py-1 bg-warning-subtle text-warning-emphasis border border-warning-subtle">
                                                        <i className="bi bi-hourglass-split me-1"></i>Pendente
                                                    </span>
                                                </div>
                                                <div className="row g-3 border-top pt-3">
                                                    <div className="col-md-5">
                                                        <small className="text-muted text-uppercase fw-bold d-block mb-1" style={{ fontSize: '0.7rem', letterSpacing: '0.5px' }}>Doador</small>
                                                        <span className="fw-semibold d-block text-dark">{selecionada.nome || "---"}</span>
                                                        <small className="text-muted d-block">
                                                            {selecionada.email}
                                                            {selecionada.telefone ? ` · ${selecionada.telefone}` : ""}
                                                            {selecionada.cidade ? ` · ${selecionada.cidade}${selecionada.estado ? ` - ${selecionada.estado}` : ""}` : ""}
                                                        </small>
                                                    </div>
                                                    <div className="col-md-3">
                                                        <small className="text-muted text-uppercase fw-bold d-block mb-1" style={{ fontSize: '0.7rem', letterSpacing: '0.5px' }}>Valor</small>
                                                        <span className="fw-bold d-block fs-5" style={{ color: '#198754' }}>{formatCurrency(selecionada.valor)}</span>
                                                        <small className="text-muted d-block">{selecionada.forma_pagamento || "Pix"}</small>
                                                    </div>
                                                    <div className="col-md-4">
                                                        <small className="text-muted text-uppercase fw-bold d-block mb-1" style={{ fontSize: '0.7rem', letterSpacing: '0.5px' }}>Comprovante</small>
                                                        <ComprovantePreview comprovante={selecionada.comprovante} />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="alert alert-warning mb-0 py-2 d-flex align-items-start" style={{ borderRadius: '6px' }}>
                                                <i className="bi bi-info-circle-fill me-2 mt-1"></i>
                                                <span>Confira se o valor já caiu na conta bancária ou se foi entregue em mãos.</span>
                                            </div>

                                            <div className="d-flex flex-wrap justify-content-end gap-2 mt-3">
                                                <button
                                                    type="button"
                                                    className="btn btn-sm btn-outline-danger d-inline-flex align-items-center"
                                                    onClick={() => cancelarCaixaEntrada(selecionada._id)}
                                                    style={{ borderRadius: '6px' }}
                                                >
                                                    <i className="bi bi-x-lg me-1"></i> Cancelar Doação
                                                </button>
                                                <button
                                                    type="button"
                                                    className="btn btn-sm btn-success d-inline-flex align-items-center text-white"
                                                    onClick={() => confirmarCaixaEntrada(selecionada._id, true)}
                                                    style={{ borderRadius: '6px' }}
                                                >
                                                    <i className="bi bi-check2-circle me-1"></i> Confirmar Recebimento
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        // ---- DOAÇÃO MATERIAL ----
                                        <div>
                                            <div className="border rounded-3 p-3 mb-3" style={{ backgroundColor: '#fdfbf7', borderLeft: '4px solid #198754' }}>
                                                <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
                                                    <div>
                                                        <h6 className="fw-bold mb-1" style={{ color: primaryColor }}>
                                                            <i className="bi bi-box-seam me-2"></i> Doação Material
                                                        </h6>
                                                        <small className="text-muted">Recebida em {formatDate(selecionada.data_criacao)}</small>
                                                    </div>
                                                    <span className="badge fw-semibold px-2 py-1 bg-warning-subtle text-warning-emphasis border border-warning-subtle">
                                                        <i className="bi bi-hourglass-split me-1"></i>Pendente
                                                    </span>
                                                </div>
                                                <div className="row g-3 border-top pt-3">
                                                    <div className="col-md-5">
                                                        <small className="text-muted text-uppercase fw-bold d-block mb-1" style={{ fontSize: '0.7rem', letterSpacing: '0.5px' }}>Doador</small>
                                                        <span className="fw-semibold d-block text-dark">{selecionada.nome || "---"}</span>
                                                        <small className="text-muted d-block">
                                                            {selecionada.email}
                                                            {selecionada.telefone ? ` · ${selecionada.telefone}` : ""}
                                                            {selecionada.cidade ? ` · ${selecionada.cidade}${selecionada.estado ? ` - ${selecionada.estado}` : ""}` : ""}
                                                        </small>
                                                    </div>
                                                    <div className="col-md-3">
                                                        <small className="text-muted text-uppercase fw-bold d-block mb-1" style={{ fontSize: '0.7rem', letterSpacing: '0.5px' }}>Itens</small>
                                                        <span className="badge px-2 py-1 rounded d-inline-block mb-1" style={{ backgroundColor: '#FAF6F0', color: primaryColor, border: '1px solid #eadfcf' }}>
                                                            {selecionada.tipo_doacao || "Material"}
                                                        </span>
                                                        <small className="text-muted d-block">{selecionada.item || "---"}</small>
                                                        {selecionada.quantidade && <small className="text-muted d-block">Qtde: {selecionada.quantidade}</small>}
                                                    </div>
                                                    <div className="col-md-4">
                                                        <small className="text-muted text-uppercase fw-bold d-block mb-1" style={{ fontSize: '0.7rem', letterSpacing: '0.5px' }}>Entrega</small>
                                                        <small className="d-block text-dark">{selecionada.forma_entrega || "---"}</small>
                                                        <small className="text-muted text-uppercase fw-bold d-block mt-2 mb-1" style={{ fontSize: '0.7rem', letterSpacing: '0.5px' }}>Comprovante</small>
                                                        <ComprovantePreview comprovante={selecionada.comprovante} />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="alert alert-warning mb-0 py-2 d-flex align-items-start" style={{ borderRadius: '6px' }}>
                                                <i className="bi bi-info-circle-fill me-2 mt-1"></i>
                                                <span>Verifique se os itens já foram entregues no abrigo ou se requer busca.</span>
                                            </div>

                                            <div className="d-flex flex-wrap justify-content-end gap-2 mt-3">
                                                <button
                                                    type="button"
                                                    className="btn btn-sm btn-outline-danger d-inline-flex align-items-center"
                                                    onClick={() => cancelarCaixaEntrada(selecionada._id)}
                                                    style={{ borderRadius: '6px' }}
                                                >
                                                    <i className="bi bi-x-lg me-1"></i> Cancelar Doação
                                                </button>
                                                <button
                                                    type="button"
                                                    className="btn btn-sm btn-success d-inline-flex align-items-center text-white"
                                                    onClick={() => confirmarCaixaEntrada(selecionada._id, false)}
                                                    style={{ borderRadius: '6px' }}
                                                >
                                                    <i className="bi bi-check2-circle me-1"></i> Confirmar Recebimento
                                                </button>
                                            </div>
                                        </div>
                                    )
                                ) : pendentes.length === 0 ? (
                                    <div className="text-center text-muted py-5">
                                        <i className="bi bi-check2-circle d-block mb-2" style={{ fontSize: '2.2rem', color: '#28a745' }}></i>
                                        Não há doações pendentes no momento!
                                    </div>
                                ) : (
                                    pendentes.map((d) => (
                                        <div key={d._id} className="border rounded-3 p-3 mb-3" style={{ backgroundColor: '#fdfbf7', borderLeft: '4px solid #ffc107' }}>
                                            <div className="d-flex flex-wrap justify-content-between align-items-center gap-2">
                                                <div className="d-flex align-items-center gap-2">
                                                    <div className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0" style={{ width: '42px', height: '42px', backgroundColor: '#fff3cd' }}>
                                                        <i className={`bi ${isFinanceira(d) ? 'bi-cash-coin' : 'bi-box-seam'} fs-5`} style={{ color: '#856404' }}></i>
                                                    </div>
                                                    <div>
                                                        <strong className="d-block" style={{ color: primaryColor }}>{d.nome || "Doador não informado"}</strong>
                                                        <small className="text-muted">
                                                            {isFinanceira(d)
                                                                ? `${formatCurrency(d.valor)}${d.forma_pagamento ? ` · ${d.forma_pagamento}` : ""}`
                                                                : `${d.item || d.tipo_doacao || "Material"}${d.quantidade ? ` · ${d.quantidade}` : ""}`}
                                                        </small>
                                                    </div>
                                                </div>
                                                <span className={`badge fw-semibold px-2 py-1 ${isFinanceira(d) ? 'bg-success-subtle text-success border border-success-subtle' : 'bg-info-subtle text-info-emphasis border border-info-subtle'}`}>
                                                    {isFinanceira(d) ? 'Financeira' : 'Material'}
                                                </span>
                                            </div>
                                            <small className="text-muted d-block mt-2">
                                                {d.email}{d.cidade ? ` · ${d.cidade}${d.estado ? ` - ${d.estado}` : ""}` : ""}
                                            </small>
                                            <div className="d-flex flex-wrap justify-content-end gap-2 mt-3 pt-3 border-top">
                                                <button
                                                    type="button"
                                                    className="btn btn-sm btn-outline-success d-inline-flex align-items-center"
                                                    onClick={() => setSelecionada(d)}
                                                    style={{ borderRadius: '6px' }}
                                                >
                                                    <i className="bi bi-search me-1"></i> Revisar
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                            <div className="modal-footer" style={{ borderTop: '2px solid #e9ecef' }}>
                                {selecionada && (
                                    <button
                                        type="button"
                                        className="btn btn-outline-secondary px-4 me-auto"
                                        style={{ borderRadius: '6px' }}
                                        onClick={() => setSelecionada(null)}
                                    >
                                        <i className="bi bi-arrow-left me-1"></i> Voltar
                                    </button>
                                )}
                                <button type="button" className="btn text-white px-4" style={{ backgroundColor: primaryColor, borderRadius: '6px' }} onClick={() => { setCaixaAberta(false); setSelecionada(null); }}>
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
