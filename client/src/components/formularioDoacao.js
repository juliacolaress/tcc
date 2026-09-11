import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import cores from '../theme';
import API_BASE_URL from '../api/config';
import BackButton from './BackButton';

const TIPOS_MATERIAIS = ["Ração", "Medicamento", "Suprimentos", "Higiene", "Outros"];

const UFS = ["AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO"];

function FormularioDoacao() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const categoriaInicial = searchParams.get("tipo") === "material" ? "material" : "financeira";

  const [form, setForm] = useState({
    nome: "",
    email: "",
    ddd: "",
    telefone: "",
    cidade: "",
    estado: "",
    categoria: categoriaInicial,
    forma_pagamento: "Pix",
    item: "",
    quantidade: "",
    tipo_doacao: "Ração",
    valor: "",
    forma_entrega: ""
  });

  const [comprovante, setComprovante] = useState(null);
  const [nomeArquivo, setNomeArquivo] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState(false);

  function updateForm(value) {
    setForm((prev) => ({ ...prev, ...value }));
  }

  const handleTelefoneChange = (e) => {
    let val = e.target.value.replace(/\D/g, "");
    if (val.length > 5) {
      val = `${val.slice(0, 5)}-${val.slice(5, 9)}`;
    }
    updateForm({ telefone: val });
  };

  function trocarCategoria(categoria) {
    updateForm({ categoria });
    setErro("");
  }

  function reiniciarFormulario() {
    setForm((prev) => ({
      ...prev,
      valor: "",
      item: "",
      quantidade: "",
      forma_entrega: ""
    }));
    setComprovante(null);
    setNomeArquivo("");
    setErro("");
    setSucesso(false);
  }

  async function onSubmit(e) {
    e.preventDefault();
    setErro("");
    setSucesso(false);

    const valorNumerico = parseFloat(form.valor);
    if (form.categoria === "financeira" && (isNaN(valorNumerico) || valorNumerico <= 0)) {
      setErro("Informe um valor maior que zero para a doação financeira.");
      return;
    }

    if (comprovante && comprovante.size > 5 * 1024 * 1024) {
      setErro("O comprovante excede o limite de 5MB.");
      return;
    }

    setEnviando(true);
    try {
      const body = new FormData();
      body.append("nome", form.nome);
      body.append("email", form.email);
      body.append("ddd", form.ddd);
      body.append("telefone", form.telefone);
      body.append("cidade", form.cidade);
      body.append("estado", form.estado);
      body.append("categoria", form.categoria);
      if (form.categoria === "financeira") {
        body.append("valor", form.valor);
        body.append("forma_pagamento", form.forma_pagamento);
      } else {
        body.append("tipo_doacao", form.tipo_doacao);
        body.append("item", form.item);
        body.append("quantidade", form.quantidade);
        body.append("forma_entrega", form.forma_entrega);
      }
      if (comprovante) {
        body.append("comprovante", comprovante);
      }

      const response = await fetch(`${API_BASE_URL}/doacao/publica`, {
        method: "POST",
        body
      });

      if (!response.ok) {
        let mensagem = `Erro ao enviar sua doação. (HTTP ${response.status} ${response.statusText})`;
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
                <span className="nav-link text-white" style={{ cursor: 'pointer' }} onClick={() => navigate('/animais-adocao')}>
                  Animais para Adoção
                </span>
              </li>

              <li className="nav-item">
                <span className="nav-link text-white px-3 py-1 rounded-pill" style={{ backgroundColor: 'rgba(255,255,255,0.15)', fontWeight: '500', cursor: 'pointer' }} onClick={() => navigate('/solicitar-doacao')}>
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
        <BackButton destinoPadrao="/solicitar-doacao" />

        <div className="text-center mt-4 mb-5">
          <h1 className="fw-bold mb-3" style={{ color: cores.textoMarrom, fontSize: '3rem' }}>
            Registrar / Confirmar Doação
          </h1>
          <p className="fs-5 text-dark fw-light">
            Preencha o formulário abaixo para registrar sua contribuição. Nossa equipe analisará o comprovante e confirmará o recebimento.
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
              <h4 className="fw-bold mb-2" style={{ color: cores.textoMarrom }}>Doação enviada com sucesso!</h4>
              <p className="text-muted mb-1">
                Muito obrigado, <strong>{form.nome}</strong>! Sua doação foi registrada com o status <strong>Pendente</strong>.
              </p>
              <p className="text-muted mb-4">Nossa equipe analisará o comprovante e confirmará o recebimento em breve.</p>
              <div className="d-flex flex-wrap gap-3 justify-content-center">
                <button
                  className="btn text-white px-4 py-2 shadow-sm"
                  style={{ backgroundColor: cores.textoMarrom, borderRadius: '6px', border: 'none' }}
                  onClick={reiniciarFormulario}
                >
                  <i className="bi bi-heart-fill me-2"></i> Fazer outra doação
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
          ) : (
            <form onSubmit={onSubmit}>
              {cabecalhoSecao("Tipo de Doação")}

              <div className="d-flex flex-wrap gap-3 mb-3">
                <button
                  type="button"
                  className="btn px-4 py-2"
                  style={{
                    backgroundColor: form.categoria === "financeira" ? cores.textoMarrom : '#FAF6F0',
                    color: form.categoria === "financeira" ? '#fff' : cores.textoMarrom,
                    border: form.categoria === "financeira" ? '1px solid transparent' : '1px solid #eadfcf',
                    borderRadius: '20px',
                    fontWeight: '600'
                  }}
                  onClick={() => trocarCategoria("financeira")}
                >
                  <i className="bi bi-cash-coin me-2"></i> Financeira (PIX)
                </button>
                <button
                  type="button"
                  className="btn px-4 py-2"
                  style={{
                    backgroundColor: form.categoria === "material" ? cores.textoMarrom : '#FAF6F0',
                    color: form.categoria === "material" ? '#fff' : cores.textoMarrom,
                    border: form.categoria === "material" ? '1px solid transparent' : '1px solid #eadfcf',
                    borderRadius: '20px',
                    fontWeight: '600'
                  }}
                  onClick={() => trocarCategoria("material")}
                >
                  <i className="bi bi-box-seam me-2"></i> Material
                </button>
              </div>

              {form.categoria === "financeira" && (
                <div className="alert alert-light border py-2 px-3 d-flex align-items-center gap-2 mb-3" role="alert" style={{ backgroundColor: '#FAF6F0', borderColor: '#eadfcf' }}>
                  <i className="bi bi-info-circle-fill" style={{ color: cores.marromClaro }}></i>
                  <small className="text-dark">
                    Use a chave PIX ou o QR Code da página de Doações para fazer a transferência e depois anexe o comprovante.
                  </small>
                </div>
              )}

              {cabecalhoSecao("Dados do Doador")}

              <div className="row">
                <div className="form-group col-md-6 mb-3">
                  <label htmlFor="nome" className="fw-semibold mb-1" style={{ color: cores.textoMarrom }}>Nome Completo</label>
                  <input type="text" className="form-control px-3 py-2" id="nome" style={inputStyle} value={form.nome} onChange={(e) => updateForm({ nome: e.target.value })} placeholder="Ex: Lucas Mendes" required />
                </div>
                <div className="form-group col-md-6 mb-3">
                  <label htmlFor="email" className="fw-semibold mb-1" style={{ color: cores.textoMarrom }}>E-mail</label>
                  <input type="email" className="form-control px-3 py-2" id="email" style={inputStyle} value={form.email} onChange={(e) => updateForm({ email: e.target.value })} placeholder="Ex: lucas@email.com" required />
                </div>
              </div>

              <div className="row">
                <div className="form-group col-md-2 mb-3">
                  <label htmlFor="ddd" className="fw-semibold mb-1" style={{ color: cores.textoMarrom }}>DDD</label>
                  <input type="text" className="form-control px-3 py-2" id="ddd" style={inputStyle} maxLength="2" placeholder="48" value={form.ddd} onChange={(e) => updateForm({ ddd: e.target.value.replace(/\D/g, "") })} />
                </div>
                <div className="form-group col-md-4 mb-3">
                  <label htmlFor="telefone" className="fw-semibold mb-1" style={{ color: cores.textoMarrom }}>Telefone</label>
                  <input type="text" className="form-control px-3 py-2" id="telefone" style={inputStyle} maxLength="10" placeholder="99999-9999" value={form.telefone} onChange={handleTelefoneChange} />
                </div>
                <div className="form-group col-md-4 mb-3">
                  <label htmlFor="cidade" className="fw-semibold mb-1" style={{ color: cores.textoMarrom }}>Cidade</label>
                  <input type="text" className="form-control px-3 py-2" id="cidade" style={inputStyle} value={form.cidade} onChange={(e) => updateForm({ cidade: e.target.value })} placeholder="Ex: Araranguá" />
                </div>
                <div className="form-group col-md-2 mb-3">
                  <label htmlFor="estado" className="fw-semibold mb-1" style={{ color: cores.textoMarrom }}>UF</label>
                  <select className="form-select px-3 py-2" id="estado" style={inputStyle} value={form.estado} onChange={(e) => updateForm({ estado: e.target.value })} required>
                    <option value="">...</option>
                    {UFS.map((uf) => (
                      <option key={uf} value={uf}>{uf}</option>
                    ))}
                  </select>
                </div>
              </div>

              {cabecalhoSecao("Detalhes da Doação")}

              {form.categoria === "financeira" ? (
                <div className="row">
                  <div className="form-group col-md-6 mb-3">
                    <label htmlFor="forma_pagamento" className="fw-semibold mb-1" style={{ color: cores.textoMarrom }}>Forma de Pagamento</label>
                    <select className="form-select px-3 py-2" id="forma_pagamento" style={inputStyle} value={form.forma_pagamento} onChange={(e) => updateForm({ forma_pagamento: e.target.value })}>
                      <option value="Pix">Pix</option>
                      <option value="Dinheiro">Dinheiro</option>
                      <option value="Cartão">Cartão</option>
                      <option value="Outro">Outro</option>
                    </select>
                  </div>
                  <div className="form-group col-md-6 mb-3">
                    <label htmlFor="valor" className="fw-semibold mb-1" style={{ color: cores.textoMarrom }}>Valor (R$)</label>
                    <input type="number" className="form-control px-3 py-2" id="valor" style={inputStyle} value={form.valor} onChange={(e) => updateForm({ valor: e.target.value })} placeholder="0.00" step="0.01" min="0.01" required />
                  </div>
                </div>
              ) : (
                <div className="row">
                  <div className="form-group col-md-6 mb-3">
                    <label htmlFor="tipo_doacao" className="fw-semibold mb-1" style={{ color: cores.textoMarrom }}>Tipo de Item</label>
                    <select className="form-select px-3 py-2" id="tipo_doacao" style={inputStyle} value={form.tipo_doacao} onChange={(e) => updateForm({ tipo_doacao: e.target.value })} required>
                      {TIPOS_MATERIAIS.map((tipo) => (
                        <option key={tipo} value={tipo}>{tipo}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group col-md-6 mb-3">
                    <label htmlFor="quantidade" className="fw-semibold mb-1" style={{ color: cores.textoMarrom }}>Quantidade</label>
                    <input type="text" className="form-control px-3 py-2" id="quantidade" style={inputStyle} value={form.quantidade} onChange={(e) => updateForm({ quantidade: e.target.value })} placeholder="Ex: 2 sacos de 15kg / 3 caixas" />
                  </div>
                  <div className="form-group col-md-12 mb-3">
                    <label htmlFor="item" className="fw-semibold mb-1" style={{ color: cores.textoMarrom }}>Descrição dos Itens</label>
                    <input type="text" className="form-control px-3 py-2" id="item" style={inputStyle} value={form.item} onChange={(e) => updateForm({ item: e.target.value })} placeholder="Ex: Ração para Cão Adulto 15kg" required />
                  </div>
                  <div className="form-group col-md-12 mb-3">
                    <label htmlFor="forma_entrega" className="fw-semibold mb-1" style={{ color: cores.textoMarrom }}>Entrega / Coleta</label>
                    <input type="text" className="form-control px-3 py-2" id="forma_entrega" style={inputStyle} value={form.forma_entrega} onChange={(e) => updateForm({ forma_entrega: e.target.value })} placeholder="Ex: Deixei na sede / Buscar no local" />
                  </div>
                </div>
              )}

              {cabecalhoSecao("Comprovante")}

              <div className="form-group mb-4">
                <div className="input-group">
                  <span className="input-group-text bg-white px-3 text-muted">
                    <i className="bi bi-paperclip"></i>
                  </span>
                  <input
                    type="file"
                    className="form-control py-2"
                    id="comprovante"
                    accept="image/jpeg,image/png,image/gif,image/webp,application/pdf"
                    style={inputStyle}
                    onChange={(e) => {
                      const arquivo = e.target.files[0] || null;
                      setComprovante(arquivo);
                      setNomeArquivo(arquivo ? arquivo.name : "");
                    }}
                  />
                </div>
                {nomeArquivo && (
                  <small className="text-muted d-flex align-items-center gap-2 mt-1">
                    <i className="bi bi-file-earmark-check" style={{ color: '#2f8f46' }}></i> {nomeArquivo}
                  </small>
                )}
                <small className="text-muted d-block mt-1">
                  {form.categoria === "financeira"
                    ? "Anexe o comprovante do PIX (imagem ou PDF, até 5MB)."
                    : "Opcional: anexe uma foto do item doado (imagem ou PDF, até 5MB)."}
                </small>
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
                      <i className="bi bi-heart-fill me-2"></i> Enviar Doação
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

export default FormularioDoacao;