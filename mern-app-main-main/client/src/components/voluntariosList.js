import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const REACT_APP_YOUR_HOSTNAME = 'http://localhost:5050';

const VoluntarioRecord = (props) => (
    <tr>
        <td>{props.record.nome}</td>
        <td>{props.record.email}</td>
        <td>{props.record.area_interesse}</td>
        {/* Ajuste aqui: dias_disponiveis é um array, usamos .join() para exibir bonito */}
        <td>
            {props.record.dias_disponiveis ? props.record.dias_disponiveis.join(", ") : "Não informado"} ({props.record.horario})
        </td>
        <td>
           
            <Link className="btn btn-link" to={`/edit-voluntarios/${props.record._id}`}>
                Editar
            </Link>
            |
            <button className="btn btn-link text-danger" onClick={() => props.deleteVoluntario(props.record._id)}>
                Excluir
            </button>
        </td>
    </tr>
);

export default function VoluntarioList() {
    const [voluntarios, setVoluntarios] = useState([]);

   
    useEffect(() => {
        async function getVoluntarios() {
            try {
                const response = await fetch(`${REACT_APP_YOUR_HOSTNAME}/voluntarios`);
                
                if (!response.ok) {
                    console.error("Erro ao buscar voluntários");
                    return;
                }

                const data = await response.json();
                setVoluntarios(data);
            } catch (error) {
                console.error("Erro de conexão:", error);
            }
        }
        getVoluntarios();
    }, []); 

    async function deleteVoluntario(id) {
        if (!window.confirm("Tem certeza que deseja excluir este voluntário?")) return;

        await fetch(`${REACT_APP_YOUR_HOSTNAME}/voluntario/${id}`, {
            method: "DELETE",
        });

        const newVoluntarios = voluntarios.filter((el) => el._id !== id);
        setVoluntarios(newVoluntarios);
    }

    return (
        <div className="container mt-4">
            <div className="d-flex justify-content-between align-items-center">
                <h3>Voluntários Cadastrados</h3>
                <Link className="btn btn-primary" to="/cadastrar-voluntarios">+ CADASTRAR NOVO VOLUNTÁRIO</Link>
            </div>
            
            <table className="table table-striped mt-3">
                <thead>
                    <tr>
                        <th>Nome</th>
                        <th>E-mail</th>
                        <th>Área de Interesse</th>
                        <th>Disponibilidade</th>
                        <th>Ações</th>
                    </tr>
                </thead>
                <tbody>
                    {voluntarios.length > 0 ? (
                        voluntarios.map((voluntario) => (
                            <VoluntarioRecord 
                                record={voluntario} 
                                deleteVoluntario={deleteVoluntario} 
                                key={voluntario._id} 
                            />
                        ))
                    ) : (
                        <tr>
                            <td colSpan="5" className="text-center">Nenhum voluntário encontrado.</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}