import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import API_BASE_URL from "../api/config";

const CATEGORIAS = ["Ração", "Medicamentos", "Suprimentos", "Higiene", "Outros"];

export default function CreateNecessidade() {
    const [form, setForm] = useState({
        titulo: "",
        categoria: "",
        quantidade_desejada: "",
        descricao: "",
        imagem: ""
    });
    const [imagemFile, setImagemFile] = useState(null);
    const [imagemPreview, setImagemPreview] = useState("");
    const [uploading, setUploading] = useState(false);

    const navigate = useNavigate();
    const primaryColor = '#4a2511';
    const labelStyle = { color: primaryColor, fontWeight: '600', marginBottom: '6px' };
    const inputStyle = { borderRadius: '6px', border: '1px solid #ced4da' };

    function updateForm(value) {
        setForm((prev) => ({ ...prev, ...value }));
    }

    function handleFileSelect(e) {
        const file = e.target.files && e.target.files[0];
        if (!file || !file.type.startsWith("image/")) return;

        setImagemFile(file);
        const reader = new FileReader();
        reader.onload = (ev) => setImagemPreview(ev.target.result);
        reader.readAsDataURL(file);
    }

    async function uploadImagem(token) {
        const formData = new FormData();
        formData.append("foto", imagemFile);
        const response = await fetch(`${API_BASE_URL}/upload`, {
            method: "POST",
            headers: { "Authorization": `Bearer ${token}` },
            body: formData
        });
        if (!response.ok) {
            let mensagem = "Erro ao enviar imagem";
            try {
                const data = await response.json();
                if (data && data.mensagem) mensagem = data.mensagem;
            } catch (_) {}
            throw new Error(mensagem);
        }
        const data = await response.json();
        return data.url;
    }

    async function onSubmit(e) {
        e.preventDefault();

        if (!form.titulo.trim() || !form.categoria) {
            window.alert("Preencha o item e a categoria da necessidade.");
            return;
        }

        const token = localStorage.getItem('token');
        setUploading(true);

        try {
            let imagem = form.imagem;
            if (imagemFile) {
                imagem = await uploadImagem(token);
            }

            const body = { ...form, imagem };

            const response = await fetch(`${API_BASE_URL}/necessidades`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(body)
            });

            if (!response.ok) {
                let mensagem = "Erro ao cadastrar necessidade.";
                try {
                    const data = await response.json();
                    if (data && data.mensagem) mensagem = data.mensagem;
                } catch (_) {}
                window.alert(mensagem);
                return;
            }

            window.alert("Necessidade cadastrada com sucesso!");
            navigate("/necessidades");
        } catch (error) {
            console.error("Erro na requisição:", error);
            window.alert(error.message || "Não foi possível conectar ao servidor.");
        } finally {
            setUploading(false);
        }
    }

    return (
        <div className="container-fluid py-2">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h3 style={{ color: primaryColor, fontWeight: 'bold' }}>
                        <i className="bi bi-box-seam-fill me-2"></i> Cadastrar Necessidade de Doação
                    </h3>
                    <p className="text-muted mb-0">Registre um item que a ONG precisa receber</p>
                </div>
                <button
                    type="button"
                    onClick={() => navigate("/necessidades")}
                    className="btn btn-outline-secondary px-4 py-2"
                    style={{ borderRadius: '6px' }}
                >
                    <i className="bi bi-arrow-left me-2"></i> Voltar
                </button>
            </div>

            <form onSubmit={onSubmit}>
                <div className="card border-0 shadow-sm p-4 mb-4" style={{ borderRadius: '8px' }}>
                    <div className="row">
                        <div className="form-group col-md-6 mb-3">
                            <label htmlFor="titulo" style={labelStyle}>Item / Título</label>
                            <input type="text" className="form-control px-3 py-2" id="titulo" style={inputStyle} value={form.titulo} onChange={(e) => updateForm({ titulo: e.target.value })} placeholder="Ex: Ração para filhotes 15kg" required />
                        </div>
                        <div className="form-group col-md-6 mb-3">
                            <label htmlFor="categoria" style={labelStyle}>Categoria</label>
                            <select className="form-select px-3 py-2" id="categoria" style={inputStyle} value={form.categoria} onChange={(e) => updateForm({ categoria: e.target.value })} required>
                                <option value="">Selecione...</option>
                                {CATEGORIAS.map((cat) => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="row">
                        <div className="form-group col-md-6 mb-3">
                            <label htmlFor="quantidade_desejada" style={labelStyle}>Quantidade Desejada</label>
                            <input type="text" className="form-control px-3 py-2" id="quantidade_desejada" style={inputStyle} value={form.quantidade_desejada} onChange={(e) => updateForm({ quantidade_desejada: e.target.value })} placeholder="Ex: 10 sacos / 5 caixas" />
                        </div>
                        <div className="form-group col-md-6 mb-3">
                            <label htmlFor="imagem" style={labelStyle}>Imagem (opcional)</label>
                            <input type="file" accept="image/*" className="form-control px-3 py-2" id="imagem" style={inputStyle} onChange={handleFileSelect} />
                            {imagemPreview && (
                                <img src={imagemPreview} alt="Prévia" style={{ marginTop: '10px', width: '100px', height: '100px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #eadfcf' }} />
                            )}
                        </div>
                    </div>

                    <div className="row">
                        <div className="form-group col-md-12 mb-3">
                            <label htmlFor="descricao" style={labelStyle}>Descrição</label>
                            <textarea className="form-control px-3 py-2" id="descricao" rows="3" style={inputStyle} value={form.descricao} onChange={(e) => updateForm({ descricao: e.target.value })} placeholder="Detalhes sobre a necessidade (marca, tamanho, observações...)" />
                        </div>
                    </div>
                </div>

                <div className="form-group text-end mb-4">
                    <button type="submit" className="btn text-white px-5 py-2 shadow-sm" style={{ backgroundColor: primaryColor, borderRadius: '6px', fontSize: '1rem', fontWeight: '500' }} disabled={uploading}>
                        {uploading ? (
                            <><span className="spinner-border spinner-border-sm me-2" role="status"></span> Enviando...</>
                        ) : (
                            <><i className="bi bi-check-lg me-2"></i> Confirmar Cadastro</>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}
