import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import API_BASE_URL from "../api/config";

const STATUS_STYLES = {
    "Agendado": { classe: "bg-success-subtle text-success border border-success-subtle" },
    "Concluído": { classe: "bg-secondary-subtle text-secondary border border-secondary-subtle" },
    "Cancelado": { classe: "bg-danger-subtle text-danger border border-danger-subtle" }
};

function formatarData(valor) {
    if (!valor) return "---";
    const texto = valor instanceof Date ? valor.toISOString() : String(valor);
    const partes = texto.slice(0, 10).split("-");
    if (partes.length !== 3) return String(valor);
    return `${partes[2]}/${partes[1]}/${partes[0]}`;
}

export default function EventosList() {
    const [eventos, setEventos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const primaryColor = '#4a2511';

    useEffect(() => {
        async function getEventos() {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch(`${API_BASE_URL}/eventos/admin`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (!response.ok) {
                    setError(`Erro ao carregar eventos: ${response.statusText}`);
                    return;
                }
                const data = await response.json();
                setEventos(Array.isArray(data) ? data : (data.data || []));
            } catch (error) {
                console.error("Erro de conexão:", error);
                setError("Não foi possível conectar ao servidor.");
            } finally {
                setLoading(false);
            }
        }
        getEventos();
    }, []);

    async function deleteEvento(id) {
        if (!window.confirm("Deseja remover permanentemente este evento?")) return;
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/eventos/${id}`, {
                method: "DELETE",
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                setEventos(eventos.filter((el) => el._id !== id));
            } else {
                window.alert("Erro ao excluir evento.");
            }
        } catch (error) {
            console.error("Erro ao deletar:", error);
            window.alert("Não foi possível conectar ao servidor.");
        }
    }

    return (
        <div className="container-fluid py-2">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h3 style={{ color: primaryColor, fontWeight: 'bold' }}>
                        <i className="bi bi-calendar-event me-2"></i> Eventos
                    </h3>
                    <p className="text-muted mb-0">Campanhas e eventos da ONG — exibidos no site para o público</p>
                </div>
                <Link
                    className="btn text-white px-4 py-2 d-inline-flex align-items-center shadow-sm"
                    to="/cadastrar-evento"
                    style={{ backgroundColor: primaryColor, fontWeight: '500', borderRadius: '6px' }}
                >
                    <i className="bi bi-plus-lg me-2"></i> Novo Evento
                </Link>
            </div>

            {error && (
                <div className="alert alert-danger shadow-sm border-0 mb-4" style={{ borderRadius: '8px' }}>
                    <i className="bi bi-exclamation-triangle me-2"></i> {error}
                </div>
            )}

            <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: '8px', overflow: 'hidden' }}>
                <div className="table-responsive">
                    <table className="table table-hover mb-0">
                        <thead className="table-light">
                            <tr style={{ borderBottom: '2px solid #e9ecef' }}>
                                <th style={{ paddingLeft: '1.5rem', color: primaryColor, fontWeight: '600', width: '80px' }}>Imagem</th>
                                <th style={{ color: primaryColor, fontWeight: '600' }}>Título</th>
                                <th style={{ color: primaryColor, fontWeight: '600' }}>Data</th>
                                <th style={{ color: primaryColor, fontWeight: '600' }}>Horário</th>
                                <th style={{ color: primaryColor, fontWeight: '600' }}>Local</th>
                                <th style={{ color: primaryColor, fontWeight: '600' }}>Status</th>
                                <th style={{ color: primaryColor, fontWeight: '600', width: '180px' }}>Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="7" className="text-center py-5">
                                        <div className="spinner-border text-primary" role="status"></div>
                                    </td>
                                </tr>
                            ) : eventos.length > 0 ? (
                                eventos.map((item) => (
                                    <tr className="align-middle" key={item._id}>
                                        <td style={{ paddingLeft: '1.5rem' }}>
                                            {item.imagem ? (
                                                <img
                                                    src={item.imagem}
                                                    alt={item.titulo}
                                                    style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '6px', border: '1px solid #eadfcf' }}
                                                />
                                            ) : (
                                                <div className="d-flex align-items-center justify-content-center" style={{ width: '60px', height: '60px', borderRadius: '6px', backgroundColor: '#fdf7f2' }}>
                                                    <i className="bi bi-calendar-event text-muted" style={{ fontSize: '1.4rem', opacity: '0.5' }}></i>
                                                </div>
                                            )}
                                        </td>
                                        <td className="fw-semibold text-dark">{item.titulo}</td>
                                        <td className="text-secondary">{formatarData(item.data)}</td>
                                        <td className="text-secondary">{item.horario || "---"}</td>
                                        <td className="text-muted">{item.local || "---"}</td>
                                        <td>
                                            <span className={`badge px-2 py-1 rounded ${STATUS_STYLES[item.status]?.classe || "bg-secondary-subtle text-secondary border border-secondary-subtle"}`} style={{ fontSize: '0.85rem' }}>
                                                {item.status}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="d-flex gap-2">
                                                <Link
                                                    className="btn btn-sm btn-outline-secondary d-inline-flex align-items-center"
                                                    to={`/edit-evento/${item._id}`}
                                                    title="Editar"
                                                    style={{ borderRadius: '6px' }}
                                                >
                                                    <i className="bi bi-pencil-square me-1"></i> Editar
                                                </Link>
                                                <button
                                                    className="btn btn-sm btn-outline-danger d-inline-flex align-items-center"
                                                    onClick={() => deleteEvento(item._id)}
                                                    title="Excluir"
                                                    style={{ borderRadius: '6px' }}
                                                >
                                                    <i className="bi bi-trash me-1"></i> Excluir
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="7" className="text-center text-muted py-5">
                                        <i className="bi bi-calendar-x text-muted d-block mb-2" style={{ fontSize: '2rem' }}></i>
                                        Nenhum evento cadastrado. Clique em "Novo Evento" para começar.
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
