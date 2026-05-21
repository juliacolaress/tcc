import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

const REACT_APP_YOUR_HOSTNAME = 'http://localhost:5050';

export default function EditAnimal() {
    const [form, setForm] = useState({
        nome: "",
        especie: "",
        sexo: "",
        idade: "",
        porte: "",
        status: "",
        temperamento: "",
        observacoes: ""
    });

    const params = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        async function fetchData() {
            const id = params.id.toString();
            try {
                const response = await fetch(`${REACT_APP_YOUR_HOSTNAME}/animal/${id}`);

                if (!response.ok) {
                    window.alert(`Erro ao buscar dados do animal: ${response.statusText}`);
                    return;
                }

                const record = await response.json();
                setForm({
                    nome: record.nome || "",
                    especie: record.especie || "",
                    sexo: record.sexo || "",
                    idade: record.idade || "",
                    porte: record.porte || "",
                    status: record.status || "Disponível",
                    temperamento: record.temperamento || "",
                    observacoes: record.observacoes || ""
                });
            } catch (err) {
                console.error("Erro ao carregar dados do animal:", err);
            }
        }
        fetchData();
    }, [params.id]);

    function updateForm(value) {
        setForm((prev) => ({ ...prev, ...value }));
    }

    async function onSubmit(e) {
        e.preventDefault();
        try {
            const response = await fetch(`${REACT_APP_YOUR_HOSTNAME}/animal/update/${params.id}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });

            if (!response.ok) {
                window.alert(`Erro ao atualizar dados: ${response.statusText}`);
                return;
            }

            window.alert("Ficha do animal atualizada com sucesso!");
            navigate("/animais");
        } catch (error) {
            console.error("Erro na requisição:", error);
            window.alert("Não foi possível conectar ao servidor backend.");
        }
    }

    const primaryColor = '#5c3a21';
    const labelStyle = { color: '#5c3a21', fontWeight: '600', marginBottom: '6px' };
    const inputStyle = { borderRadius: '6px', border: '1px solid #ced4da' };

    return (
        <div className="container-fluid py-2">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h3 style={{ color: primaryColor, fontWeight: 'bold' }}>Editar Registro do Animal</h3>
                    <p className="text-muted mb-0">Atualize o prontuário e o status do peludo</p>
                </div>
                <button type="button" onClick={() => navigate("/animais")} className="btn btn-outline-secondary px-4 py-2" style={{ borderRadius: '6px' }}>
                    <i className="bi bi-arrow-left me-2"></i> Voltar
                </button>
            </div>

            <form onSubmit={onSubmit}>
                <div className="card border-0 shadow-sm p-4 mb-4" style={{ borderRadius: '8px' }}>
                    <h5 className="mb-4 pb-2 border-bottom text-muted text-uppercase small fw-bold" style={{ letterSpacing: '0.5px' }}>
                        Modificar Ficha Cadastral
                    </h5>

                    <div className="row">
                        <div className="form-group col-md-4 mb-3">
                            <label htmlFor="nome" style={labelStyle}>Nome do Animal</label>
                            <input type="text" className="form-control px-3 py-2" id="nome" style={inputStyle} value={form.nome} onChange={(e) => updateForm({ nome: e.target.value })} required />
                        </div>
                        <div className="form-group col-md-4 mb-3">
                            <label htmlFor="especie" style={labelStyle}>Espécie</label>
                            <select className="form-select px-3 py-2" id="especie" style={inputStyle} value={form.especie} onChange={(e) => updateForm({ especie: e.target.value })} required>
                                <option value="Cão">Cão</option>
                                <option value="Gato">Gato</option>
                                <option value="Outro">Outro</option>
                            </select>
                        </div>
                        <div className="form-group col-md-4 mb-3">
                            <label htmlFor="sexo" style={labelStyle}>Gênero / Sexo</label>
                            <select className="form-select px-3 py-2" id="sexo" style={inputStyle} value={form.sexo} onChange={(e) => updateForm({ sexo: e.target.value })} required>
                                <option value="Macho">Macho</option>
                                <option value="Fêmea">Fêmea</option>
                            </select>
                        </div>
                    </div>

                    <div className="row">
                        <div className="form-group col-md-4 mb-3">
                            <label htmlFor="idade" style={labelStyle}>Idade Estimada</label>
                            <input type="text" className="form-control px-3 py-2" id="idade" style={inputStyle} value={form.idade} onChange={(e) => updateForm({ idade: e.target.value })} />
                        </div>
                        <div className="form-group col-md-4 mb-3">
                            <label htmlFor="porte" style={labelStyle}>Porte</label>
                            <select className="form-select px-3 py-2" id="porte" style={inputStyle} value={form.porte} onChange={(e) => updateForm({ porte: e.target.value })}>
                                <option value="Pequeno">Pequeno</option>
                                <option value="Médio">Médio</option>
                                <option value="Grande">Grande</option>
                            </select>
                        </div>
                        <div className="form-group col-md-4 mb-3">
                            <label htmlFor="status" style={labelStyle}>Status Atual</label>
                            <select className="form-select px-3 py-2" id="status" style={inputStyle} value={form.status} onChange={(e) => updateForm({ status: e.target.value })}>
                                <option value="Disponível">Disponível para Adoção</option>
                                <option value="Tratamento">Em Tratamento Clínico</option>
                                <option value="Adotado">Adotado</option>
                            </select>
                        </div>
                    </div>

                    <div className="row">
                        <div className="form-group col-md-6 mb-3">
                            <label htmlFor="temperamento" style={labelStyle}>Temperamento</label>
                            <input type="text" className="form-control px-3 py-2" id="temperamento" style={inputStyle} value={form.temperamento} onChange={(e) => updateForm({ temperamento: e.target.value })} />
                        </div>
                        <div className="form-group col-md-6 mb-3">
                            <label htmlFor="observacoes" style={labelStyle}>Histórico / Observações Clínicas</label>
                            <textarea className="form-control px-3 py-2" id="observacoes" style={{ ...inputStyle, height: '43px', resize: 'none' }} value={form.observacoes} onChange={(e) => updateForm({ observacoes: e.target.value })} />
                        </div>
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