import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function DoacaoMaterial() {
  const navigate = useNavigate();
  
  // Controle do menu dropdown de Doações
  const [dropdownDoacoes, setDropdownDoacoes] = useState(false);

  // Controle do Chat/Tutorial Passo a Passo da lateral direita
  const [exibirTutorial, setExibirTutorial] = useState(false);
  const [passoTutorial, setPassoTutorial] = useState(1);

  // Paleta de cores oficial do Patas & Lares
  const cores = {
    marromMenu: '#4a2511',       // Marrom clássico do topo e caixas de destaque
    cremeFundo: '#fdf8f4',       // Fundo off-white suave da página
    textoMarrom: '#4a2511',      // Tom marrom escuro dos títulos principais
    textoDestaque: '#4a2511',    // Tom marrom médio para os subtítulos
    rodapePreto: '#0a0a0a',      // Fundo escuro do rodapé
    marromTutorial: '#b38b6d'    // Tom marrom médio do container de tutorial
  };

  // Dados fictícios estruturados baseados nas imagens para renderização limpa
  const categorias = {
    alimentacao: [
      { id: 1, nome: "Ração Seca Pedigree para Cães Adultos Raças Pequenas – 10.1kg", img: "https://placehold.co/200x250?text=Pedigree+10kg" },
      { id: 2, nome: "Ração para Gatos Whiskas Sabor Peixe – Pacote – 10kg", img: "https://placehold.co/200x250?text=Whiskas+10kg" },
      { id: 3, nome: "Ração Úmida Whiskas Sachê Frango para Gatos Adultos – 85g", img: "https://placehold.co/200x250?text=Whiskas+Sache" },
      { id: 4, nome: "Ração Úmida Pedigree Sachê Carne ao Molho para Cães Adultos de Raças Pequenas – 100g", img: "https://placehold.co/200x250?text=Pedigree+Sache" }
    ],
    higiene: [
      { id: 5, nome: "Shampoo Sanol Dog Neutro para Cães e Gatos - 500ml", img: "https://placehold.co/200x250?text=Sanol+Dog" },
      { id: 6, nome: "Areia Higiênica Pipicat Campestre para Gatos – 4kg", img: "https://placehold.co/200x250?text=Pipicat+4kg" },
      { id: 7, nome: "Produtos de limpeza variados: água sanitária, desinfetante, detergente, sabão em pó, sabão em barra e panos de chão.", img: "https://placehold.co/200x250?text=Kits+Limpeza" }
    ],
    bemEstar: [
      { id: 8, nome: "Casinha de plástico para oferecer abrigo seguro e confortável aos animais.", img: "https://placehold.co/200x200?text=Casinha" },
      { id: 9, nome: "Arranhadores simples para os gatos se exercitarem e manterem as unhas saudáveis.", img: "https://placehold.co/200x200?text=Arranhador" },
      { id: 10, nome: "Camas e colchonetes, artesanais ou comprados, para os animais descansarem.", img: "https://placehold.co/200x200?text=Cama+Pet" },
      { id: 11, nome: "Coleiras e guias de nylon simples para passeios seguros dos animais.", img: "https://placehold.co/200x200?text=Coleiras" }
    ]
  };

  return (
    <div style={{ fontFamily: 'Poppins, sans-serif', backgroundColor: cores.cremeFundo, minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      
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
                <span className="nav-link text-white" style={{ cursor: 'pointer' }} onClick={() => navigate('/')}>Início</span>
              </li>
              <li className="nav-item">
                <span className="nav-link text-white" style={{ cursor: 'pointer' }} onClick={() => navigate('/animais-adocao')}>Animais para Adoção</span>
              </li>

              {/* Dropdown: Doações */}
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

              <li className="nav-item">
                <span className="nav-link text-white" style={{ cursor: 'pointer' }}>Eventos</span>
              </li>
              <li className="nav-item">
                <span className="nav-link text-white" style={{ cursor: 'pointer' }} onClick={() => navigate('/contato')}>Contato</span>
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

      {/* 2. CORPO DA PÁGINA (CONTEÚDO INSTITUCIONAL) */}
      <div className="container py-5 flex-grow-1" style={{ position: 'relative' }}>
        
        {/* Título Principal com botão flutuante 'Quero Doar' */}
        <div className="d-flex justify-content-between align-items-center mb-5 mt-2">
          <h1 className="fw-bold mb-0" style={{ color: cores.textoMarrom, fontSize: '3rem' }}>Doação de Material</h1>
          <button 
            className="btn btn-donate-material px-4 py-2 shadow-sm" 
            onClick={() => { setExibirTutorial(true); setPassoTutorial(1); }}
          >
            Quero Doar
          </button>
        </div>

        {/* SEÇÃO 1: ALIMENTAÇÃO */}
        <section className="mb-5 text-start">
          <h3 className="fw-bold" style={{ color: cores.textoDestaque }}>Alimentação</h3>
          <p className="text-muted fs-5 mb-4">Veja os alimentos que gostaríamos de receber para garantir a nutrição dos nossos amigos de quatro patas.</p>
          <div className="row row-cols-1 row-cols-sm-2 row-cols-md-4 g-4">
            {categorias.alimentacao.map(item => (
              <div className="col" key={item.id}>
                <div className="card h-100 border-0 bg-transparent text-start transition-hover" style={{ transition: '0.3s' }}>
                  <div className="d-flex justify-content-center align-items-center p-3 bg-white rounded-4 shadow-sm" style={{ minHeight: '260px' }}>
                    <img src={item.img} alt={item.nome} className="img-fluid object-fit-contain" style={{ maxHeight: '220px' }} />
                  </div>
                  <div className="card-body px-1 pt-3">
                    <p className="card-text text-dark small lh-sm fw-medium">{item.nome}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* SEÇÃO 2: HIGIENE */}
        <section className="mb-5 text-start">
          <h3 className="fw-bold" style={{ color: cores.textoDestaque }}>Higiene</h3>
          <p className="text-muted fs-5 mb-4">Garanta um ambiente limpo e saudável para nossos animais resgatados.</p>
          <div className="row row-cols-1 row-cols-sm-2 row-cols-md-4 g-4">
            {categorias.higiene.map(item => (
              <div className="col" key={item.id}>
                <div className="card h-100 border-0 bg-transparent text-start">
                  <div className="d-flex justify-content-center align-items-center p-3 bg-white rounded-4 shadow-sm" style={{ minHeight: '260px' }}>
                    <img src={item.img} alt={item.nome} className="img-fluid object-fit-contain" style={{ maxHeight: '220px' }} />
                  </div>
                  <div className="card-body px-1 pt-3">
                    <p className="card-text text-dark small lh-sm fw-medium">{item.nome}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* SEÇÃO 3: BEM-ESTAR */}
        <section className="mb-5 text-start">
          <h3 className="fw-bold" style={{ color: cores.textoDestaque }}>Bem-estar</h3>
          <p className="text-muted fs-5 mb-4">Ajude a proporcionar conforto e momentos de alegria para cada pet que acolhemos.</p>
          <div className="row row-cols-1 row-cols-sm-2 row-cols-md-4 g-4">
            {categorias.bemEstar.map(item => (
              <div className="col" key={item.id}>
                <div className="card h-100 border-0 bg-transparent text-start">
                  <div className="d-flex justify-content-center align-items-center p-3 bg-white rounded-4 shadow-sm" style={{ minHeight: '220px' }}>
                    <img src={item.img} alt={item.nome} className="img-fluid object-fit-contain" style={{ maxHeight: '180px' }} />
                  </div>
                  <div className="card-body px-1 pt-3">
                    <p className="card-text text-dark small lh-sm fw-medium">{item.nome}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 3. CONTROLLER DA CAIXA FLUTUANTE DO TUTORIAL (LATERAL DIREITA) */}
        {exibirTutorial && (
          <div 
            className="position-fixed rounded-4 p-4 text-start shadow-lg d-flex flex-column gap-3"
            style={{ 
              backgroundColor: '#ad8262', 
              width: '380px', 
              right: '30px', 
              bottom: '100px', 
              zIndex: 1050,
              border: '1px solid rgba(255,255,255,0.3)',
              backdropFilter: 'blur(10px)'
            }}
          >
            {/* Header do Chat */}
            <div className="d-flex justify-content-between align-items-center mb-2">
              <div className="d-flex align-items-center gap-2">
                <div className="bg-white rounded-circle d-flex align-items-center justify-content-center shadow-sm" style={{ width: '40px', height: '40px' }}>
                  <i className="bi bi-paw-fill" style={{ color: '#ad8262' }}></i>
                </div>
                <span className="text-white fw-bold">Suporte Patas & Lares</span>
              </div>
              <button 
                className="btn btn-sm rounded-circle d-flex align-items-center justify-content-center" 
                style={{ backgroundColor: 'rgba(0,0,0,0.2)', width: '32px', height: '32px', border: 'none', color: '#fff' }}
                onClick={() => setExibirTutorial(false)}
              >
                <i className="bi bi-x-lg"></i>
              </button>
            </div>

            {/* Conteúdo Dinâmico por Passos (Balões de Chat) */}
            <div style={{ maxHeight: '400px', overflowY: 'auto', paddingRight: '5px' }}>
              {passoTutorial >= 1 && (
                <div className="d-flex flex-column gap-2 mb-3">
                  <div className="bg-white text-dark p-3 rounded-4 rounded-tl-0 shadow-sm">
                    <p className="mb-0 small">Olá! Bem-vindo à área de doações da nossa ONG. Vou te explicar como funciona para doar.</p>
                  </div>
                  {passoTutorial === 1 && (
                    <div className="d-flex justify-content-end">
                      <button className="btn btn-light btn-sm rounded-pill px-3 fw-bold text-dark shadow-sm" onClick={() => setPassoTutorial(2)}>Continuar</button>
                    </div>
                  )}
                </div>
              )}

              {passoTutorial >= 2 && (
                <div className="d-flex flex-column gap-2 mb-3">
                  <div className="bg-white text-dark p-3 rounded-4 rounded-tl-0 shadow-sm">
                    <p className="mb-0 small">Ao clicar no botão <strong>'Quero doar'</strong> no canto superior direito da página, vai abrir um formulário de doação.</p>
                  </div>
                  {passoTutorial === 2 && (
                    <div className="d-flex justify-content-end">
                      <button className="btn btn-light btn-sm rounded-pill px-3 fw-bold text-dark shadow-sm" onClick={() => setPassoTutorial(3)}>Continuar</button>
                    </div>
                  )}
                </div>
              )}

              {passoTutorial >= 3 && (
                <div className="d-flex flex-column gap-2 mb-3">
                  <div className="bg-white text-dark p-3 rounded-4 rounded-tl-0 shadow-sm">
                    <p className="mb-1 small fw-bold">No formulário, você vai informar:</p>
                    <ul className="mb-0 ps-3 small text-muted" style={{ fontSize: '0.85rem' }}>
                      <li>Seu nome e contato.</li>
                      <li>Sua cidade/estado.</li>
                      <li>O tipo de doação.</li>
                      <li>Uma mensagem opcional para detalhar sua doação.</li>
                    </ul>
                  </div>
                  {passoTutorial === 3 && (
                    <div className="d-flex justify-content-end">
                      <button className="btn btn-light btn-sm rounded-pill px-3 fw-bold text-dark shadow-sm" onClick={() => setPassoTutorial(4)}>Continuar</button>
                    </div>
                  )}
                </div>
              )}

              {passoTutorial >= 4 && (
                <div className="d-flex flex-column gap-2 mb-3">
                  <div className="bg-white text-dark p-3 rounded-4 rounded-tl-0 shadow-sm">
                    <p className="mb-2 small fw-bold">Depois, você pode escolher a forma de entrega:</p>
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
                      <button className="btn btn-light btn-sm rounded-pill px-3 fw-bold text-dark shadow-sm" onClick={() => setPassoTutorial(5)}>Continuar</button>
                    </div>
                  )}
                </div>
              )}

              {passoTutorial >= 5 && (
                <div className="d-flex flex-column gap-2 mb-3">
                  <div className="bg-white text-dark p-3 rounded-4 rounded-tl-0 shadow-sm">
                    <p className="mb-2 small fw-bold">Aqui estão alguns exemplos do que precisamos agora:</p>
                    <div className="d-flex gap-2 overflow-auto pb-2 mb-2" style={{ scrollbarWidth: 'none' }}>
                      {categorias.alimentacao.slice(0, 2).concat(categorias.higiene.slice(0, 1)).map(item => (
                        <div key={item.id} className="text-center" style={{ minWidth: '80px' }}>
                          <img src={item.img} alt={item.nome} style={{ width: '80px', height: '100px', objectFit: 'contain', borderRadius: '8px', border: '1px solid #eee' }} />
                        </div>
                      ))}
                    </div>
                    <p className="mb-0 small text-muted">Rações, areia higiênica, shampoos e muito mais!</p>
                  </div>
                  {passoTutorial === 5 && (
                    <div className="d-flex justify-content-end">
                      <button className="btn btn-light btn-sm rounded-pill px-3 fw-bold text-dark shadow-sm" onClick={() => setPassoTutorial(6)}>Continuar</button>
                    </div>
                  )}
                </div>
              )}

              {passoTutorial >= 6 && (
                <div className="d-flex flex-column gap-2 mb-3">
                  <div className="bg-white text-dark p-3 rounded-4 rounded-tl-0 shadow-sm">
                    <p className="mb-0 small">Pronto! Agora é só clicar no botão 'Quero doar', preencher o formulário e escolher a melhor forma de entrega. Muito obrigado!</p>
                  </div>
                  <div className="d-flex justify-content-end">
                    <button className="btn btn-success btn-sm rounded-pill px-4 fw-bold shadow-sm" onClick={() => setExibirTutorial(false)}>Finalizar</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Botão de Balão de Mensagem Fixo no Canto Inferior Direito */}
        <div 
          className="position-fixed d-flex align-items-center justify-content-center shadow-lg floating-chat-trigger" 
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

      </div>

      {/* 4. RODAPÉ OFICIAL */}
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

export default DoacaoMaterial;