import React, { useState, useEffect } from "react";
import API_BASE_URL from "../api/config";

const MESES = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

function formatarMes(ms) {
    if (!ms) return "---";
    const [ano, mes] = ms.split("-");
    const idx = parseInt(mes, 10) - 1;
    return `${MESES[idx] || mes}/${ano}`;
}

function formatCurrency(value) {
    return `R$ ${parseFloat(value || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
}

const FORM_VAZIO = {
    titulo: "",
    mesReferencia: "",
    totalArrecadacao: "",
    totalDespesas: "",
    resumo: "",
    balanceteUrl: ""
};

export default function RelatoriosList() {
    const [relatorios, setRelatorios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalAberto, setModalAberto] = useState(false);
    const [editando, setEditando] = useState(null);
    const [form, setForm] = useState(FORM_VAZIO);
    const [salvando, setSalvando] = useState(false);
    const [pdfFile, setPdfFile] = useState(null);
    const [enviandoPdf, setEnviandoPdf] = useState(false);

    const primaryColor = '#4a2511';
    const labelStyle = { color: primaryColor, fontWeight: '600', marginBottom: '6px' };
    const inputStyle = { borderRadius: '6px', border: '1px solid #ced4da' };

    const token = localStorage.getItem('token');

    useEffect(() => {
        carregarRelatorios();
    }, []);

    async function carregarRelatorios() {
        setLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/relatorios`);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            const data = await response.json();
            setRelatorios(data);
        } catch (error) {
            console.error("Erro ao carregar relatórios:", error);
        } finally {
            setLoading(false);
        }
    }

    function abrirNovo() {
        setEditando(null);
        setForm(FORM_VAZIO);
        setPdfFile(null);
        setModalAberto(true);
    }

    function abrirEdicao(relatorio) {
        setEditando(relatorio);
        setForm({
            titulo: relatorio.titulo || "",
            mesReferencia: relatorio.mesReferencia || "",
            totalArrecadacao: relatorio.totalArrecadacao ?? "",
            totalDespesas: relatorio.totalDespesas ?? "",
            resumo: relatorio.resumo || "",
            balanceteUrl: relatorio.balanceteUrl || ""
        });
        setPdfFile(null);
        setModalAberto(true);
    }

    function updateForm(value) {
        setForm((prev) => ({ ...prev, ...value }));
    }

    async function handlePdfSelect(e) {
        const file = e.target.files && e.target.files[0];
        if (!file) return;
        if (file.type !== "application/pdf") {
            window.alert("Apenas arquivos PDF são permitidos.");
            return;
        }

        setEnviandoPdf(true);
        try {
            const formData = new FormData();
            formData.append("arquivo", file);
            const response = await fetch(`${API_BASE_URL}/relatorios/upload-balancete`, {
                method: "POST",
                headers: { "Authorization": `Bearer ${token}` },
                body: formData
            });
            if (!response.ok) {
                let mensagem = "Erro ao enviar o PDF";
                try {
                    const data = await response.json();
                    if (data && data.mensagem) mensagem = data.mensagem;
                } catch (_) {}
                window.alert(mensagem);
                return;
            }
            const data = await response.json();
            setPdfFile(file.name);
            updateForm({ balanceteUrl: data.url });
        } catch (error) {
            console.error("Erro no upload do PDF:", error);
            window.alert(error.message || "Não foi possível conectar ao servidor.");
        } finally {
            setEnviandoPdf(false);
        }
    }

    async function onSubmit(e) {
        e.preventDefault();

        if (!form.titulo.trim() || !form.mesReferencia) {
            window.alert("Preencha o título e o mês/ano de referência.");
            return;
        }

        setSalvando(true);

        try {
            const method = editando ? "PUT" : "POST";
            const url = editando
                ? `${API_BASE_URL}/relatorios/${editando._id}`
                : `${API_BASE_URL}/relatorios`;

            const response = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(form)
            });

            if (!response.ok) {
                let mensagem = `Erro ao salvar relatório. (HTTP ${response.status})`;
                try {
                    const data = await response.json();
                    if (data && data.mensagem) mensagem = data.mensagem;
                } catch (_) {}
                window.alert(mensagem);
                return;
            }

            setModalAberto(false);
            window.alert(editando ? "Relatório atualizado com sucesso!" : "Relatório cadastrado com sucesso!");
            carregarRelatorios();
        } catch (error) {
            console.error("Erro na requisição:", error);
            window.alert(error.message || "Não foi possível conectar ao servidor.");
        } finally {
            setSalvando(false);
        }
    }

    async function excluirRelatorio(id) {
        if (!window.confirm("Deseja excluir permanentemente este relatório?")) return;
        try {
            const response = await fetch(`${API_BASE_URL}/relatorios/${id}`, {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (!response.ok) {
                window.alert("Erro ao excluir relatório.");
                return;
            }
            setRelatorios((prev) => prev.filter((r) => r._id !== id));
            window.alert("Relatório excluído com sucesso!");
        } catch (error) {
            console.error("Erro ao excluir:", error);
            window.alert("Não foi possível conectar ao servidor.");
        }
    }

    const totalArrecadado = relatorios.reduce((acc, r) => acc + (parseFloat(r.totalArrecadacao) || 0), 0);
    const totalDespesas = relatorios.reduce((acc, r) => acc + (parseFloat(r.totalDespesas) || 0), 0);

    return (
        <div className="container-fluid py-2">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h3 style={{ color: primaryColor, fontWeight: 'bold' }}>
                        <i className="bi bi-file-earmark-bar-graph me-2"></i> Prestação de Contas
                    </h3>
                    <p className="text-muted mb-0">Relatórios mensais de entradas e saídas exibidos na página pública de Transparência</p>
                </div>
                <button
                    type="button"
                    onClick={abrirNovo}
                    className="btn text-white px-4 py-2 d-inline-flex align-items-center shadow-sm"
                    style={{ backgroundColor: primaryColor, borderRadius: '6px', fontWeight: '500' }}
                >
                    <i className="bi bi-plus-lg me-2"></i> Novo Relatório
                </button>
            </div>

            <div className="row g-4 mb-4">
                <div className="col-md-6">
                    <div className="card border-0 shadow-sm p-4 h-100" style={{ borderRadius: '8px', backgroundColor: '#fdf7f2' }}>
                        <div className="d-flex align-items-center gap-3">
                            <div style={{ backgroundColor: '#fff', borderRadius: '50%', padding: '15px', border: '1px solid #eadfcf' }}>
                                <i className="bi bi-arrow-down-circle fs-3 text-success"></i>
                            </div>
                            <div>
                                <small className="text-muted text-uppercase fw-bold">Total arrecadado (relatórios)</small>
                                <h4 className="fw-bold mb-0" style={{ color: primaryColor }}>
                                    {loading ? <span className="spinner-border spinner-border-sm" role="status"></span> : formatCurrency(totalArrecadado)}
                                </h4>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-md-6">
                    <div className="card border-0 shadow-sm p-4 h-100" style={{ borderRadius: '8px', backgroundColor: '#fdf7f2' }}>
                        <div className="d-flex align-items-center gap-3">
                            <div style={{ backgroundColor: '#fff', borderRadius: '50%', padding: '15px', border: '1px solid #eadfcf' }}>
                                <i className="bi bi-arrow-up-circle fs-3 text-danger"></i>
                            </div>
                            <div>
                                <small className="text-muted text-uppercase fw-bold">Total de despesas (relatórios)</small>
                                <h4 className="fw-bold mb-0" style={{ color: primaryColor }}>
                                    {loading ? <span className="spinner-border spinner-border-sm" role="status"></span> : formatCurrency(totalDespesas)}
                                </h4>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: '8px', overflow: 'hidden' }}>
                <div className="table-responsive">
                    <table className="table table-hover mb-0 align-middle">
                        <thead className="table-light">
                            <tr style={{ borderBottom: '2px solid #e9ecef' }}>
                                <th style={{ paddingLeft: '1.5rem', color: primaryColor, fontWeight: '600' }}>Título</th>
                                <th style={{ color: primaryColor, fontWeight: '600' }}>Referência</th>
                                <th className="text-end" style={{ color: primaryColor, fontWeight: '600' }}>Entradas</th>
                                <th className="text-end" style={{ color: primaryColor, fontWeight: '600' }}>Saídas</th>
                                <th className="text-end" style={{ color: primaryColor, fontWeight: '600' }}>Saldo</th>
                                <th style={{ color: primaryColor, fontWeight: '600' }}>Balancete</th>
                                <th style={{ color: primaryColor, fontWeight: '600', width: '180px' }}>Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="7" className="text-center py-5">
                                        <div className="spinner-border" style={{ color: primaryColor }} role="status"></div>
                                    </td>
                                </tr>
                            ) : relatorios.length > 0 ? (
                                relatorios.map((relatorio) => {
                                    const saldo = (parseFloat(relatorio.totalArrecadacao) || 0) - (parseFloat(relatorio.totalDespesas) || 0);
                                    return (
                                        <tr key={relatorio._id}>
                                            <td className="fw-semibold text-dark" style={{ paddingLeft: '1.5rem' }}>{relatorio.titulo}</td>
                                            <td className="text-muted">{formatarMes(relatorio.mesReferencia)}</td>
                                            <td className="text-end fw-semibold text-success">{formatCurrency(relatorio.totalArrecadacao)}</td>
                                            <td className="text-end fw-semibold text-danger">{formatCurrency(relatorio.totalDespesas)}</td>
                                            <td className={`text-end fw-bold ${saldo >= 0 ? "text-secondary" : "text-danger"}`}>{formatCurrency(saldo)}</td>
                                            <td>
                                                {relatorio.balanceteUrl ? (
                                                    <a
                                                        href={relatorio.balanceteUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="btn btn-sm btn-outline-secondary d-inline-flex align-items-center"
                                                        style={{ borderRadius: '6px' }}
                                                    >
                                                        <i className="bi bi-file-earmark-pdf me-1"></i> Ver PDF
                                                    </a>
                                                ) : (
                                                    <span className="text-muted small">---</span>
                                                )}
                                            </td>
                                            <td>
                                                <div className="d-flex gap-2">
                                                    <button
                                                        type="button"
                                                        className="btn btn-sm btn-outline-secondary d-inline-flex align-items-center"
                                                        style={{ borderRadius: '6px' }}
                                                        onClick={() => abrirEdicao(relatorio)}
                                                    >
                                                        <i className="bi bi-pencil-square me-1"></i> Editar
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="btn btn-sm btn-outline-danger d-inline-flex align-items-center"
                                                        style={{ borderRadius: '6px' }}
                                                        onClick={() => excluirRelatorio(relatorio._id)}
                                                    >
                                                        <i className="bi bi-trash me-1"></i> Excluir
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan="7" className="text-center text-muted py-5">
                                        <i className="bi bi-inbox text-muted d-block mb-2" style={{ fontSize: '2rem' }}></i>
                                        Nenhum relatório cadastrado ainda.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {modalAberto && (
                <div className="modal d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(74,37,17,0.5)' }} onClick={() => !salvando && setModalAberto(false)}>
                    <div className="modal-dialog modal-lg modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-content border-0 shadow" style={{ borderRadius: '12px' }}>
                            <div className="modal-header border-0" style={{ backgroundColor: '#fdf7f2', borderTopLeftRadius: '12px', borderTopRightRadius: '12px' }}>
                                <h5 className="modal-title fw-bold" style={{ color: primaryColor }}>
                                    <i className={`bi ${editando ? "bi-pencil-square" : "bi-file-earmark-plus"} me-2`}></i>
                                    {editando ? "Editar Relatório" : "Novo Relatório"}
                                </h5>
                                <button type="button" className="btn-close" onClick={() => setModalAberto(false)} disabled={salvando}></button>
                            </div>

                            <form onSubmit={onSubmit}>
                                <div className="modal-body">
                                    <div className="row">
                                        <div className="form-group col-md-8 mb-3">
                                            <label htmlFor="titulo" style={labelStyle}>Título do Relatório</label>
                                            <input type="text" className="form-control px-3 py-2" id="titulo" style={inputStyle} value={form.titulo} onChange={(e) => updateForm({ titulo: e.target.value })} placeholder="Ex: Balancete de Janeiro" required />
                                        </div>
                                        <div className="form-group col-md-4 mb-3">
                                            <label htmlFor="mesReferencia" style={labelStyle}>Mês/Ano de Referência</label>
                                            <input type="month" className="form-control px-3 py-2" id="mesReferencia" style={inputStyle} value={form.mesReferencia} onChange={(e) => updateForm({ mesReferencia: e.target.value })} required />
                                        </div>
                                    </div>

                                    <div className="row">
                                        <div className="form-group col-md-6 mb-3">
                                            <label htmlFor="totalArrecadacao" style={labelStyle}>Total de Arrecadação (R$)</label>
                                            <input type="number" step="0.01" min="0" className="form-control px-3 py-2" id="totalArrecadacao" style={inputStyle} value={form.totalArrecadacao} onChange={(e) => updateForm({ totalArrecadacao: e.target.value })} placeholder="0,00" />
                                        </div>
                                        <div className="form-group col-md-6 mb-3">
                                            <label htmlFor="totalDespesas" style={labelStyle}>Total de Despesas (R$)</label>
                                            <input type="number" step="0.01" min="0" className="form-control px-3 py-2" id="totalDespesas" style={inputStyle} value={form.totalDespesas} onChange={(e) => updateForm({ totalDespesas: e.target.value })} placeholder="0,00" />
                                        </div>
                                    </div>

                                    <div className="row">
                                        <div className="form-group col-md-6 mb-3">
                                            <label htmlFor="balanceteUrl" style={labelStyle}>Link do Balancete (URL)</label>
                                            <input type="url" className="form-control px-3 py-2" id="balanceteUrl" style={inputStyle} value={form.balanceteUrl} onChange={(e) => updateForm({ balanceteUrl: e.target.value })} placeholder="https://... ou link gerado pelo upload abaixo" />
                                        </div>
                                        <div className="form-group col-md-6 mb-3">
                                            <label htmlFor="balancetePdf" style={labelStyle}>Ou enviar PDF do Balancete</label>
                                            <input type="file" accept="application/pdf" className="form-control px-3 py-2" id="balancetePdf" style={inputStyle} onChange={handlePdfSelect} disabled={enviandoPdf} />
                                            {enviandoPdf && <small className="text-muted d-block mt-1"><span className="spinner-border spinner-border-sm me-1" role="status"></span> Enviando PDF...</small>}
                                            {pdfFile && <small className="text-success d-block mt-1"><i className="bi bi-check-circle me-1"></i>{pdfFile}</small>}
                                        </div>
                                    </div>

                                    <div className="row">
                                        <div className="form-group col-md-12 mb-2">
                                            <label htmlFor="resumo" style={labelStyle}>Resumo do Mês</label>
                                            <textarea className="form-control px-3 py-2" id="resumo" rows="3" style={inputStyle} value={form.resumo} onChange={(e) => updateForm({ resumo: e.target.value })} placeholder="Breve resumo das entradas, saídas e atividades do mês..." />
                                        </div>
                                    </div>
                                </div>

                                <div className="modal-footer border-0">
                                    <button type="button" className="btn btn-outline-secondary px-4" style={{ borderRadius: '6px' }} onClick={() => setModalAberto(false)} disabled={salvando}>
                                        Cancelar
                                    </button>
                                    <button type="submit" className="btn text-white px-4 d-inline-flex align-items-center" style={{ backgroundColor: primaryColor, borderRadius: '6px', fontWeight: '500' }} disabled={salvando}>
                                        {salvando ? (
                                            <><span className="spinner-border spinner-border-sm me-2" role="status"></span> Salvando...</>
                                        ) : (
                                            <><i className="bi bi-check-lg me-2"></i> Salvar</>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
