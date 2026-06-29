import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import API_BASE_URL from "../api/config";

const VoluntarioRecord = (props) => {
    const primaryColor = '#4a2511';
    return (
        <tr className="align-middle">
            <td className="fw-semibold text-dark" style={{ paddingLeft: '1.5rem' }}>{props.record.nome}</td>
            <td className="text-muted">{props.record.email}</td>
            <td className="text-secondary">
                {props.record.ddd && props.record.telefone ? `(${props.record.ddd}) ${props.record.telefone}` : "---"}
            </td>
            <td className="text-muted">{props.record.cidade ? `${props.record.cidade} - ${props.record.estado}` : "---"}</td>
            <td>
                <div className="d-flex gap-2">
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
    const [voluntarios, setVoluntarios] = useState([]);
    const [pesquisa, setPesquisa] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function getVoluntarios() {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch(`${API_BASE_URL}/voluntarios`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                if (!response.ok) return;
                const data = await response.json();
                setVoluntarios(data);
            } catch (error) {
                console.error("Erro de conexão:", error);
            } finally {
                setLoading(false);
            }
        }
        getVoluntarios();
    }, []); 

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

    const voluntariosFiltrados = voluntarios.filter((v) => {
        const termo = pesquisa.toLowerCase();
        return (
            (v.nome && v.nome.toLowerCase().includes(termo)) ||
            (v.email && v.email.toLowerCase().includes(termo)) ||
            (v.cidade && v.cidade.toLowerCase().includes(termo))
        );
    });

    const primaryColor = '#4a2511';

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
            
            {/* Campo de Pesquisa */}
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
                <div className="mt-2 ps-1">
                    <small className="text-muted">
                        Exibindo <strong>{voluntariosFiltrados.length}</strong> de {voluntarios.length} registros.
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
                                    <td colSpan="5" className="text-center text-muted py-5">
                                        <i className="bi bi-people text-muted d-block mb-2" style={{ fontSize: '2rem' }}></i>
                                        Nenhum voluntário encontrado.
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