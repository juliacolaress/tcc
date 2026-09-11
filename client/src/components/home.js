import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from './gatoecachorro.png';
import cores from '../theme';
import API_BASE_URL from '../api/config';
import { resolverUrl, aoErrarImagem } from '../utils/fotos';

function formatarData(valor) {
    if (!valor) return "";
    const texto = valor instanceof Date ? valor.toISOString() : String(valor);
    const partes = texto.slice(0, 10).split("-");
    if (partes.length !== 3) return String(valor);
    return `${partes[2]}/${partes[1]}/${partes[0]}`;
}

const CAMPANHA_PADRAO = {
    titulo: "Juntos pela Castração e Bem-Estar Animal",
    descricao: "Campanha permanente da Patas & Lares para promover a castração de cães e gatos e combater o abandono. Cada animal castrado evita dezenas de novos filhotes sem lar e reduz o sofrimento de animais vulneráveis na nossa comunidade.",
    objetivos: "Reduzir a superpopulação de animais abandonados, promover a saúde e o bem-estar dos pets, conscientizar a comunidade sobre posse responsável e ampliar o acesso das famílias à castração gratuita ou de baixo custo.",
    comoParticipar: "Você pode participar se voluntariando, doando ou agendando a castração do seu pet. Fale com a nossa equipe pela página de contato ou inscreva-se como voluntário!",
    data: "",
    horario: "",
    local: "",
    imagem: ""
};

function CampanhaCard({ campanha, onClick }) {
    return (
        <div
            className="card border-0 text-white p-4 shadow-sm mx-auto"
            style={{ backgroundColor: cores.marromCampanha, borderRadius: '24px', maxWidth: '1000px', cursor: 'pointer' }}
            onClick={onClick}
            role="button"
            aria-label={`Ver detalhes: ${campanha.titulo}`}
        >
            <div className="card-body d-flex flex-column flex-md-row align-items-center justify-content-between px-md-5 py-3">
                <div className="d-flex align-items-center mb-3 mb-md-0">
                    {campanha.imagem ? (
                        <img
                            src={resolverUrl(campanha.imagem)}
                            alt={campanha.titulo}
                            className="rounded-4 shadow bg-white"
                            style={{ width: '85px', height: '85px', objectFit: 'cover' }}
                            onError={aoErrarImagem}
                        />
                    ) : (
                        <div className="bg-white rounded-circle d-flex align-items-center justify-content-center position-relative shadow" style={{ width: '85px', height: '85px', color: cores.marromCampanha }}>
                            <i className="bi bi-plus-lg position-absolute fw-bold fs-5 bg-white rounded-circle px-1" style={{ bottom: '2px', right: '2px', border: `3px solid ${cores.marromCampanha}` }}></i>
                        </div>
                    )}
                </div>

                <div className="text-center text-md-start flex-grow-1 mx-md-4">
                    <h2 className="fw-bold mb-0 display-6" style={{ letterSpacing: '0.5px' }}>
                        {campanha.titulo}
                    </h2>
                    {(campanha.data || campanha.local) && (
                        <span className="small opacity-75 fw-light d-block mt-2">
                            <i className="bi bi-calendar3 me-1"></i>
                            {campanha.data ? formatarData(campanha.data) : "Em breve"}
                            {campanha.local ? ` • ${campanha.local}` : ""}
                            {campanha.horario ? ` • ${campanha.horario}` : ""}
                        </span>
                    )}
                </div>

                <div className="d-none d-md-block opacity-90 fs-1">
                    <i className="bi bi-envelope-heart-fill" style={{ fontSize: '4.5rem' }}></i>
                </div>
            </div>
        </div>
    );
}

