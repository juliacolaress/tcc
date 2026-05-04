import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

const REACT_APP_YOUR_HOSTNAME = 'http://localhost:5050';

export default function EditVoluntario() {
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

    const params = useParams();
    const navigate = useNavigate();

    // 1. CARREGA OS DADOS DO VOLUNTÁRIO AO ABRIR A PÁGINA
    useEffect(() => {
        async function fetchData() {
            const id = params.id.toString();
            const response = await fetch(`${REACT_APP_YOUR_HOSTNAME}/voluntario/${id}`);

            if (!response.ok) {
                window.alert(`Erro ao buscar voluntário: ${response.statusText}`);
                return;
            }

            const record = await response.json();
            if (!record) {
                window.alert(`Voluntário não encontrado`);
                navigate("/voluntarios");
                return;
            }

            
            setForm({
                ...record,
                dias_disponiveis: record.dias_disponiveis || []
            });
        }
        fetchData();
    }, [params.id, navigate]);

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
        
        const { _id, ...dadosParaSalvar } = form;

        const response = await fetch(`${REACT_APP_YOUR_HOSTNAME}/voluntario/update/${params.id}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(dadosParaSalvar)
        });

        if (response.ok) {
            window.alert("Voluntário atualizado com sucesso!");
            navigate("/voluntarios");
        } else {
            window.alert("Erro ao atualizar voluntário.");
        }
    }

    return (
        <div className="container mt-4 mb-5">
            <h3>Editar Voluntário</h3>
            <hr />
            <form onSubmit={onSubmit}>
                {/* NOME E EMAIL */}
                <div className="row">
                    <div className="form-group col-md-6 mb-3">
                        <label htmlFor="nome">Nome Completo</label>
                        <input
                            type="text"
                            className="form-control"
                            id="nome"
                            value={form.nome}
                            onChange={(e) => updateForm({ nome: e.target.value })}
                            required
                        />
                    </div>
                    <div className="form-group col-md-6 mb-3">
                        <label htmlFor="email">E-mail</label>
                        <input
                            type="email"
                            className="form-control"
                            id="email"
                            value={form.email}
                            onChange={(e) => updateForm({ email: e.target.value })}
                            required
                        />
                    </div>
                </div>

                {/* TELEFONE E LOCALIZAÇÃO */}
                <div className="row">
                    <div className="form-group col-md-2 mb-3">
                        <label htmlFor="ddd">DDD</label>
                        <input
                            type="text"
                            className="form-control"
                            id="ddd"
                            maxLength="2"
                            value={form.ddd}
                            onChange={(e) => updateForm({ ddd: e.target.value.replace(/\D/g, "") })}
                        />
                    </div>
                    <div className="form-group col-md-4 mb-3">
                        <label htmlFor="telefone">Telefone</label>
                        <input
                            type="text"
                            className="form-control"
                            id="telefone"
                            value={form.telefone}
                            onChange={(e) => updateForm({ telefone: e.target.value })}
                        />
                    </div>
                    <div className="form-group col-md-4 mb-3">
                        <label htmlFor="cidade">Cidade</label>
                        <input
                            type="text"
                            className="form-control"
                            id="cidade"
                            value={form.cidade}
                            onChange={(e) => updateForm({ cidade: e.target.value })}
                        />
                    </div>
                    <div className="form-group col-md-2 mb-3">
                        <label htmlFor="estado">Estado</label>
                        <input
                            type="text"
                            className="form-control"
                            id="estado"
                            value={form.estado}
                            onChange={(e) => updateForm({ estado: e.target.value })}
                        />
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
                                id={`check-${dia}`}
                                checked={form.dias_disponiveis.includes(dia)} 
                                onChange={() => handleCheckboxChange(dia)} 
                            />
                            <label className="form-check-label" htmlFor={`check-${dia}`}>{dia}</label>
                        </div>
                    ))}
                </div>

                <div className="row">
                    
                    <div className="form-group col-md-6 mb-3">
                        <label htmlFor="horario">Horário</label>
                        <select 
                            className="form-control" 
                            id="horario"
                            value={form.horario} 
                            onChange={(e) => updateForm({ horario: e.target.value })}
                        >
                            <option value="">Selecione...</option>
                            <option value="Manhã (08h às 12h)">Manhã (08h às 12h)</option>
                            <option value="Tarde (14h às 18h)">Tarde (14h às 18h)</option>
                            <option value="Noite (18h às 20h)">Noite (18h às 20h)</option>
                        </select>
                    </div>

                  
                    <div className="form-group col-md-6 mb-3">
                        <label htmlFor="area_interesse">Área de Interesse</label>
                        <select 
                            className="form-control" 
                            id="area_interesse"
                            value={form.area_interesse} 
                            onChange={(e) => updateForm({ area_interesse: e.target.value })}
                        >
                            <option value="">Selecione...</option>
                            <option value="Cuidados com animais">Cuidados com animais</option>
                            <option value="Eventos e campanhas">Eventos e campanhas</option>
                            <option value="Divulgação e redes sociais">Divulgação e redes sociais</option>
                            <option value="Outros">Outros</option>
                        </select>
                    </div>
                </div>

                {/* OBSERVAÇÕES */}
                <div className="form-group mb-3">
                    <label htmlFor="observacoes">Observações Gerais</label>
                    <textarea
                        className="form-control"
                        id="observacoes"
                        rows="3"
                        value={form.observacoes}
                        onChange={(e) => updateForm({ observacoes: e.target.value })}
                    ></textarea>
                </div>

                <div className="form-group mt-4">
                    <input
                        type="submit"
                        value="Atualizar Voluntário"
                        className="btn btn-warning"
                    />
                    <button 
                        type="button" 
                        className="btn btn-secondary ms-2" 
                        onClick={() => navigate("/voluntarios")}
                    >
                        Cancelar
                    </button>
                </div>
            </form>
        </div>
    );
}