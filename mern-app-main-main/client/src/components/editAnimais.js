import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API_BASE_URL from "../api/config";

const RACAS_POR_ESPECIE = {
    Cachorro: [
        "Vira-lata (SRD)", 
        "Pit Bull (ou mestiço)", 
        "Pinscher", 
        "Poodle", 
        "Labrador", 
        "Pastor Alemão", 
        "Beagle", 
        "Yorkshire",
        "Chow Chow",
        "Dachshund (Salsicha)",
        "Outra"
    ],
    Gato: [
        "Vira-lata (SRD)", 
        "Frajola (Preto e Branco)", 
        "Tigrado (Tabby)",
        "Preto",
        "Siamês", 
        "Persa", 
        "Angorá",
        "Branco",
        "Escaminha (Tortoise)",
        "Outra"
    ]
};

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
    const primaryColor = '#5c3a21';

    // 1. CARREGA OS DADOS DO ANIMAL AO ABRIR A PÁGINA
    useEffect(() => {
        async function fetchData() {
            const id = params.id.toString();
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/animal/${id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

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
            // Garantindo que data_nasc esteja no formato YYYY-MM-DD para o input type="date"
            let formattedDate = "";
            if (record.data_nasc) {
                formattedDate = record.data_nasc.split('T')[0];
            }

            setForm({
                ...record,
                data_nasc: formattedDate,
                obs: record.obs || ""
            });
        }
        fetchData();
    }, [params.id, navigate]);

    function updateForm(value) {
        setForm((prev) => ({ ...prev, ...value }));
    }

    async function onSubmit(e) {
        e.preventDefault();
        const editedAnimal = { ...form };
        const token = localStorage.getItem('token');

        try {
            // 2. ENVIA OS DADOS ATUALIZADOS PARA O BACKEND
            const response = await fetch(`${API_BASE_URL}/animal/update/${params.id}`, {
                method: "POST", // ou PUT, dependendo do seu backend
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(editedAnimal)
            });

            if (!response.ok) {
                const message = `Erro ao atualizar: ${response.statusText}`;
                window.alert(message);
                return;
            }

            window.alert("Animal atualizado com sucesso!");
            navigate("/animais");
        } catch (error) {
            console.error("Erro na atualização:", error);
            window.alert("Erro ao conectar ao servidor.");
        }
    }

    // Normalização para busca segura no objeto RACAS_POR_ESPECIE
    const especieChave = form.especie ? form.especie.charAt(0).toUpperCase() + form.especie.slice(1).toLowerCase() : "";
    const racasDisponiveis = RACAS_POR_ESPECIE[especieChave] || [];

    return (
        <div className="container mt-4">
            <h3 className="mb-4" style={{ color: primaryColor, fontWeight: 'bold' }}>
                <i className="bi bi-paw-fill me-2"></i> Editar Animal
            </h3>
            <hr />
            <form onSubmit={onSubmit}>
                {/* NOME */}
                <div className="form-group mb-3">
                    <label htmlFor="nome" className="fw-bold">Nome do Animal</label>
                    <input
                        type="text"
                        className="form-control shadow-sm"
                        id="nome"
                        value={form.nome}
                        onChange={(e) => updateForm({ nome: e.target.value })}
                        required
                    />
                </div>

                <div className="row">
                    {/* ESPÉCIE */}
                    <div className="form-group col-md-6 mb-3">
                        <label htmlFor="especie" className="fw-bold">Espécie</label>
                        <select 
                            className="form-control shadow-sm"
                            id="especie"
                            value={form.especie}
                            onChange={(e) => {
                                updateForm({ especie: e.target.value, raca: "" });
                            }}
                            required
                        >
                            <option value="">Selecione...</option>
                            <option value="Cachorro">Cachorro</option>
                            <option value="Gato">Gato</option>
                        </select>
                    </div>

                    {/* RAÇA - DINÂMICA */}
                    <div className="form-group col-md-6 mb-3">
                        <label htmlFor="raca" className="fw-bold">Raça</label>
                        <select 
                            className="form-control shadow-sm"
                            id="raca"
                            value={form.raca}
                            onChange={(e) => updateForm({ raca: e.target.value })}
                            disabled={!form.especie}
                            required
                        >
                            <option value="">Selecione a raça...</option>
                            {racasDisponiveis.map((raca) => (
                                <option key={raca} value={raca}>
                                    {raca}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="row">
                    {/* PORTE */}
                    <div className="form-group col-md-4 mb-3">
                        <label htmlFor="porte" className="fw-bold">Porte</label>
                        <select 
                            className="form-control shadow-sm"
                            id="porte"
                            value={form.porte}
                            onChange={(e) => updateForm({ porte: e.target.value })}
                            required
                        >
                            <option value="">Selecione...</option>
                            <option value="Pequeno">Pequeno</option>
                            <option value="Médio">Médio</option>
                            <option value="Grande">Grande</option>
                        </select>
                    </div>

                    {/* GÊNERO */}
                    <div className="form-group col-md-4 mb-3">
                        <label className="fw-bold d-block">Gênero</label>
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
                        <label htmlFor="data_nasc" className="fw-bold">Data de Nascimento (Aprox.)</label>
                        <input
                            type="date"
                            className="form-control shadow-sm"
                            id="data_nasc"
                            value={form.data_nasc}
                            onChange={(e) => updateForm({ data_nasc: e.target.value })}
                        />
                    </div>
                </div>

                {/* OBSERVAÇÕES */}
                <div className="form-group mb-3">
                    <label htmlFor="obs" className="fw-bold">Observações Médicas/Histórico</label>
                    <textarea
                        className="form-control shadow-sm"
                        id="obs"
                        rows="3"
                        value={form.obs}
                        onChange={(e) => updateForm({ obs: e.target.value })}
                    ></textarea>
                </div>

                {/* CHECKBOXES */}
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

                <div className="form-group mt-4 d-flex gap-2">
                    <button type="submit" className="btn text-white px-5 shadow-sm" style={{ backgroundColor: primaryColor, borderRadius: '6px', fontWeight: '500' }}>
                        Salvar Alterações
                    </button>
                    <button type="button" className="btn btn-outline-secondary px-5 shadow-sm" style={{ borderRadius: '6px' }} onClick={() => navigate(-1)}>
                        Cancelar
                    </button>
                </div>
            </form>
        </div>
    );
}