import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const REACT_APP_YOUR_HOSTNAME = 'http://localhost:5050'; 

export default function CreateDoacao() {
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
    
    const navigate = useNavigate();

    function updateForm(value) {
        setForm((prev) => {
            return { ...prev, ...value };
        });
    }

    // Função para aplicar a máscara de telefone (coloca o traço)
    const handleTelefoneChange = (e) => {
        let val = e.target.value.replace(/\D/g, ""); // Remove tudo que não é número
        if (val.length > 5) {
            val = `${val.slice(0, 5)}-${val.slice(5, 9)}`; // Formata 99999-9999
        }
        updateForm({ telefone: val });
    };

    async function onSubmit(e) {
        e.preventDefault();

        // No envio, podemos juntar o DDD e o Telefone se quiser, 
        // ou mandar separado como está no form.
        const newDoacao = { 
            ...form,
            valor: parseFloat(form.valor) || 0 
        };

        const response = await fetch(`${REACT_APP_YOUR_HOSTNAME}/doacao/add`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newDoacao)
        });

        if (!response.ok) {
            window.alert(`Erro ao salvar: ${response.statusText}`);
            return;
        }

        window.alert("Doação cadastrada com sucesso!");
        setForm({ email: "", nome: "", ddd: "", telefone: "", cidade: "", estado: "", tipo_doacao: "", item: "", valor: "", forma_entrega: "" });
        navigate("/doacoes");
    }

    return (
        <div className="container mt-4 mb-5">
            <h3 className="mb-4">Cadastrar Nova Doação</h3>
            <form onSubmit={onSubmit}>
                
                <div className="row">
                    <div className="form-group col-md-6 mb-3">
                        <label htmlFor="nome">Nome Completo</label>
                        <input type="text" className="form-control" id="nome" value={form.nome} onChange={(e) => updateForm({ nome: e.target.value })} required />
                    </div>
                    <div className="form-group col-md-6 mb-3">
                        <label htmlFor="email">E-mail</label>
                        <input type="email" className="form-control" id="email" value={form.email} onChange={(e) => updateForm({ email: e.target.value })} required />
                    </div>
                </div>

                <div className="row">
                    {/* DDD */}
                    <div className="form-group col-md-1 mb-3">
                        <label htmlFor="ddd">DDD</label>
                        <input type="text" className="form-control" id="ddd" maxLength="2" placeholder="48" value={form.ddd} onChange={(e) => updateForm({ ddd: e.target.value.replace(/\D/g, "") })} />
                    </div>

                    {/* Telefone com Máscara */}
                    <div className="form-group col-md-3 mb-3">
                        <label htmlFor="telefone">Telefone</label>
                        <input type="text" className="form-control" id="telefone" maxLength="10" placeholder="99999-9999" value={form.telefone} onChange={handleTelefoneChange} />
                    </div>

                    <div className="form-group col-md-6 mb-3">
                        <label htmlFor="cidade">Cidade</label>
                        <input type="text" className="form-control" id="cidade" value={form.cidade} onChange={(e) => updateForm({ cidade: e.target.value })} />
                    </div>

                    <div className="form-group col-md-2 mb-3">
                        <label htmlFor="estado">UF</label>
                        <select className="form-control" id="estado" value={form.estado} onChange={(e) => updateForm({ estado: e.target.value })} required>
                            <option value="">...</option>
                            <option value="AC">AC</option><option value="AL">AL</option><option value="AP">AP</option><option value="AM">AM</option><option value="BA">BA</option><option value="CE">CE</option><option value="DF">DF</option><option value="ES">ES</option><option value="GO">GO</option><option value="MA">MA</option><option value="MT">MT</option><option value="MS">MS</option><option value="MG">MG</option><option value="PA">PA</option><option value="PB">PB</option><option value="PR">PR</option><option value="PE">PE</option><option value="PI">PI</option><option value="RJ">RJ</option><option value="RN">RN</option><option value="RS">RS</option><option value="RO">RO</option><option value="RR">RR</option><option value="SC">SC</option><option value="SP">SP</option><option value="SE">SE</option><option value="TO">TO</option>
                        </select>
                    </div>
                </div>

                <div className="row">
                    <div className="form-group col-md-6 mb-3">
                        <label htmlFor="tipo_doacao">Tipo de Doação</label>
                        <select className="form-control" id="tipo_doacao" value={form.tipo_doacao} onChange={(e) => updateForm({ tipo_doacao: e.target.value })}>
                            <option value="">Selecione...</option>
                            <option value="Dinheiro">Dinheiro</option>
                            <option value="Ração">Ração</option>
                            <option value="Medicamento">Medicamento</option>
                            <option value="Outros">Outros</option>
                        </select>
                    </div>
                    <div className="form-group col-md-6 mb-3">
                        <label htmlFor="item">Descrição do Item</label>
                        <input type="text" className="form-control" id="item" value={form.item} onChange={(e) => updateForm({ item: e.target.value })} />
                    </div>
                </div>

                <div className="row">
                    <div className="form-group col-md-6 mb-3">
                        <label htmlFor="valor">Valor (R$)</label>
                        <input type="number" className="form-control" id="valor" value={form.valor} onChange={(e) => updateForm({ valor: e.target.value })} />
                    </div>
                    <div className="form-group col-md-6 mb-3">
                        <label htmlFor="forma_entrega">Entrega / Coleta</label>
                        <input type="text" className="form-control" id="forma_entrega" value={form.forma_entrega} onChange={(e) => updateForm({ forma_entrega: e.target.value })} />
                    </div>
                </div>

                <div className="form-group mt-4">
                    <input type="submit" value="Confirmar Doação" className="btn btn-primary w-100" />
                </div>
            </form>
        </div>
    );
}