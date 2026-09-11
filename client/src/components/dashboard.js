import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API_BASE_URL from "../api/config";

export default function Dashboard() {
  const [totalAnimais, setTotalAnimais] = useState(0);
  const [totalArrecadado, setTotalArrecadado] = useState(0);
  const [totalVoluntarios, setTotalVoluntarios] = useState(0);
  const [totalPendentes, setTotalPendentes] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function carregarDados() {
      try {
        const token = localStorage.getItem('token');
        const headers = {
          'Authorization': `Bearer ${token}`
        };

        const [animaisRes, doacoesRes, voluntariosRes] = await Promise.all([
          fetch(`${API_BASE_URL}/animal`, { headers }).catch(() => null),
          fetch(`${API_BASE_URL}/doacoes`, { headers }).catch(() => null),
          fetch(`${API_BASE_URL}/voluntarios`, { headers }).catch(() => null)
        ]);

        if (animaisRes && animaisRes.ok) {
          const animaisData = await animaisRes.json(); // Corrigido aqui!
          const listaAnimais = Array.isArray(animaisData) ? animaisData : (animaisData.data || []);
          setTotalAnimais(listaAnimais.length);
        }

        if (doacoesRes && doacoesRes.ok) {
          const doacoesData = await doacoesRes.json();
          const listaDoacoes = Array.isArray(doacoesData) ? doacoesData : (doacoesData.data || []);
          const soma = listaDoacoes.reduce((acc, item) => acc + (parseFloat(item.valor) || 0), 0);
          setTotalArrecadado(soma);
        }

        if (voluntariosRes && voluntariosRes.ok) {
          const voluntariosData = await voluntariosRes.json();
          const listaVoluntarios = Array.isArray(voluntariosData) ? voluntariosData : (voluntariosData.data || []);
          setTotalVoluntarios(listaVoluntarios.length);
          setTotalPendentes(listaVoluntarios.filter((v) => (v.status || 'Ativo') === 'Pendente').length);
        }
      } catch (error) {
        console.error('Erro de conexão com o backend:', error);
      } finally {
        setLoading(false);
      }
    }
    carregarDados();
  }, []);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const primaryColor = '#4a2511';



  return (
    <div className="container-fluid py-2">
      {/* Cabeçalho Interno */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>         
          <h2 style={{ color: primaryColor, fontWeight: 'bold' }} className="mb-1">Painel de Controle</h2>
          <p className="text-muted mb-0">Visão geral do sistema de apoio e resgate</p>
        </div>
        <div>
          <span className="badge bg-light text-dark border p-2 small">
            <i className="bi bi-person-circle me-1"></i> Administrador
          </span>
        </div>
      </div>

      <hr className="mb-4" />

      {/* Card de Notificação: Solicitações de Voluntários Pendentes */}
      <Link to="/voluntarios" state={{ abrirCaixa: true }} style={{ textDecoration: 'none', color: 'inherit' }}>
        <div
          className="card border-0 shadow-sm mb-4"
          style={{
            borderRadius: '12px',
            backgroundColor: totalPendentes > 0 ? '#fff8e6' : '#f2f2f2',
            borderLeft: totalPendentes > 0 ? '6px solid #f0ad4e' : '6px solid #c8c8c8',
            cursor: 'pointer'
          }}
        >
          <div className="card-body d-flex flex-wrap justify-content-between align-items-center gap-3 py-3 px-4">
            <div className="d-flex align-items-center gap-3">
              <div
                className="rounded-circle d-flex align-items-center justify-content-center"
                style={{ width: '52px', height: '52px', backgroundColor: totalPendentes > 0 ? '#ffecb3' : '#e0e0e0' }}
              >
                <i className={`bi ${totalPendentes > 0 ? 'bi-inbox-fill' : 'bi-inbox'} fs-3`} style={{ color: totalPendentes > 0 ? '#8a6d1d' : '#888' }}></i>
              </div>
              <div>
                <span className="text-muted small text-uppercase fw-bold d-block" style={{ color: totalPendentes > 0 ? '#8a6d1d' : '#666' }}>
                  Solicitações de Voluntários Pendentes
                </span>
                <h3 className="fw-bold mb-0" style={{ color: totalPendentes > 0 ? '#856404' : '#666' }}>
                  {loading ? <span className="spinner-border spinner-border-sm" role="status"></span> : totalPendentes}
                </h3>
              </div>
            </div>
            <span className="btn px-4 py-2 text-white shadow-sm" style={{ backgroundColor: totalPendentes > 0 ? '#f0ad4e' : '#8a8a8a', borderRadius: '6px', fontWeight: '500' }}>
              <i className="bi bi-arrow-right-circle me-2"></i> Ir para a Caixa de Entrada
            </span>
          </div>
        </div>
      </Link>

      {/* Grid de Cards Indicadores */}
      <div className="row g-4 mb-5">
        
        {/* CARD ANIMAIS */}
        <div className="col-lg-4 col-md-6">
          <Link to="/animais" style={{ textDecoration: 'none', color: 'inherit' }}>
            <div 
              className="card border-0 p-3 h-100 bg-white admin-indicator-card" 
            >
              <div className="card-body d-flex flex-column justify-content-center">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <span className="text-muted small text-uppercase fw-bold">Animais Cadastrados</span>
                    <h2 className="mt-2 fw-bold mb-0" style={{ color: primaryColor }}>
                      {loading ? <span className="spinner-border spinner-border-sm" role="status"></span> : totalAnimais}
                    </h2>
                  </div>
                  <div style={{ backgroundColor: '#fdf7f2', borderRadius: '50%', padding: '15px' }}>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        </div>

        {/* CARD DOAÇÕES */}
        <div className="col-lg-4 col-md-6">
          <Link to="/estatisticas-doacoes" style={{ textDecoration: 'none', color: 'inherit' }}>
            <div 
              className="card border-0 p-3 h-100 bg-white admin-indicator-card" 
            >
              <div className="card-body d-flex flex-column justify-content-center">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <span className="text-muted small text-uppercase fw-bold">Total Arrecadado</span>
                    <h2 className="mt-2 fw-bold mb-1" style={{ color: primaryColor }}>
                      {loading ? <span className="spinner-border spinner-border-sm" role="status"></span> : formatCurrency(totalArrecadado)}
                    </h2>
                    <small className="text-primary" style={{ fontSize: '0.75rem', fontWeight: '500' }}>
                      <i className="bi bi-graph-up me-1"></i> Ver análise detalhada
                    </small>
                  </div>
                  <div style={{ backgroundColor: '#fdf7f2', borderRadius: '50%', padding: '15px' }}>
                    <i className="bi bi-cash-coin fs-3" style={{ color: primaryColor }}></i>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        </div>

        {/* CARD VOLUNTÁRIOS */}
        <div className="col-lg-4 col-md-12">
          <Link to="/voluntarios" style={{ textDecoration: 'none', color: 'inherit' }}>
            <div 
              className="card border-0 p-3 h-100 bg-white admin-indicator-card" 
            >
              <div className="card-body d-flex flex-column justify-content-center">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <span className="text-muted small text-uppercase fw-bold">Voluntários Ativos</span>
                    <h2 className="mt-2 fw-bold mb-0" style={{ color: primaryColor }}>
                      {loading ? <span className="spinner-border spinner-border-sm" role="status"></span> : totalVoluntarios}
                    </h2>
                  </div>
                  <div style={{ backgroundColor: '#fdf7f2', borderRadius: '50%', padding: '15px' }}>
                    <i className="bi bi-people-fill fs-3" style={{ color: primaryColor }}></i>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        </div>

      </div>

      {/* Bloco de Boas-vindas / Informativo */}
      <div className="card border-0 shadow-sm bg-white" style={{ borderRadius: '12px' }}>
        <div className="card-body p-5">
          <h4 style={{ color: primaryColor, fontWeight: 'bold' }} className="mb-3">
            Gerenciamento Interno Patas & Lares
          </h4>
          <p className="text-muted mb-4" style={{ maxWidth: '800px', lineHeight: '1.6' }}>
            Utilize o menu fixo localizado à esquerda da tela para navegar entre os módulos do sistema. 
            Você pode cadastrar novos acolhidos, registrar doações recebidas em dinheiro ou materiais, além de coordenar a lista de voluntários parceiros.
          </p>
          <Link to="/animais" className="btn px-4 py-2 text-white shadow-sm" style={{ backgroundColor: primaryColor, borderRadius: '6px', fontWeight: '500' }}>
            <i className="bi bi-plus-circle me-2"></i> Gerenciar Animais
          </Link>
        </div>
      </div>
    </div>
  );
}