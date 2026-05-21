import React, { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import API_BASE_URL from "../api/config";

export default function Edit() {
    const [form, setForm] = useState({
        name: "",
        user: "",
        email: "",
        function: ""
    })
    const params = useParams()
    const navigate = useNavigate()
    const primaryColor = '#5c3a21';

    useEffect(() => {
        async function fetchData() {
            const id = params.id
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/user/${id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
            if (!response.ok) {
                const message = `An error occurred: ${response.statusText}`
                window.alert(message)
                return
            }

            const user = await response.json()
            if (!user) {
                window.alert(`Usuário com id ${id} não encontrado`)
                navigate("/usuarios")
                return
            }

            setForm(user)
        }

        fetchData()

        return
    }, [params.id, navigate])

    function updateForm(value) {
        setForm((prev) => {
            return { ...prev, ...value }
        })
    }

    async function onSubmit(e) {
        e.preventDefault()

        const editedPerson = { ...form }
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/update/${params.id}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(editedPerson)
        })

        if (!response.ok) {
            const message = `An error occurred: ${response.statusText}`
            window.alert(message)
            return
        }

        navigate("/usuarios")
    }

    return (
        <div className="container mt-4">
            <h3 className="mb-4" style={{ color: primaryColor, fontWeight: 'bold' }}>
                <i className="bi bi-person-fill me-2"></i> Alteração de dados do Usuário
            </h3>
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
                <div className="form-group mb-3">
                    <label htmlFor="user" className="fw-bold">Username</label>
                    <input
                        type="text"
                        className="form-control shadow-sm"
                        id="user"
                        value={form.user}
                        onChange={(e) => updateForm({ user: e.target.value })}
                    />
                </div>
                <div className="form-group mb-3">
                    <label htmlFor="email" className="fw-bold">E-mail</label>
                    <input
                        type="text"
                        className="form-control shadow-sm"
                        id="email"
                        value={form.email}
                        onChange={(e) => updateForm({ email: e.target.value })}
                    />
                </div>
                <div className="form-group mb-4">
                    <label className="fw-bold d-block mb-2">Função</label>
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
                <div className="form-group d-flex gap-2">
                    <button type="submit" className="btn text-white px-5 shadow-sm" style={{ backgroundColor: primaryColor, borderRadius: '6px', fontWeight: '500' }}>
                        Salvar Alterações
                    </button>
                    <button type="button" className="btn btn-outline-secondary px-5 shadow-sm" style={{ borderRadius: '6px' }} onClick={() => navigate(-1)}>
                        Cancelar
                    </button>
                </div>
            </form>
        </div>
    )
}
