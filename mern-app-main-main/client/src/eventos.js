import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Eventos() {
  const navigate = useNavigate();
  
  // Controle do menu dropdown de Doações (via clique para não sumir do nada)
  const [dropdownDoacoes, setDropdownDoacoes] = useState(false);

  // Paleta de cores oficial do Patas & Lares
  const cores = {
    marromMenu: '#4a2511',       // Marrom clássico do topo e destaques
    cremeFundo: '#fdf8f4',       // Fundo off-white suave da página
    textoMarrom: '#4a2511',      // Tom marrom escuro dos títulos principais
    textoDestaque: '#a46843',    // Tom marrom médio para botões e links ativos
    rodapePreto: '#0a0a0a'       // Fundo escuro do rodapé
  };

  // Dados dos cartazes de eventos baseados na imagem image_c150be.png
  const listaEventos = [
    { id: 1, alt: "Castração Gratuita para Cães e Gatos", img: "https://placehold.co/350x450?text=Castração+Gratuita" },
    { id: 2, alt: "Carômetro: Doguinhos Disponíveis para Adoção", img: "https://placehold.co/350x450?text=Carômetro+Adoção" },
    { id: 3, alt: "Campanha Seja um Voluntário: Eles precisam de você", img: "https://placehold.co/350x450?text=Seja+Voluntário" }
  ];

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
          <h1 className="fw-bold mb-0" style={{ color: '#b08a68', fontSize: '3rem' }}>
            Participe dos Nossos Eventos
          </h1>
          <button 
            className="btn text-white px-4 py-2 rounded-pill fw-bold" 
            style={{ backgroundColor: cores.textoDestaque, fontSize: '1rem', border: 'none' }}
            onClick={() => navigate('/contato')}
          >
            Seja Voluntário
          </button>
        </div>

        {/* Descrição Introdutória */}
        <p className="fs-5 text-dark mb-5 text-start lh-base" style={{ maxWidth: '900px', opacity: 0.9 }}>
          Descubra todas as atividades da ONG e junte-se a nós em momentos que transformam vidas! Confira data, horário e detalhes em cada evento.
        </p>

        {/* Fileira de Cartazes dos Eventos */}
        <div className="row row-cols-1 row-cols-md-3 g-4 mb-5 justify-content-center">
          {listaEventos.map((evento) => (
            <div className="col d-flex justify-content-center" key={evento.id}>
              <div className="card border-0 bg-white rounded shadow-sm overflow-hidden p-2" style={{ maxWidth: '340px' }}>
                <img 
                  src={evento.img} 
                  alt={evento.alt} 
                  className="img-fluid rounded object-fit-cover" 
                  style={{ width: '100%', height: 'auto', minHeight: '380px' }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Texto Informativo de Fechamento */}
        <p className="fs-5 text-dark text-start lh-base mt-4" style={{ opacity: 0.9 }}>
          Transforme momentos em sorrisos: torne-se voluntário e faça a diferença na vida dos nossos amigos de quatro patas! Clique no botão <strong>‘Seja Voluntário’</strong> no canto superior direito e participe!
        </p>

      </div>

      {/* 3. RODAPÉ OFICIAL */}
      <footer className="text-white py-4 mt-auto" style={{ backgroundColor: cores.rodapePreto, fontSize: '0.9rem', borderTop: '4px solid #aa7a44' }}>
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