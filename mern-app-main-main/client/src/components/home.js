import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Home() {
    const [stats, setStats] = useState({
        totalAnimais: 0,
        totalDoado: 0,
        totalVoluntarios: 0
    });
    const navigate = useNavigate();

    useEffect(() => {
        async function fetchStats() {
            try {
                const response = await fetch("http://localhost:5050/dashboard/stats");
                if (response.ok) {
                    const data = await response.json();
                    setStats(data);
                }
            } catch (error) {
                console.error("Erro ao buscar estatísticas:", error);
            }
        }
        fetchStats();
    }, []);

    return (
        <div className="d-flex" style={{ height: "100vh", backgroundColor: "#f8f9fa" }}>
            {/* Menu Lateral (Sidebar) */}
            <div style={{ width: "250px", backgroundColor: "#ffffff", boxShadow: "4px 0 10px rgba(0, 0, 0, 0.05)", paddingTop: "20px", position: "fixed", height: "100vh" }}>
                <div className="mb-4 px-4">
                    <h4 className="fw-bold" style={{ color: "#5C3A21" }}>Patas & Lares</h4>
                    <small className="text-muted">Painel Administrativo</small>
                </div>
                <hr className="mx-3" />

                <ul className="nav flex-column flex-grow-1">
                    <li className="nav-item">
                        <Link className="nav-link active" to="/home" style={{ color: "#ffffff", backgroundColor: "#5C3A21", fontWeight: "500", padding: "12px 20px", borderRadius: "8px", margin: "4px 16px" }}>
                            <i className="bi bi-house-door-fill me-2"></i> Início
                        </Link>
                    </li>
                    <li className="nav-item">
                        <Link className="nav-link" to="/usuarios" style={{ color: "#495057", fontWeight: "500", padding: "12px 20px", borderRadius: "8px", margin: "4px 16px" }}>
                            <i className="bi bi-person-fill me-2"></i> Usuários
                        </Link>
                    </li>
                    <li className="nav-item">
                        <Link className="nav-link" to="/animais" style={{ color: "#495057", fontWeight: "500", padding: "12px 20px", borderRadius: "8px", margin: "4px 16px" }}>
                            <i className="bi bi-heart-fill me-2"></i> Animais
                        </Link>
                    </li>
                    <li className="nav-item">
                        <Link className="nav-link" to="/doacao" style={{ color: "#495057", fontWeight: "500", padding: "12px 20px", borderRadius: "8px", margin: "4px 16px" }}>
                            <i className="bi bi-cash-coin me-2"></i> Doações
                        </Link>
                    </li>
                    <li className="nav-item">
                        <Link className="nav-link" to="/voluntarios" style={{ color: "#495057", fontWeight: "500", padding: "12px 20px", borderRadius: "8px", margin: "4px 16px" }}>
                            <i className="bi bi-people-fill me-2"></i> Voluntários
                        </Link>
                    </li>
                </ul>

                <div className="p-3 mx-3 mb-3 border-top mt-auto">
                    <button className="btn btn-link text-danger text-decoration-none d-flex align-items-center p-0" onClick={() => navigate("/")} style={{ border: 'none', background: 'none' }}>
                        <i className="bi bi-box-arrow-left me-2 fs-5"></i> Sair
                    </button>
                </div>
            </div>

            {/* Conteúdo Principal */}
            <div style={{ marginLeft: "250px", padding: "40px", width: "calc(100% - 250px)" }}>
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <div>
                        <h2 className="fw-bold mb-1" style={{ color: "#5C3A21" }}>Painel de Controle</h2>
                        <p className="text-muted mb-0">Visão geral do sistema de apoio e resgate</p>
                    </div>
                    <div>
                        <span className="badge bg-light text-dark border p-2">
                            <i className="bi bi-person-circle me-1"></i> Administrador
                        </span>
                    </div>
                </div>

                <hr className="mb-4" />

                {/* Cards de Estatísticas */}
                <div className="row g-4">
                    <div className="col-md-4">
                        <div className="card p-3 h-100 shadow-sm border-0" style={{ borderRadius: "12px" }}>
                            <div className="d-flex align-items-center">
                                <div className="bg-light text-primary d-flex align-items-center justify-content-center me-3" style={{ fontSize: "1.8rem", padding: "12px", borderRadius: "10px", width: "50px", height: "50px" }}>
                                    <i className="bi bi-heart-fill"></i>
                                </div>
                                <div>
                                    <span className="text-muted d-block mb-1">Animais Cadastrados</span>
                                    <h3 className="fw-bold mb-0">{stats.totalAnimais || 0}</h3>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="col-md-4">
                        <div className="card p-3 h-100 shadow-sm border-0" style={{ borderRadius: "12px" }}>
                            <div className="d-flex align-items-center">
                                <div className="bg-light text-success d-flex align-items-center justify-content-center me-3" style={{ fontSize: "1.8rem", padding: "12px", borderRadius: "10px", width: "50px", height: "50px" }}>
                                    <i className="bi bi-currency-dollar"></i>
                                </div>
                                <div>
                                    <span className="text-muted d-block mb-1">Total Arrecadado</span>
                                    <h3 className="fw-bold mb-0">
                                        R$ {Number(stats.totalDoado || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                    </h3>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="col-md-4">
                        <div className="card p-3 h-100 shadow-sm border-0" style={{ borderRadius: "12px" }}>
                            <div className="d-flex align-items-center">
                                <div className="bg-light text-info d-flex align-items-center justify-content-center me-3" style={{ fontSize: "1.8rem", padding: "12px", borderRadius: "10px", width: "50px", height: "50px" }}>
                                    <i className="bi bi-people-fill"></i>
                                </div>
                                <div>
                                    <span className="text-muted d-block mb-1">Voluntários</span>
                                    <h3 className="fw-bold mb-0">{stats.totalVoluntarios || 0}</h3>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bloco de Ação Central */}
                <div className="mt-5 p-5 bg-white rounded-3 shadow-sm border-0">
                    <h4 className="fw-bold mb-3" style={{ color: "#5C3A21" }}>Gerenciamento do Patas & Lares</h4>
                    <p className="text-muted mb-4">
                        A partir do menu lateral, você consegue acessar o cadastro e manter o controle de todos os dados do projeto.
                    </p>
                    <Link to="/animais" className="btn px-4 py-2 text-white" style={{ backgroundColor: "#5C3A21", borderRadius: "8px", textDecoration: "none" }}>
                        Gerenciar Animais
                    </Link>
                </div>
            </div>
        </div>
    );
}