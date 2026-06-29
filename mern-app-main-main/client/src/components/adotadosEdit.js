import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API_BASE_URL from "../api/config";

export default function AdotadosEdit() {
    const [form, setForm] = useState({ 
        nome: "", 
        especie: "", 
        raca: "", 
        status: "Adotado", 
        obs: "",
        adotante: "",
        data_adocao: ""
    });
    const [loading, setLoading] = useState(true);
    const { id } = useParams();
    const navigate = useNavigate();
    const primaryColor = '#4a2511';

    useEffect(() => {
        async function fetchAnimal() {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch(`${API_BASE_URL}/animal/${id}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (response.ok) {
                    const data = await response.json();
                    setForm({
                        ...data,
                        adotante: data.adotante || "",
                        data_adocao: data.data_adocao ? data.data_adocao.split('T')[0] : ""
                    });
                } else {
                    window.alert("Erro ao carregar dados do animal.");
                    navigate("/adotados");
                }
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        }
        fetchAnimal();
    }, [id, navigate]);

    async function onSubmit(e) {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/animal/update/${id}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ 
                    status: form.status, 
                    obs: form.obs,
                    adotante: form.adotante,
                    data_adocao: form.data_adocao
                })
            });

            if (response.ok) {
                window.alert("Registro atualizado com sucesso!");
                if (form.status === "Disponível") {
                    navigate("/animais");
                } else {
                    navigate("/adotados");
                }
            } else {
                window.alert("Erro ao atualizar o registro.");
            }
        } catch (error) {
            console.error(error);
            window.alert("Erro de conexão com o servidor.");
        }
    }

    if (loading) {
        return <div className="text-center py-5"><div className="spinner-border" style={{ color: primaryColor }}></div></div>;
    }

    return (
        <div className="container mt-4" style={{ maxWidth: '700px' }}>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h3 style={{ color: primaryColor, fontWeight: 'bold' }}>Gerenciar Adotado: {form.nome}</h3>
                    <p className="text-muted mb-0">{form.especie} • {form.raca || "Sem raça definida"}</p>
                </div>
                <button className="btn btn-outline-secondary" onClick={() => navigate("/adotados")}>Voltar</button>
            </div>

            <form onSubmit={onSubmit} className="card border-0 shadow-sm p-4" style={{ borderRadius: '8px' }}>
                {/* SEÇÃO DA SITUAÇÃO ATUAL / DEVOLUÇÃO */}
                <div className="alert alert-warning border-0 p-3 mb-4" style={{ borderRadius: '6px' }}>
                    <label className="fw-bold d-block mb-2 text-warning-heading">
                        <i className="bi bi-exclamation-triangle-fill me-2"></i> Situação do Animal (Caso de Devolução)
                    </label>
                    <div className="mt-2">
                        <div className="form-check form-check-inline me-4">
                            <input 
                                className="form-check-input" type="radio" name="status" id="statusAdotado" 
                                value="Adotado" checked={form.status === "Adotado"} 
                                onChange={(e) => setForm({ ...form, status: e.target.value })} 
                            />
                            <label className="form-check-label fw-semibold text-dark" htmlFor="statusAdotado">Continuar como Adotado</label>
                        </div>
                        <div className="form-check form-check-inline">
                            <input 
                                className="form-check-input" type="radio" name="status" id="statusDevolvido" 
                                value="Disponível" checked={form.status === "Disponível"} 
                                onChange={(e) => setForm({ ...form, status: e.target.value })} 
                            />
                            <label className="form-check-label fw-bold text-danger" htmlFor="statusDevolvido">Devolvido ao Abrigo (Disponível)</label>
                        </div>
                    </div>
                </div>

                {/* INFORMAÇÕES DO ADOTANTE */}
                <div className="row mb-3">
                    <div className="form-group col-md-8">
                        <label className="fw-bold mb-2" style={{ color: primaryColor }}>Nome do Adotante</label>
                        <input 
                            type="text" className="form-control" value={form.adotante} 
                            onChange={(e) => setForm({ ...form, adotante: e.target.value })}
                            placeholder="Nome completo do novo dono"
                            style={{ borderRadius: '6px' }}
                        />
                    </div>
                    <div className="form-group col-md-4">
                        <label className="fw-bold mb-2" style={{ color: primaryColor }}>Data da Adoção</label>
                        <input 
                            type="date" className="form-control" value={form.data_adocao} 
                            onChange={(e) => setForm({ ...form, data_adocao: e.target.value })}
                            style={{ borderRadius: '6px' }}
                        />
                    </div>
                </div>

                {/* OBSERVAÇÕES */}
                <div className="form-group mb-4">
                    <label className="fw-bold mb-2" style={{ color: primaryColor }}>Motivo da Devolução / Observações do Histórico</label>
                    <textarea 
                        className="form-control" rows="4" value={form.obs || ""} 
                        onChange={(e) => setForm({ ...form, obs: e.target.value })}
                        placeholder="Caso o animal tenha sido devolvido, relate aqui as razões ou atualize o histórico médico..."
                        style={{ borderRadius: '6px' }}
                    ></textarea>
                </div>

                <div className="text-end">
                    <button type="submit" className="btn text-white px-4" style={{ backgroundColor: primaryColor, borderRadius: '6px' }}>
                        <i className="bi bi-save me-2"></i> Salvar Alterações
                    </button>
                </div>
            </form>
        </div>
    );
}