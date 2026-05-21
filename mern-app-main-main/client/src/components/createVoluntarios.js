import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const REACT_APP_YOUR_HOSTNAME = 'http://localhost:5050'; 

export default function CreateVoluntario() {
    const [form, setForm] = useState({
        nome: "",
        email: "",
        ddd: "",
        telefone: "",
        cidade: "",     
        estado: ""
    });
    
    const navigate = useNavigate();

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

    async function onSubmit(e) {
        e.preventDefault();
        try {
            const response = await fetch(`${REACT_APP_YOUR_HOSTNAME}/voluntario/add`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form)
            });

            if (!response.ok) {
                window.alert(`Erro ao salvar voluntário: ${response.statusText}`);
                return;
            }

            window.alert("Voluntário cadastrado com sucesso!");
            navigate("/voluntarios");
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
                    <h3 style={{ color: primaryColor, fontWeight: 'bold' }}>Cadastrar Novo Voluntário</h3>
                    <p className="text-muted mb-0">Insira os dados do novo colaborador da ONG</p>
                </div>
                <button 
                    type="button"
                    onClick={() => navigate("/voluntarios")} 
                    className="btn btn-outline-secondary px-4 py-2" 
                    style={{ borderRadius: '6px' }}
                >
                    <i className="bi bi-arrow-left me-2"></i> Voltar
                </button>
            </div>

            <form onSubmit={onSubmit}>
                <div className="card border-0 shadow-sm p-4 mb-4" style={{ borderRadius: '8px' }}>
                    <h5 className="mb-4 pb-2 border-bottom text-muted text-uppercase small fw-bold" style={{ letterSpacing: '0.5px' }}>
                        Dados Cadastrais do Voluntário
                    </h5>

                    <div className="row">
                        <div className="form-group col-md-6 mb-3">
                            <label htmlFor="nome" style={labelStyle}>Nome Completo</label>
                            <input type="text" className="form-control px-3 py-2" id="nome" style={inputStyle} value={form.nome} onChange={(e) => updateForm({ nome: e.target.value })} placeholder="Ex: Lucas Mendes" required />
                        </div>
                        <div className="form-group col-md-6 mb-3">
                            <label htmlFor="email" style={labelStyle}>E-mail</label>
                            <input type="email" className="form-control px-3 py-2" id="email" style={inputStyle} value={form.email} onChange={(e) => updateForm({ email: e.target.value })} placeholder="Ex: lucas@email.com" required />
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
                            <input type="text" className="form-control px-3 py-2" id="cidade" style={inputStyle} value={form.cidade} onChange={(e) => updateForm({ cidade: e.target.value })} placeholder="Ex: Araranguá" />
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

                <div className="form-group text-end mb-4">
                    <button type="submit" className="btn text-white px-5 py-2 shadow-sm" style={{ backgroundColor: primaryColor, borderRadius: '6px', fontSize: '1rem', fontWeight: '500' }}>
                        <i className="bi bi-check-lg me-2"></i> Confirmar Cadastro
                    </button>
                </div>
            </form>
        </div>
    );
}