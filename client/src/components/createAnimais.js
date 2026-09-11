import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import API_BASE_URL from "../api/config";
import BackButton from "./BackButton";

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
        status: "Disponível", // Mantido como String para suportar o fluxo de histórico
        genero: "",
        castracao: false,
        estado_saude: "",
        doencas_pre_ex: "",
        pelo: "",
        amputacao: false,
        cor: "",
        ong: false
    });

    const [fotosFiles, setFotosFiles] = useState([]);
    const [fotosPreview, setFotosPreview] = useState([]);
    const [uploading, setUploading] = useState(false);
    
    const navigate = useNavigate();
    const primaryColor = '#4a2511';

    function updateForm(value) {
        setForm((prev) => ({ ...prev, ...value }));
    }

    function handleFileSelect(e) {
        const files = Array.from(e.target.files);
        const novos = files.filter(f => f.type.startsWith("image/"));
        if (novos.length === 0) return;

        setFotosFiles(prev => [...prev, ...novos].slice(0, 3));

        novos.forEach(file => {
            const reader = new FileReader();
            reader.onload = (ev) => {
                setFotosPreview(prev => [...prev, ev.target.result].slice(0, 3));
            };
            reader.readAsDataURL(file);
        });
    }

    function removerFoto(index) {
        setFotosFiles(prev => prev.filter((_, i) => i !== index));
        setFotosPreview(prev => prev.filter((_, i) => i !== index));
    }

    async function uploadFotos(token) {
        const urls = [];
        for (const file of fotosFiles) {
            const formData = new FormData();
            formData.append("foto", file);
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
            urls.push(data.url);
        }
        return urls;
    }

    async function onSubmit(e) {
        e.preventDefault();

        if (!form.genero) {
            window.alert("Por favor, selecione o gênero do animal.");
            return;
        }

        const token = localStorage.getItem('token');
        setUploading(true);

        try {
            let urls = [];
            if (fotosFiles.length > 0) {
                urls = await uploadFotos(token);
            }

            const newAnimal = {
                ...form,
                fotoUrl: urls[0] || "",
                fotos: urls
            };

            const response = await fetch(`${API_BASE_URL}/animal/add`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(newAnimal)
            });

            if (!response.ok) {
                const message = `Erro ao salvar: ${response.statusText}`;
                window.alert(message);
                return;
            }

            window.alert("Animal cadastrado com sucesso!");
            navigate("/animais"); 
        } catch (error) {
            console.error("Erro na requisição:", error);
            window.alert(error.message || "Erro ao conectar ao servidor.");
        } finally {
            setUploading(false);
        }
    }

    const labelStyle = { color: '#4a2511', fontWeight: '600', marginBottom: '6px' };
    const inputStyle = { borderRadius: '6px', border: '1px solid #ced4da' };

    return (
        <div className="container-fluid py-2">
            <BackButton destinoPadrao="/dashboard" />
            <div className="mt-3 mb-4">
                <h3 style={{ color: primaryColor, fontWeight: 'bold' }}>Cadastrar Novo Animal 🐾</h3>
                <p className="text-muted mb-0">Registre um novo pet sob os cuidados da ONG</p>
            </div>

            <form onSubmit={onSubmit}>
                <div className="card border-0 shadow-sm p-4 mb-4" style={{ borderRadius: '8px' }}>
                    <h5 className="mb-4 pb-2 border-bottom text-muted text-uppercase small fw-bold" style={{ letterSpacing: '0.5px' }}>
                        Informações Básicas
                    </h5>

                    <div className="row">
                        <div className="form-group col-md-12 mb-3">
                            <label style={labelStyle}>Nome do Animal</label>
                            <input type="text" className="form-control px-3 py-2" style={inputStyle} value={form.nome} onChange={(e) => updateForm({ nome: e.target.value })} placeholder="Ex: Rex" required />
                        </div>
                    </div>

                    <div className="row">
                        <div className="form-group col-md-6 mb-3">
                            <label style={labelStyle}>Espécie</label>
                            <select className="form-select px-3 py-2" style={inputStyle} value={form.especie} onChange={(e) => updateForm({ especie: e.target.value, raca: "" })} required>
                                <option value="">Selecione...</option>
                                <option value="Cachorro">Cachorro</option>
                                <option value="Gato">Gato</option>
                            </select>
                        </div>
                        <div className="form-group col-md-6 mb-3">
                            <label style={labelStyle}>Raça</label>
                            <select className="form-select px-3 py-2" style={inputStyle} value={form.raca} onChange={(e) => updateForm({ raca: e.target.value })} disabled={!form.especie} required>
                                <option value="">Selecione a raça...</option>
                                {form.especie && RACAS_POR_ESPECIE[form.especie].map((raca) => (
                                    <option key={raca} value={raca}>{raca}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="row">
                        <div className="form-group col-md-4 mb-3">
                            <label style={labelStyle}>Porte</label>
                            <select className="form-select px-3 py-2" style={inputStyle} value={form.porte} onChange={(e) => updateForm({ porte: e.target.value })} required>
                                <option value="">Selecione...</option>
                                <option value="Pequeno">Pequeno</option>
                                <option value="Médio">Médio</option>
                                <option value="Grande">Grande</option>
                            </select>
                        </div>
                        <div className="form-group col-md-4 mb-3">
                            <label style={labelStyle}>Gênero</label>
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
                        <div className="form-group col-md-4 mb-3">
                            <label style={labelStyle}>Data de Nascimento (Aprox.)</label>
                            <input type="date" className="form-control px-3 py-2" style={inputStyle} value={form.data_nasc} onChange={(e) => updateForm({ data_nasc: e.target.value })} />
                        </div>
                    </div>

                    <h5 className="mb-4 mt-4 pb-2 border-bottom text-muted text-uppercase small fw-bold" style={{ letterSpacing: '0.5px' }}>
                        Fotos do Animal
                    </h5>

                    <div className="form-group mb-4">
                        <label style={labelStyle}>Fotos (máximo 3)</label>
                        <input
                            type="file"
                            className="form-control px-3 py-2"
                            style={inputStyle}
                            multiple
                            accept="image/jpeg,image/png,image/gif,image/webp"
                            onChange={handleFileSelect}
                            disabled={fotosFiles.length >= 3}
                        />
                        <small className="text-muted">Formatos: JPG, PNG, GIF, WebP. Tamanho máximo: 5MB cada.</small>
                        
                        {fotosPreview.length > 0 && (
                            <div className="d-flex gap-2 mt-3 flex-wrap">
                                {fotosPreview.map((preview, index) => (
                                    <div key={index} className="position-relative" style={{ width: '100px', height: '100px' }}>
                                        <img
                                            src={preview}
                                            alt={`Preview ${index + 1}`}
                                            style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '6px', border: '1px solid #dee2e6' }}
                                        />
                                        <button
                                            type="button"
                                            className="btn btn-danger btn-sm position-absolute"
                                            style={{ top: '-8px', right: '-8px', borderRadius: '50%', width: '24px', height: '24px', padding: '0', fontSize: '12px' }}
                                            onClick={() => removerFoto(index)}
                                        >
                                            ×
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <h5 className="mb-4 mt-4 pb-2 border-bottom text-muted text-uppercase small fw-bold" style={{ letterSpacing: '0.5px' }}>
                        Situação e Detalhes de Saúde
                    </h5>

                    {/* STATUS DE ADOÇÃO (Adicionado dinamicamente seguindo o padrão estético) */}
                    <div className="row mb-4">
                        <div className="form-group col-md-12">
                            <label style={labelStyle}>Status de Adoção</label>
                            <div className="mt-1">
                                <div className="form-check form-check-inline me-4">
                                    <input 
                                        className="form-check-input" 
                                        type="radio" 
                                        name="status" 
                                        id="statusDisponivel" 
                                        value="Disponível" 
                                        checked={form.status === "Disponível"} 
                                        onChange={(e) => updateForm({ status: e.target.value })} 
                                        style={{ borderColor: primaryColor }}
                                    />
                                    <label className="form-check-label" htmlFor="statusDisponivel">
                                        <span className="badge bg-success-subtle text-success border border-success-subtle px-2 py-1">Disponível para Adoção</span>
                                    </label>
                                </div>
                                <div className="form-check form-check-inline">
                                    <input 
                                        className="form-check-input" 
                                        type="radio" 
                                        name="status" 
                                        id="statusAdotado" 
                                        value="Adotado" 
                                        checked={form.status === "Adotado"} 
                                        onChange={(e) => updateForm({ status: e.target.value })} 
                                        style={{ borderColor: primaryColor }}
                                    />
                                    <label className="form-check-label" htmlFor="statusAdotado">
                                        <span className="badge bg-secondary-subtle text-secondary border border-secondary-subtle px-2 py-1">Adotado</span>
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="row mb-3">
                        <div className="col-md-12">
                            <div className="form-check form-check-inline">
                                <input className="form-check-input" type="checkbox" id="castracao" checked={form.castracao} onChange={(e) => updateForm({ castracao: e.target.checked })} />
                                <label className="form-check-label" htmlFor="castracao" style={{ fontWeight: '500' }}>Castrado</label>
                            </div>
                            <div className="form-check form-check-inline ms-3">
                                <input className="form-check-input" type="checkbox" id="amputacao" checked={form.amputacao} onChange={(e) => updateForm({ amputacao: e.target.checked })} />
                                <label className="form-check-label" htmlFor="amputacao" style={{ fontWeight: '500' }}>Possui Amputação</label>
                            </div>
                        </div>
                    </div>

                    <div className="form-group mb-3">
                        <label style={labelStyle}>Observações Médicas / Histórico</label>
                        <textarea className="form-control px-3 py-2" style={inputStyle} rows="3" value={form.obs} onChange={(e) => updateForm({ obs: e.target.value })} placeholder="Descreva o estado de saúde ou histórico do animal..."></textarea>
                    </div>
                </div>

                <div className="form-group text-end mb-4">
                    <button type="submit" className="btn text-white px-5 py-2 shadow-sm" style={{ backgroundColor: primaryColor, borderRadius: '6px', fontWeight: '500' }} disabled={uploading}>
                        {uploading ? (
                            <>
                                <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                                Enviando fotos...
                            </>
                        ) : (
                            <>
                                <i className="bi bi-check-lg me-2"></i> Cadastrar Animal
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}