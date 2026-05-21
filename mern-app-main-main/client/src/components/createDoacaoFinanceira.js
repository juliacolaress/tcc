import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import API_BASE_URL from "../api/config";

export default function CreateDoacaoFinanceira() {
    const [form, setForm] = useState({
        email: "",
        nome: "",
        ddd: "",
        telefone: "",
        cidade: "",     
        estado: "",
        tipo_doacao: "Dinheiro",
        item: "Doação Financeira",
        valor: "",
        forma_entrega: "N/A"
    });
    
    const navigate = useNavigate();

    function updateForm(value) {
        setForm((prev) => {
            return { ...prev, ...value };
        });
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

        const newDoacao = { 
            ...form,
            valor: parseFloat(form.valor) || 0 
        };
        const token = localStorage.getItem('token');

        try {
            const response = await fetch(`${API_BASE_URL}/doacao/add`, {
                method: "POST",
                headers: { 
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(newDoacao)
            });

            if (!response.ok) {
                window.alert(`Erro ao salvar: ${response.statusText}`);
                return;
            }

            window.alert("Doação financeira cadastrada com sucesso!");
            navigate("/doacoes", { state: { filter: "Dinheiro" } });
        } catch (error) {
            console.error("Erro na requisição:", error);
            window.alert("Erro ao conectar ao servidor.");
        }
    }

    const primaryColor = '#5c3a21';
    const labelStyle = { color: '#5c3a21', fontWeight: '600', marginBottom: '6px' };
    const inputStyle = { borderRadius: '6px', border: '1px solid #ced4da' };

    return (
        <div className="container-fluid py-2">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h3 style={{ color: primaryColor, fontWeight: 'bold' }}>Cadastrar Doação Financeira</h3>
                    <p className="text-muted mb-0">Registre uma nova contribuição monetária para a ONG</p>
                </div>
                <button 
                    type="button"
                    onClick={() => navigate(-1)} 
                    className="btn px-4 py-2" 
                    style={{ borderRadius: '6px', color: primaryColor, borderColor: primaryColor, fontWeight: '500' }}
                >
                    <i className="bi bi-arrow-left me-2"></i> Voltar
                </button>
            </div>

            <form onSubmit={onSubmit}>
                <div className="card border-0 shadow-sm p-4 mb-4" style={{ borderRadius: '8px' }}>
                    <h5 className="mb-4 pb-2 border-bottom text-muted text-uppercase small fw-bold" style={{ letterSpacing: '0.5px' }}>
                        Dados do Doador
                    </h5>

                    <div className="row">
                        <div className="form-group col-md-6 mb-3">
                            <label style={labelStyle}>Nome Completo</label>
                            <input type="text" className="form-control px-3 py-2" style={inputStyle} value={form.nome} onChange={(e) => updateForm({ nome: e.target.value })} placeholder="Ex: Júlia Colares" required />
                        </div>
                        <div className="form-group col-md-6 mb-3">
                            <label style={labelStyle}>E-mail</label>
                            <input type="email" className="form-control px-3 py-2" style={inputStyle} value={form.email} onChange={(e) => updateForm({ email: e.target.value })} placeholder="Ex: julia@email.com" required />
                        </div>
                    </div>

                    <div className="row">
                        <div className="form-group col-md-2 mb-3">
                            <label style={labelStyle}>DDD</label>
                            <input type="text" className="form-control px-3 py-2" style={inputStyle} maxLength="2" placeholder="48" value={form.ddd} onChange={(e) => updateForm({ ddd: e.target.value.replace(/\D/g, "") })} />
                        </div>
                        <div className="form-group col-md-4 mb-3">
                            <label style={labelStyle}>Telefone</label>
                            <input type="text" className="form-control px-3 py-2" style={inputStyle} maxLength="10" placeholder="99999-9999" value={form.telefone} onChange={handleTelefoneChange} />
                        </div>
                        <div className="form-group col-md-4 mb-3">
                            <label style={labelStyle}>Cidade</label>
                            <input type="text" className="form-control px-3 py-2" style={inputStyle} value={form.cidade} onChange={(e) => updateForm({ cidade: e.target.value })} placeholder="Ex: Araranguá" />
                        </div>
                        <div className="form-group col-md-2 mb-3">
                            <label style={labelStyle}>UF</label>
                            <select className="form-select px-3 py-2" style={inputStyle} value={form.estado} onChange={(e) => updateForm({ estado: e.target.value })} required>
                                <option value="">...</option>
                                <option value="AC">AC</option><option value="AL">AL</option><option value="AP">AP</option><option value="AM">AM</option><option value="BA">BA</option><option value="CE">CE</option><option value="DF">DF</option><option value="ES">ES</option><option value="GO">GO</option><option value="MA">MA</option><option value="MT">MT</option><option value="MS">MS</option><option value="MG">MG</option><option value="PA">PA</option><option value="PB">PB</option><option value="PR">PR</option><option value="PE">PE</option><option value="PI">PI</option><option value="RJ">RJ</option><option value="RN">RN</option><option value="RS">RS</option><option value="RO">RO</option><option value="RR">RR</option><option value="SC">SC</option><option value="SP">SP</option><option value="SE">SE</option><option value="TO">TO</option>
                            </select>
                        </div>
                    </div>

                    <h5 className="mb-4 mt-4 pb-2 border-bottom text-muted text-uppercase small fw-bold" style={{ letterSpacing: '0.5px' }}>
                        Detalhes Financeiros
                    </h5>

                    <div className="row">
                        <div className="form-group col-md-12 mb-3">
                            <label style={labelStyle}>Valor da Doação (R$)</label>
                            <input type="number" className="form-control px-3 py-2" style={inputStyle} value={form.valor} onChange={(e) => updateForm({ valor: e.target.value })} placeholder="0.00" step="0.01" required />
                        </div>
                    </div>
                </div>

                <div className="form-group text-end mb-4">
                    <button type="submit" className="btn text-white px-5 py-2 shadow-sm" style={{ backgroundColor: primaryColor, borderRadius: '6px', fontWeight: '500' }}>
                        <i className="bi bi-check-lg me-2"></i> Confirmar Doação
                    </button>
                </div>
            </form>
        </div>
    );
}
