import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import API_BASE_URL from "../api/config";

export default function Create() {
    const [form, setForm] = useState({
        name: "",
        user: "",
        email: "",
        function: ""
    })
    const navigate = useNavigate()

    function updateForm(value) {
        setForm((prev) => {
            return { ...prev, ...value }
        })
    }

    async function onSubmit(e) {
        e.preventDefault()

        const newPerson = { ...form }
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/user/add`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(newPerson)
        })

        if (!response.ok) {
            const message = `An error occurred: ${response.statusText}`
            window.alert(message)
            return
        }

        setForm({ name: "", user: "", email: "", function: "" })
        navigate("/usuarios")
    }

    const primaryColor = '#5c3a21';

    return (
        <div className="container mt-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h3 style={{ color: primaryColor, fontWeight: 'bold' }}>Cadastrar novo usuário</h3>
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
            <form onSubmit={onSubmit}>
                <div className="form-group mb-3">
                    <label htmlFor="name" className="fw-bold">Nome completo</label>
                    <input
                        type="text"
                        className="form-control shadow-sm"
                        id="name"
                        value={form.name}
                        onChange={(e) => updateForm({ name: e.target.value })}
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="user">Username</label>
                    <input
                        type="text"
                        className="form-control"
                        id="user"
                        value={form.user}
                        onChange={(e) => updateForm({ user: e.target.value })}
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="email">E-mail</label>
                    <input
                        type="text"
                        className="form-control"
                        id="email"
                        value={form.email}
                        onChange={(e) => updateForm({ email: e.target.value })}
                    />
                </div>
                <div className="form-group">
                    <div className="form-check form-check-inline">
                        <input
                            className="form-check-input"
                            type="radio"
                            name="positionOptions"
                            id="positionEstudante"
                            value="Estudante"
                            checked={form.function === "Estudante"}
                            onChange={(e) => updateForm({ function: e.target.value })}
                        />
                        <label htmlFor="positionEstudante" className="form-check-label">Estudante</label>
                    </div>
                    <div className="form-check form-check-inline">
                        <input
                            className="form-check-input"
                            type="radio"
                            name="positionOptions"
                            id="positionDocente"
                            value="Docente"
                            checked={form.function === "Docente"}
                            onChange={(e) => updateForm({ function: e.target.value })}
                        />
                        <label htmlFor="positionDocente" className="form-check-label">Docente</label>
                    </div>
                    <div className="form-check form-check-inline">
                        <input
                            className="form-check-input"
                            type="radio"
                            name="positionOptions"
                            id="positionTae"
                            value="Tae"
                            checked={form.function === "Tae"}
                            onChange={(e) => updateForm({ function: e.target.value })}
                        />
                        <label htmlFor="positionTae" className="form-check-label">Técnico Administrativo</label>
                    </div>
                </div>
                <div className="form-group mt-4">
                    <input
                        type="submit"
                        value="Enviar dados"
                        className="btn text-white px-5 shadow-sm"
                        style={{ backgroundColor: primaryColor, borderRadius: '6px', fontWeight: '500' }}
                    />
                </div>
            </form>
        </div>
    )
}