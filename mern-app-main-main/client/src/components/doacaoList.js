import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const REACT_APP_YOUR_HOSTNAME = 'http://localhost:5050';

const DoacaoRecord = (props) => {
    const getBadgeClass = (tipo) => {
        switch (tipo) {
            case "Dinheiro": return "bg-success-subtle text-success border border-success-subtle";
            case "Ração": return "bg-warning-subtle text-warning-emphasis border border-warning-subtle";
            case "Medicamento": return "bg-primary-subtle text-primary border border-primary-subtle";
            default: return "bg-secondary-subtle text-secondary border border-secondary-subtle";
        }
    };

    return (
        <tr className="align-middle">
            <td className="fw-semibold text-dark" style={{ paddingLeft: '1.5rem' }}>{props.record.nome}</td>
            <td>
                <span className={`badge px-2 py-1.5 rounded ${getBadgeClass(props.record.tipo_doacao)}`} style={{ fontSize: '0.85rem' }}>
                    {props.record.tipo_doacao}
                </span>
            </td>
            <td className="text-muted">{props.record.item || "---"}</td>
            <td className="fw-bold text-end text-secondary" style={{ paddingRight: '2rem' }}>
                {props.record.valor ? `R$ ${parseFloat(props.record.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : "---"}
            </td>
            <td>
                <div className="d-flex gap-2">
                    <Link 
                        className="btn btn-sm btn-outline-secondary d-inline-flex align-items-center" 
                        to={`/edit-doacao/${props.record._id}`}
                        title="Editar"
                        style={{ borderRadius: '6px' }}
                    >
                        <i className="bi bi-pencil-square me-1"></i> Editar
                    </Link>
                    <button 
                        className="btn btn-sm btn-outline-danger d-inline-flex align-items-center" 
                        onClick={() => props.deleteDoacao(props.record._id)}
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

export default function DoacaoList() {
    const [doacoes, setDoacoes] = useState([]);
    const [pesquisa, setPesquisa] = useState("");

    useEffect(() => {
        async function getDoacoes() {
            try {
                const response = await fetch(`${REACT_APP_YOUR_HOSTNAME}/doacoes`);
                if (!response.ok) return;
                const data = await response.json();
                setDoacoes(data);
            } catch (error) {
                console.error("Erro de conexão:", error);
            }
        }
        getDoacoes();
    }, []); 

    async function deleteDoacao(id) {
        if (!window.confirm("Deseja excluir permanentemente esta doação?")) return;
        try {
            await fetch(`${REACT_APP_YOUR_HOSTNAME}/doacao/${id}`, { method: "DELETE" });
            setDoacoes(doacoes.filter((el) => el._id !== id));
        } catch (error) {
            console.error("Erro ao deletar:", error);
        }
    }

    const doacoesFiltradas = doacoes.filter((doacao) => {
        const termo = pesquisa.toLowerCase();
        return (
            doacao.nome.toLowerCase().includes(termo) ||
            doacao.tipo_doacao.toLowerCase().includes(termo) ||
            (doacao.item && doacao.item.toLowerCase().includes(termo))
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
                <Link 
                    className="btn text-white px-4 py-2 d-inline-flex align-items-center shadow-sm" 
                    to="/cadastrar-doacao" 
                    style={{ backgroundColor: primaryColor, fontWeight: '500', borderRadius: '6px' }}
                >
                    <i className="bi bi-plus-lg me-2"></i> Nova Doação
                </Link>
            </div>
            
            <div className="card border-0 shadow-sm p-3 mb-4" style={{ borderRadius: '8px' }}>
                <div className="input-group">
                    <span className="input-group-text bg-white border-end-0 text-muted px-3">
                        <i className="bi bi-search"></i>
                    </span>
                    <input
                        type="text"
                        className="form-control border-start-0 py-2"
                        placeholder="Pesquisar por doador, tipo ou item..."
                        value={pesquisa}
                        onChange={(e) => setPesquisa(e.target.value)}
                        style={{ boxShadow: 'none', borderRadius: '0 6px 6px 0', border: '1px solid #ced4da' }}
                    />
                </div>
                <div className="mt-2 ps-1">
                    <small className="text-muted">
                        Exibindo <strong>{doacoesFiltradas.length}</strong> de {doacoes.length} registros.
                    </small>
                </div>
            </div>

            <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: '8px', overflow: 'hidden' }}>
                <div className="table-responsive">
                    <table className="table table-hover mb-0">
                        <thead className="table-light">
                            <tr style={{ borderBottom: '2px solid #e9ecef' }}>
                                <th style={{ paddingLeft: '1.5rem', color: primaryColor, fontWeight: '600' }}>Doador</th>
                                <th style={{ color: primaryColor, fontWeight: '600' }}>Tipo</th>
                                <th style={{ color: primaryColor, fontWeight: '600' }}>Item / Descrição</th>
                                <th className="text-end" style={{ paddingRight: '2rem', color: primaryColor, fontWeight: '600' }}>Valor</th>
                                <th style={{ color: primaryColor, fontWeight: '600', width: '180px' }}>Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {doacoesFiltradas.length > 0 ? (
                                doacoesFiltradas.map((doacao) => (
                                    <DoacaoRecord 
                                        record={doacao} 
                                        deleteDoacao={deleteDoacao} 
                                        key={doacao._id} 
                                    />
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="text-center text-muted py-5">
                                        <i className="bi bi-inbox text-muted d-block mb-2" style={{ fontSize: '2rem' }}></i>
                                        Nenhuma doação encontrada para os termos pesquisados.
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