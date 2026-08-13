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
      className={`admin-nav-link${ativo ? " admin-nav-link-active" : ""}`}
    >
      <i className={`bi ${icon} admin-nav-icon`}></i>
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
      {menuAberto && <div className="admin-backdrop" onClick={() => setMenuAberto(false)}></div>}

      {/* Menu Lateral para o Administrador */}
      <aside className={`admin-sidebar${menuAberto ? " admin-sidebar-open" : ""}`}>
        <div className="d-flex justify-content-between align-items-start">
          <div>
            <h4 className="mb-1" style={{ color: '#4a2511', fontWeight: 'bold' }}>
              <i className="bi bi-paw-fill me-2" style={{ transform: 'rotate(-15deg)', display: 'inline-block' }}></i>
              Patas & Lares
            </h4>
            <p className="text-muted small mb-0">Painel Administrativo</p>
          </div>
          <button
            type="button"
            className="btn d-lg-none admin-sidebar-close"
            onClick={() => setMenuAberto(false)}
            aria-label="Fechar menu"
          >
            <i className="bi bi-x-lg"></i>
          </button>
        </div>

        <nav className="admin-nav mt-4">
          <div className="admin-section-title">Geral</div>
          <NavItem to="/dashboard" icon="bi-speedometer2" label="Dashboard" />

          <div className="admin-section-title">Gestão</div>
          <NavItem to="/animais" icon="bi-paw-fill" label="Animais" />
          <NavItem to="/voluntarios" icon="bi-people" label="Voluntários" />
          <NavItem to="/eventos-admin" icon="bi-calendar-event" label="Eventos" />
          <NavItem to="/adotados" icon="bi-heart-fill" label="Histórico de Adotados" />

          <div className="admin-section-title">Recursos & Doações</div>
          <NavItem to="/doacoes?aba=financeira" icon="bi-cash-coin" label="Doações Financeiras" />
          <NavItem to="/doacoes?aba=material" icon="bi-box-seam" label="Doações Materiais" />
          <NavItem to="/necessidades" icon="bi-clipboard-check" label="Necessidades" />
          <NavItem to="/relatorios-admin" icon="bi-file-earmark-bar-graph" label="Prestação de Contas" />

          <div className="admin-section-title">Configurações</div>
          <NavItem to="/usuarios" icon="bi-person-gear" label="Usuários" />
          <NavItem to="/configuracoes-doacao" icon="bi-bank" label="Dados da ONG / Conta" />
        </nav>

        <hr className="mt-4" />
        <Link className="admin-nav-link text-danger" to="/login" onClick={handleLogout}>
          <i className="bi bi-box-arrow-right admin-nav-icon"></i>
          <span>Sair</span>
        </Link>
      </aside>

      {/* Conteúdo Principal do Painel */}
      <main className="admin-main">
        {/* Barra superior com hamburger (apenas no mobile) */}
        <div className="admin-topbar">
          <button
            type="button"
            className="admin-topbar-btn"
            onClick={() => setMenuAberto(true)}
            aria-label="Abrir menu"
          >
            <i className="bi bi-list fs-4"></i>
          </button>
          <span className="fw-bold">
            <i className="bi bi-paw-fill me-2" style={{ transform: 'rotate(-15deg)', display: 'inline-block' }}></i>
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

  const handleLogin = (newToken) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
  };

  return (
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
      
      {/* Se o administrador já estiver logado e tentar entrar no login, ele vai direto para o painel */}
      <Route path="/login" element={token ? <Navigate to="/dashboard" replace /> : <Login onLogin={handleLogin} />} />
      <Route path="/register" element={<Register />} />

      {/* 2. ROTAS PROTEGIDAS (Apenas para o Administrador logado) */}
      <Route element={token ? <DashboardLayout setToken={setToken} /> : <Navigate to="/login" replace />}>
        
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
  );
}