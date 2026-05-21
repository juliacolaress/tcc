import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API_BASE_URL from "../api/config";
import Logo from './Logo.png';

export default function Dashboard() {
  const [totalAnimais, setTotalAnimais] = useState(0);
  const [totalArrecadado, setTotalArrecadado] = useState(0);
  const [totalVoluntarios, setTotalVoluntarios] = useState(0);
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
          const animaisData = await animaisRes.json();
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

  const primaryColor = '#5c3a21';

  return (
    <div className="container-fluid py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>          
          <h3 style={{ color: primaryColor, fontWeight: 'bold' }}>Patas & Lares</h3>
          <p className="text-muted mb-0">Painel de Controle</p>
        </div>
        <div>
          <Link to="/animais" className="btn btn-outline-secondary px-4 py-2" style={{ borderRadius: '6px' }}>
            <i className="bi bi-list me-2"></i> Gerenciar Animais
          </Link>
        </div>
      </div>

      <div className="row g-4 mb-4">
        {/* CARD ANIMAIS */}
        <div className="col-xl-4 col-md-6">
          <div className="card border-0 shadow-sm p-3 h-100">
            <div className="card-body d-flex flex-column justify-content-center">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <span className="text-muted small text-uppercase fw-bold">Animais Cadastrados</span>
                  <h2 className="mt-2 fw-bold" style={{ color: primaryColor }}>
                    {loading ? <span className="spinner-border spinner-border-sm" role="status"></span> : totalAnimais}
                  </h2>
                </div>
                <div style={{ backgroundColor: '#fdf7f2', borderRadius: '50%', padding: '15px' }}>
                  <i className="bi bi-paw-fill fs-4" style={{ color: primaryColor }}></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CARD DOAÇÕES LINKADO */}
        <div className="col-xl-4 col-md-12">
          <Link to="/estatisticas-doacoes" style={{ textDecoration: 'none', color: 'inherit' }}>
            <div className="card border-0 shadow-sm p-3 h-100" style={{ cursor: 'pointer', transition: 'transform 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}>
              <div className="card-body d-flex flex-column justify-content-center">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <span className="text-muted small text-uppercase fw-bold">Total Arrecadado</span>
                    <h2 className="mt-2 fw-bold" style={{ color: primaryColor }}>
                      {loading ? <span className="spinner-border spinner-border-sm" role="status"></span> : formatCurrency(totalArrecadado)}
                    </h2>
                    <small className="text-primary" style={{ fontSize: '0.75rem' }}>+ Clique para ver análise detalhada</small>
                  </div>
                  <div style={{ backgroundColor: '#fdf7f2', borderRadius: '50%', padding: '15px' }}>
                    <i className="bi bi-cash-coin fs-4" style={{ color: primaryColor }}></i>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        </div>

        {/* CARD VOLUNTÁRIOS */}
        <div className="col-xl-4 col-md-6">
          <div className="card border-0 shadow-sm p-3 h-100">
            <div className="card-body d-flex flex-column justify-content-center">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <span className="text-muted small text-uppercase fw-bold">Voluntários</span>
                  <h2 className="mt-2 fw-bold" style={{ color: primaryColor }}>
                    {loading ? <span className="spinner-border spinner-border-sm" role="status"></span> : totalVoluntarios}
                  </h2>
                </div>
                <div style={{ backgroundColor: '#fdf7f2', borderRadius: '50%', padding: '15px' }}>
                  <i className="bi bi-people-fill fs-4" style={{ color: primaryColor }}></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="card border-0 shadow-sm">
        <div className="card-body p-4">
          <h4 style={{ color: primaryColor, fontWeight: 'bold' }}>Gerenciamento do Patas & Lares</h4>
          <p className="text-muted">A partir do menu lateral ou dos cards informativos, você consegue acessar os dados e manter o controle total do projeto.</p>
          <Link to="/animais" className="btn px-4 py-2 text-white mt-2" style={{ backgroundColor: primaryColor, borderRadius: '6px' }}>
            Gerenciar Animais
          </Link>
        </div>
      </div>
    </div>
  );
}