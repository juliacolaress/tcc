import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import API_BASE_URL from "../api/config";

// Componente da Linha da Tabela (Record) customizado
const Record = (props) => {
    return (
        <tr className="align-middle">
            <td className="fw-semibold">{props.record.name}</td>
            <td>{props.record.user}</td> {/* Garanta que no backend seja 'user' */}
            <td>{props.record.email}</td>
            <td>
                <span className="badge bg-light text-dark border px-2 py-1" style={{ borderRadius: '4px' }}>
                    {props.record.function}
                </span>
            </td>
            <td>
                <div className="d-flex gap-2">
                    <Link 
                        className="btn btn-sm btn-outline-secondary d-inline-flex align-items-center" 
                        to={`/edit/${props.record._id}`}
                        style={{ borderRadius: '4px' }}
                    >
                        <i className="bi bi-pencil me-1"></i> Editar
                    </Link>
                    <button
                        className="btn btn-sm btn-outline-danger d-inline-flex align-items-center"
                        onClick={() => props.deleteRecord(props.record._id)}
                        style={{ borderRadius: '4px' }}
                    >
                        <i className="bi bi-trash me-1"></i> Excluir
                    </button>
                </div>
            </td>
        </tr>
    );
};

export default function UserList() {
    const [users, setUsers] = useState([]);
    const primaryColor = '#5c3a21';

    // CORREÇÃO AQUI: Array vazio [] garante que a busca aconteça só 1 vez ao abrir a tela
    useEffect(() => {
        async function getUsers() {
            const token = localStorage.getItem('token');
            try {
                const response = await fetch(`${API_BASE_URL}/user/`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (!response.ok) {
                    const message = `Um erro ocorreu: ${response.statusText}`;
                    window.alert(message);
                    return;
                }

                const data = await response.json();
                setUsers(data);
            } catch (error) {
                console.error("Erro ao buscar usuários:", error);
            }
        }

        getUsers();
    }, []); // <--- Array de dependências corrigido para não dar loop infinito!

    async function deleteRecord(id) {
        const result = window.confirm("Deseja remover desta lista?");
        if (!result) {
            return;
        }

        const token = localStorage.getItem('token');
        await fetch(`${API_BASE_URL}/user/${id}`, {
            method: "DELETE",
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        // Atualiza o estado local removendo o usuário deletado da tela na hora
        const newUsers = users.filter((record) => record._id !== id);
        setUsers(newUsers);
    }

    function recordList() {
        return users.map((record) => {
            return (
                <Record
                    key={record._id}
                    record={record}
                    deleteRecord={() => deleteRecord(record._id)}
                />
            );
        });
    }

    return (
        <div className="container mt-4">
            {/* Cabeçalho padronizado */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h3 style={{ color: primaryColor, fontWeight: 'bold' }}>
                    <i className="bi bi-people-fill me-2"></i> Lista de Usuários
                </h3>
                <Link 
                    className="btn text-white px-4 py-2 shadow-sm" 
                    to="/cadastrar-usuario"
                    style={{ backgroundColor: primaryColor, borderRadius: '6px', fontWeight: '500' }}
                >
                    <i className="bi bi-plus-lg me-2"></i> Cadastrar novo usuário
                </Link>
            </div>
            <hr />

            {/* Tabela Customizada */}
            <div className="table-responsive shadow-sm" style={{ borderRadius: '8px' }}>
                <table className="table table-hover table-striped mb-0">
                    <thead className="text-white" style={{ backgroundColor: primaryColor }}>
                        <tr>
                            <th className="py-3 ps-3">Nome</th>
                            <th className="py-3">Login</th>
                            <th className="py-3">E-mail</th>
                            <th className="py-3">Função</th>
                            <th className="py-3 pe-3">Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.length > 0 ? (
                            recordList()
                        ) : (
                            <tr>
                                <td colSpan="5" className="text-center py-4 text-muted">
                                    Nenhum usuário cadastrado ou carregando...
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}