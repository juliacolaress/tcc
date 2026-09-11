import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import cores from './theme';
import API_BASE_URL from './api/config';
import BackButton from './components/BackButton';

const OPCOES_INTERESSES = ["Passeios", "Limpeza", "Eventos", "Resgates", "Outros"];
const DIAS_SEMANA = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"];
const TURNOS = ["Manhã", "Tarde", "Noite"];

function SejaVoluntario() {
  const navigate = useNavigate();
  const [dropdownDoacoes, setDropdownDoacoes] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState("");

  const [form, setForm] = useState({
    nome: "",
    email: "",
    ddd: "",
    telefone: "",
    cidade: "",
    estado: "",
    interesses: [],
    disponibilidade: [],
    observacoes: ""
  });

  function updateForm(value) {
    setForm((prev) => ({ ...prev, ...value }));
  }

  function toggleInteresse(interesse) {
    const atuais = form.interesses.includes(interesse)
      ? form.interesses.filter((i) => i !== interesse)
      : [...form.interesses, interesse];
    updateForm({ interesses: atuais });
  }

  function toggleDisponibilidade(dia, horario) {
    const jaExiste = form.disponibilidade.some((d) => d.dia === dia && d.horario === horario);
    const atualizada = jaExiste
      ? form.disponibilidade.filter((d) => !(d.dia === dia && d.horario === horario))
      : [...form.disponibilidade, { dia, horario }];
    updateForm({ disponibilidade: atualizada });
  }

  const handleTelefoneChange = (e) => {
    let val = e.target.value.replace(/\D/g, "");
    if (val.length > 5) {
      val = `${val.slice(0, 5)}-${val.slice(5, 9)}`;
    }
    updateForm({ telefone: val });
  };

  async function onSubmit(e) {
    e.preventDefault();
    setErro("");
    setEnviando(true);
    try {
      const response = await fetch(`${API_BASE_URL}/voluntario/public/add`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });

      if (!response.ok) {
        let mensagem = `Erro ao enviar sua solicitação. (HTTP ${response.status} ${response.statusText})`;
        try {
          const data = await response.json();
          if (data && data.mensagem) mensagem = data.mensagem;
        } catch (err) {
          // resposta não é JSON
        }
        setErro(mensagem);
        return;
      }

      window.alert("Inscrição enviada com sucesso! Nossa equipe analisará sua solicitação.");
      navigate("/");
    } catch (error) {
      console.error("Erro na requisição:", error);
      setErro("Não foi possível conectar ao servidor. Tente novamente mais tarde.");
    } finally {
      setEnviando(false);
    }
  }

  const inputStyle = { borderRadius: '6px', border: '1px solid #ced4da' };

  return (
    <div style={{ fontFamily: 'Poppins, sans-serif', backgroundColor: cores.cremeFundo, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

      {/* 1. NAVBAR SUPERIOR */}
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

      {/* 2. CORPO DA PÁGINA */}
      <div className="container py-5 flex-grow-1" onClick={() => setDropdownDoacoes(false)}>
        <BackButton destinoPadrao="/" />
        <div className="text-center mt-4 mb-5">
          <h1 className="fw-bold mb-3" style={{ color: cores.textoMarrom, fontSize: '3rem' }}>
            Seja um Voluntário
          </h1>
          <p className="fs-5 text-dark fw-light">
            Preencha o formulário abaixo e nossa equipe entrará em contato após analisar sua solicitação.
          </p>
        </div>

        <div className="card border-0 shadow-sm p-4 p-md-5 mx-auto" style={{ borderRadius: '12px', maxWidth: '900px', backgroundColor: '#fff' }}>
          <form onSubmit={onSubmit}>
            <h5 className="mb-4 pb-2 border-bottom text-muted text-uppercase small fw-bold" style={{ letterSpacing: '0.5px', color: cores.textoMarrom }}>
              Dados Cadastrais
            </h5>

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
                  <option value="AC">AC</option><option value="AL">AL</option><option value="AP">AP</option><option value="AM">AM</option><option value="BA">BA</option><option value="CE">CE</option><option value="DF">DF</option><option value="ES">ES</option><option value="GO">GO</option><option value="MA">MA</option><option value="MT">MT</option><option value="MS">MS</option><option value="MG">MG</option><option value="PA">PA</option><option value="PB">PB</option><option value="PR">PR</option><option value="PE">PE</option><option value="PI">PI</option><option value="RJ">RJ</option><option value="RN">RN</option><option value="RS">RS</option><option value="RO">RO</option><option value="RR">RR</option><option value="SC">SC</option><option value="SP">SP</option><option value="SE">SE</option><option value="TO">TO</option>
                </select>
              </div>
            </div>

            <h5 className="mt-4 mb-3 pb-2 border-bottom text-muted text-uppercase small fw-bold" style={{ letterSpacing: '0.5px', color: cores.textoMarrom }}>
              Áreas de Interesse
            </h5>
            <div className="d-flex flex-wrap gap-2 mb-4">
              {OPCOES_INTERESSES.map((opcao) => {
                const ativo = form.interesses.includes(opcao);
                return (
                  <label
                    key={opcao}
                    className="btn px-3 py-1"
                    style={{
                      backgroundColor: ativo ? cores.textoMarrom : '#fdf7f2',
                      color: ativo ? '#fff' : cores.textoMarrom,
                      border: ativo ? '1px solid transparent' : '1px solid #eadfcf',
                      borderRadius: '20px',
                      cursor: 'pointer',
                      fontWeight: '500'
                    }}
                  >
                    <input type="checkbox" className="d-none" checked={ativo} onChange={() => toggleInteresse(opcao)} />
                    {opcao}
                  </label>
                );
              })}
            </div>

            <h5 className="mt-4 mb-3 pb-2 border-bottom text-muted text-uppercase small fw-bold" style={{ letterSpacing: '0.5px', color: cores.textoMarrom }}>
              Disponibilidade (dia da semana e horário)
            </h5>
            <div className="table-responsive mb-4">
              <table className="table table-bordered align-middle text-center mb-0" style={{ borderRadius: '8px', overflow: 'hidden' }}>
                <thead className="table-light">
                  <tr>
                    <th className="text-start px-3" style={{ color: cores.textoMarrom, fontWeight: '600' }}>Dia</th>
                    {TURNOS.map((turno) => (
                      <th key={turno} style={{ color: cores.textoMarrom, fontWeight: '600' }}>{turno}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {DIAS_SEMANA.map((dia) => (
                    <tr key={dia}>
                      <td className="text-start fw-semibold text-muted px-3">{dia}</td>
                      {TURNOS.map((turno) => {
                        const ativo = form.disponibilidade.some((d) => d.dia === dia && d.horario === turno);
                        return (
                          <td key={turno} className="p-1">
                            <input
                              type="checkbox"
                              checked={ativo}
                              onChange={() => toggleDisponibilidade(dia, turno)}
                              style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: cores.textoMarrom }}
                            />
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <h5 className="mt-4 mb-3 pb-2 border-bottom text-muted text-uppercase small fw-bold" style={{ letterSpacing: '0.5px', color: cores.textoMarrom }}>
              Observações / Comentários
            </h5>
            <div className="form-group mb-4">
              <label htmlFor="observacoes" className="fw-semibold mb-1" style={{ color: cores.textoMarrom }}>
                Observações <span className="text-muted fw-normal">(opcional)</span>
              </label>
              <textarea
                className="form-control px-3 py-2"
                id="observacoes"
                rows="4"
                style={inputStyle}
                value={form.observacoes}
                onChange={(e) => updateForm({ observacoes: e.target.value })}
                placeholder="Ex: disponível apenas aos finais de semana, restrições de mobilidade, experiências anteriores..."
              ></textarea>
            </div>

            {erro && (
              <div className="alert alert-danger py-2" role="alert">
                <i className="bi bi-exclamation-triangle me-2"></i> {erro}
              </div>
            )}

            <div className="text-end">
              <button type="submit" className="btn text-white px-5 py-2 shadow-sm" style={{ backgroundColor: cores.btnVoluntario, borderRadius: '6px', fontSize: '1rem', fontWeight: '500', border: 'none' }} disabled={enviando}>
                {enviando ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status"></span> Enviando...
                  </>
                ) : (
                  <>
                    <i className="bi bi-check-lg me-2"></i> Enviar Inscrição
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* 3. RODAPÉ OFICIAL */}
      <footer className="text-white py-4 mt-auto" style={{ backgroundColor: cores.rodapeMarrom, fontSize: '0.9rem', borderTop: '4px solid #aa7a44' }}>
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

export default SejaVoluntario;
