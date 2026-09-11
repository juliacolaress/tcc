import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import cores from '../theme';
import API_BASE_URL from '../api/config';
import BackButton from './BackButton';
import { normalizeFotos, aoErrarImagem } from '../utils/fotos';

const VALOR_PADRAO = {
  nome: "",
  email: "",
  data_nascimento: "",
  telefone: "",
  cpf: "",
  rua: "",
  numero: "",
  bairro: "",
  cidade: ""
};

function mascaraTelefone(valor) {
  let limpo = valor.replace(/\D/g, "").slice(0, 10);
  if (limpo.length > 6) limpo = `${limpo.slice(0, 5)}-${limpo.slice(5, 10)}`;
  return limpo;
}

function mascaraCpf(valor) {
  const limpo = valor.replace(/\D/g, "").slice(0, 11);
  if (limpo.length > 9) return `${limpo.slice(0, 3)}.${limpo.slice(3, 6)}.${limpo.slice(6, 9)}-${limpo.slice(9, 11)}`;
  if (limpo.length > 6) return `${limpo.slice(0, 3)}.${limpo.slice(3, 6)}.${limpo.slice(6, 9)}`;
  if (limpo.length > 3) return `${limpo.slice(0, 3)}.${limpo.slice(3, 6)}`;
  return limpo;
}

