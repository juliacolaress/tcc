import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API_BASE_URL from "../api/config";

export default function DonationStats() {
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        financeira: { dia: 0, semana: 0, mes: 0, total: 0 },
        material: { dia: 0, semana: 0, mes: 0, total: 0 }
    });
    const [loading, setLoading] = useState(true);
    const primaryColor = '#4a2511';

    useEffect(() => {
        async function fetchStats() {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch(`${API_BASE_URL}/doacoes`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (!response.ok) return;
                const doacoes = await response.json();

                const agora = new Date();
                const umDia = 24 * 60 * 60 * 1000;
                const umaSemana = 7 * umDia;
                const umMes = 30 * umDia;

                const newStats = {
                    financeira: { dia: 0, semana: 0, mes: 0, total: 0 },
                    material: { dia: 0, semana: 0, mes: 0, total: 0 }
                };

                doacoes.forEach(d => {
                    const isFinanceira = d.tipo_doacao === "Dinheiro";
                    const cat = isFinanceira ? 'financeira' : 'material';
                    const data = d.data_criacao ? new Date(d.data_criacao) : null;

                    newStats[cat].total++;

                    if (data) {
                        const diff = agora - data;
                        if (diff < umDia) newStats[cat].dia++;
                        if (diff < umaSemana) newStats[cat].semana++;
                        if (diff < umMes) newStats[cat].mes++;
                    }
                });

                setStats(newStats);
            } catch (error) {
                console.error("Erro ao carregar estatísticas:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchStats();
    }, []);

    const StatItem = ({ label, value }) => (
        <div className="d-flex justify-content-between mb-2 py-2 border-bottom border-light">
            <span className="text-muted">{label}:</span>
            <span className="fw-bold" style={{ color: primaryColor }}>{value}</span>
        </div>
    );

    return (
        <div className="container-fluid py-2">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h3 style={{ color: primaryColor, fontWeight: 'bold' }}>Estatísticas de Doações</h3>
                    <p className="text-muted mb-0">Análise detalhada das contribuições recebidas por período</p>
                </div>
                <button 
                    type="button"
                    onClick={() => navigate("/home")} 
                    className="btn px-4 py-2" 
                    style={{ borderRadius: '6px', color: primaryColor, borderColor: primaryColor, fontWeight: '500' }}
                >
                    <i className="bi bi-arrow-left me-2"></i> Voltar ao Início
                </button>
            </div>

            <div className="row g-4 justify-content-center">
                {/* FINANCEIRAS */}
                <div className="col-md-6">
                    <div className="card border-0 shadow-sm p-4 h-100" style={{ borderRadius: '15px' }}>
                        <div className="text-center mb-4">
                            <div className="d-inline-block mb-3" style={{ backgroundColor: '#fdf7f2', borderRadius: '50%', padding: '25px' }}>
                                <i className="bi bi-cash-coin" style={{ fontSize: '3rem', color: primaryColor }}></i>
                            </div>
                            <h4 className="fw-bold" style={{ color: primaryColor }}>Doações Financeiras</h4>
                        </div>
                        
                        <div className="bg-light p-4 rounded-3">
                            <h6 className="text-uppercase small fw-bold text-muted mb-4 border-bottom pb-2">Entradas por Período</h6>
                            <StatItem label="Últimas 24 horas" value={loading ? "..." : stats.financeira.dia} />
                            <StatItem label="Últimos 7 dias" value={loading ? "..." : stats.financeira.semana} />
                            <StatItem label="Últimos 30 dias" value={loading ? "..." : stats.financeira.mes} />
                            <StatItem label="Total Histórico" value={loading ? "..." : stats.financeira.total} />
                        </div>
                    </div>
                </div>

                {/* MATERIAIS */}
                <div className="col-md-6">
                    <div className="card border-0 shadow-sm p-4 h-100" style={{ borderRadius: '15px' }}>
                        <div className="text-center mb-4">
                            <div className="d-inline-block mb-3" style={{ backgroundColor: '#fdf7f2', borderRadius: '50%', padding: '25px' }}>
                                <i className="bi bi-box-seam" style={{ fontSize: '3rem', color: primaryColor }}></i>
                            </div>
                            <h4 className="fw-bold" style={{ color: primaryColor }}>Doações Materiais</h4>
                        </div>

                        <div className="bg-light p-4 rounded-3">
                            <h6 className="text-uppercase small fw-bold text-muted mb-4 border-bottom pb-2">Entradas por Período</h6>
                            <StatItem label="Últimas 24 horas" value={loading ? "..." : stats.material.dia} />
                            <StatItem label="Últimos 7 dias" value={loading ? "..." : stats.material.semana} />
                            <StatItem label="Últimos 30 dias" value={loading ? "..." : stats.material.mes} />
                            <StatItem label="Total Histórico" value={loading ? "..." : stats.material.total} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
