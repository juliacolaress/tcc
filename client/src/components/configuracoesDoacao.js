import React, { useState, useEffect } from "react";
import API_BASE_URL from "../api/config";
import { resolverUrl, aoErrarImagem } from "../utils/fotos";
import BackButton from "./BackButton";

export default function ConfiguracoesDoacao() {
    const [form, setForm] = useState({
        razaoSocial: "",
        cnpj: "",
        banco: "",
        agencia: "",
        contaCorrente: "",
        chavePix: "",
        qrCode: ""
    });
    const [qrFile, setQrFile] = useState(null);
    const [qrPreview, setQrPreview] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const primaryColor = '#3D2314';
    const labelStyle = { color: primaryColor, fontWeight: '600', marginBottom: '6px' };
    const inputStyle = { borderRadius: '6px', border: '1px solid #ced4da' };

    const token = localStorage.getItem('token');

    useEffect(() => {
        async function carregarConfig() {
            try {
                const response = await fetch(`${API_BASE_URL}/configuracoes/doacao`);
                if (!response.ok) throw new Error(`HTTP ${response.status}`);
                const data = await response.json();
                setForm({
                    razaoSocial: data.razaoSocial || "",
                    cnpj: data.cnpj || "",
                    banco: data.banco || "",
                    agencia: data.agencia || "",
                    contaCorrente: data.contaCorrente || "",
                    chavePix: data.chavePix || "",
                    qrCode: data.qrCode || ""
                });
            } catch (error) {
                console.error("Erro ao carregar configurações:", error);
                window.alert("Não foi possível carregar os dados de doação. Tente novamente.");
            } finally {
                setLoading(false);
            }
        }
        carregarConfig();
    }, []);

    function updateForm(value) {
        setForm((prev) => ({ ...prev, ...value }));
    }

    function handleQrSelect(e) {
        const file = e.target.files && e.target.files[0];
        if (!file || !file.type.startsWith("image/")) return;

        setQrFile(file);
        const reader = new FileReader();
        reader.onload = (ev) => setQrPreview(ev.target.result);
        reader.readAsDataURL(file);
    }

    async function uploadQr() {
        const formData = new FormData();
        formData.append("foto", qrFile);
        const response = await fetch(`${API_BASE_URL}/upload`, {
            method: "POST",
            headers: { "Authorization": `Bearer ${token}` },
            body: formData
        });
        if (!response.ok) {
            let mensagem = "Erro ao enviar imagem do QR Code";
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

        if (!form.razaoSocial.trim() || !form.cnpj.trim() || !form.chavePix.trim()) {
            window.alert("Preencha pelo menos a Razão Social, o CNPJ e a Chave PIX.");
            return;
        }

        setSaving(true);

        try {
            let qrCode = form.qrCode;
            if (qrFile) {
                qrCode = await uploadQr();
            }

            const response = await fetch(`${API_BASE_URL}/configuracoes/doacao`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ ...form, qrCode })
            });

            if (!response.ok) {
                let mensagem = `Erro ao salvar. (HTTP ${response.status})`;
                try {
                    const data = await response.json();
                    if (data && data.mensagem) mensagem = data.mensagem;
                } catch (_) {}
                window.alert(mensagem);
                return;
            }

            const data = await response.json();
            setForm({
                razaoSocial: data.razaoSocial || "",
                cnpj: data.cnpj || "",
                banco: data.banco || "",
                agencia: data.agencia || "",
                contaCorrente: data.contaCorrente || "",
                chavePix: data.chavePix || "",
                qrCode: data.qrCode || ""
            });
            setQrFile(null);
            setQrPreview("");
            window.alert("Dados de doação atualizados com sucesso!");
        } catch (error) {
            console.error("Erro na requisição:", error);
            window.alert(error.message || "Não foi possível conectar ao servidor.");
        } finally {
            setSaving(false);
        }
    }

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center py-5">
                <span className="spinner-border" style={{ color: primaryColor }} role="status"></span>
            </div>
        );
    }

    return (
        <div className="container-fluid py-2">
            <BackButton destinoPadrao="/dashboard" />
            <div className="mt-3 mb-4">
                <h3 style={{ color: primaryColor, fontWeight: 'bold' }}>
                    <i className="bi bi-bank me-2"></i> Configurações de Doação
                </h3>
                <p className="text-muted mb-0">Dados bancários e chave PIX exibidos na página pública de doação</p>
            </div>

            <form onSubmit={onSubmit}>
                <div className="card border-0 shadow-sm p-4 mb-4" style={{ borderRadius: '8px' }}>
                    <h5 className="mb-3" style={{ color: primaryColor, fontWeight: 'bold' }}>
                        <i className="bi bi-buildings me-2"></i> Identificação da ONG
                    </h5>
                    <div className="row">
                        <div className="form-group col-md-8 mb-3">
                            <label htmlFor="razaoSocial" style={labelStyle}>Razão Social / Nome</label>
                            <input type="text" className="form-control px-3 py-2" id="razaoSocial" style={inputStyle} value={form.razaoSocial} onChange={(e) => updateForm({ razaoSocial: e.target.value })} placeholder="Ex: Organização de Amparo Animal Patas & Lares" required />
                        </div>
                        <div className="form-group col-md-4 mb-3">
                            <label htmlFor="cnpj" style={labelStyle}>CNPJ</label>
                            <input type="text" className="form-control px-3 py-2" id="cnpj" style={inputStyle} value={form.cnpj} onChange={(e) => updateForm({ cnpj: e.target.value })} placeholder="00.000.000/0000-00" required />
                        </div>
                    </div>
                </div>

                <div className="card border-0 shadow-sm p-4 mb-4" style={{ borderRadius: '8px' }}>
                    <h5 className="mb-3" style={{ color: primaryColor, fontWeight: 'bold' }}>
                        <i className="bi bi-credit-card-2-front me-2"></i> Dados Bancários
                    </h5>
                    <div className="row">
                        <div className="form-group col-md-4 mb-3">
                            <label htmlFor="banco" style={labelStyle}>Banco</label>
                            <input type="text" className="form-control px-3 py-2" id="banco" style={inputStyle} value={form.banco} onChange={(e) => updateForm({ banco: e.target.value })} placeholder="Ex: Itaú (000)" />
                        </div>
                        <div className="form-group col-md-4 mb-3">
                            <label htmlFor="agencia" style={labelStyle}>Agência</label>
                            <input type="text" className="form-control px-3 py-2" id="agencia" style={inputStyle} value={form.agencia} onChange={(e) => updateForm({ agencia: e.target.value })} placeholder="0000" />
                        </div>
                        <div className="form-group col-md-4 mb-3">
                            <label htmlFor="contaCorrente" style={labelStyle}>Conta Corrente</label>
                            <input type="text" className="form-control px-3 py-2" id="contaCorrente" style={inputStyle} value={form.contaCorrente} onChange={(e) => updateForm({ contaCorrente: e.target.value })} placeholder="00000-0" />
                        </div>
                    </div>
                </div>

                <div className="card border-0 shadow-sm p-4 mb-4" style={{ borderRadius: '8px' }}>
                    <h5 className="mb-3" style={{ color: primaryColor, fontWeight: 'bold' }}>
                        <i className="bi bi-qr-code me-2"></i> PIX
                    </h5>
                    <div className="row">
                        <div className="form-group col-md-6 mb-3">
                            <label htmlFor="chavePix" style={labelStyle}>Chave PIX</label>
                            <input type="text" className="form-control px-3 py-2" id="chavePix" style={inputStyle} value={form.chavePix} onChange={(e) => updateForm({ chavePix: e.target.value })} placeholder="00.000.000/0000-00" required />
                        </div>
                        <div className="form-group col-md-6 mb-3">
                            <label htmlFor="qrCode" style={labelStyle}>Imagem do QR Code (PIX Copia e Cola)</label>
                            <input type="file" accept="image/*" className="form-control px-3 py-2" id="qrCode" style={inputStyle} onChange={handleQrSelect} />
                        </div>
                    </div>

                    {(qrPreview || form.qrCode) && (
                        <div className="mb-3 d-flex align-items-center gap-3">
                            <img
                                src={qrPreview || resolverUrl(form.qrCode)}
                                alt="QR Code PIX"
                                style={{ width: '160px', height: '160px', objectFit: 'contain', borderRadius: '8px', border: '1px solid #eadfcf', backgroundColor: '#fff', padding: '6px' }}
                                onError={aoErrarImagem}
                            />
                            {qrPreview && <span className="text-muted small">Prévia da nova imagem (ainda não salva).</span>}
                            {!qrPreview && form.qrCode && <span className="text-muted small">QR Code atualmente salvo.</span>}
                        </div>
                    )}
                </div>

                <div className="form-group text-end mb-4">
                    <button type="submit" className="btn text-white px-5 py-2 shadow-sm" style={{ backgroundColor: primaryColor, borderRadius: '6px', fontSize: '1rem', fontWeight: '500' }} disabled={saving}>
                        {saving ? (
                            <><span className="spinner-border spinner-border-sm me-2" role="status"></span> Salvando...</>
                        ) : (
                            <><i className="bi bi-check-lg me-2"></i> Salvar Alterações</>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}