function FormularioAdocao() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const animalId = searchParams.get("id");

  const [animal, setAnimal] = useState(null);
  const [carregandoAnimal, setCarregandoAnimal] = useState(true);
  const [erroAnimal, setErroAnimal] = useState("");

  const [form, setForm] = useState(VALOR_PADRAO);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState(false);

  useEffect(() => {
    let ativo = true;
    async function carregarAnimal() {
      if (!animalId) {
        setErroAnimal("Animal não identificado. Volte para a página de adoção e tente novamente.");
        setCarregandoAnimal(false);
        return;
      }
      try {
        const response = await fetch(`${API_BASE_URL}/animal/${animalId}`);
        if (!response.ok) throw new Error(response.statusText);
        const data = await response.json();
        if (ativo) {
          if (data.status === "Adotado") {
            setErroAnimal("Este animal já foi adotado. Que tal escolher outro amigo para adoção?");
          } else {
            setAnimal(data);
          }
        }
      } catch (error) {
        console.error("Erro ao carregar animal:", error);
        if (ativo) setErroAnimal("Não foi possível carregar os dados do animal. Volte e tente novamente.");
      } finally {
        if (ativo) setCarregandoAnimal(false);
      }
    }
    carregarAnimal();
    return () => { ativo = false; };
  }, [animalId]);

  function updateForm(value) {
    setForm((prev) => ({ ...prev, ...value }));
  }

  async function onSubmit(e) {
    e.preventDefault();
    setErro("");
    setSucesso(false);
    setEnviando(true);
    try {
      const response = await fetch(`${API_BASE_URL}/animal/${animalId}/adotar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });

      if (!response.ok) {
        let mensagem = `Erro ao registrar sua adoção. (HTTP ${response.status} ${response.statusText})`;
        try {
          const data = await response.json();
          if (data && data.mensagem) mensagem = data.mensagem;
        } catch (err) {
        }
        setErro(mensagem);
        return;
      }

      setSucesso(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      console.error("Erro na requisição:", error);
      setErro("Não foi possível conectar ao servidor. Tente novamente mais tarde.");
    } finally {
      setEnviando(false);
    }
  }

  const inputStyle = { borderRadius: '6px', border: '1px solid #ced4da' };

  const cabecalhoSecao = (titulo) => (
    <h5 className="mt-4 mb-3 pb-2 border-bottom text-muted text-uppercase small fw-bold" style={{ letterSpacing: '0.5px', color: cores.textoMarrom }}>
      {titulo}
    </h5>
  );

  return (
    <div style={{ fontFamily: 'Poppins, sans-serif', backgroundColor: cores.cremeFundo, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

      <nav className="navbar navbar-expand-lg navbar-dark p-3" style={{ backgroundColor: cores.marromMenu }}>
        <div className="container d-flex justify-content-between align-items-center">
          <span className="navbar-brand fw-bold d-flex align-items-center fs-4" style={{ cursor: 'pointer' }} onClick={() => navigate('/')}>
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
                <span className="nav-link text-white px-3 py-1 rounded-pill" style={{ backgroundColor: 'rgba(255,255,255,0.15)', fontWeight: '500', cursor: 'pointer' }} onClick={() => navigate('/animais-adocao')}>
                  Animais para Adoção
                </span>
              </li>

              <li className="nav-item">
                <span className="nav-link text-white" style={{ cursor: 'pointer' }} onClick={() => navigate('/solicitar-doacao')}>
                  Doações
                </span>
              </li>

              <li className="nav-item">
                <span className="nav-link text-white" style={{ cursor: 'pointer' }} onClick={() => navigate('/eventos')}>
                  Eventos
                </span>
              </li>

              <li className="nav-item">
                <span className="nav-link text-white" style={{ cursor: 'pointer' }} onClick={() => navigate('/transparencia')}>
                  Transparência
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

      <div className="container py-5 flex-grow-1">
        <BackButton destinoPadrao="/animais-adocao" />

        <div className="text-center mt-4 mb-5">
          <h1 className="fw-bold mb-3" style={{ color: cores.textoMarrom, fontSize: '3rem' }}>
            Questionário de Adoção
          </h1>
          <p className="fs-5 text-dark fw-light">
            Ficamos felizes com sua decisão de adotar um pet! Preencha o formulário abaixo para iniciar o processo de adoção responsável da nossa ONG.
          </p>
        </div>

        <div className="card border-0 shadow-sm p-4 p-md-5 mx-auto" style={{ borderRadius: '12px', maxWidth: '900px', backgroundColor: '#fff' }}>
          {sucesso ? (
            <div className="text-center py-4">
              <div className="mb-3 d-flex justify-content-center">
                <div style={{ backgroundColor: '#e8f5e9', borderRadius: '50%', width: '90px', height: '90px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <i className="bi bi-check-circle-fill" style={{ color: '#2f8f46', fontSize: '2.8rem' }}></i>
                </div>
              </div>
              <h4 className="fw-bold mb-2" style={{ color: cores.textoMarrom }}>Solicitação registrada com sucesso!</h4>
              <p className="text-muted mb-1">
                Muito obrigado, <strong>{form.nome}</strong>! Sua solicitação de adoção do <strong>{animal?.nome || "pet"}</strong> foi recebida.
              </p>
              <p className="text-muted mb-4">Nossa equipe entrará em contato em breve para dar continuidade ao processo de adoção responsável.</p>
              <div className="d-flex flex-wrap gap-3 justify-content-center">
                <button
                  className="btn text-white px-4 py-2 shadow-sm"
                  style={{ backgroundColor: cores.textoMarrom, borderRadius: '6px', border: 'none' }}
                  onClick={() => navigate('/animais-adocao')}
                >
                  <i className="bi bi-heart-fill me-2"></i> Ver outros animais
                </button>
                <button
                  className="btn btn-outline-secondary px-4 py-2 d-inline-flex align-items-center"
                  style={{ borderRadius: '6px' }}
                  onClick={() => navigate('/')}
                >
                  <i className="bi bi-house-heart-fill me-2"></i> Voltar ao Início
                </button>
              </div>
            </div>
          ) : carregandoAnimal || erroAnimal ? (
            <div className="text-center py-5">
              {carregandoAnimal ? (
                <>
                  <div className="spinner-border mb-3" style={{ color: cores.textoMarrom }} role="status"></div>
                  <p className="text-muted">Carregando dados do animal...</p>
                </>
              ) : (
                <>
                  <i className="bi bi-emoji-frown fs-1 d-block mb-3" style={{ color: cores.marromMedio }}></i>
                  <p className="fs-5 text-dark fw-medium">{erroAnimal}</p>
                  <button
                    className="btn text-white px-4 py-2 mt-2"
                    style={{ backgroundColor: cores.textoMarrom, borderRadius: '6px', border: 'none' }}
                    onClick={() => navigate('/animais-adocao')}
                  >
                    <i className="bi bi-paw me-2"></i> Voltar aos Animais
                  </button>
                </>
              )}
            </div>
          ) : (
            <form onSubmit={onSubmit}>
              {cabecalhoSecao("Dados do Animal")}

              <div className="d-flex flex-wrap align-items-center gap-3 p-3 rounded-3" style={{ backgroundColor: '#FAF6F0', border: '1px solid #eadfcf' }}>
                {normalizeFotos(animal).length > 0 ? (
                  <img
                    src={normalizeFotos(animal)[0]}
                    alt={animal.nome}
                    style={{ width: '70px', height: '70px', objectFit: 'cover', borderRadius: '10px', border: '1px solid #eadfcf' }}
                    onError={aoErrarImagem}
                  />
                ) : (
                  <div className="d-flex align-items-center justify-content-center" style={{ width: '70px', height: '70px', borderRadius: '10px', backgroundColor: '#fff', border: '1px solid #eadfcf' }}>
                    <i className="bi bi-paw-fill" style={{ color: cores.marromMedio, fontSize: '1.5rem' }}></i>
                  </div>
                )}
                <div className="text-start">
                  <p className="mb-0 fw-bold fs-5" style={{ color: cores.textoMarrom }}>{animal.nome}</p>
                  <p className="mb-0 text-muted small">
                    {animal.especie || "Animal"}{animal.raca ? ` • ${animal.raca}` : ""} • {animal.genero === "M" ? "macho" : "fêmea"} • porte {animal.porte ? animal.porte.toLowerCase() : "médio"}
                  </p>
                </div>
              </div>

              {cabecalhoSecao("Dados Pessoais")}

              <div className="row">
                <div className="form-group col-md-6 mb-3">
                  <label htmlFor="nome" className="fw-semibold mb-1" style={{ color: cores.textoMarrom }}>Nome Completo</label>
                  <input type="text" className="form-control px-3 py-2" id="nome" style={inputStyle} value={form.nome} onChange={(e) => updateForm({ nome: e.target.value })} placeholder="Ex: Maria Silva" required />
                </div>
                <div className="form-group col-md-6 mb-3">
                  <label htmlFor="email" className="fw-semibold mb-1" style={{ color: cores.textoMarrom }}>E-mail</label>
                  <input type="email" className="form-control px-3 py-2" id="email" style={inputStyle} value={form.email} onChange={(e) => updateForm({ email: e.target.value })} placeholder="Ex: maria@email.com" required />
                </div>
              </div>

              <div className="row">
                <div className="form-group col-md-4 mb-3">
                  <label htmlFor="data_nascimento" className="fw-semibold mb-1" style={{ color: cores.textoMarrom }}>Data de Nascimento</label>
                  <input type="date" className="form-control px-3 py-2" id="data_nascimento" style={inputStyle} value={form.data_nascimento} onChange={(e) => updateForm({ data_nascimento: e.target.value })} required />
                </div>
                <div className="form-group col-md-4 mb-3">
                  <label htmlFor="telefone" className="fw-semibold mb-1" style={{ color: cores.textoMarrom }}>Telefone / WhatsApp</label>
                  <input type="tel" className="form-control px-3 py-2" id="telefone" style={inputStyle} maxLength="10" placeholder="(48) 99999-9999" value={form.telefone} onChange={(e) => updateForm({ telefone: mascaraTelefone(e.target.value) })} required />
                </div>
                <div className="form-group col-md-4 mb-3">
                  <label htmlFor="cpf" className="fw-semibold mb-1" style={{ color: cores.textoMarrom }}>CPF</label>
                  <input type="text" className="form-control px-3 py-2" id="cpf" style={inputStyle} maxLength="14" placeholder="000.000.000-00" value={form.cpf} onChange={(e) => updateForm({ cpf: mascaraCpf(e.target.value) })} required />
                </div>
              </div>

              {cabecalhoSecao("Endereço")}

              <div className="row">
                <div className="form-group col-md-8 mb-3">
                  <label htmlFor="rua" className="fw-semibold mb-1" style={{ color: cores.textoMarrom }}>Rua</label>
                  <input type="text" className="form-control px-3 py-2" id="rua" style={inputStyle} value={form.rua} onChange={(e) => updateForm({ rua: e.target.value })} placeholder="Ex: Rua das Flores" required />
                </div>
                <div className="form-group col-md-4 mb-3">
                  <label htmlFor="numero" className="fw-semibold mb-1" style={{ color: cores.textoMarrom }}>Número</label>
                  <input type="text" className="form-control px-3 py-2" id="numero" style={inputStyle} value={form.numero} onChange={(e) => updateForm({ numero: e.target.value })} placeholder="Ex: 123" required />
                </div>
              </div>

              <div className="row">
                <div className="form-group col-md-6 mb-3">
                  <label htmlFor="bairro" className="fw-semibold mb-1" style={{ color: cores.textoMarrom }}>Bairro</label>
                  <input type="text" className="form-control px-3 py-2" id="bairro" style={inputStyle} value={form.bairro} onChange={(e) => updateForm({ bairro: e.target.value })} placeholder="Ex: Centro" required />
                </div>
                <div className="form-group col-md-6 mb-3">
                  <label htmlFor="cidade" className="fw-semibold mb-1" style={{ color: cores.textoMarrom }}>Cidade</label>
                  <input type="text" className="form-control px-3 py-2" id="cidade" style={inputStyle} value={form.cidade} onChange={(e) => updateForm({ cidade: e.target.value })} placeholder="Ex: Sombrio" required />
                </div>
              </div>

              {erro && (
                <div className="alert alert-danger py-2" role="alert">
                  <i className="bi bi-exclamation-triangle me-2"></i> {erro}
                </div>
              )}

              <div className="text-end">
                <button type="submit" className="btn text-white px-5 py-2 shadow-sm" style={{ backgroundColor: cores.btnDoe, borderRadius: '6px', fontSize: '1rem', fontWeight: '500', border: 'none' }} disabled={enviando}>
                  {enviando ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status"></span> Enviando...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-heart-fill me-2"></i> Enviar Solicitação de Adoção
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

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

export default FormularioAdocao;