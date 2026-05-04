import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const REACT_APP_YOUR_HOSTNAME = 'http://localhost:5050';

const DoacaoRecord = (props) => (
    <tr>
        <td>{props.record.nome}</td>
        <td>{props.record.tipo_doacao}</td>
        <td>{props.record.item}</td>
        <td>{props.record.valor ? `R$ ${props.record.valor}` : "---"}</td>
        <td>
            {/* BOTÃO EDITAR */}
            <Link className="btn btn-link text-primary" to={`/edit-doacao/${props.record._id}`}>
                Editar
            </Link>
            <span className="mx-1">|</span> 
            {/* BOTÃO EXCLUIR */}
            <button className="btn btn-link text-danger" onClick={() => props.deleteDoacao(props.record._id)}>
                Excluir
            </button>
        </td>
    </tr>
);

export default function DoacaoList() {
    const [doacoes, setDoacoes] = useState([]);

    // Busca as doações ao carregar o componente
    useEffect(() => {
        async function getDoacoes() {
            try {
                const response = await fetch(`${REACT_APP_YOUR_HOSTNAME}/doacoes`);
                if (!response.ok) {
                    console.error("Erro ao buscar doações:", response.statusText);
                    return;
                }
                const data = await response.json();
                setDoacoes(data);
            } catch (error) {
                console.error("Erro de conexão:", error);
            }
        }
        getDoacoes();
    }, []); 

    async function deleteDoacao(id) {
        if (!window.confirm("Excluir esta doação?")) return;
        
        await fetch(`${REACT_APP_YOUR_HOSTNAME}/doacao/${id}`, { method: "DELETE" });
        setDoacoes(doacoes.filter((el) => el._id !== id));
    }

    return (
        <div className="container mt-4">
            <div className="d-flex justify-content-between align-items-center">
                <h3>Doações Recebidas</h3>
                <Link className="btn btn-warning" to="/cadastrar-doacao">+ NOVA DOAÇÃO</Link>
            </div>
            
            <table className="table table-striped mt-3">
                <thead>
                    <tr>
                        <th>Doador</th>
                        <th>Tipo</th>
                        <th>Item</th>
                        <th>Valor</th>
                        <th>Ações</th>
                    </tr>
                </thead>
                <tbody>
                    {doacoes.length > 0 ? (
                        doacoes.map((doacao) => (
                            <DoacaoRecord 
                                record={doacao} 
                                deleteDoacao={deleteDoacao} 
                                key={doacao._id} 
                            />
                        ))
                    ) : (
                        <tr>
                            <td colSpan="5" className="text-center">Nenhuma doação encontrada.</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}