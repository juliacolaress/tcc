import React, { useState } from 'react';
import { Routes, Route, Navigate, Link, Outlet } from 'react-router-dom';

// Importando as páginas principais
import Dashboard from './components/dashboard'; // <--- PAGINA INICIAL DO ADM (CARDS)
import Home from './components/home';           // <--- PAGINA INICIAL DO USUARIO (SITE)
import Contato from './components/contato';
import UserList from './components/userList';
import AnimalList from './components/animalList';
import DoacaoList from './components/doacaoList';
import VoluntariosList from './components/voluntariosList';
import DonationStats from './components/donationStats';

// Importando os cadastros
import CreateAnimais from './components/createAnimais';
import CreateDoacao from './components/createDoacao';
import CreateDoacaoFinanceira from './components/createDoacaoFinanceira';
import CreateDoacaoMaterial from './components/createDoacaoMaterial';
import CreateVoluntarios from './components/createVoluntarios';
import Create from './components/create'; 

// Importando as edições
import Edit from './components/edit';
import EditAnimais from './components/editAnimais';
import EditDoacao from './components/editDoacao';
import EditVoluntarios from './components/editVoluntarios';

import Login from './components/Login';
import Register from './components/Register';

// Layout do Painel Administrativo (Menu Lateral Fixo)
function DashboardLayout({ setToken }) {
  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
  };

  return (
    <div className="d-flex" style={{ minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
      {/* Menu Lateral Fixo para o Administrador */}
      <aside className="bg-white border-end" style={{ width: '280px', padding: '20px', position: 'fixed', height: '100vh' }}>
        <h4 style={{ color: '#8B5A2B', fontWeight: 'bold' }}>
          <i className="bi bi-paw-fill me-2" style={{ transform: 'rotate(-15deg)', display: 'inline-block' }}></i>
          Patas & Lares
        </h4>
        <p className="text-muted small">Painel Administrativo</p>
        <hr />
        
        <ul className="nav flex-column gap-2">
          <li className="nav-item">
            {/* O link de Início do ADM agora aponta para /dashboard */}
            <Link className="nav-link text-dark d-flex align-items-center" to="/dashboard">
              <i className="bi bi-house-door me-3 fs-5"></i> Início
            </Link>
          </li>
          <li className="nav-item">
            <Link className="nav-link text-dark d-flex align-items-center" to="/usuarios">
              <i className="bi bi-person me-3 fs-5"></i> Usuários
            </Link>
          </li>
          <li className="nav-item">
            <Link className="nav-link text-dark d-flex align-items-center" to="/animais">
              <i className="bi bi-heart me-3 fs-5"></i> Animais
            </Link>
          </li>
          <li className="nav-item">
            <Link className="nav-link text-dark d-flex align-items-center" to="/doacoes">
              <i className="bi bi-cash-coin me-3 fs-5"></i> Doações
            </Link>
          </li>
          <li className="nav-item">
            <Link className="nav-link text-dark d-flex align-items-center" to="/voluntarios">
              <i className="bi bi-people me-3 fs-5"></i> Voluntários
            </Link>
          </li>
        </ul>

        <hr className="mt-5" />
        <Link className="nav-link text-danger d-flex align-items-center" to="/login" onClick={handleLogout}>
          <i className="bi bi-box-arrow-left me-3 fs-5"></i> Sair
        </Link>
      </aside>

      {/* Conteúdo Principal do Painel (Empurrado para o lado para não sobrepor a Sidebar) */}
      <main className="flex-grow-1 p-4" style={{ marginLeft: '280px', width: 'calc(100% - 280px)' }}>
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
      {/* 1. ROTAS PÚBLICAS (Qualquer visitante acessa) */}
      <Route path="/" element={<Home />} />
      <Route path="/contato" element={<Contato />} />
      
      {/* Se o administrador já estiver logado e tentar entrar no login, ele vai direto para o painel */}
      <Route path="/login" element={token ? <Navigate to="/dashboard" replace /> : <Login onLogin={handleLogin} />} />
      <Route path="/register" element={<Register />} />

      {/* 2. ROTAS PROTEGIDAS (Apenas para o Administrador logado) */}
      <Route element={token ? <DashboardLayout setToken={setToken} /> : <Navigate to="/login" replace />}>
        
        {/* A PAGINA INICIAL DO ADM AGORA É O DASHBOARD */}
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
      </Route>

      {/* Rota de segurança: se digitar qualquer coisa errada, volta para a Home pública */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}