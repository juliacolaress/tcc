import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import cores from './theme';
import API_BASE_URL from './api/config';

function formatarData(valor) {
    if (!valor) return "";
    const texto = valor instanceof Date ? valor.toISOString() : String(valor);
    const partes = texto.slice(0, 10).split("-");
    if (partes.length !== 3) return String(valor);
    return `${partes[2]}/${partes[1]}/${partes[0]}`;
}

function Eventos() {
  const navigate = useNavigate();
  
  // Controle do menu dropdown de Doações (via clique para não sumir do nada)
  const [dropdownDoacoes, setDropdownDoacoes] = useState(false);

  // Eventos cadastrados no painel administrativo
  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function carregarEventos() {
      try {
        const response = await fetch(`${API_BASE_URL}/eventos`);
        if (!response.ok) throw new Error(response.statusText);
        const data = await response.json();
        setEventos(Array.isArray(data) ? data : (data.data || []));
      } catch (error) {
        console.error('Erro ao carregar eventos:', error);
      } finally {
        setLoading(false);
      }
    }
    carregarEventos();
  }, []);

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
                <span className="nav-link text-white" style={{ cursor: 'pointer' }} onClick={() => navigate('/')}>
                  Início
                </span>
              </li>

              <li className="nav-item">
                <span className="nav-link text-white" style={{ cursor: 'pointer' }} onClick={() => navigate('/animais-adocao')}>
                  Animais para Adoção
                </span>
              </li>

              {/* Dropdown corrigido: Abre e fecha no Clique para estabilidade */}
              <li className="nav-item position-relative">
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

              {/* Item Eventos Ativo com a pílula de destaque */}
              <li className="nav-item">
                <span className="nav-link text-white px-3 py-1 rounded-pill" style={{ backgroundColor: 'rgba(255,255,255,0.15)', fontWeight: '500', cursor: 'pointer' }}>
                  Eventos
                </span>
              </li>

              <li className="nav-item">
                <span className="nav-link text-white" style={{ cursor: 'pointer' }} onClick={() => navigate('/transparencia')}>
                  Transparência
                </span>
              </li>
              
              <li className="nav-item">
                <span className="nav-link text-white" style={{ cursor: 'pointer' }} onClick={() => navigate('/contato')}>
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

      {/* 2. CORPO DA PÁGINA DE EVENTOS */}
      <div className="container py-5 flex-grow-1" onClick={() => setDropdownDoacoes(false)}>
        
        {/* Topo: Título e Botão Seja Voluntário */}
        <div className="d-flex justify-content-between align-items-center mb-4 mt-2">
          <h1 className="fw-bold mb-0" style={{ color: cores.textoMarrom, fontSize: '3rem' }}>
            Participe dos Nossos Eventos
          </h1>
          <button 
            className="btn text-white px-4 py-2 rounded-pill fw-bold" 
            style={{ backgroundColor: cores.textoDestaque, fontSize: '1rem', border: 'none' }}
            onClick={() => navigate('/seja-voluntario')}
          >
            Seja Voluntário
          </button>
        </div>

        {/* Descrição Introdutória */}
        <p className="fs-5 text-dark mb-5 text-start lh-base" style={{ maxWidth: '900px', opacity: 0.9 }}>
          Descubra todas as atividades da ONG e junte-se a nós em momentos que transformam vidas! Confira data, horário e detalhes em cada evento.
        </p>

        {/* Fileira de Cartazes dos Eventos */}
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border" style={{ color: cores.textoMarrom }} role="status"></div>
          </div>
        ) : eventos.length === 0 ? (
          <div className="text-center py-5" style={{ color: cores.textoMarrom }}>
            <i className="bi bi-calendar-x fs-1"></i>
            <p className="mt-2 fs-5">Nenhum evento agendado no momento. Volte em breve!</p>
          </div>
        ) : (
          <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4 mb-5 justify-content-center">
            {eventos.map((evento) => (
              <div className="col d-flex justify-content-center" key={evento._id}>
                <div className="card border-0 bg-white rounded-4 shadow-sm overflow-hidden" style={{ maxWidth: '360px', width: '100%', border: '1px solid rgba(170, 122, 68, 0.3)' }}>
                  <div className="d-flex align-items-center justify-content-center bg-white p-3" style={{ height: '220px', overflow: 'hidden' }}>
                    {evento.imagem ? (
                      <img
                        src={evento.imagem}
                        alt={evento.titulo}
                        className="img-fluid object-fit-contain"
                        style={{ maxHeight: '200px' }}
                      />
                    ) : (
                      <i className="bi bi-calendar-event" style={{ fontSize: '3.5rem', color: cores.marromClaro, opacity: '0.6' }}></i>
                    )}
                  </div>
                  <div className="card-body p-4 text-start">
                    <h5 className="fw-bold mb-2" style={{ color: cores.textoMarrom }}>{evento.titulo}</h5>
                    <div className="d-flex flex-wrap gap-3 small text-muted mb-2">
                      <span className="d-inline-flex align-items-center">
                        <i className="bi bi-calendar3 me-1"></i> {formatarData(evento.data)}
                      </span>
                      {evento.horario && (
                        <span className="d-inline-flex align-items-center">
                          <i className="bi bi-clock me-1"></i> {evento.horario}
                        </span>
                      )}
                      {evento.local && (
                        <span className="d-inline-flex align-items-center">
                          <i className="bi bi-geo-alt me-1"></i> {evento.local}
                        </span>
                      )}
                    </div>
                    {evento.descricao && (
                      <p className="card-text text-muted small lh-sm mb-0" style={{ fontSize: '0.85rem' }}>{evento.descricao}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Texto Informativo de Fechamento */}
        <p className="fs-5 text-dark text-start lh-base mt-4" style={{ opacity: 0.9 }}>
          Transforme momentos em sorrisos: torne-se voluntário e faça a diferença na vida dos nossos amigos de quatro patas! Clique no botão <strong>‘Seja Voluntário’</strong> no canto superior direito e participe!
        </p>

      </div>

      {/* 3. RODAPÉ OFICIAL */}
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

export default Eventos;