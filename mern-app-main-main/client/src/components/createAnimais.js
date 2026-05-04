import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const REACT_APP_YOUR_HOSTNAME = 'http://localhost:5050'; 

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

export default function CreateAnimais() {
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
    
    const navigate = useNavigate();

    function updateForm(value) {
        setForm((prev) => {
            return { ...prev, ...value };
        });
    }

    async function onSubmit(e) {
        e.preventDefault();

        const newAnimal = { ...form };

        try {
            const response = await fetch(`${REACT_APP_YOUR_HOSTNAME}/animal/add`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(newAnimal)
            });

            if (!response.ok) {
                // Captura a mensagem do servidor se algo deu errado (ex: validações do Schema)
                const message = `Erro ao salvar: ${response.statusText}`;
                window.alert(message);
                return;
            }

            window.alert("Animal cadastrado com sucesso!");
            navigate("/animais"); 
        } catch (error) {
            console.error("Erro na requisição:", error);
            window.alert("Não foi possível conectar ao servidor. Verifique se o backend está rodando!");
        }
    }

    return (
        <div className="container mt-4">
            <h3 className="mb-4">Cadastrar Novo Animal 🐾</h3>
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
                        <select 
                            className="form-control"
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
                        <label htmlFor="raca">Raça</label>
                        <select 
                            className="form-control"
                            id="raca"
                            value={form.raca}
                            onChange={(e) => updateForm({ raca: e.target.value })}
                            disabled={!form.especie}
                            required
                        >
                            <option value="">Selecione a raça...</option>
                            {form.especie && RACAS_POR_ESPECIE[form.especie].map((raca) => (
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
                        <label htmlFor="porte">Porte</label>
                        <select 
                            className="form-control"
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
                            value={form.data_nasc}
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

                <div className="form-group">
                    <input
                        type="submit"
                        value="Cadastrar Animal"
                        className="btn btn-success w-100"
                    />
                </div>
            </form>
        </div>
    );
}