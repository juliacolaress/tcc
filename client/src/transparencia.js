import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import cores from './theme';
import API_BASE_URL from './api/config';

const MESES = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

function formatarMes(ms) {
    if (!ms) return "---";
    const [ano, mes] = ms.split("-");
    const idx = parseInt(mes, 10) - 1;
    return `${MESES[idx] || mes} de ${ano}`;
}

function formatCurrency(value) {
    return `R$ ${parseFloat(value || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
}

function Transparencia() {
  const navigate = useNavigate();
  const [dropdownDoacoes, setDropdownDoacoes] = useState(false);
  const [relatorios, setRelatorios] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    let ativo = true;
    fetch(`${API_BASE_URL}/relatorios`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (!ativo) return;
        setRelatorios(Array.isArray(data) ? data : []);
      })
      .catch((error) => {
        console.error("Erro ao carregar relatórios:", error);
        setErro("Não foi possível carregar os relatórios no momento.");
      })
      .finally(() => {
        if (ativo) setCarregando(false);
      });
    return () => { ativo = false; };
  }, []);

  const totalArrecadado = relatorios.reduce((acc, r) => acc + (parseFloat(r.totalArrecadacao) || 0), 0);
  const totalDespesas = relatorios.reduce((acc, r) => acc + (parseFloat(r.totalDespesas) || 0), 0);

  return (
    <div style={{ fontFamily: 'Poppins, sans-serif', backgroundColor: cores.cremeFundo, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

      {/* 1. NAVBAR SUPERIOR */}
      <nav className="navbar navbar-expand-lg navbar-dark p-3" style={{ backgroundColor: cores.marromMenu }}>
        <div className="container d-flex justify-content-between align-items-center">
          <span className="navbar-brand fw-bold d-flex align-items-center fs-4" style={{ cursor: 'pointer' }} onClick={() => navigate('/')}>
            <i className="bi bi-paw-fill me-2" style={{ transform: 'rotate(-15deg)' }}></i>
            Patas & Lares
          </span>

          <div className="d-flex align-items-center gap-4">
            <ul className="navbar-nav flex-row gap-3 text-white align-items-center mb-0 d-none d-md-flex">

              <li className="nav-item">
                <span className="nav-link text-white" style={{ cursor: 'pointer' }} onClick={() => { navigate('/'); setDropdownDoacoes(false); }}>
                  Início
                </span>
              </li>

              <li className="nav-item">
                <span className="nav-link text-white" style={{ cursor: 'pointer' }} onClick={() => { navigate('/animais-adocao'); setDropdownDoacoes(false); }}>
                  Animais para Adoção
                </span>
              </li>

              <li className="nav-item position-relative" style={{ cursor: 'pointer' }}>
                <span
                  className="nav-link text-white"
                  style={{ cursor: 'pointer' }}
                  onClick={() => setDropdownDoacoes(!dropdownDoacoes)}
                >
                  Doações <i className="bi bi-chevron-down small ms-1"></i>
                </span>
                {dropdownDoacoes && (
                  <ul className="position-absolute list-unstyled p-2 rounded shadow"
                      style={{ backgroundColor: cores.marromMenu, width: '150px', zIndex: 1000, left: 0, marginTop: '5px' }}>
                    <li><span className="dropdown-item text-white-50 small py-1" style={{ cursor: 'pointer' }} onClick={() => { navigate('/doacao-financeira'); setDropdownDoacoes(false); }}>Financeira</span></li>
                    <li><span className="dropdown-item text-white-50 small py-1" style={{ cursor: 'pointer' }} onClick={() => { navigate('/doacao-material'); setDropdownDoacoes(false); }}>Material</span></li>
                  </ul>
                )}
              </li>

              <li className="nav-item">
                <span className="nav-link text-white" style={{ cursor: 'pointer' }} onClick={() => { navigate('/eventos'); setDropdownDoacoes(false); }}>
                  Eventos
                </span>
              </li>

              <li className="nav-item">
                <span className="nav-link text-white px-3 py-1 rounded-pill" style={{ backgroundColor: 'rgba(255,255,255,0.15)', fontWeight: '500', cursor: 'pointer' }}>
                  Transparência
                </span>
              </li>

              <li className="nav-item">
                <span className="nav-link text-white" style={{ cursor: 'pointer' }} onClick={() => { navigate('/contato'); setDropdownDoacoes(false); }}>
                  Contato
                </span>
              </li>
            </ul>

            <button
              className="btn text-white px-3 py-1 rounded-pill border border-white-50"
              style={{ backgroundColor: 'rgba(255,255,255,0.1)', fontSize: '0.9rem' }}
              onClick={() => navigate('/login')}
            >
              Acesso Restrito
            </button>
          </div>
        </div>
      </nav>

      {/* 2. CABEÇALHO */}
      <div className="text-white py-5 px-4 text-center" style={{ backgroundColor: cores.marromBanner }}>
        <div className="container py-3">
          <h1 className="display-5 fw-bold mb-3">Transparência</h1>
          <p className="fs-5 fw-light mb-0 mx-auto" style={{ maxWidth: '700px', opacity: 0.9 }}>
            Prestação de contas mensal da Patas & Lares: entradas, saídas e o balancete detalhado de cada período.
          </p>
        </div>
      </div>

      {/* 3. CORPO */}
      <div className="container py-5 flex-grow-1">
        {carregando ? (
          <div className="text-center py-5">
            <div className="spinner-border" style={{ color: cores.marromClaro }} role="status"></div>
          </div>
        ) : erro ? (
          <div className="alert alert-warning border-0 shadow-sm mx-auto" style={{ borderRadius: '8px', maxWidth: '600px' }}>
            <i className="bi bi-exclamation-triangle me-2"></i> {erro}
          </div>
        ) : relatorios.length === 0 ? (
          <div className="text-center py-5">
            <i className="bi bi-folder2-open text-muted d-block mb-3" style={{ fontSize: '3rem' }}></i>
            <h4 className="fw-bold text-muted">Nenhum relatório publicado ainda.</h4>
            <p className="text-muted">Em breve a prestação de contas mensal estará disponível aqui.</p>
          </div>
        ) : (
          <>
            {/* Resumo geral */}
            <div className="row g-4 mb-5 justify-content-center">
              <div className="col-md-5">
                <div className="card border-0 shadow-sm p-4 h-100" style={{ borderRadius: '12px', backgroundColor: cores.cardBege }}>
                  <div className="d-flex align-items-center gap-3">
                    <div className="rounded-circle bg-white d-flex align-items-center justify-content-center shadow-sm" style={{ width: '56px', height: '56px' }}>
                      <i className="bi bi-arrow-down-circle fs-3 text-success"></i>
                    </div>
                    <div>
                      <small className="text-muted text-uppercase fw-bold d-block">Total arrecadado</small>
                      <h3 className="fw-bold mb-0" style={{ color: cores.textoMarrom }}>{formatCurrency(totalArrecadado)}</h3>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-md-5">
                <div className="card border-0 shadow-sm p-4 h-100" style={{ borderRadius: '12px', backgroundColor: cores.cardBege }}>
                  <div className="d-flex align-items-center gap-3">
                    <div className="rounded-circle bg-white d-flex align-items-center justify-content-center shadow-sm" style={{ width: '56px', height: '56px' }}>
                      <i className="bi bi-arrow-up-circle fs-3 text-danger"></i>
                    </div>
                    <div>
                      <small className="text-muted text-uppercase fw-bold d-block">Total de despesas</small>
                      <h3 className="fw-bold mb-0" style={{ color: cores.textoMarrom }}>{formatCurrency(totalDespesas)}</h3>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Cards de relatórios */}
            <div className="row g-4">
              {relatorios.map((relatorio) => {
                const arrecadacao = parseFloat(relatorio.totalArrecadacao) || 0;
                const despesas = parseFloat(relatorio.totalDespesas) || 0;
                const saldo = arrecadacao - despesas;
                return (
                  <div className="col-md-6 col-lg-4" key={relatorio._id}>
                    <div className="card h-100 border-0 shadow-sm" style={{ borderRadius: '12px' }}>
                      <div className="card-header border-0 text-white" style={{ backgroundColor: cores.marromMenu, borderTopLeftRadius: '12px', borderTopRightRadius: '12px' }}>
                        <small className="text-uppercase fw-bold" style={{ opacity: 0.75 }}>{formatarMes(relatorio.mesReferencia)}</small>
                        <h5 className="card-title fw-bold mb-0">{relatorio.titulo}</h5>
                      </div>
                      <div className="card-body d-flex flex-column">
                        <div className="d-flex justify-content-between mb-2">
                          <span className="text-muted"><i className="bi bi-arrow-down-circle text-success me-1"></i> Entradas</span>
                          <span className="fw-semibold text-success">{formatCurrency(arrecadacao)}</span>
                        </div>
                        <div className="d-flex justify-content-between mb-2">
                          <span className="text-muted"><i className="bi bi-arrow-up-circle text-danger me-1"></i> Saídas</span>
                          <span className="fw-semibold text-danger">{formatCurrency(despesas)}</span>
                        </div>
                        <div className="d-flex justify-content-between pb-2 border-bottom mb-3">
                          <span className="text-muted fw-bold">Saldo do mês</span>
                          <span className={`fw-bold ${saldo >= 0 ? "text-secondary" : "text-danger"}`}>{formatCurrency(saldo)}</span>
                        </div>

                        {relatorio.resumo && (
                          <p className="text-muted small mb-3" style={{ lineHeight: '1.5' }}>{relatorio.resumo}</p>
                        )}

                        {relatorio.balanceteUrl ? (
                          <a
                            href={relatorio.balanceteUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn mt-auto text-white d-inline-flex align-items-center justify-content-center shadow-sm"
                            style={{ backgroundColor: cores.marromClaro, borderRadius: '8px', fontWeight: '500' }}
                          >
                            <i className="bi bi-file-earmark-pdf me-2"></i> Ver Balancete
                          </a>
                        ) : (
                          <span className="btn mt-auto text-muted d-inline-flex align-items-center justify-content-center border" style={{ borderRadius: '8px', cursor: 'default' }}>
                            Balancete em breve
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* 4. RODAPÉ OFICIAL */}
      <footer className="text-white py-4 mt-auto" style={{ backgroundColor: cores.rodapeMarrom, fontSize: '0.9rem', borderTop: '4px solid #aa7a44' }}>
        <div className="container">
          <div className="row align-items-center g-3">
            <div className="col-md-4 d-flex align-items-center justify-content-center justify-content-md-start">
              <div className="d-flex align-items-center">
                <div className="p-2 me-2 rounded text-center" style={{ backgroundColor: '#aa7a44', color: '#000000', width: '50px', height: '50px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <i className="bi bi-house-heart-fill fs-3"></i>
                </div>
                <div className="text-start lh-1">
                  <span className="fw-bold d-block fs-5 mb-1">Patas</span>
                  <span className="fw-bold d-block fs-5" style={{ color: '#aa7a44' }}>& Lares</span>
                </div>
              </div>
            </div>

            <div className="col-md-4 text-center text-md-start border-start-md ps-md-4" style={{ color: '#e0e0e0' }}>
              <p className="mb-1 small">CNPJ 00.000.000/0000-00</p>
              <p className="mb-1 small">Sombrio/SC</p>
              <p className="mb-0 small">
                Dúvidas e informações: <a href="mailto:pataselares@gmail.com" className="text-white text-decoration-underline">pataselares@gmail.com</a>
              </p>
            </div>

            <div className="col-md-4 text-center text-md-end text-white-50 small">
              Copyright © 2026 Patas & Lares | Powered by Patas & Lares
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}

export default Transparencia;
