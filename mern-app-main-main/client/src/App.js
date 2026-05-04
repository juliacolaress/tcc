import React, { useState } from 'react';
import { Routes, Route, Navigate, Link, Outlet } from 'react-router-dom';

// Importando as páginas principais
import Home from './components/home';
import UserList from './components/userList';
import AnimalList from './components/animalList';
import DoacaoList from './components/doacaoList';
import VoluntariosList from './components/voluntariosList';

// Importando os cadastros
import CreateAnimais from './components/createAnimais';
import CreateDoacao from './components/createDoacao';
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
      {/* Menu Lateral */}
      <aside className="bg-white border-end" style={{ width: '280px', padding: '20px' }}>
        <h4 style={{ color: '#8B5A2B', fontWeight: 'bold' }}>Patas & Lares</h4>
        <p className="text-muted small">Painel Administrativo</p>
        <hr />
        
        <ul className="nav flex-column gap-2">
          <li className="nav-item">
            <Link className="nav-link text-dark d-flex align-items-center" to="/home">
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

      {/* Conteúdo Principal (onde as telas aparecem) */}
      <main className="flex-grow-1 p-4">
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
      {/* Redirecionamento inicial */}
      <Route path="/" element={token ? <Navigate to="/home" /> : <Navigate to="/login" />} />

      {/* Rotas protegidas dentro do painel (exigem autenticação) */}
      <Route element={token ? <DashboardLayout setToken={setToken} /> : <Navigate to="/login" replace />}>
        <Route path="/home" element={<Home />} />
        
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
        <Route path="/edit-doacao/:id" element={<EditDoacao />} />

        {/* Voluntários */}
        <Route path="/voluntarios" element={<VoluntariosList />} />
        <Route path="/cadastrar-voluntarios" element={<CreateVoluntarios />} />
        <Route path="/edit-voluntarios/:id" element={<EditVoluntarios />} />
      </Route>

      {/* Telas de Login/Registro sem o menu lateral */}
      <Route path="/login" element={<Login onLogin={handleLogin} />} />
      <Route path="/register" element={<Register />} />

      {/* Rota coringa caso digite algo errado */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}