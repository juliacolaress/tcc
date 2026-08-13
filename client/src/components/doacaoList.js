import React, { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
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

const AcaoButtons = ({ record, deleteDoacao }) => (
    <div className="d-flex gap-2">
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

    const financeiras = doacoes.filter((d) => isFinanceira(d));
    const materiais = doacoes.filter((d) => !isFinanceira(d));

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

    const primaryColor = '#4a2511';

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

            {/* Abas */}
            <ul className="nav nav-tabs mb-4" style={{ borderBottom: '2px solid #eadfcf' }}>
                <li className="nav-item">
                    <button
                        type="button"
                        className={`nav-link ${abaAtiva === "financeira" ? "active" : ""}`}
                        onClick={() => trocarAba("financeira")}
                        style={{
                            color: abaAtiva === "financeira" ? primaryColor : '#6c757d',
                            fontWeight: '600',
                            borderBottom: abaAtiva === "financeira" ? '3px solid ' + primaryColor : 'none',
                            borderRadius: 0
                        }}
                    >
                        <i className="bi bi-cash-coin me-2"></i> Doações Financeiras
                        <span className={`badge ms-2 ${abaAtiva === "financeira" ? 'text-white' : 'bg-light text-dark border'}`} style={{ backgroundColor: abaAtiva === "financeira" ? primaryColor : undefined }}>
                            {financeiras.length}
                        </span>
                    </button>
                </li>
                <li className="nav-item">
                    <button
                        type="button"
                        className={`nav-link ${abaAtiva === "material" ? "active" : ""}`}
                        onClick={() => trocarAba("material")}
                        style={{
                            color: abaAtiva === "material" ? primaryColor : '#6c757d',
                            fontWeight: '600',
                            borderBottom: abaAtiva === "material" ? '3px solid ' + primaryColor : 'none',
                            borderRadius: 0
                        }}
                    >
                        <i className="bi bi-box-seam me-2"></i> Doações Materiais
                        <span className={`badge ms-2 ${abaAtiva === "material" ? 'text-white' : 'bg-light text-dark border'}`} style={{ backgroundColor: abaAtiva === "material" ? primaryColor : undefined }}>
                            {materiais.length}
                        </span>
                    </button>
                </li>
            </ul>

            {abaAtiva === "financeira" && (
                <div className="card border-0 shadow-sm p-4 mb-4" style={{ borderRadius: '8px', backgroundColor: '#fdf7f2' }}>
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
                                    <th className="text-end" style={{ color: primaryColor, fontWeight: '600' }}>Valor</th>
                                    <th style={{ color: primaryColor, fontWeight: '600' }}>Data</th>
                                    <th style={{ color: primaryColor, fontWeight: '600', width: '180px' }}>Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan="5" className="text-center py-5">
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
                                            <td className="fw-bold text-end text-secondary" style={{ paddingRight: '1.5rem' }}>
                                                {formatCurrency(doacao.valor)}
                                            </td>
                                            <td className="text-muted">{formatDate(doacao.data_criacao)}</td>
                                            <td>
                                                <AcaoButtons record={doacao} deleteDoacao={deleteDoacao} />
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="text-center text-muted py-5">
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
                                    <th style={{ color: primaryColor, fontWeight: '600' }}>Data</th>
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
                                            <td className="text-muted">{formatDate(doacao.data_criacao)}</td>
                                            <td>
                                                <AcaoButtons record={doacao} deleteDoacao={deleteDoacao} />
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="text-center text-muted py-5">
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
        </div>
    );
}
