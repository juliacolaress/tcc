import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import API_BASE_URL from "../api/config";
import BackButton from "./BackButton";

export default function Create() {
    const [form, setForm] = useState({
        name: "",
        user: "",
        email: "",
        function: ""
    });
    const navigate = useNavigate();

    function updateForm(value) {
        setForm((prev) => {
            return { ...prev, ...value };
        });
    }

    async function onSubmit(e) {
        e.preventDefault();

        // Se o usuário esquecer de selecionar uma função, avisa antes de enviar
        if (!form.function) {
            window.alert("Por favor, selecione uma função institucional.");
            return;
        }

        const newPerson = { ...form };
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/user/add`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(newPerson)
        });

        if (!response.ok) {
            const message = `An error occurred: ${response.statusText}`;
            window.alert(message);
            return;
        }

        setForm({ name: "", user: "", email: "", function: "" });
        navigate("/usuarios");
    }

    const primaryColor = '#3D2314';

    return (
        <div className="container mt-4">
            {/* Cabeçalho */}
            <div className="mb-4">
                <BackButton destinoPadrao="/dashboard" />
                <div className="mt-3">
                    <h3 style={{ color: primaryColor, fontWeight: 'bold' }}>
                        <i className="bi bi-person-fill me-2"></i> Cadastrar novo usuário
                    </h3>
                </div>
            </div>
            <hr />

            {/* Formulário */}
            <form onSubmit={onSubmit}>
                <div className="form-group mb-3">
                    <label htmlFor="name" className="fw-bold mb-1">Nome completo</label>
                    <input
                        type="text"
                        className="form-control shadow-sm"
                        id="name"
                        value={form.name}
                        onChange={(e) => updateForm({ name: e.target.value })}
                        placeholder="Digite o nome completo"
                        required
                    />
                </div>

                <div className="form-group mb-3">
                    <label htmlFor="user" className="fw-bold mb-1">Username</label>
                    <input
                        type="text"
                        className="form-control shadow-sm"
                        id="user"
                        value={form.user}
                        onChange={(e) => updateForm({ user: e.target.value })}
                        placeholder="Escolha um nome de usuário"
                        required
                    />
                </div>

                <div className="form-group mb-3">
                    <label htmlFor="email" className="fw-bold mb-1">E-mail</label>
                    <input
                        type="email"
                        className="form-control shadow-sm"
                        id="email"
                        value={form.email}
                        onChange={(e) => updateForm({ email: e.target.value })}
                        placeholder="exemplo@email.com"
                        required
                    />
                </div>

                {/* Seção de Função/Cargo atualizada para o contexto da ONG */}
                <div className="form-group mb-4">
                    <label className="fw-bold mb-2 d-block">Função institucional</label>
                    
                    <div className="form-check form-check-inline me-3">
                        <input
                            className="form-check-input"
                            type="radio"
                            name="positionOptions"
                            id="positionAdmin"
                            value="Administrador"
                            checked={form.function === "Administrador"}
                            onChange={(e) => updateForm({ function: e.target.value })}
                            style={{ borderColor: primaryColor }}
                        />
                        <label htmlFor="positionAdmin" className="form-check-label">Administrador</label>
                    </div>

                    <div className="form-check form-check-inline me-3">
                        <input
                            className="form-check-input"
                            type="radio"
                            name="positionOptions"
                            id="positionVoluntario"
                            value="Voluntário"
                            checked={form.function === "Voluntário"}
                            onChange={(e) => updateForm({ function: e.target.value })}
                            style={{ borderColor: primaryColor }}
                        />
                        <label htmlFor="positionVoluntario" className="form-check-label">Voluntário</label>
                    </div>

                    <div className="form-check form-check-inline">
                        <input
                            className="form-check-input"
                            type="radio"
                            name="positionOptions"
                            id="positionVeterinario"
                            value="Veterinário"
                            checked={form.function === "Veterinário"}
                            onChange={(e) => updateForm({ function: e.target.value })}
                            style={{ borderColor: primaryColor }}
                        />
                        <label htmlFor="positionVeterinario" className="form-check-label">Veterinário</label>
                    </div>
                </div>

                {/* Botão de Envio */}
                <div className="form-group mt-4">
                    <button
                        type="submit"
                        className="btn text-white px-5 py-2 shadow-sm"
                        style={{ backgroundColor: primaryColor, borderRadius: '6px', fontWeight: '500' }}
                    >
                        <i className="bi bi-check-circle me-2"></i> Enviar dados
                    </button>
                </div>
            </form>
        </div>
    );
}