import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import cores from '../theme';
import API_BASE_URL from '../api/config';
import { resolverUrl, aoErrarImagem } from '../utils/fotos';
import estilos from './componentes.module.css';

const CONFIG_PADRAO = {
  razaoSocial: "Organização de Amparo Animal Patas & Lares",
  cnpj: "00.000.000/0000-00",
  banco: "Itaú (000)",
  agencia: "0000",
  contaCorrente: "00000-0",
  chavePix: "00.000.000/0000-00",
  qrCode: ""
};

const SECOES_NECESSIDADES = [
  { chave: 'Ração', titulo: 'Alimentação', descricao: 'Veja os alimentos que gostaríamos de receber para garantir a nutrição dos nossos amigos de quatro patas.' },
  { chave: 'Medicamentos', titulo: 'Medicamentos', descricao: 'Ajuda a manter nossos animais saudáveis e tratados.' },
  { chave: 'Higiene', titulo: 'Higiene', descricao: 'Garanta um ambiente limpo e saudável para nossos animais resgatados.' },
  { chave: 'Suprimentos', titulo: 'Bem-estar', descricao: 'Ajude a proporcionar conforto e momentos de alegria para cada pet que acolhemos.' },
  { chave: 'Outros', titulo: 'Outros Itens', descricao: 'Qualquer outro item que possa ajudar a ONG.' }
];

