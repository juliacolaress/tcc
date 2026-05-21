import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

const REACT_APP_YOUR_HOSTNAME = 'http://localhost:5050';

export default function EditDoacao() {
    const [form, setForm] = useState({
        email: "",
        nome: "",
        ddd: "",
        telefone: "",
        cidade: "",     
        estado: "",
        tipo_doacao: "",
        item: "",
        valor: "",
        forma_entrega: ""
    });

    const params = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        async function fetchData() {
            const id = params.id.toString();
            const response = await fetch(`${REACT_APP_YOUR_HOSTNAME}/doacao/${id}`);

            if (!response.ok) {
                window.alert(`Erro ao buscar doação: ${response.statusText}`);
                return;
            }

            const record = await response.json();
            setForm({
                email: record.email || "",
                nome: record.nome || "",
                ddd: record.ddd || "",
                telefone: record.telefone || "",
                cidade: record.cidade || "",
                estado: record.estado || "",
                tipo_doacao: record.tipo_doacao || "",
                item: record.item || "",
                valor: record.valor || "",
                forma_entrega: record.forma_entrega || ""
            });
        }
        fetchData();
    }, [params.id]);

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
        
        const updatedDoacao = { 
            ...form,
            valor: parseFloat(form.valor) || 0 
        };

        try {
            const response = await fetch(`${REACT_APP_YOUR_HOSTNAME}/doacao/update/${params.id}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updatedDoacao),
            });

            if (!response.ok) {
                window.alert(`Erro ao salvar: ${response.statusText}`);
                return;
            }

            window.alert("Doação atualizada com sucesso!");
            navigate("/doacoes");
        } catch (error) {
            console.error("Erro na requisição:", error);
            window.alert("Não foi possível conectar ao servidor.");
        }
    }

    const primaryColor = '#5c3a21';
    const labelStyle = { color: '#5c3a21', fontWeight: '600', marginBottom: '6px' };
    const inputStyle = { borderRadius: '6px', border: '1px solid #ced4da' };

    return (
        <div className="container-fluid py-2">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h3 style={{ color: primaryColor, fontWeight: 'bold' }}>Editar Cadastro de Doação</h3>
                    <p className="text-muted mb-0">Atualize as informações de contribuição do doador</p>
                </div>
                <button 
                    type="button"
                    onClick={() => navigate("/doacoes")} 
                    className="btn btn-outline-secondary px-4 py-2" 
                    style={{ borderRadius: '6px' }}
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

                    <h5 className="mb-4 mt-4 pb-2 border-bottom text-muted text-uppercase small fw-bold" style={{ letterSpacing: '0.5px' }}>
                        Detalhes da Doação
                    </h5>

                    <div className="row">
                        <div className="form-group col-md-6 mb-3">
                            <label htmlFor="tipo_doacao" style={labelStyle}>Tipo de Doação</label>
                            <select className="form-select px-3 py-2" id="tipo_doacao" style={inputStyle} value={form.tipo_doacao} onChange={(e) => updateForm({ tipo_doacao: e.target.value })}>
                                <option value="">Selecione...</option>
                                <option value="Dinheiro">Dinheiro</option>
                                <option value="Ração">Ração</option>
                                <option value="Medicamento">Medicamento</option>
                                <option value="Outros">Outros</option>
                            </select>
                        </div>
                        <div className="form-group col-md-6 mb-3">
                            <label htmlFor="item" style={labelStyle}>Descrição do Item</label>
                            <input type="text" className="form-control px-3 py-2" id="item" style={inputStyle} value={form.item} onChange={(e) => updateForm({ item: e.target.value })} />
                        </div>
                    </div>

                    <div className="row">
                        <div className="form-group col-md-6 mb-3">
                            <label htmlFor="valor" style={labelStyle}>Valor (R$)</label>
                            <input type="number" className="form-control px-3 py-2" id="valor" style={inputStyle} value={form.valor} onChange={(e) => updateForm({ valor: e.target.value })} step="0.01" />
                        </div>
                        <div className="form-group col-md-6 mb-3">
                            <label htmlFor="forma_entrega" style={labelStyle}>Entrega / Coleta</label>
                            <input type="text" className="form-control px-3 py-2" id="forma_entrega" style={inputStyle} value={form.forma_entrega} onChange={(e) => updateForm({ forma_entrega: e.target.value })} />
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