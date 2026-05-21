import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API_BASE_URL from "../api/config";

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro('');
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/usuarios/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, senha })
      });

      const data = await response.json();

      if (response.ok) {
        // Envia o token para o App.js salvar no estado global e localStorage
        onLogin(data.token);
        
        // MUDANÇA PRINCIPAL: Agora o ADM vai direto para a tela de controle/cards
        navigate('/dashboard'); 
      } else {
        setErro(data.message || 'E-mail ou senha incorretos.');
      }
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      setErro('Erro ao conectar com o servidor. Tente novamente mais tarde.');
    } finally {
      setLoading(false);
    }
  };

  const primaryColor = '#5c3a21';

  return (
    <div className="d-flex align-items-center justify-content-center" style={{ minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
      <div className="card shadow-sm border-0 p-4" style={{ width: '100%', maxWidth: '400px', borderRadius: '12px' }}>
        <div className="card-body">
          {/* Logo / Título */}
          <div className="text-center mb-4">
            <h2 className="fw-bold mb-1" style={{ color: primaryColor }}>
              <i className="bi bi-paw-fill me-2" style={{ transform: 'rotate(-15deg)', display: 'inline-block' }}></i>
              Patas & Lares
            </h2>
            <p className="text-muted small">Acesso Restrito Administrativo</p>
          </div>

          {/* Mensagem de Erro */}
          {erro && (
            <div className="alert alert-danger p-2 small text-center" role="alert" style={{ borderRadius: '8px' }}>
              <i className="bi bi-exclamation-triangle-fill me-2"></i> {erro}
            </div>
          )}

          {/* Formulário */}
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label text-muted small fw-bold uppercase">E-mail</label>
              <div className="input-group">
                <span className="input-group-text bg-white border-end-0 text-muted">
                  <i className="bi bi-envelope"></i>
                </span>
                <input
                  type="email"
                  className="form-control border-start-0 ps-0"
                  placeholder="exemplo@ong.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  style={{ borderRadius: '0 6px 6px 0', boxShadow: 'none' }}
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="form-label text-muted small fw-bold uppercase">Senha</label>
              <div className="input-group">
                <span className="input-group-text bg-white border-end-0 text-muted">
                  <i className="bi bi-lock"></i>
                </span>
                <input
                  type="password"
                  className="form-control border-start-0 ps-0"
                  placeholder="••••••••"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  required
                  style={{ borderRadius: '0 6px 6px 0', boxShadow: 'none' }}
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn w-100 py-2 text-white shadow-sm fw-bold mb-3"
              style={{ backgroundColor: primaryColor, borderRadius: '8px', border: 'none' }}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Autenticando...
                </>
              ) : (
                'Entrar no Painel'
              )}
            </button>
          </form>

          {/* Link para voltar para o site público */}
          <div className="text-center mt-3">
            <Link to="/" className="text-decoration-none small text-muted">
              <i className="bi bi-arrow-left me-1"></i> Voltar para o Site Público
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}