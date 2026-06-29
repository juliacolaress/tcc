import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Contato() {
  const navigate = useNavigate();
  
  // Controle do menu de Doações via clique (estável)
  const [dropdownDoacoes, setDropdownDoacoes] = useState(false);

  // Paleta de cores oficial do Patas & Lares
  const cores = {
    marromMenu: '#4a2511',       // Marrom clássico do topo
    cremeFundo: '#fdf8f4',       // Fundo off-white suave da página
    textoMarrom: '#4a2511',      // Tom marrom escuro dos títulos principais
    textoDestaque: '#4a2511',    // Tom marrom médio para os subtítulos/ícones
    rodapePreto: '#0a0a0a'       // Fundo escuro do rodapé
  };

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
                <span 
                  className="nav-link text-white" 
                  style={{ cursor: 'pointer' }} 
                  onClick={() => { navigate('/animais-adocao'); setDropdownDoacoes(false); }}
                >
                  Animais para Adoção
                </span>
              </li>

              {/* Dropdown: Doações (Corrigido para clique constante e seguro) */}
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

              {/* ABA DE EVENTOS CORRIGIDA */}
              <li className="nav-item">
                <span 
                  className="nav-link text-white" 
                  style={{ cursor: 'pointer' }} 
                  onClick={() => { navigate('/eventos'); setDropdownDoacoes(false); }}
                >
                  Eventos
                </span>
              </li>
              
              {/* Link de Contato ativo/destacado */}
              <li className="nav-item">
                <span className="nav-link text-white px-3 py-1 rounded-pill" style={{ cursor: 'pointer', backgroundColor: 'rgba(255,255,255,0.15)', fontWeight: '500' }}>
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

      {/* 2. CORPO DA PÁGINA DE CONTATO */}
      <div className="container py-5 flex-grow-1" onClick={() => setDropdownDoacoes(false)}>
        
        {/* Título Principal */}
        <div className="text-start mb-5 pb-2">
          <h1 className="fw-bold mb-3" style={{ color: cores.textoMarrom, fontSize: '3rem' }}>
            Informações para contato:
          </h1>
          <p className="fs-5 text-dark opacity-90 fw-light">
            Aqui você encontra todas as formas de contato e canais oficiais da Patas & Lares
          </p>
        </div>

        {/* PRIMEIRA FILEIRA: Localização, Correspondência e Horário */}
        <div className="row g-4 text-start mb-5 pt-3">
          
          {/* Coluna 1: Localização */}
          <div className="col-md-4">
            <h4 className="fw-bold d-flex align-items-center mb-3" style={{ color: cores.textoDestaque }}>
              <i className="bi bi-geo-alt fs-4 me-2"></i> Localização
            </h4>
            <div className="ps-4 text-dark lh-lg" style={{ fontSize: '0.98rem' }}>
              <p className="mb-0"><strong>Patas & Lares — Sede Central</strong></p>
              <p className="mb-0">Rua Central, nº 245 — Bairro São José</p>
              <p className="mb-0">Cidade Sombrio — SC</p>
              <p className="mb-0">CEP 88960-000</p>
            </div>
          </div>

          {/* Coluna 2: Endereço para correspondência */}
          <div className="col-md-4">
            <h4 className="fw-bold d-flex align-items-center mb-3" style={{ color: cores.textoDestaque }}>
              <i className="bi bi-envelope fs-4 me-2"></i> Endereço para correspondência
            </h4>
            <div className="ps-4 text-dark lh-lg" style={{ fontSize: '0.98rem' }}>
              <p className="mb-2">Envie cartas, doações físicas ou documentos para:</p>
              <ul className="list-unstyled mb-0">
                <li className="d-flex align-items-center mb-1">
                  <span className="me-2">•</span> Caixa Postal 000 — CEP 88960-000
                </li>
                <li className="d-flex align-items-center">
                  <span className="me-2">•</span> Cidade Sombrio — SC
                </li>
              </ul>
            </div>
          </div>

          {/* Coluna 3: Horário de funcionamento */}
          <div className="col-md-4">
            <h4 className="fw-bold d-flex align-items-center mb-3" style={{ color: cores.textoDestaque }}>
              <i className="bi bi-clock fs-4 me-2"></i> Horário de funcionamento
            </h4>
            <div className="ps-4 text-dark lh-lg" style={{ fontSize: '0.98rem' }}>
              <ul className="list-unstyled mb-0">
                <li className="d-flex align-items-center mb-1">
                  <span className="me-2">•</span> Segunda a Sexta: 8h às 17h
                </li>
                <li className="d-flex align-items-center mb-1">
                  <span className="me-2">•</span> Sábados: 9h às 13h
                </li>
                <li className="d-flex align-items-center">
                  <span className="me-2">•</span> Domingos e feriados: fechado
                </li>
              </ul>
            </div>
          </div>

        </div>

        {/* SEGUNDA FILEIRA: Outros canais e Informações adicionais */}
        <div className="row g-4 text-start pt-4 border-top border-2" style={{ borderColor: 'rgba(74, 37, 17, 0.1)' }}>
          
          {/* Coluna 4: Outros canais de contato */}
          <div className="col-md-4">
            <h4 className="fw-bold d-flex align-items-center mb-3" style={{ color: cores.textoDestaque }}>
              <i className="bi bi-telephone fs-4 me-2"></i> Outros canais de contato
            </h4>
            <div className="ps-4 text-dark lh-lg" style={{ fontSize: '0.98rem' }}>
              <ul className="list-unstyled mb-0">
                <li className="mb-1"><strong>•</strong> (48) 99861-2965</li>
                <li className="mb-1"><strong>•</strong> (48) 98871-8454</li>
                <li className="mb-1"><strong>•</strong> pataselares@gmail.com</li>
                <li><strong>•</strong> Instagram | Facebook | TikTok</li>
              </ul>
            </div>
          </div>

          {/* Coluna 5: Informações adicionais */}
          <div className="col-md-8">
            <h4 className="fw-bold d-flex align-items-center mb-3" style={{ color: cores.textoDestaque }}>
              <i className="bi bi-paw fs-4 me-2"></i> Informações adicionais
            </h4>
            <div className="ps-4 text-dark lh-lg" style={{ fontSize: '0.98rem' }}>
              <ul className="list-unstyled mb-0">
                <li className="mb-1"><strong>•</strong> Adoções: somente mediante triagem e entrevista.</li>
                <li className="mb-1"><strong>•</strong> Voluntariado: inscrições abertas.</li>
                <li><strong>•</strong> Doações: aceitamos ração, produtos de limpeza e contribuições via Pix e transferência.</li>
              </ul>
            </div>
          </div>

        </div>

      </div>

      {/* 3. RODAPÉ OFICIAL */}
      <footer className="text-white py-4 mt-auto" style={{ backgroundColor: cores.rodapePreto, fontSize: '0.9rem', borderTop: '4px solid #aa7a44' }}>
        <div className="container">
          <div className="row align-items-center g-3">
            
            <div className="col-md-4 d-flex align-items-center justify-content-center justify-content-md-start">
              <div className="d-flex align-items-center">
                <div className="p-2 me-2 rounded text-center" style={{ backgroundColor: '#aa7a44', color: '#000000', width: '50px', height: '50px', display: 'flex', alignItems: 'center', justify: 'center' }}>
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

export default Contato;