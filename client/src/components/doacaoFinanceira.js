import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import cores from '../theme';
import API_BASE_URL from '../api/config';
import { resolverUrl, aoErrarImagem } from '../utils/fotos';

const CONFIG_PADRAO = {
  razaoSocial: "Organização de Amparo Animal Patas & Lares",
  cnpj: "00.000.000/0000-00",
  banco: "Itaú (000)",
  agencia: "0000",
  contaCorrente: "00000-0",
  chavePix: "00.000.000/0000-00",
  qrCode: ""
};

function DoacaoFinanceira() {
  const navigate = useNavigate();
  
  // Controle do menu dropdown de Doações
  const [dropdownDoacoes, setDropdownDoacoes] = useState(false);

  // Dados de doação carregados do servidor
  const [config, setConfig] = useState(CONFIG_PADRAO);
  const [copiado, setCopiado] = useState(false);

  useEffect(() => {
    let ativo = true;
    fetch(`${API_BASE_URL}/configuracoes/doacao`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (!ativo) return;
        setConfig({
          razaoSocial: data.razaoSocial || CONFIG_PADRAO.razaoSocial,
          cnpj: data.cnpj || CONFIG_PADRAO.cnpj,
          banco: data.banco || CONFIG_PADRAO.banco,
          agencia: data.agencia || CONFIG_PADRAO.agencia,
          contaCorrente: data.contaCorrente || CONFIG_PADRAO.contaCorrente,
          chavePix: data.chavePix || CONFIG_PADRAO.chavePix,
          qrCode: data.qrCode || ""
        });
      })
      .catch((error) => {
        console.error("Erro ao carregar dados de doação:", error);
      });
    return () => { ativo = false; };
  }, []);

  async function copiarChavePix() {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(config.chavePix);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = config.chavePix;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch (error) {
      console.error("Erro ao copiar chave PIX:", error);
      window.alert(`Não foi possível copiar a chave. Copie manualmente: ${config.chavePix}`);
    }
  }

  return (
    <div style={{ fontFamily: 'Poppins, sans-serif', backgroundColor: cores.cremeFundo, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* 1. NAVBAR SUPERIOR */}
      <nav className="navbar navbar-expand-lg navbar-dark p-3" style={{ backgroundColor: cores.marromMenu }}>
        <div className="container d-flex justify-content-between align-items-center">
          <span className="navbar-brand fw-bold d-flex align-items-center fs-4" style={{ cursor: 'pointer' }} onClick={() => navigate('/')}>
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

              {/* Dropdown: Doações (Ativo) */}
              <li 
                className="nav-item position-relative" 
                style={{ cursor: 'pointer' }}
                onMouseLeave={() => setDropdownDoacoes(false)}
              >
                <span className="nav-link text-white px-3 py-1 rounded-pill" style={{ backgroundColor: 'rgba(255,255,255,0.15)', fontWeight: '500' }} onClick={() => setDropdownDoacoes(!dropdownDoacoes)}>
                  Doações <i className="bi bi-chevron-down small ms-1"></i>
                </span>
                {dropdownDoacoes && (
                  <ul className="position-absolute list-unstyled p-2 rounded shadow mt-2" 
                      style={{ backgroundColor: cores.marromMenu, width: '150px', zIndex: 1000, left: 0 }}>
                    <li><span className="dropdown-item text-white-50 small py-1" style={{ cursor: 'pointer' }} onClick={() => navigate('/doacao-financeira')}>Financeira</span></li>
                    <li><span className="dropdown-item text-white-50 small py-1" style={{ cursor: 'pointer' }} onClick={() => navigate('/doacao-material')}>Material</span></li>
                  </ul>
                )}
              </li>

              <li className="nav-item"><span className="nav-link text-white" style={{ cursor: 'pointer' }}>Eventos</span></li>

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

      {/* 2. CORPO DA PÁGINA DE DOAÇÃO */}
      <div className="container py-5 flex-grow-1">
        <div className="row g-5 align-items-start mt-2">
          
          {/* Coluna Esquerda: Informações de Texto */}
          <div className="col-md-6 text-start">
            <h1 className="fw-bold mb-4" style={{ color: cores.textoMarrom, fontSize: '3.2rem' }}>
              Doação financeira
            </h1>
            
            <p className="fs-5 text-dark mb-5 lh-base" style={{ opacity: 0.9 }}>
              Você pode realizar sua doação diretamente na conta da Patas & Lares utilizando os dados bancários ou via PIX QR Code.
            </p>

            <h4 className="fw-bold mb-4" style={{ color: cores.textoDestaque }}>
              {config.razaoSocial}
            </h4>

            <div className="mb-5 text-dark lh-lg" style={{ fontSize: '1.1rem' }}>
              <p className="mb-1"><strong>CNPJ</strong> {config.cnpj}</p>
              <p className="mb-1"><strong>Banco</strong> {config.banco}</p>
              <p className="mb-1"><strong>Agência</strong> {config.agencia}</p>
              <p className="mb-1"><strong>Conta corrente</strong> {config.contaCorrente}</p>
            </div>

            <div className="text-dark lh-lg" style={{ fontSize: '1.1rem' }}>
              <p className="mb-1"><strong>Doação via PIX</strong></p>
              <div className="d-flex flex-wrap align-items-center gap-2 mb-1">
                <p className="mb-0">
                  <strong>Chave CNPJ</strong> {config.chavePix}
                </p>
                <button
                  type="button"
                  onClick={copiarChavePix}
                  className="btn btn-sm d-inline-flex align-items-center gap-2 text-white"
                  style={{
                    backgroundColor: copiado ? '#2f8f46' : cores.marromClaro,
                    border: 'none',
                    borderRadius: '6px',
                    fontWeight: '500',
                    transition: 'background-color 0.2s ease'
                  }}
                >
                  <i className={`bi ${copiado ? 'bi-clipboard-check' : 'bi-clipboard'}`}></i>
                  {copiado ? 'Copiado! ✓' : 'Copiar Chave PIX'}
                </button>
              </div>
            </div>
          </div>

          {/* Coluna Direita: Box do QR Code */}
          <div className="col-md-6 d-flex justify-content-center justify-content-md-end align-items-center pt-4">
            <div 
              className="p-4 p-md-5 rounded shadow text-center text-white d-flex flex-column align-items-center justify-content-center"
              style={{ backgroundColor: cores.marromMenu, maxWidth: '480px', width: '100%' }}
            >
              <h4 className="fw-bold mb-4 lh-base" style={{ fontSize: '1.4rem', maxWidth: '320px' }}>
                Aponte seu celular para fazer sua doação via PIX QR code
              </h4>
              
              {/* Container Branco do QR Code */}
              <div 
                className="bg-white p-4 rounded-4 shadow-sm position-relative d-flex align-items-center justify-content-center"
                style={{ width: '280px', height: '280px' }}
              >
                {config.qrCode ? (
                  <img
                    src={resolverUrl(config.qrCode)}
                    alt="QR Code PIX"
                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                    onError={aoErrarImagem}
                  />
                ) : (
                  <>
                    {/* Ícone Genérico de QR Code usando Bootstrap Icons para visualização fluida */}
                    <i className="bi bi-qr-code text-black" style={{ fontSize: '13.5rem' }}></i>

                    {/* Selo Central do Banco (Ex: Itaú) */}
                    <div 
                      className="position-absolute rounded-3 fw-bold d-flex align-items-center justify-content-center shadow-sm"
                      style={{ 
                        backgroundColor: '#ec7000', 
                        color: '#fff', 
                        width: '55px', 
                        height: '55px', 
                        fontSize: '0.85rem',
                        border: '3px solid white' 
                      }}
                    >
                      {config.banco.split(" ")[0].toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* 3. RODAPÉ OFICIAL */}
      <footer className="text-white py-4 mt-auto" style={{ backgroundColor: cores.rodapeMarrom, fontSize: '0.9rem', borderTop: '4px solid #aa7a44' }}>
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
              <p className="mb-1 small">CNPJ {config.cnpj}</p>
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

export default DoacaoFinanceira;