export default function Home() {
  const navigate = useNavigate();

  // Estado para controlar o dropdown de doações via clique
  const [, setDropdownDoacoes] = useState(false);

  // Estado das campanhas (eventos ativos vindos do banco)
  const [eventosCampanhas, setEventosCampanhas] = useState([]);
  const [loadingCampanhas, setLoadingCampanhas] = useState(true);
  const [campanhaDetalhe, setCampanhaDetalhe] = useState(null);

  useEffect(() => {
    let ativo = true;
    async function carregarCampanhas() {
      try {
        const response = await fetch(`${API_BASE_URL}/eventos`);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const dados = await response.json();
        if (ativo) setEventosCampanhas(Array.isArray(dados) ? dados : []);
      } catch (error) {
        console.error("Erro ao carregar campanhas:", error);
        if (ativo) setEventosCampanhas([]);
      } finally {
        if (ativo) setLoadingCampanhas(false);
      }
    }
    carregarCampanhas();
    return () => { ativo = false; };
  }, []);

  return (
    <div style={{ fontFamily: 'Poppins, sans-serif', backgroundColor: '#ffffff', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

      {/* 1. NAVBAR SUPERIOR */}
      <nav className="navbar navbar-expand-lg navbar-dark p-3" style={{ backgroundColor: cores.marromMenu }}>
        <div className="container d-flex justify-content-between align-items-center">
          <span className="navbar-brand fw-bold d-flex align-items-center fs-4" style={{ cursor: 'pointer' }} onClick={() => navigate('/')}>
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

              {/* Item único: Doações (formulário unificado) */}
              <li className="nav-item">
                <span 
                  className="nav-link text-white" 
                  style={{ cursor: 'pointer' }}
                  onClick={() => { navigate('/solicitar-doacao'); setDropdownDoacoes(false); }}
                >
                  Doações
                </span>
              </li>

              {/* ABA DE EVENTOS CORRIGIDA (Redirecionando perfeitamente) */}
              <li className="nav-item">
                <span 
                  className="nav-link text-white" 
                  style={{ cursor: 'pointer' }} 
                  onClick={() => { navigate('/eventos'); setDropdownDoacoes(false); }}
                >
                  Eventos
                </span>
              </li>

              <li className="nav-item">
                <span
                  className="nav-link text-white"
                  style={{ cursor: 'pointer' }}
                  onClick={() => { navigate('/transparencia'); setDropdownDoacoes(false); }}
                >
                  Transparência
                </span>
              </li>

              <li className="nav-item">
                <span
                  className="nav-link text-white"
                  style={{ cursor: 'pointer' }}
                  onClick={() => { navigate('/contato'); setDropdownDoacoes(false); }}
                >
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

      {/* 2. HERO SECTION / BANNER PRINCIPAL */}
      <div className="text-white py-5 px-4" style={{ backgroundColor: cores.marromBanner }} onClick={() => setDropdownDoacoes(false)}>
        <div className="container py-4">
          <div className="row align-items-center">
            <div className="col-lg-7 text-start">
              <h1 className="display-4 fw-bold mb-3" style={{ lineHeight: '1.2' }}>
                Bem-vindo (a) à<br />Patas & Lares
              </h1>
              <p className="fs-5 opacity-90 fw-light">
                Transforme vidas: adote, doe ou seja voluntário.
              </p>
            </div>
            <div className="col-lg-5 text-center mt-4 mt-lg-0">
              <img
                src={Logo}
                alt="Gato e Cachorro"
                className="img-fluid"
                style={{ maxHeight: '420px', width: '100%', objectFit: 'contain' }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 3. SOBRE A ONG */}
      <div className="py-5" style={{ backgroundColor: '#ffffff' }} onClick={() => setDropdownDoacoes(false)}>
        <div className="container py-2 text-start">
          <h2 className="fw-bold mb-3" style={{ color: cores.textoMarrom }}>Sobre a ONG</h2>
          <p className="text-muted mb-0 lh-lg" style={{ maxWidth: '1000px', fontSize: '1.05rem' }}>
            Na ONG Patas & Lares, acreditamos que cada vida importa. Nosso propósito é resgatar, cuidar e transformar a vida de cães e gatos abandonados, oferecendo-lhes uma segunda chance de ter um lar seguro e cheio de afeto. Junte-se à nossa missão!
          </p>
        </div>
      </div>

      {/* 4. COMO VOCÊ PODE AJUDAR + CAMPANHAS */}
      <div className="py-5" style={{ backgroundColor: cores.cremeFundo }} onClick={() => setDropdownDoacoes(false)}>
        <div className="container text-center">

          <h2 className="fw-bold mb-5" style={{ color: cores.textoMarrom }}>Como Você Pode Ajudar</h2>

          {/* Fileira dos 3 Cards */}
          <div className="row g-4 justify-content-center mb-5">

            {/* Card Adote */}
            <div className="col-md-4">
              <div className="card h-100 border-0 p-4" style={{ backgroundColor: cores.cardBege }}>
                <div className="card-body d-flex flex-column align-items-center">
                  <i className="bi bi-emoji-heart-eyes-fill fs-1 mb-2" style={{ color: cores.textoMarrom }}></i>
                  <h4 className="card-title fw-bold mb-3" style={{ color: cores.textoMarrom }}>Adote</h4>
                  <p className="card-text text-muted small px-2 mb-4">
                    Dê um lar cheio de amor para um amigo de quatro patas.
                  </p>
                  <button 
                    className="btn mt-auto text-white px-4 py-2 shadow-sm" 
                    style={{ backgroundColor: cores.btnAdote, border: 'none', borderRadius: '8px', fontWeight: '500' }}
                    onClick={() => navigate('/animais-adocao')}
                  >
                    Ver Animais
                  </button>
                </div>
              </div>
            </div>

            {/* Card Doe */}
            <div className="col-md-4">
              <div className="card h-100 border-0 p-4" style={{ backgroundColor: cores.cardBege }}>
                <div className="card-body d-flex flex-column align-items-center">
                  <i className="bi bi-heart-fill fs-1 mb-2" style={{ color: cores.marromPastel }}></i>
                  <h4 className="card-title fw-bold mb-3" style={{ color: cores.textoMarrom }}>Doe</h4>
                  <p className="card-text text-muted small px-2 mb-4">
                    Contribua para cuidados, resgates e tratamentos.
                  </p>
                  <button 
                    className="btn mt-auto text-white px-4 py-2 shadow-sm" 
                    style={{ backgroundColor: cores.btnDoe, border: 'none', borderRadius: '8px', fontWeight: '500' }}
                    onClick={() => navigate('/solicitar-doacao')}
                  >
                    Doe Agora
                  </button>
                </div>
              </div>
            </div>

            {/* Card Seja Voluntário */}
            <div className="col-md-4">
              <div className="card h-100 border-0 p-4" style={{ backgroundColor: cores.cardBege }}>
                <div className="card-body d-flex flex-column align-items-center">
                  <i className="bi bi-person-fill fs-1 mb-2" style={{ color: cores.textoMarrom }}></i>
                  <h4 className="card-title fw-bold mb-3" style={{ color: cores.textoMarrom }}>Seja Voluntário</h4>
                  <p className="card-text text-muted small px-2 mb-4">
                    Participe de eventos, ajude nos cuidados e inscreva-se.
                  </p>
                  <button 
                    className="btn mt-auto text-white px-4 py-2 shadow-sm" 
                    style={{ backgroundColor: cores.btnVoluntario, border: 'none', borderRadius: '8px', fontWeight: '500' }}
                    onClick={() => navigate('/seja-voluntario')}
                  >
                    Inscreva-se
                  </button>
                </div>
              </div>
            </div>

          </div>

          {/* Banner de Campanhas */}
          <div className="mt-5 px-2">
            <h3 className="fw-bold mb-4 text-start" style={{ color: cores.textoMarrom, maxWidth: '1000px', margin: '0 auto 1.5rem auto' }}>Campanhas</h3>

            {loadingCampanhas ? (
              <div className="text-center py-4">
                <div className="spinner-border" style={{ color: cores.marromCampanha }} role="status"></div>
              </div>
            ) : (
              <div className="d-flex flex-column gap-4 align-items-center">
                {eventosCampanhas.length > 0 ? (
                  eventosCampanhas.map((campanha) => (
                    <CampanhaCard key={campanha._id || campanha.titulo} campanha={campanha} onClick={() => setCampanhaDetalhe(campanha)} />
                  ))
                ) : (
                  <CampanhaCard campanha={CAMPANHA_PADRAO} onClick={() => setCampanhaDetalhe(CAMPANHA_PADRAO)} />
                )}
              </div>
            )}
          </div>

        </div>
      </div>

      {/* 5. ADOÇÃO RESPONSÁVEL */}
      <div className="py-5 bg-white" onClick={() => setDropdownDoacoes(false)}>
        <div className="container text-start" style={{ maxWidth: '1000px' }}>

          <h2 className="fw-bold mb-4 text-center text-md-start" style={{ color: cores.textoMarrom, fontSize: '2rem' }}>
            Adoção Responsável
          </h2>

          <h5 className="fw-bold mb-4" style={{ color: cores.textoMarrom }}>
            Transformando vidas, um lar de cada vez
          </h5>

          <p className="text-dark lh-lg mb-4" style={{ textAlign: 'justify', fontSize: '0.95rem' }}>
            A adoção de um animal de estimação é um gesto de amor e compaixão que transforma vidas, a do pet e também a sua. Na <strong>Patas & Lares</strong>, acreditamos que adotar é mais do que acolher: é oferecer uma nova oportunidade de carinho, cuidado e felicidade. Nossa missão é promover a adoção responsável, conectando animais que precisam de uma segunda chance a famílias dispostas a proporcionar um lar cheio de segurança e afeto.
          </p>

          <h5 className="fw-bold mb-3" style={{ color: cores.textoMarrom }}>
            Por que a Adoção Responsável é importante?
          </h5>

          <p className="text-dark lh-lg mb-0" style={{ textAlign: 'justify', fontSize: '0.95rem' }}>
            A adoção responsável é importante porque garante o bem-estar do animal e a harmonia da convivência com a family que o acolhe. Ao adotar com consciência, a pessoa entende que o pet é um ser vivo que precisa de cuidados contínuos, como alimentação adequada, atenção, vacinação, acompanhamento veterinário e espaço para brincar e se exercitar. Esse cuidado reduz o abandono, promove qualidade de vida, fortalece a empatia e o respeito pelos animais e ajuda a controlar a superpopulação, oferecendo a eles uma segunda chance de ter um lar seguro e cheio de afeto.
          </p>

        </div>
      </div>

      {/* 6. RODAPÉ OFICIAL */}
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

            <div className="col-md-4 text-center" style={{ color: '#e0e0e0' }}>
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

      {/* Modal: Detalhes da Campanha */}
      {campanhaDetalhe && (
        <div
          className="modal show d-block"
          tabIndex="-1"
          role="dialog"
          style={{ backgroundColor: 'rgba(61,35,20,0.55)', zIndex: 1050 }}
          onClick={() => setCampanhaDetalhe(null)}
        >
          <div className="modal-dialog modal-dialog-centered modal-lg" role="document" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content border-0 shadow" style={{ borderRadius: '16px', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
              <div className="modal-header border-0" style={{ backgroundColor: cores.textoMarrom, borderTopLeftRadius: '16px', borderTopRightRadius: '16px' }}>
                <h5 className="modal-title fw-bold text-white">
                  <i className="bi bi-megaphone me-2"></i> Detalhes da Campanha
                </h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setCampanhaDetalhe(null)}></button>
              </div>

              <div className="modal-body" style={{ overflowY: 'auto', padding: '1.5rem' }}>
                {campanhaDetalhe.imagem && (
                  <div className="text-center mb-3">
                    <img
                      src={resolverUrl(campanhaDetalhe.imagem)}
                      alt={campanhaDetalhe.titulo}
                      className="rounded-4 shadow-sm"
                      style={{ maxHeight: '260px', maxWidth: '100%', objectFit: 'contain', backgroundColor: '#FAF6F0' }}
                      onError={aoErrarImagem}
                    />
                  </div>
                )}

                <h4 className="fw-bold mb-2" style={{ color: cores.textoMarrom }}>{campanhaDetalhe.titulo}</h4>

                <div className="d-flex flex-wrap gap-3 small text-muted mb-3">
                  {campanhaDetalhe.data && (
                    <span><i className="bi bi-calendar3 me-1"></i>{formatarData(campanhaDetalhe.data)}</span>
                  )}
                  {campanhaDetalhe.horario && (
                    <span><i className="bi bi-clock me-1"></i>{campanhaDetalhe.horario}</span>
                  )}
                  {campanhaDetalhe.local && (
                    <span><i className="bi bi-geo-alt me-1"></i>{campanhaDetalhe.local}</span>
                  )}
                </div>

                <h6 className="fw-bold mb-1" style={{ color: cores.textoMarrom }}>
                  <i className="bi bi-info-circle me-2"></i>Contexto
                </h6>
                <p className="text-muted lh-base" style={{ whiteSpace: 'pre-wrap' }}>
                  {campanhaDetalhe.descricao || "Conheça os detalhes desta campanha e ajude a transformar vidas."}
                </p>

                <h6 className="fw-bold mb-1" style={{ color: cores.textoMarrom }}>
                  <i className="bi bi-bullseye me-2"></i>Objetivos
                </h6>
                <p className="text-muted lh-base m-0" style={{ whiteSpace: 'pre-wrap' }}>
                  {campanhaDetalhe.objetivos || "Promover o bem-estar animal, o combate ao abandono e a conscientização da comunidade sobre posse responsável."}
                </p>
              </div>

              <div className="modal-footer border-0">
                <button type="button" className="btn btn-outline-secondary px-4" style={{ borderRadius: '6px' }} onClick={() => setCampanhaDetalhe(null)}>
                  Fechar
                </button>
                <button
                  type="button"
                  className="btn text-white px-4"
                  style={{ backgroundColor: cores.btnVoluntario, borderRadius: '6px', fontWeight: '500' }}
                  onClick={() => { setCampanhaDetalhe(null); navigate('/seja-voluntario'); }}
                >
                  <i className="bi bi-person-plus me-1"></i> Seja Voluntário
                </button>
                <button
                  type="button"
                  className="btn text-white px-4"
                  style={{ backgroundColor: cores.textoMarrom, borderRadius: '6px', fontWeight: '500' }}
                  onClick={() => { setCampanhaDetalhe(null); navigate('/eventos'); }}
                >
                  <i className="bi bi-calendar-event me-1"></i> Ver Eventos
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}