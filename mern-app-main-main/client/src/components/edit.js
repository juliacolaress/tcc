import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API_BASE_URL from "../api/config";

export default function Edit() {
    const [form, setForm] = useState({
        name: "",
        user: "",
        email: "",
        function: ""
    });
    const params = useParams();
    const navigate = useNavigate();
    const primaryColor = '#5c3a21';

    useEffect(() => {
        async function fetchData() {
            const id = params.id;
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/user/${id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (!response.ok) {
                const message = `An error occurred: ${response.statusText}`;
                window.alert(message);
                return;
            }

            const user = await response.json();
            if (!user) {
                window.alert(`Usuário com id ${id} não encontrado`);
                navigate("/usuarios");
                return;
            }

            setForm(user);
        }

        fetchData();
    }, [params.id, navigate]);

    function updateForm(value) {
        setForm((prev) => {
            return { ...prev, ...value };
        });
    }

    async function onSubmit(e) {
        e.preventDefault();

        if (!form.function) {
            window.alert("Por favor, selecione uma função institucional.");
            return;
        }

        const editedPerson = { ...form };
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/update/${params.id}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(editedPerson)
        });

        if (!response.ok) {
            const message = `An error occurred: ${response.statusText}`;
            window.alert(message);
            return;
        }

        navigate("/usuarios");
    }

    return (
        <div className="container mt-4">
            {/* Cabeçalho espelhado do Create */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h3 style={{ color: primaryColor, fontWeight: 'bold' }}>
                    <i className="bi bi-pencil-square me-2"></i> Alteração de dados do Usuário
                </h3>
                <button 
                    type="button"
                    onClick={() => navigate(-1)} 
                    className="btn px-4 py-2" 
                    style={{ borderRadius: '6px', color: primaryColor, borderColor: primaryColor, fontWeight: '500' }}
                >
                    <i className="bi bi-arrow-left me-2"></i> Voltar
                </button>
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
                        required
                    />
                </div>

                {/* Seção de Função/Cargo com as opções corretas da ONG Patas & Lares */}
                <div className="form-group mb-4">
                    <label className="fw-bold d-block mb-2">Função institucional</label>
                    
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

                {/* Botões de Ação na base */}
                <div className="form-group d-flex gap-2 mt-4">
                    <button 
                        type="submit" 
                        className="btn text-white px-5 py-2 shadow-sm" 
                        style={{ backgroundColor: primaryColor, borderRadius: '6px', fontWeight: '500' }}
                    >
                        <i className="bi bi-save me-2"></i> Salvar Alterações
                    </button>
                    <button 
                        type="button" 
                        className="btn btn-outline-secondary px-5 py-2 shadow-sm" 
                        style={{ borderRadius: '6px', fontWeight: '500' }} 
                        onClick={() => navigate(-1)}
                    >
                        Cancelar
                    </button>
                </div>
            </form>
        </div>
    );
}