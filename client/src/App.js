import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, Link, Outlet, useLocation } from 'react-router-dom';

// Importando as páginas principais
import Dashboard from './components/dashboard'; // <--- PAGINA INICIAL DO ADM (CARDS)
import Home from './components/home';           // <--- PAGINA INICIAL DO USUARIO (SITE)
import Contato from './components/contato';
import UserList from './components/userList';
import AnimalList from './components/animalList';
import DoacaoList from './components/doacaoList';
import VoluntariosList from './components/voluntariosList';
import NecessidadesList from './components/necessidadesList';
import EventosList from './components/eventosList';
import DonationStats from './components/donationStats';
import ConfiguracoesDoacao from './components/configuracoesDoacao';
import RelatoriosList from './components/relatoriosList';

import AnimaisAdocao from './animaisAdocao';
import DoacaoFinanceira from './components/doacaoFinanceira';
import DoacaoMaterial from './components/doacaoMaterial';
import Transparencia from './transparencia';

// Importando os cadastros
import CreateAnimais from './components/createAnimais';
import CreateDoacao from './components/createDoacao';
import CreateDoacaoFinanceira from './components/createDoacaoFinanceira';
import CreateDoacaoMaterial from './components/createDoacaoMaterial';
import CreateVoluntarios from './components/createVoluntarios';
import Create from './components/create'; 
import AdotadosList from './components/adotadosList';
import AdotadosEdit from './components/adotadosEdit';

// Importando as edições
import Edit from './components/edit';
import EditAnimais from './components/editAnimais';
import EditDoacao from './components/editDoacao';
import EditVoluntarios from './components/editVoluntarios';
import CreateNecessidade from './components/createNecessidade';
import EditNecessidade from './components/editNecessidade';
import CreateEvento from './components/createEvento';
import EditEvento from './components/editEvento';

import Login from './components/Login';
import Register from './components/Register';
import Eventos from './eventos';
import SejaVoluntario from './sejaVoluntario';
import SolicitarDoacao from './components/solicitarDoacao';
import FormularioDoacao from './components/formularioDoacao';
import FormularioAdocao from './components/formularioAdocao';

import estilosAdmin from './admin.module.css';

// Decodifica o payload do JWT para saber o papel do usuário (sem validar assinatura,
// que é responsabilidade do servidor). Retorna null se o token for inválido/expirado.
function getUsuarioAutenticado(token) {
  if (!token) return null;
  try {
    const payload = token.split('.')[1];
    if (!payload) return null;
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const json = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    const dados = JSON.parse(json);
    if (dados.exp && Date.now() >= dados.exp * 1000) return null;
    return dados;
  } catch (e) {
    return null;
  }
}

// Direciona o scroll para o topo sempre que houver troca de rota,
// garantindo que nenhuma posição/estado de rolagem da página anterior persista.
function ScrollToTop() {
  const { pathname, search } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [pathname, search]);

  return null;
}

// Layout do Painel Administrativo (Menu Lateral Fixo)
function NavItem({ to, icon, label }) {
  const location = useLocation();
  const [caminho, query] = to.split("?");

  let ativo = location.pathname === caminho;
  if (ativo && query !== undefined) {
    ativo = location.search === `?${query}`;
  }

  return (
    <Link
      to={to}
      className={`${estilosAdmin.adminNavLink}${ativo ? ` ${estilosAdmin.adminNavLinkActive}` : ""}`}
    >
      <i className={`bi ${icon} ${estilosAdmin.adminNavIcon}`}></i>
      <span>{label}</span>
    </Link>
  );
}

function DashboardLayout({ setToken }) {
  const [menuAberto, setMenuAberto] = useState(false);
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
  };

  useEffect(() => {
    setMenuAberto(false);
  }, [location.pathname, location.search]);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
      {/* Overlay para fechar o menu no mobile */}
      {menuAberto && <div className={estilosAdmin.adminBackdrop} onClick={() => setMenuAberto(false)}></div>}

      {/* Menu Lateral para o Administrador */}
      <aside className={`${estilosAdmin.adminSidebar}${menuAberto ? ` ${estilosAdmin.adminSidebarOpen}` : ""}`}>
        <div className="d-flex justify-content-between align-items-start">
          <div>
            <h4 className="mb-1" style={{ color: '#3D2314', fontWeight: 'bold' }}>
              Patas & Lares
            </h4>
            <p className="text-muted small mb-0">Painel Administrativo</p>
          </div>
          <button
            type="button"
            className={`btn d-lg-none ${estilosAdmin.adminSidebarClose}`}
            onClick={() => setMenuAberto(false)}
            aria-label="Fechar menu"
          >
            <i className="bi bi-x-lg"></i>
          </button>
        </div>

        <nav className={`${estilosAdmin.adminNav} mt-4`}>
          <div className={estilosAdmin.adminSectionTitle}>Geral</div>
          <NavItem to="/dashboard" icon="bi-speedometer2" label="Dashboard" />

          <div className={estilosAdmin.adminSectionTitle}>Gestão</div>
          <NavItem to="/animais" icon="bi-heart-fill" label="Animais" />
          <NavItem to="/voluntarios" icon="bi-people" label="Voluntários" />
          <NavItem to="/eventos-admin" icon="bi-calendar-event" label="Eventos" />
          <NavItem to="/adotados" icon="bi-heart-fill" label="Histórico de Adotados" />

          <div className={estilosAdmin.adminSectionTitle}>Recursos & Doações</div>
          <NavItem to="/doacoes" icon="bi-cash-coin" label="Doações" />
          <NavItem to="/necessidades" icon="bi-clipboard-check" label="Necessidades" />
          <NavItem to="/relatorios-admin" icon="bi-file-earmark-bar-graph" label="Prestação de Contas" />

          <div className={estilosAdmin.adminSectionTitle}>Configurações</div>
          <NavItem to="/usuarios" icon="bi-person-gear" label="Usuários" />
          <NavItem to="/configuracoes-doacao" icon="bi-bank" label="Dados da ONG / Conta" />
        </nav>

        <hr className="mt-4" />
        <Link className={`${estilosAdmin.adminNavLink} text-danger`} to="/login" onClick={handleLogout}>
          <i className={`bi bi-box-arrow-right ${estilosAdmin.adminNavIcon}`}></i>
          <span>Sair</span>
        </Link>
      </aside>

      {/* Conteúdo Principal do Painel */}
      <main className={estilosAdmin.adminMain}>
        {/* Barra superior com hamburger (apenas no mobile) */}
        <div className={estilosAdmin.adminTopbar}>
          <button
            type="button"
            className={estilosAdmin.adminTopbarBtn}
            onClick={() => setMenuAberto(true)}
            aria-label="Abrir menu"
          >
            <i className="bi bi-list fs-4"></i>
          </button>
          <span className="fw-bold">
            Patas & Lares
          </span>
        </div>
        <Outlet />
      </main>
    </div>
  );
}

