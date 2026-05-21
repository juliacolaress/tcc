import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function Home() {
  const navigate = useNavigate();
  const primaryColor = '#5c3a21';

  return (
    <div style={{ fontFamily: 'Poppins, sans-serif' }}>
      {/* Navbar Simples para o Usuário */}
      <nav className="navbar navbar-light bg-white shadow-sm px-4">
        <span className="navbar-brand fw-bold" style={{ color: primaryColor }}>
          <i className="bi bi-paw-fill me-2"></i> Patas & Lares
        </span>
        {/* CORREÇÃO AQUI: Esse botão agora joga para o formulário de login seguro */}
        <button className="btn btn-outline-secondary" onClick={() => navigate('/login')}>
          <i className="bi bi-lock-fill me-2"></i> Acesso Administrativo
        </button>
      </nav>

      {/* Hero Section */}
      <div className="container py-5 text-center">
        <div className="row py-5 align-items-center">
          <div className="col-lg-6 text-start">
            <h1 className="display-4 fw-bold" style={{ color: primaryColor }}>
              Encontre o seu novo melhor amigo.
            </h1>
            <p className="lead text-muted">
              Somos uma ONG dedicada ao resgate, cuidado e adoção responsável de animais. 
              Mude uma vida, adote um amor.
            </p>
            <div className="mt-4">
              <button className="btn btn-lg text-white px-4 me-3" style={{ backgroundColor: primaryColor }}>
                Quero Adotar
              </button>
              <button className="btn btn-lg btn-outline-secondary px-4">
                Como Ajudar?
              </button>
            </div>
          </div>
          <div className="col-lg-6">
            <img 
              src="https://img.freepik.com/fotos-gratis/grupo-de-retratos-de-cachorros-e-gatos-adoraveis_23-2149102078.jpg" 
              alt="Pets" 
              className="img-fluid rounded-circle shadow"
            />
          </div>
        </div>
      </div>

      {/* Seção de Números da ONG */}
      <div className="bg-light py-5">
        <div className="container text-center">
          <div className="row">
            <div className="col-md-4">
              <h2 className="fw-bold" style={{ color: primaryColor }}>+500</h2>
              <p className="text-muted">Animais Resgatados</p>
            </div>
            <div className="col-md-4">
              <h2 className="fw-bold" style={{ color: primaryColor }}>+300</h2>
              <p className="text-muted">Adoções Realizadas</p>
            </div>
            <div className="col-md-4">
              <h2 className="fw-bold" style={{ color: primaryColor }}>100%</h2>
              <p className="text-muted">Amor e Dedicação</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}