import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

const REACT_APP_YOUR_HOSTNAME = 'http://localhost:5050';

export default function EditDoacao() {
    const [form, setForm] = useState({
        nome: "",
        tipo_doacao: "",
        item: "",
        valor: "",
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
            setForm(record);
        }
        fetchData();
    }, [params.id]);

    function updateForm(value) {
        setForm((prev) => ({ ...prev, ...value }));
    }

    async function onSubmit(e) {
        e.preventDefault();
        await fetch(`${REACT_APP_YOUR_HOSTNAME}/doacao/update/${params.id}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(form),
        });

        window.alert("Doação atualizada!");
        navigate("/doacoes");
    }

    return (
        <div className="container mt-4">
            <h3>Editar Doação</h3>
            <form onSubmit={onSubmit}>
                <div className="form-group mb-3">
                    <label>Doador:</label>
                    <input type="text" className="form-control" value={form.nome} 
                        onChange={(e) => updateForm({ nome: e.target.value })} />
                </div>
                <div className="form-group mb-3">
                    <label>Tipo (Dinheiro/Item):</label>
                    <input type="text" className="form-control" value={form.tipo_doacao} 
                        onChange={(e) => updateForm({ tipo_doacao: e.target.value })} />
                </div>
                <div className="form-group mb-3">
                    <label>Item/Descrição:</label>
                    <input type="text" className="form-control" value={form.item} 
                        onChange={(e) => updateForm({ item: e.target.value })} />
                </div>
                <div className="form-group mb-3">
                    <label>Valor (se houver):</label>
                    <input type="number" className="form-control" value={form.valor} 
                        onChange={(e) => updateForm({ valor: e.target.value })} />
                </div>
                <input type="submit" value="Salvar Alterações" className="btn btn-warning" />
            </form>
        </div>
    );
}