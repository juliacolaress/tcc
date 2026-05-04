import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const REACT_APP_YOUR_HOSTNAME = 'http://localhost:5050';

export default function CreateVoluntario() {
    // Estado inicial totalmente vazio para um novo cadastro
    const [form, setForm] = useState({
        nome: "",
        email: "",
        ddd: "",
        telefone: "",
        cidade: "",
        estado: "",
        dias_disponiveis: [], 
        horario: "",
        area_interesse: "",
        observacoes: ""
    });

    const navigate = useNavigate();

    // Atualiza o estado do formulário
    function updateForm(value) {
        setForm((prev) => ({ ...prev, ...value }));
    }

    // Lógica para os Checkboxes (Dias da Semana)
    const handleCheckboxChange = (dia) => {
        const { dias_disponiveis } = form;
        if (dias_disponiveis.includes(dia)) {
            updateForm({ dias_disponiveis: dias_disponiveis.filter(d => d !== dia) });
        } else {
            updateForm({ dias_disponiveis: [...dias_disponiveis, dia] });
        }
    };

    async function onSubmit(e) {
        e.preventDefault();
        
        // Enviamos para a rota de criação (/voluntario/add) usando POST
        const response = await fetch(`${REACT_APP_YOUR_HOSTNAME}/voluntario/add`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(form)
        });

        if (response.ok) {
            window.alert("Voluntário cadastrado com sucesso!");
            setForm({ nome: "", email: "", ddd: "", telefone: "", cidade: "", estado: "", dias_disponiveis: [], horario: "", area_interesse: "", observacoes: "" });
            navigate("/voluntarios");
        } else {
            window.alert("Erro ao cadastrar voluntário.");
        }
    }

    return (
        <div className="container mt-4 mb-5">
            <h3>Cadastrar Novo Voluntário</h3>
            <hr />
            <form onSubmit={onSubmit}>
                <div className="row">
                    <div className="form-group col-md-6 mb-3">
                        <label>Nome Completo</label>
                        <input type="text" className="form-control" placeholder="Digite o nome" value={form.nome} onChange={(e) => updateForm({ nome: e.target.value })} required />
                    </div>
                    <div className="form-group col-md-6 mb-3">
                        <label>E-mail</label>
                        <input type="email" className="form-control" placeholder="exemplo@email.com" value={form.email} onChange={(e) => updateForm({ email: e.target.value })} required />
                    </div>
                </div>

                <div className="row">
                    <div className="form-group col-md-2 mb-3">
                        <label>DDD</label>
                        <input type="text" className="form-control" maxLength="2" value={form.ddd} onChange={(e) => updateForm({ ddd: e.target.value.replace(/\D/g, "") })} />
                    </div>
                    <div className="form-group col-md-4 mb-3">
                        <label>Telefone</label>
                        <input type="text" className="form-control" value={form.telefone} onChange={(e) => updateForm({ telefone: e.target.value })} />
                    </div>
                    <div className="form-group col-md-4 mb-3">
                        <label>Cidade</label>
                        <input type="text" className="form-control" value={form.cidade} onChange={(e) => updateForm({ cidade: e.target.value })} />
                    </div>
                    <div className="form-group col-md-2 mb-3">
                        <label>Estado</label>
                        <input type="text" className="form-control" value={form.estado} onChange={(e) => updateForm({ estado: e.target.value })} />
                    </div>
                </div>

                <hr />

                <div className="mb-3">
                    <label className="d-block mb-2"><strong>Disponibilidade de dias da semana:</strong></label>
                    {["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"].map(dia => (
                        <div key={dia} className="form-check form-check-inline">
                            <input 
                                className="form-check-input" 
                                type="checkbox" 
                                checked={form.dias_disponiveis.includes(dia)} 
                                onChange={() => handleCheckboxChange(dia)} 
                            />
                            <label className="form-check-label">{dia}</label>
                        </div>
                    ))}
                </div>

                <div className="row">
                    <div className="form-group col-md-6 mb-3">
                        <label>Horário</label>
                        <select className="form-control" value={form.horario} onChange={(e) => updateForm({ horario: e.target.value })}>
                            <option value="">Selecione...</option>
                            <option value="Manhã">Manhã (08h às 12h)</option>
                            <option value="Tarde">Tarde (14h às 18h)</option>
                            <option value="Noite">Noite (18h às 20h)</option>
                        </select>
                    </div>
                    <div className="form-group col-md-6 mb-3">
                        <label>Área de Interesse</label>
                        <select className="form-control" value={form.area_interesse} onChange={(e) => updateForm({ area_interesse: e.target.value })}>
                            <option value="">Selecione...</option>
                            <option value="Cuidados">Cuidados com animais</option>
                            <option value="Eventos">Eventos e campanhas</option>
                            <option value="Divulgação">Divulgação e redes sociais</option>
                            <option value="Outros">Outros</option>
                        </select>
                    </div>
                </div>

                <div className="form-group mb-3">
                    <label>Observações Gerais</label>
                    <textarea className="form-control" rows="3" value={form.observacoes} onChange={(e) => updateForm({ observacoes: e.target.value })}></textarea>
                </div>

                <div className="form-group mt-4">
                    <input type="submit" value="Salvar Cadastro" className="btn btn-primary" />
                    <button type="button" className="btn btn-secondary ms-2" onClick={() => navigate("/voluntarios")}>Voltar</button>
                </div>
            </form>
        </div>
    );
}