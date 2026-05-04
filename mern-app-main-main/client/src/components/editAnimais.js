import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
const REACT_APP_YOUR_HOSTNAME = 'http://localhost:5050';

export default function EditAnimais() {
    const [form, setForm] = useState({
        nome: "",
        porte: "",
        especie: "",
        raca: "",
        data_nasc: "",
        caracteristicas: "",
        data_resgate: "",
        obs: "",
        status: true,
        genero: "",
        castracao: false,
        estado_saude: "",
        doencas_pre_ex: "",
        pelo: "",
        amputacao: false,
        cor: "",
        ong: false
    });

    const params = useParams();
    const navigate = useNavigate();

    // 1. CARREGA OS DADOS DO ANIMAL AO ABRIR A PÁGINA
    useEffect(() => {
        async function fetchData() {
            const id = params.id.toString();
            const response = await fetch(`${REACT_APP_YOUR_HOSTNAME}/animal/${id}`);

            if (!response.ok) {
                const message = `Um erro ocorreu: ${response.statusText}`;
                window.alert(message);
                return;
            }

            const record = await response.json();
            if (!record) {
                window.alert(`Animal com id ${id} não encontrado`);
                navigate("/animais");
                return;
            }

            // Preenche o formulário com o que veio do banco
            setForm(record);
        }
        fetchData();
    }, [params.id, navigate]);

    function updateForm(value) {
        setForm((prev) => ({ ...prev, ...value }));
    }

    async function onSubmit(e) {
        e.preventDefault();
        const editedAnimal = { ...form };

        // 2. ENVIA OS DADOS ATUALIZADOS PARA O BACKEND
        await fetch(`${REACT_APP_YOUR_HOSTNAME}/animal/update/${params.id}`, {
            method: "POST", // ou PUT, dependendo do seu backend
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(editedAnimal)
        });

        window.alert("Animal atualizado com sucesso!");
        navigate("/animais");
    }

    return (
        <div className="container mt-4">
            <h3>Editar Animal</h3>
            <form onSubmit={onSubmit}>
                {/* NOME */}
                <div className="form-group mb-3">
                    <label htmlFor="nome">Nome do Animal</label>
                    <input
                        type="text"
                        className="form-control"
                        id="nome"
                        value={form.nome}
                        onChange={(e) => updateForm({ nome: e.target.value })}
                        required
                    />
                </div>

                <div className="row">
                    {/* ESPÉCIE */}
                    <div className="form-group col-md-6 mb-3">
                        <label htmlFor="especie">Espécie</label>
                        <input
                            type="text"
                            className="form-control"
                            id="especie"
                            value={form.especie}
                            onChange={(e) => updateForm({ especie: e.target.value })}
                        />
                    </div>

                    {/* RAÇA */}
                    <div className="form-group col-md-6 mb-3">
                        <label htmlFor="raca">Raça</label>
                        <input
                            type="text"
                            className="form-control"
                            id="raca"
                            value={form.raca}
                            onChange={(e) => updateForm({ raca: e.target.value })}
                        />
                    </div>
                </div>

                <div className="row">
                    {/* PORTE */}
                    <div className="form-group col-md-4 mb-3">
                        <label htmlFor="porte">Porte</label>
                        <select 
                            className="form-control"
                            id="porte"
                            value={form.porte}
                            onChange={(e) => updateForm({ porte: e.target.value })}
                        >
                            <option value="">Selecione...</option>
                            <option value="Pequeno">Pequeno</option>
                            <option value="Médio">Médio</option>
                            <option value="Grande">Grande</option>
                        </select>
                    </div>

                    {/* GÊNERO */}
                    <div className="form-group col-md-4 mb-3">
                        <label>Gênero</label>
                        <div className="mt-2">
                            <div className="form-check form-check-inline">
                                <input className="form-check-input" type="radio" name="genero" id="macho" value="M" checked={form.genero === "M"} onChange={(e) => updateForm({ genero: e.target.value })} />
                                <label className="form-check-label" htmlFor="macho">Macho</label>
                            </div>
                            <div className="form-check form-check-inline">
                                <input className="form-check-input" type="radio" name="genero" id="femea" value="F" checked={form.genero === "F"} onChange={(e) => updateForm({ genero: e.target.value })} />
                                <label className="form-check-label" htmlFor="femea">Fêmea</label>
                            </div>
                        </div>
                    </div>

                    {/* DATA NASCIMENTO */}
                    <div className="form-group col-md-4 mb-3">
                        <label htmlFor="data_nasc">Data de Nascimento (Aprox.)</label>
                        <input
                            type="date"
                            className="form-control"
                            id="data_nasc"
                            value={form.data_nasc ? form.data_nasc.split('T')[0] : ""}
                            onChange={(e) => updateForm({ data_nasc: e.target.value })}
                        />
                    </div>
                </div>

                {/* OBSERVAÇÕES */}
                <div className="form-group mb-3">
                    <label htmlFor="obs">Observações Médicas/Histórico</label>
                    <textarea
                        className="form-control"
                        id="obs"
                        rows="3"
                        value={form.obs}
                        onChange={(e) => updateForm({ obs: e.target.value })}
                    ></textarea>
                </div>

                {/* CHECKBOXES (Booleanos) */}
                <div className="form-group mb-4">
                    <div className="form-check form-check-inline">
                        <input className="form-check-input" type="checkbox" id="castracao" checked={form.castracao} onChange={(e) => updateForm({ castracao: e.target.checked })} />
                        <label className="form-check-label" htmlFor="castracao">Castrado</label>
                    </div>
                    <div className="form-check form-check-inline">
                        <input className="form-check-input" type="checkbox" id="amputacao" checked={form.amputacao} onChange={(e) => updateForm({ amputacao: e.target.checked })} />
                        <label className="form-check-label" htmlFor="amputacao">Possui Amputação</label>
                    </div>
                </div>

                <div className="form-group">
                    <input
                        type="submit"
                        value="Salvar Alterações"
                        className="btn btn-primary"
                    />
                </div>
            </form>
        </div>
    );
}