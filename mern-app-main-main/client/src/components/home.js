import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from './gatoecachorro.png'

export default function Home() {
  const navigate = useNavigate();

  const [dropdownAdocao, setDropdownAdocao] = useState(false);
  const [dropdownDoacoes, setDropdownDoacoes] = useState(false);

  // Identidade visual extraída dos seus prints reais
  const cores = {
    marromMenu: '#4a2511',       // Marrom clássico do topo
    marromBanner: '#aa7a44',     // Tom queimado do banner principal
    cremeFundo: '#fdf8f4',       // Fundo off-white das seções intermediárias
    textoMarrom: '#4a2511',      // Títulos em marrom
    cardBege: '#f2e8df',         // Fundo dos cards "Como Ajudar"

    // Cores exatas dos botões baseadas no novo print
    btnAdote: '#e2a36f',         // Marrom pastel
    btnDoe: '#f0c27b',           // Amarelo/Dourado pastel
    btnVoluntario: '#cf9b72',    // Marrom médio pastel

    vermelhoCampanha: '#dd1c1a', // Vermelho vivo do banner de castração
    rodapePreto: '#0a0a0a'       // Fundo escuro do rodapé
  };

  return (
    <div style={{ fontFamily: 'Poppins, sans-serif', backgroundColor: '#ffffff', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

      {/* 1. NAVBAR SUPERIOR */}
      <nav className="navbar navbar-expand-lg navbar-dark p-3" style={{ backgroundColor: cores.marromMenu }}>
        <div className="container d-flex justify-content-between align-items-center">
          {/* CORREÇÃO: Agora voltar para a Home ao clicar no nome da ONG */}
          <span className="navbar-brand fw-bold d-flex align-items-center fs-4" style={{ cursor: 'pointer' }} onClick={() => navigate('/')}>
            <i className="bi bi-paw-fill me-2" style={{ transform: 'rotate(-15deg)' }}></i>
            Patas & Lares
          </span>

          <div className="d-flex align-items-center gap-4">
            <ul className="navbar-nav flex-row gap-3 text-white align-items-center mb-0 d-none d-md-flex">

              <li className="nav-item"><span className="nav-link text-white" style={{ cursor: 'pointer' }}
              onClick={() => navigate('/')}>Início</span></li>


              {/* Dropdown 1: Animais para Adoção */}
              <li className="nav-item position-relative" style={{ cursor: 'pointer' }}>
                <span className="nav-link text-white" onClick={() => { setDropdownAdocao(!dropdownAdocao); setDropdownDoacoes(false); }}>
                  Animais para Adoção <i className="bi bi-chevron-down small ms-1"></i>
                </span>
                {dropdownAdocao && (
                  <ul className="position-absolute list-unstyled p-2 rounded shadow mt-2"
                    style={{ backgroundColor: cores.marromMenu, width: '150px', zIndex: 1000, left: 0 }}>
                    <li><span className="dropdown-item text-white-50 small py-1" style={{ cursor: 'pointer' }}>Cães</span></li>
                    <li><span className="dropdown-item text-white-50 small py-1" style={{ cursor: 'pointer' }}>Gatos</span></li>
                  </ul>
                )}
              </li>

              {/* Dropdown 2: Doações */}
              <li className="nav-item position-relative" style={{ cursor: 'pointer' }}>
                <span className="nav-link text-white" onClick={() => { setDropdownDoacoes(!dropdownDoacoes); setDropdownAdocao(false); }}>
                  Doações <i className="bi bi-chevron-down small ms-1"></i>
                </span>
                {dropdownDoacoes && (
                  <ul className="position-absolute list-unstyled p-2 rounded shadow mt-2"
                    style={{ backgroundColor: cores.marromMenu, width: '150px', zIndex: 1000, left: 0 }}>
                    <li><span className="dropdown-item text-white-50 small py-1" style={{ cursor: 'pointer' }}>Financeira</span></li>
                    <li><span className="dropdown-item text-white-50 small py-1" style={{ cursor: 'pointer' }}>Material</span></li>
                  </ul>
                )}
              </li>

              <li className="nav-item"><span className="nav-link text-white" style={{ cursor: 'pointer' }}>Eventos</span></li>

              {/* CORREÇÃO AQUI: Adicionado onClick para redirecionar para a página de contato */}
              <li className="nav-item">
                <span
                  className="nav-link text-white"
                  style={{ cursor: 'pointer' }}
                  onClick={() => navigate('/contato')}
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
      <div className="text-white py-5 px-4" style={{ backgroundColor: cores.marromBanner }}>
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
                style={{ maxHeight: '260px', objectFit: 'contain' }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 3. SOBRE A ONG */}
      <div className="py-5" style={{ backgroundColor: '#ffffff' }}>
        <div className="container py-2 text-start">
          <h2 className="fw-bold mb-3" style={{ color: cores.textoMarrom }}>Sobre a ONG</h2>
          <p className="text-muted mb-0 lh-lg" style={{ maxWidth: '1000px', fontSize: '1.05rem' }}>
            Na ONG Patas & Lares, acreditamos que cada vida importa. Nosso propósito é resgatar, cuidar e transformar a vida de cães e gatos abandonados, oferecendo-lhes uma segunda chance de ter um lar seguro e cheio de afeto. Junte-se à nossa missão!
          </p>
        </div>
      </div>

      {/* 4. COMO VOCÊ PODE AJUDAR + CAMPANHAS */}
      <div className="py-5" style={{ backgroundColor: cores.cremeFundo }}>
        <div className="container text-center">

          <h2 className="fw-bold mb-5" style={{ color: cores.textoMarrom }}>Como Você Pode Ajudar</h2>

          {/* Fileira dos 3 Cards */}
          <div className="row g-4 justify-content-center mb-5">

            {/* Card Adote */}
            <div className="col-md-4">
              <div className="card h-100 border-0 p-4 shadow-sm" style={{ backgroundColor: cores.cardBege, borderRadius: '16px' }}>
                <div className="card-body d-flex flex-column align-items-center">
                  <i className="bi bi-paw-fill fs-1 mb-2" style={{ color: cores.textoMarrom }}></i>
                  <h4 className="card-title fw-bold mb-3" style={{ color: cores.textoMarrom }}>Adote</h4>
                  <p className="card-text text-muted small px-2 mb-4">
                    Dê um lar cheio de amor para um amigo de quatro patas.
                  </p>
                  <button className="btn mt-auto text-white px-4 fw-bold shadow-sm" style={{ backgroundColor: cores.btnAdote, border: 'none', borderRadius: '8px' }}>
                    Ver Animais
                  </button>
                </div>
              </div>
            </div>

            {/* Card Doe */}
            <div className="col-md-4">
              <div className="card h-100 border-0 p-4 shadow-sm" style={{ backgroundColor: cores.cardBege, borderRadius: '16px' }}>
                <div className="card-body d-flex flex-column align-items-center">
                  <i className="bi bi-heart-fill fs-1 mb-2" style={{ color: cores.btnDoe }}></i>
                  <h4 className="card-title fw-bold mb-3" style={{ color: cores.textoMarrom }}>Doe</h4>
                  <p className="card-text text-muted small px-2 mb-4">
                    Contribua para cuidados, resgates e tratamentos.
                  </p>
                  <button className="btn mt-auto text-white px-4 fw-bold shadow-sm" style={{ backgroundColor: cores.btnDoe, border: 'none', borderRadius: '8px' }}>
                    Doe Agora
                  </button>
                </div>
              </div>
            </div>

            {/* Card Seja Voluntário */}
            <div className="col-md-4">
              <div className="card h-100 border-0 p-4 shadow-sm" style={{ backgroundColor: cores.cardBege, borderRadius: '16px' }}>
                <div className="card-body d-flex flex-column align-items-center">
                  <i className="bi bi-person-fill fs-1 mb-2" style={{ color: cores.textoMarrom }}></i>
                  <h4 className="card-title fw-bold mb-3" style={{ color: cores.textoMarrom }}>Seja Voluntário</h4>
                  <p className="card-text text-muted small px-2 mb-4">
                    Participe de eventos, ajude nos cuidados e inscreva-se.
                  </p>
                  <button className="btn mt-auto text-white px-4 fw-bold shadow-sm" style={{ backgroundColor: cores.btnVoluntario, border: 'none', borderRadius: '8px' }}>
                    Inscreva-se
                  </button>
                </div>
              </div>
            </div>

          </div>

          {/* Banner Vermelho: Campanhas */}
          <div className="mt-5 px-2">
            <h3 className="fw-bold mb-4 text-start" style={{ color: cores.textoMarrom, maxWidth: '1000px', margin: '0 auto 1.5rem auto' }}>Campanhas</h3>

            <div className="card border-0 text-white p-4 shadow-sm mx-auto" style={{ backgroundColor: cores.vermelhoCampanha, borderRadius: '24px', maxWidth: '1000px' }}>
              <div className="card-body d-flex flex-column flex-md-row align-items-center justify-content-between px-md-5 py-3">

                <div className="d-flex align-items-center mb-3 mb-md-0">
                  <div className="bg-white rounded-circle d-flex align-items-center justify-content-center position-relative shadow" style={{ width: '85px', height: '85px', color: cores.vermelhoCampanha }}>
                    <i className="bi bi-paw-fill fs-1"></i>
                    <i className="bi bi-plus-lg position-absolute fw-bold fs-5 bg-white rounded-circle px-1" style={{ bottom: '2px', right: '2px', border: `3px solid ${cores.vermelhoCampanha}` }}></i>
                  </div>
                </div>

                <div className="text-center text-md-start flex-grow-1 mx-md-4">
                  <h2 className="fw-bold mb-0 display-6" style={{ letterSpacing: '0.5px' }}>
                    Juntos pela Castração e Bem-Estar Animal
                  </h2>
                </div>

                <div className="d-none d-md-block opacity-90 fs-1">
                  <i className="bi bi-envelope-heart-fill" style={{ fontSize: '4.5rem' }}></i>
                </div>

              </div>
            </div>
          </div>

        </div>
      </div>

      {/* 5. ADOÇÃO RESPONSÁVEL */}
      <div className="py-5 bg-white">
        <div className="container text-start" style={{ maxWidth: '1000px' }}>

          <h2 className="fw-bold mb-4 text-center text-md-start" style={{ color: cores.textoMarrom, fontSize: '2rem' }}>
            Adoção Responsável
          </h2>

          <h5 className="fw-bold mb-4" style={{ color: cores.textoMarrom }}>
            Transformando vidas, um lar de cada vez
          </h5>

          <p className="text-dark lh-lg mb-4" style={{ textAlign: 'justify', fontSize: '0.95rem' }}>
            A adoção de um animal de estimação é um gesture de amor e compaixão que transforma vidas, a do pet e também a sua. Na <strong>Patas & Lares</strong>, acreditamos que adotar é mais do que acolher: é oferecer uma nova oportunidade de carinho, cuidado e felicidade. Nossa missão é promover a adoção responsável, conectando animais que precisam de uma segunda chance a famílias dispostas a proporcionar um lar cheio de segurança e afeto.
          </p>

          <h5 className="fw-bold mb-3" style={{ color: cores.textoMarrom }}>
            Por que a Adoção Responsável é importante?
          </h5>

          <p className="text-dark lh-lg mb-0" style={{ textAlign: 'justify', fontSize: '0.95rem' }}>
            A adoção responsável é importante porque garante o bem-estar do animal e a harmonia da convivência com a família que o acolhe. Ao adotar com consciência, a pessoa entende que o pet é um ser vivo que precisa de cuidados contínuos, como alimentação adequada, atenção, vacinação, acompanhamento veterinário e espaço para brincar e se exercitar. Esse cuidado reduz o abandono, promove qualidade de vida, fortalece a empatia e o respeito pelos animais e ajuda a controlar a superpopulação, oferecendo a eles uma segunda chance de ter um lar seguro e cheio de afeto.
          </p>

        </div>
      </div>

      {/* 6. RODAPÉ OFICIAL */}
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