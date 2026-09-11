import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API_BASE_URL from "../api/config";
import BackButton from "./BackButton";

const OPCOES_INTERESSES = ["Passeios", "Limpeza", "Eventos", "Resgates", "Outros"];
const DIAS_SEMANA = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"];
const TURNOS = ["Manhã", "Tarde", "Noite"];

export default function EditVoluntario() {
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

    const params = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        async function fetchData() {
            const id = params.id.toString();
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/voluntario/${id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                window.alert(`Erro ao buscar dados do voluntário: ${response.statusText}`);
                return;
            }

            const record = await response.json();
            setForm({
                nome: record.nome || "",
                email: record.email || "",
                ddd: record.ddd || "",
                telefone: record.telefone || "",
                cidade: record.cidade || "",
                estado: record.estado || "",
                interesses: Array.isArray(record.interesses) ? record.interesses : [],
                disponibilidade: Array.isArray(record.disponibilidade) ? record.disponibilidade : [],
                observacoes: record.observacoes || ""
            });
        }
        fetchData();
    }, [params.id]);

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
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/voluntario/update/${params.id}`, {
                method: "POST",
                headers: { 
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(form),
            });

            if (!response.ok) {
                window.alert(`Erro ao salvar alterações: ${response.statusText}`);
                return;
            }

            window.alert("Cadastro de voluntário atualizado com sucesso!");
            navigate("/voluntarios");
        } catch (error) {
            console.error("Erro na requisição:", error);
            window.alert("Não foi possível conectar ao servidor.");
        }
    }

    const primaryColor = '#3D2314';
    const labelStyle = { color: '#3D2314', fontWeight: '600', marginBottom: '6px' };
    const inputStyle = { borderRadius: '6px', border: '1px solid #ced4da' };

    return (
        <div className="container-fluid py-2">
            <BackButton destinoPadrao="/dashboard" />
            <div className="mt-3 mb-4">
                <h3 style={{ color: primaryColor, fontWeight: 'bold' }}>
                    <i className="bi bi-people-fill me-2"></i> Editar Cadastro de Voluntário
                </h3>
                <p className="text-muted mb-0">Atualize as informações do voluntário ativo</p>
            </div>

            <form onSubmit={onSubmit}>
                <div className="card border-0 shadow-sm p-4 mb-4" style={{ borderRadius: '8px' }}>
                    <h5 className="mb-4 pb-2 border-bottom text-muted text-uppercase small fw-bold" style={{ letterSpacing: '0.5px' }}>
                        Dados Cadastrais do Voluntário
                    </h5>

                    <div className="row">
                        <div className="form-group col-md-6 mb-3">
                            <label htmlFor="nome" style={labelStyle}>Nome Completo</label>
                            <input type="text" className="form-control px-3 py-2" id="nome" style={inputStyle} value={form.nome} onChange={(e) => updateForm({ nome: e.target.value })} required />
                        </div>
                        <div className="form-group col-md-6 mb-3">
                            <label htmlFor="email" style={labelStyle}>E-mail</label>
                            <input type="email" className="form-control px-3 py-2" id="email" style={inputStyle} value={form.email} onChange={(e) => updateForm({ email: e.target.value })} required />
                        </div>
                    </div>

                    <div className="row">
                        <div className="form-group col-md-2 mb-3">
                            <label htmlFor="ddd" style={labelStyle}>DDD</label>
                            <input type="text" className="form-control px-3 py-2" id="ddd" style={inputStyle} maxLength="2" placeholder="48" value={form.ddd} onChange={(e) => updateForm({ ddd: e.target.value.replace(/\D/g, "") })} />
                        </div>
                        <div className="form-group col-md-4 mb-3">
                            <label htmlFor="telefone" style={labelStyle}>Telefone</label>
                            <input type="text" className="form-control px-3 py-2" id="telefone" style={inputStyle} maxLength="10" placeholder="99999-9999" value={form.telefone} onChange={handleTelefoneChange} />
                        </div>
                        <div className="form-group col-md-4 mb-3">
                            <label htmlFor="cidade" style={labelStyle}>Cidade</label>
                            <input type="text" className="form-control px-3 py-2" id="cidade" style={inputStyle} value={form.cidade} onChange={(e) => updateForm({ cidade: e.target.value })} />
                        </div>
                        <div className="form-group col-md-2 mb-3">
                            <label htmlFor="estado" style={labelStyle}>UF</label>
                            <select className="form-select px-3 py-2" id="estado" style={inputStyle} value={form.estado} onChange={(e) => updateForm({ estado: e.target.value })} required>
                                <option value="">...</option>
                                <option value="AC">AC</option><option value="AL">AL</option><option value="AP">AP</option><option value="AM">AM</option><option value="BA">BA</option><option value="CE">CE</option><option value="DF">DF</option><option value="ES">ES</option><option value="GO">GO</option><option value="MA">MA</option><option value="MT">MT</option><option value="MS">MS</option><option value="MG">MG</option><option value="PA">PA</option><option value="PB">PB</option><option value="PR">PR</option><option value="PE">PE</option><option value="PI">PI</option><option value="RJ">RJ</option><option value="RN">RN</option><option value="RS">RS</option><option value="RO">RO</option><option value="RR">RR</option><option value="SC">SC</option><option value="SP">SP</option><option value="SE">SE</option><option value="TO">TO</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="card border-0 shadow-sm p-4 mb-4" style={{ borderRadius: '8px' }}>
                    <h5 className="mb-4 pb-2 border-bottom text-muted text-uppercase small fw-bold" style={{ letterSpacing: '0.5px' }}>
                        Áreas de Interesse
                    </h5>
                    <div className="d-flex flex-wrap gap-2">
                        {OPCOES_INTERESSES.map((opcao) => {
                            const ativo = form.interesses.includes(opcao);
                            return (
                                <label
                                    key={opcao}
                                    className="btn px-3 py-1"
                                    style={{
                                        backgroundColor: ativo ? primaryColor : '#FAF6F0',
                                        color: ativo ? '#fff' : primaryColor,
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
                </div>

                <div className="card border-0 shadow-sm p-4 mb-4" style={{ borderRadius: '8px' }}>
                    <h5 className="mb-4 pb-2 border-bottom text-muted text-uppercase small fw-bold" style={{ letterSpacing: '0.5px' }}>
                        Disponibilidade (dia da semana e horário)
                    </h5>
                    <div className="table-responsive">
                        <table className="table table-bordered align-middle text-center mb-0" style={{ borderRadius: '8px', overflow: 'hidden' }}>
                            <thead className="table-light">
                                <tr>
                                    <th className="text-start px-3" style={{ color: primaryColor, fontWeight: '600' }}>Dia</th>
                                    {TURNOS.map((turno) => (
                                        <th key={turno} style={{ color: primaryColor, fontWeight: '600' }}>{turno}</th>
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
                                                        style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: primaryColor }}
                                                    />
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="card border-0 shadow-sm p-4 mb-4" style={{ borderRadius: '8px' }}>
                    <h5 className="mb-4 pb-2 border-bottom text-muted text-uppercase small fw-bold" style={{ letterSpacing: '0.5px' }}>
                        Observações / Comentários
                    </h5>
                    <div className="form-group mb-2">
                        <label htmlFor="observacoes" style={labelStyle}>
                            Observações <span className="text-muted fw-normal">(opcional)</span>
                        </label>
                        <textarea
                            className="form-control px-3 py-2"
                            id="observacoes"
                            rows="4"
                            style={inputStyle}
                            value={form.observacoes}
                            onChange={(e) => updateForm({ observacoes: e.target.value })}
                            placeholder="Ex: restrições, disponibilidade especial, observações gerais..."
                        ></textarea>
                    </div>
                </div>

                <div className="form-group text-end mb-4">
                    <button type="submit" className="btn text-white px-5 py-2 shadow-sm" style={{ backgroundColor: primaryColor, borderRadius: '6px', fontSize: '1rem', fontWeight: '500' }}>
                        <i className="bi bi-check-lg me-2"></i> Salvar Alterações
                    </button>
                </div>
            </form>
        </div>
    );
}