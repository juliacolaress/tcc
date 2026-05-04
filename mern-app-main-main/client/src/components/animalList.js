import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const REACT_APP_YOUR_HOSTNAME = 'http://localhost:5050'; 

const AnimalRecord = (props) => {
    return (
        <tr>
            <td>{props.record.nome}</td>
            <td>{props.record.especie}</td>
            <td>{props.record.raca}</td>
            <td>{props.record.porte}</td>
            <td>
                <Link className="btn btn-link" to={`/edit-animal/${props.record._id}`}>Editar</Link>
                <button
                    className="btn btn-link text-danger"
                    onClick={() => {
                        props.deleteAnimal(props.record._id);
                    }}
                >
                    Excluir
                </button>
            </td>
        </tr>
    );
};

export default function AnimalList() {
    const [animais, setAnimais] = useState([]);

    // Busca os dados no banco de dados ao carregar a página
    useEffect(() => {
        async function getAnimais() {
            try {
                const response = await fetch(`${REACT_APP_YOUR_HOSTNAME}/animal`);

                if (!response.ok) {
                    const message = `Um erro ocorreu: ${response.statusText}`;
                    window.alert(message);
                    return;
                }

                const animaisData = await response.json();
                setAnimais(animaisData);
            } catch (error) {
                console.error("Erro ao buscar dados:", error);
            }
        }

        getAnimais();
    }, []); // Array vazio para rodar apenas uma vez na montagem

    // Função de exclusão
    async function deleteAnimal(id) {
        const result = window.confirm("Deseja remover este animal da lista?");
        if (!result) return;

        await fetch(`${REACT_APP_YOUR_HOSTNAME}/animal/${id}`, {
            method: "DELETE"
        });

        const newAnimais = animais.filter((record) => record._id !== id);
        setAnimais(newAnimais);
    }

    function recordList() {
        if (animais.length === 0) {
            return (
                <tr>
                    <td colSpan="5" className="text-center text-muted py-4">
                        Nenhum animal cadastrado no momento.
                    </td>
                </tr>
            );
        }

        return animais.map((record) => {
            return (
                <AnimalRecord
                    key={record._id}
                    record={record}
                    deleteAnimal={deleteAnimal} // Passa a referência da função
                />
            );
        });
    }

    return (
        <div className="container mt-4">
            <div className="d-flex justify-content-between align-items-center mb-4 ps-2">
                <h3>Lista de Animais Cadastrados</h3>
                {/* Certifique-se de que a rota bate com o App.js */}
                <Link className="btn btn-success" to="/create-animais"> 
                    + CADASTRAR ANIMAL
                </Link>
            </div>
            
            <table className="table table-striped table-hover" style={{ marginTop: 20 }}>
                <thead className="table-light">
                    <tr>
                        <th>Nome do Animal</th>
                        <th>Espécie</th>
                        <th>Raça</th>
                        <th>Porte</th>
                        <th>Ações</th>
                    </tr>
                </thead>
                <tbody>{recordList()}</tbody>
            </table>
        </div>
    );
}