export default function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));

  const usuario = getUsuarioAutenticado(token);
  const isAdmin = usuario?.tipo === "Admin";

  const handleLogin = (newToken) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
  };

  return (
    <>
      <ScrollToTop />
      <Routes>
      {/* 1. ROTAS PÚBLICAS (Qualquer visitante acessa sem token) */}
      <Route path="/" element={<Home />} />
      <Route path="/contato" element={<Contato />} />
      <Route path="/animais-adocao" element={<AnimaisAdocao />} />
      <Route path="/doacao-financeira" element={<DoacaoFinanceira />} />
      <Route path="/doacao-material" element={<DoacaoMaterial />} />
      <Route path="/transparencia" element={<Transparencia />} />
      <Route path="/eventos" element={<Eventos />} />
      <Route path="/seja-voluntario" element={<SejaVoluntario />} />
      <Route path="/solicitar-doacao" element={<SolicitarDoacao />} />
      <Route path="/doar/formulario" element={<FormularioDoacao />} />
      <Route path="/adocao/formulario" element={<FormularioAdocao />} />
      
      {/* Somente o administrador logado vai direto ao painel; demais usuários veem o login */}
      <Route path="/login" element={isAdmin ? <Navigate to="/dashboard" replace /> : <Login onLogin={handleLogin} />} />
      <Route path="/register" element={<Register />} />

      {/* 2. ROTAS PROTEGIDAS (Apenas para o Administrador logado) */}
      <Route element={isAdmin ? <DashboardLayout setToken={setToken} /> : <Navigate to="/login" replace />}>
        
        {/* A PAGINA INICIAL DO ADM É O DASHBOARD */}
        <Route path="/dashboard" element={<Dashboard />} />
        
        {/* Dashboard Analytics */}
        <Route path="/estatisticas-doacoes" element={<DonationStats />} />

        {/* Usuários */}
        <Route path="/usuarios" element={<UserList />} />
        <Route path="/cadastrar-usuario" element={<Create />} />
        <Route path="/edit/:id" element={<Edit />} />

        {/* Animais */}
        <Route path="/animais" element={<AnimalList />} />
        <Route path="/cadastrar-animal" element={<CreateAnimais />} />
        <Route path="/edit-animal/:id" element={<EditAnimais />} />

        {/* Histórico de Adoções (Visão do Admin) */}
        <Route path="/adotados" element={<AdotadosList />} />
        <Route path="/adotados/editar/:id" element={<AdotadosEdit />} />

        {/* Doações */}
        <Route path="/doacoes" element={<DoacaoList />} />
        <Route path="/cadastrar-doacao" element={<CreateDoacao />} />
        <Route path="/cadastrar-doacao-financeira" element={<CreateDoacaoFinanceira />} />
        <Route path="/cadastrar-doacao-material" element={<CreateDoacaoMaterial />} />
        <Route path="/edit-doacao/:id" element={<EditDoacao />} />

        {/* Voluntários */}
        <Route path="/voluntarios" element={<VoluntariosList />} />
        <Route path="/cadastrar-voluntarios" element={<CreateVoluntarios />} />
        <Route path="/edit-voluntarios/:id" element={<EditVoluntarios />} />

        {/* Necessidades de Doação */}
        <Route path="/necessidades" element={<NecessidadesList />} />
        <Route path="/cadastrar-necessidade" element={<CreateNecessidade />} />
        <Route path="/edit-necessidade/:id" element={<EditNecessidade />} />

        {/* Prestação de Contas */}
        <Route path="/relatorios-admin" element={<RelatoriosList />} />

        {/* Eventos */}
        <Route path="/eventos-admin" element={<EventosList />} />
        <Route path="/cadastrar-evento" element={<CreateEvento />} />
        <Route path="/edit-evento/:id" element={<EditEvento />} />

        {/* Configurações de Doação */}
        <Route path="/configuracoes-doacao" element={<ConfiguracoesDoacao />} />
      </Route>

      {/* Rota de segurança: se digitar qualquer coisa errada, volta para a Home pública */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
    </>
  );
}