function SolicitarDoacao() {
  const navigate = useNavigate();

  const [config, setConfig] = useState(CONFIG_PADRAO);
  const [copiado, setCopiado] = useState(false);

  const [necessidades, setNecessidades] = useState([]);
  const [loading, setLoading] = useState(true);

  const [exibirTutorial, setExibirTutorial] = useState(false);
  const [passoTutorial, setPassoTutorial] = useState(1);

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

  useEffect(() => {
    let ativo = true;
    async function carregarNecessidades() {
      try {
        const response = await fetch(`${API_BASE_URL}/necessidades`);
        if (!response.ok) throw new Error(response.statusText);
        const data = await response.json();
        if (ativo) setNecessidades(Array.isArray(data) ? data : (data.data || []));
      } catch (error) {
        console.error('Erro ao carregar necessidades:', error);
      } finally {
        if (ativo) setLoading(false);
      }
    }
    carregarNecessidades();
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

  function rolarPara(id) {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  const renderNecessidades = () => {
    if (loading) {
      return (
        <div className="text-center py-5">
          <div className="spinner-border" style={{ color: cores.textoMarrom }} role="status"></div>
        </div>
      );
    }
    if (necessidades.length === 0) {
      return (
        <p className="text-muted fs-5 text-center">Nenhuma necessidade de doação cadastrada no momento. Volte em breve!</p>
      );
    }
    return SECOES_NECESSIDADES.map(sec => {
      const itens = necessidades.filter(n => n.categoria === sec.chave);
      if (itens.length === 0) return null;
      return (
        <section className="mb-5 text-start" key={sec.chave}>
          <h3 className="fw-bold" style={{ color: cores.textoDestaque }}>{sec.titulo}</h3>
          <p className="text-muted fs-5 mb-4">{sec.descricao}</p>
          <div className="row row-cols-1 row-cols-sm-2 row-cols-md-4 g-4">
            {itens.map(item => (
              <div className="col" key={item._id}>
                <div className="card h-100 border-0 bg-transparent text-start">
                  <div className="d-flex justify-content-center align-items-center p-3 bg-white rounded-4 shadow-sm" style={{ minHeight: '260px', overflow: 'hidden' }}>
                    {item.imagem ? (
                      <img src={resolverUrl(item.imagem)} alt={item.titulo} className="img-fluid object-fit-contain" style={{ maxHeight: '220px' }} onError={aoErrarImagem} />
                    ) : (
                      <i className="bi bi-box-seam" style={{ fontSize: '3rem', color: cores.marromClaro, opacity: '0.6' }}></i>
                    )}
                  </div>
                  <div className="card-body px-1 pt-3">
                    <p className="card-text text-dark small lh-sm fw-medium mb-1">{item.titulo}</p>
                    {item.quantidade_desejada && (
                      <p className="mb-1 small fw-bold" style={{ color: cores.textoDestaque }}>
                        <i className="bi bi-bag me-1"></i>{item.quantidade_desejada}
                      </p>
                    )}
                    {item.descricao && (
                      <p className="card-text text-muted small lh-sm mb-0" style={{ fontSize: '0.8rem' }}>{item.descricao}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      );
    });
  };

  return (
    <div style={{ fontFamily: 'Poppins, sans-serif', backgroundColor: cores.cremeFundo, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

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

              <li className="nav-item">
                <span className="nav-link text-white px-3 py-1 rounded-pill" style={{ backgroundColor: 'rgba(255,255,255,0.15)', fontWeight: '500', cursor: 'pointer' }} onClick={() => navigate('/solicitar-doacao')}>
                  Doações
                </span>
              </li>

              <li className="nav-item">
                <span className="nav-link text-white" style={{ cursor: 'pointer' }} onClick={() => navigate('/eventos')}>
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

      <div className="container py-5 flex-grow-1">

        <div className="d-flex justify-content-between align-items-center mb-4 mt-2 flex-wrap gap-3">
          <h1 className="fw-bold mb-0" style={{ color: cores.textoMarrom, fontSize: '3rem' }}>
            Quero Doar
          </h1>
          <button
            className="btn text-white px-4 py-2 rounded-pill fw-bold"
            style={{ backgroundColor: cores.textoDestaque, fontSize: '1rem', border: 'none' }}
            onClick={() => navigate('/doar/formulario')}
          >
            Doar
          </button>
        </div>

        <p className="fs-5 text-dark mb-5 text-start lh-base" style={{ maxWidth: '900px', opacity: 0.9 }}>
          Cada ajuda faz a diferença na vida de um animal resgatado. Escolha a forma de doação, confira os dados para o PIX ou as necessidades atuais e registre sua contribuição.
        </p>

        <section className="mb-5" id="pix">
          <h2 className="fw-bold mb-4" style={{ color: cores.textoMarrom }}>
            Dados Bancários e PIX
          </h2>

          <div className="row g-5 align-items-start mt-2">

            <div className="col-md-6 text-start">
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

            <div className="col-md-6 d-flex justify-content-center justify-content-md-end align-items-center pt-4">
              <div
                className="p-4 p-md-5 rounded shadow text-center text-white d-flex flex-column align-items-center justify-content-center"
                style={{ backgroundColor: cores.marromMenu, maxWidth: '480px', width: '100%' }}
              >
                <h4 className="fw-bold mb-4 lh-base" style={{ fontSize: '1.4rem', maxWidth: '320px' }}>
                  Aponte seu celular para fazer sua doação via PIX QR code
                </h4>

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
                      <i className="bi bi-qr-code text-black" style={{ fontSize: '13.5rem' }}></i>

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
        </section>

        <section className="mb-5" id="necessidades">
          <div className="mb-4">
              <h2 className="fw-bold mb-2" style={{ color: cores.textoMarrom }}>
                Necessidades Atuais da ONG
              </h2>
              <p className="text-muted fs-6 mb-0">
                Confira o que estamos precisando agora e escolha como ajudar com materiais.
              </p>
            </div>
          {renderNecessidades()}
        </section>

        </div>

      {exibirTutorial && (
        <div
          className="position-fixed rounded-4 p-4 text-start shadow-lg d-flex flex-column gap-3"
          style={{
            backgroundColor: '#FAF6F0',
            width: '380px',
            right: '30px',
            bottom: '100px',
            zIndex: 1050,
            border: '1px solid #eadfcf',
            backdropFilter: 'blur(10px)'
          }}
        >
          <div className="d-flex justify-content-between align-items-center p-3 text-white" style={{ backgroundColor: cores.textoMarrom, borderRadius: '12px 12px 0 0', margin: '-16px -16px 0' }}>
            <div className="d-flex align-items-center gap-2">
              <div className="rounded-circle d-flex align-items-center justify-content-center" style={{ backgroundColor: 'rgba(255,255,255,0.12)', width: '40px', height: '40px' }}>
                <i className="bi bi-paw-fill" style={{ color: cores.marromPastel }}></i>
              </div>
              <div>
                <span className="fw-bold d-block">Atendimento Patas & Lares</span>
                <small className="text-white-50">Como doar para a nossa ONG</small>
              </div>
            </div>
            <button
              className="btn btn-sm rounded-circle d-flex align-items-center justify-content-center text-white"
              style={{ backgroundColor: 'rgba(255,255,255,0.15)', width: '32px', height: '32px', border: 'none' }}
              onClick={() => setExibirTutorial(false)}
              title="Fechar"
            >
              <i className="bi bi-x-lg"></i>
            </button>
          </div>

          <div style={{ maxHeight: '400px', overflowY: 'auto', paddingRight: '5px' }}>
            {passoTutorial >= 1 && (
              <div className="d-flex flex-column gap-2 mb-3">
                <div className="bg-white text-dark p-3 rounded-4 rounded-tl-0 shadow-sm">
                  <p className="mb-0 small">Olá! Bem-vindo à área de doações da nossa ONG. Vou te explicar como funciona para doar.</p>
                </div>
                {passoTutorial === 1 && (
                  <div className="d-flex justify-content-end">
                    <button className="btn btn-sm rounded-pill px-3 fw-bold text-white shadow-sm" style={{ backgroundColor: cores.textoMarrom, border: 'none' }} onClick={() => setPassoTutorial(2)}>Continuar</button>
                  </div>
                )}
              </div>
            )}

            {passoTutorial >= 2 && (
              <div className="d-flex flex-column gap-2 mb-3">
                <div className="bg-white text-dark p-3 rounded-4 rounded-tl-0 shadow-sm">
                  <p className="mb-0 small">Ao clicar no botão <strong>'Doar'</strong> no canto superior direito, você será direcionado para o formulário de doação.</p>
                </div>
                {passoTutorial === 2 && (
                  <div className="d-flex justify-content-end">
                    <button className="btn btn-sm rounded-pill px-3 fw-bold text-white shadow-sm" style={{ backgroundColor: cores.textoMarrom, border: 'none' }} onClick={() => setPassoTutorial(3)}>Continuar</button>
                  </div>
                )}
              </div>
            )}

            {passoTutorial >= 3 && (
              <div className="d-flex flex-column gap-2 mb-3">
                <div className="bg-white text-dark p-3 rounded-4 rounded-tl-0 shadow-sm">
                  <p className="mb-1 small fw-bold">No formulário, você vai informar:</p>
                  <ul className="mb-2 ps-3 small text-muted" style={{ fontSize: '0.85rem' }}>
                    <li>Seu nome e contato.</li>
                    <li>Sua cidade/estado.</li>
                    <li>O tipo de doação.</li>
                    <li>Se é financeira (PIX) ou em itens.</li>
                  </ul>
                  <p className="mb-0 small">Antes de preencher, consulte as <strong>Necessidades Atuais da ONG</strong> cadastradas na página.</p>
                  <button className="btn btn-warning btn-sm rounded-pill px-3 fw-bold mt-2 shadow-sm" onClick={() => rolarPara('necessidades')}>
                    <i className="bi bi-bag-heart me-1"></i> Ver necessidades
                  </button>
                </div>
                {passoTutorial === 3 && (
                  <div className="d-flex justify-content-end">
                    <button className="btn btn-sm rounded-pill px-3 fw-bold text-white shadow-sm" style={{ backgroundColor: cores.textoMarrom, border: 'none' }} onClick={() => setPassoTutorial(4)}>Continuar</button>
                  </div>
                )}
              </div>
            )}

            {passoTutorial >= 4 && (
              <div className="d-flex flex-column gap-2 mb-3">
                <div className="bg-white text-dark p-3 rounded-4 rounded-tl-0 shadow-sm">
                  <p className="mb-2 small fw-bold">Depois, você pode informar a forma de entrega:</p>
                  <div className="d-flex flex-column gap-2">
                    <div className="p-2 rounded bg-light border-start border-4 border-warning small">
                      <strong>Pessoalmente:</strong> trazer até a ONG.
                    </div>
                    <div className="p-2 rounded bg-light border-start border-4 border-info small">
                      <strong>Correio:</strong> enviar pelos Correios.
                    </div>
                  </div>
                </div>
                {passoTutorial === 4 && (
                  <div className="d-flex justify-content-end">
                    <button className="btn btn-sm rounded-pill px-3 fw-bold text-white shadow-sm" style={{ backgroundColor: cores.textoMarrom, border: 'none' }} onClick={() => setPassoTutorial(5)}>Continuar</button>
                  </div>
                )}
              </div>
            )}

            {passoTutorial >= 5 && necessidades.length > 0 && (
              <div className="d-flex flex-column gap-2 mb-3">
                <div className="bg-white text-dark p-3 rounded-4 rounded-tl-0 shadow-sm">
                  <p className="mb-2 small fw-bold">Aqui estão alguns exemplos do que precisamos agora:</p>
                  <div className="d-flex gap-2 overflow-auto pb-2 mb-2" style={{ scrollbarWidth: 'none' }}>
                    {necessidades.slice(0, 3).map(item => (
                      <div key={item._id} className="text-center" style={{ minWidth: '80px' }}>
                        {item.imagem ? (
                          <img src={resolverUrl(item.imagem)} alt={item.titulo} style={{ width: '80px', height: '100px', objectFit: 'contain', borderRadius: '8px', border: '1px solid #eee' }} onError={aoErrarImagem} />
                        ) : (
                          <div className="d-flex align-items-center justify-content-center" style={{ width: '80px', height: '100px', borderRadius: '8px', border: '1px solid #eee', backgroundColor: '#f8f9fa' }}>
                            <i className="bi bi-box-seam text-muted" style={{ fontSize: '1.5rem' }}></i>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  <p className="mb-0 small text-muted">Rações, areia higiênica, medicamentos e muito mais!</p>
                </div>
                {passoTutorial === 5 && (
                  <div className="d-flex justify-content-end">
                    <button className="btn btn-sm rounded-pill px-3 fw-bold text-white shadow-sm" style={{ backgroundColor: cores.textoMarrom, border: 'none' }} onClick={() => setPassoTutorial(6)}>Continuar</button>
                  </div>
                )}
              </div>
            )}

            {passoTutorial >= 6 && (
              <div className="d-flex flex-column gap-2 mb-3">
                <div className="bg-white text-dark p-3 rounded-4 rounded-tl-0 shadow-sm">
                  <p className="mb-0 small">Pronto! Agora é só clicar no botão <strong>'Doar'</strong>, preencher o formulário e enviar sua contribuição. Muito obrigado!</p>
                </div>
                <div className="d-flex justify-content-end">
                  <button className="btn btn-sm rounded-pill px-4 fw-bold text-white shadow-sm" style={{ backgroundColor: cores.textoMarrom, border: 'none' }} onClick={() => setExibirTutorial(false)}>Finalizar</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <div
        className={`position-fixed d-flex align-items-center justify-content-center shadow-lg ${estilos.floatingChatTrigger}`}
        style={{
          bottom: '30px',
          right: '30px',
          backgroundColor: cores.marromMenu,
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          cursor: 'pointer',
          zIndex: 1000
        }}
        onClick={() => { setExibirTutorial(!exibirTutorial); setPassoTutorial(1); }}
      >
        <i className="bi bi-chat-dots-fill text-white fs-4"></i>
      </div>

      <footer className="text-white py-4 mt-auto" style={{ backgroundColor: cores.rodapeMarrom, fontSize: '0.9rem', borderTop: '4px solid #A67C52' }}>
        <div className="container">
          <div className="row align-items-center g-3">
            <div className="col-md-4 d-flex align-items-center justify-content-center justify-content-md-start">
              <div className="d-flex align-items-center">
                <div className="p-2 me-2 rounded text-center" style={{ backgroundColor: '#A67C52', color: '#000000', width: '50px', height: '50px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <i className="bi bi-house-heart-fill fs-3"></i>
                </div>
                <div className="text-start lh-1">
                  <span className="fw-bold d-block fs-5 mb-1">Patas</span>
                  <span className="fw-bold d-block fs-5" style={{ color: '#A67C52' }}>& Lares</span>
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

export default SolicitarDoacao;