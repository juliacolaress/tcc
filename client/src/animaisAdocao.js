import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API_BASE_URL from "./api/config";
import { normalizeFotos, aoErrarImagem } from "./utils/fotos";
import cores from "./theme";

// Componente do Card do Animal
const AnimalCard = ({ animal, onAdotar }) => {
    const [imagemAtual, setImagemAtual] = useState(0);
    const fotos = normalizeFotos(animal);
    
    // Definindo uma imagem padrão caso o banco não tenha foto cadastrada ainda
    const imagemPadrao = animal.especie === "Cachorro" 
        ? "https://images.unsplash.com/photo-1543466835-00a7907e9de1?q=80&w=500" // Foto de cachorro
        : "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?q=80&w=500"; // Foto de gato

    const imagemExibida = fotos.length > 0 ? fotos[imagemAtual] : imagemPadrao;

    return (
        <div className="card border-0 shadow-sm h-100" style={{ borderRadius: '0px', backgroundColor: '#FFFDF9' }}>
            {/* Imagem do Pet */}
            <div className="position-relative" style={{ height: '250px', overflow: 'hidden' }}>
                <img 
                    src={imagemExibida} 
                    className="card-img-top w-100 h-100" 
                    style={{ objectFit: 'cover' }} 
                    alt={animal.nome}
                    onError={aoErrarImagem}
                />
                
                {/* Carousel com thumbnails */}
                {fotos.length > 1 && (
                    <div className="position-absolute bottom-0 start-0 end-0 d-flex justify-content-center gap-1 pb-2" style={{ background: 'linear-gradient(transparent, rgba(0,0,0,0.5))' }}>
                        {fotos.map((url, index) => (
                            <img
                                key={index}
                                src={url}
                                alt={`Thumbnail ${index + 1}`}
                                onClick={() => setImagemAtual(index)}
                                onError={aoErrarImagem}
                                style={{
                                    width: '40px',
                                    height: '40px',
                                    objectFit: 'cover',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    border: index === imagemAtual ? '2px solid white' : '2px solid transparent',
                                    opacity: index === imagemAtual ? 1 : 0.7
                                }}
                            />
                        ))}
                    </div>
                )}
            </div>
            
            {/* Corpo do Card */}
            <div className="card-body d-flex flex-column p-4">
                <p className="card-text text-dark flex-grow-1" style={{ fontSize: '0.95rem', lineHeight: '1.5' }}>
                    <strong>{animal.nome}:</strong> {animal.caracteristicas || `${animal.raca || "Vira-lata"}, ${animal.genero === 'M' ? 'macho' : 'fêmea'}, porte ${animal.porte ? animal.porte.toLowerCase() : 'médio'}.`} {animal.obs}
                </p>
                
                {/* Botão Adote Agora */}
                <div className="text-end mt-3">
                    <button 
                        className="btn px-4 py-2 text-white" 
                        style={{ backgroundColor: cores.textoMarrom, borderRadius: '20px', fontSize: '0.9rem', fontWeight: '500', border: 'none' }}
                        onClick={onAdotar}
                    >
                        Adote agora
                    </button>
                </div>
            </div>
        </div>
    );
};

export default function AnimaisAdocao() {
    const navigate = useNavigate();
    const [animais, setAnimais] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Estados para os seletores de filtros
    const [especie, setEspecie] = useState("");
    const [sexo, setSexo] = useState("");
    const [porte, setPorte] = useState("");
    
    // Filtros aplicados de fato (só mudam quando clica em "Filtrar")
    const [filtrosAplicados, setFiltrosAplicados] = useState({ especie: "", sexo: "", porte: "" });

    // Mantemos apenas o controle do menu de Doações, o de adoção foi removido
    

    // 1. BUSCA OS ANIMAIS (Sem token, rota pública)
    useEffect(() => {
        async function fetchPublicAnimais() {
            try {
                const response = await fetch(`${API_BASE_URL}/animal`);
                if (response.ok) {
                    const result = await response.json();
                    const data = Array.isArray(result) ? result : (result.data || []);
                    setAnimais(data);
                }
            } catch (error) {
                console.error("Erro ao carregar animais na página pública:", error);
            } finally {
                loading && setLoading(false);
            }
        }
        fetchPublicAnimais();
    }, [loading]);

    // 2. FUNÇÃO DO BOTÃO FILTRAR
    const handleFiltrar = (e) => {
        e.preventDefault();
        setFiltrosAplicados({ especie, sexo, porte });
    };

    // 2.1 FUNÇÃO DO BOTÃO LIMPAR FILTROS
    const handleLimparFiltros = () => {
        setEspecie("");
        setSexo("");
        setPorte("");
        setFiltrosAplicados({ especie: "", sexo: "", porte: "" });
    };

    // 3. REGRA DE FILTRAGEM (Garante status "Disponível" e bate com os selects)
    const animaisExibidos = animais.filter((animal) => {
        if (!animal || animal.status !== "Disponível") return false;

        const bateEspecie = filtrosAplicados.especie === "" || animal.especie === filtrosAplicados.especie;
        const bateSexo = filtrosAplicados.sexo === "" || animal.genero === filtrosAplicados.sexo;
        const batePorte = filtrosAplicados.porte === "" || animal.porte === filtrosAplicados.porte;

        return bateEspecie && bateSexo && batePorte;
    });

    return (
        <div style={{ fontFamily: 'Poppins, sans-serif', backgroundColor: cores.cremeFundo, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            
            {/* 1. NAVBAR SUPERIOR */}
            <nav className="navbar navbar-expand-lg navbar-dark p-3" style={{ backgroundColor: cores.marromMenu }}>
                <div className="container d-flex justify-content-between align-items-center">
                    <span className="navbar-brand fw-bold d-flex align-items-center fs-4" style={{ cursor: 'pointer' }} onClick={() => navigate('/')}>
                        Patas & Lares
                    </span>

                    <div className="d-flex align-items-center gap-4">
                        <ul className="navbar-nav flex-row gap-3 text-white align-items-center mb-0 d-none d-md-flex">
                            
                            <li className="nav-item">
                                <span className="nav-link text-white" style={{ cursor: 'pointer' }} onClick={() => navigate('/')}>
                                    Início
                                </span>
                            </li>

                            {/* CORREÇÃO: Removido o Dropdown. Agora é um botão ativo de link direto */}
                            <li className="nav-item">
                                <span 
                                    className="nav-link text-white px-3 py-1 rounded-pill" 
                                    style={{ cursor: 'pointer', backgroundColor: 'rgba(255,255,255,0.15)', fontWeight: '500' }} 
                                    onClick={() => navigate('/animais-adocao')}
                                >
                                    Animais para Adoção
                                </span>
                            </li>

                            {/* Item único: Doações */}
                            <li className="nav-item">
                                <span className="nav-link text-white" style={{ cursor: 'pointer' }} onClick={() => navigate('/solicitar-doacao')}>
                                    Doações
                                </span>
                            </li>

                            <li className="nav-item"><span className="nav-link text-white" style={{ cursor: 'pointer' }}>Eventos</span></li>

                            <li className="nav-item">
                                <span
                                    className="nav-link text-white"
                                    style={{ cursor: 'pointer' }}
                                    onClick={() => navigate('/transparencia')}
                                >
                                    Transparência
                                </span>
                            </li>
                            
                            <li className="nav-item">
                                <span
                                    className="nav-link text-white"
                                    style={{ cursor: 'pointer' }}
                                    onClick={() => navigate('/contato')}
                                >
                                    Contato
                                </span>
                            </li>
                        </ul>

                        <button
                            className="btn text-white px-3 py-1 rounded-pill border border-white-50"
                            style={{ backgroundColor: 'rgba(255,255,255,0.1)', fontSize: '0.9rem' }}
                            onClick={() => navigate('/login')}
                        >
                            Acesso Restrito
                        </button>
                    </div>
                </div>
            </nav>

            {/* Conteúdo da Página */}
            <div style={{ backgroundColor: cores.branco, flexGrow: 1, paddingBottom: '3rem' }}>
                <div className="container pt-5">
                    
                    <h1 className="fw-bold mb-4 text-center" style={{ color: cores.textoMarrom }}>Nossos Amigos para Adoção</h1>

                    {/* Seção de Filtros */}
                    <form onSubmit={handleFiltrar} className="row g-3 justify-content-center align-items-center mb-5">
                        <div className="col-6 col-md-3">
                            <select className="form-select py-2 fw-semibold text-muted" value={especie} onChange={(e) => setEspecie(e.target.value)} style={{ borderRadius: '6px' }}>
                                <option value="">Espécie</option>
                                <option value="Cachorro">Cachorro</option>
                                <option value="Gato">Gato</option>
                            </select>
                        </div>
                        <div className="col-6 col-md-3">
                            <select className="form-select py-2 fw-semibold text-muted" value={sexo} onChange={(e) => setSexo(e.target.value)} style={{ borderRadius: '6px' }}>
                                <option value="">Sexo</option>
                                <option value="M">Macho</option>
                                <option value="F">Fêmea</option>
                            </select>
                        </div>
                        <div className="col-6 col-md-3">
                            <select className="form-select py-2 fw-semibold text-muted" value={porte} onChange={(e) => setPorte(e.target.value)} style={{ borderRadius: '6px' }}>
                                <option value="">Porte</option>
                                <option value="Pequeno">Pequeno</option>
                                <option value="Médio">Médio</option>
                                <option value="Grande">Grande</option>
                            </select>
                        </div>
                        <div className="col-12 col-md-3 text-start d-flex gap-2">
                            <button type="submit" className="btn px-4 py-2 fw-bold text-white shadow-sm flex-fill" style={{ backgroundColor: '#3D2314', borderRadius: '20px' }}>
                                Filtrar
                            </button>
                            <button type="button" className="btn px-4 py-2 fw-bold shadow-sm flex-fill" style={{ backgroundColor: '#e9ecef', color: '#3D2314', borderRadius: '20px', border: '1px solid #d0d0d0' }} onClick={handleLimparFiltros}>
                                Limpar Filtros
                            </button>
                        </div>
                    </form>

                    {/* Grid de Cards */}
                    {loading ? (
                        <div className="text-center py-5">
                            <div className="spinner-border" style={{ color: cores.textoMarrom }} role="status"></div>
                        </div>
                    ) : animaisExibidos.length > 0 ? (
                        <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4 px-3">
                            {animaisExibidos.map((animal) => (
                                <div className="col" key={animal._id}>
                                    <AnimalCard animal={animal} onAdotar={() => navigate(`/adocao/formulario?id=${animal._id}`)} />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-5" style={{ color: cores.textoMarrom }}>
                            <i className="bi bi-emoji-frown fs-1"></i>
                            <p className="mt-2 fs-5">Nenhum animal disponível com esses filtros no momento.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* 3. RODAPÉ OFICIAL */}
            <footer className="text-white py-4 mt-auto" style={{ backgroundColor: cores.rodapeMarrom, fontSize: '0.9rem', borderTop: '4px solid #A67C52' }}>
                <div className="container">
                    <div className="row align-items-center g-3">

                        <div className="col-md-4 d-flex align-items-center justify-content-center justify-content-md-start">
                            <div className="d-flex align-items-center">
                                <div className="p-2 me-2 rounded text-center" style={{ backgroundColor: '#A67C52', color: '#000000', width: '50px', height: '50px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <i className="bi bi-house-heart-fill fs-3"></i>
                                </div>
                                <div className="text-start lh-1">
                                    <span className="fw-bold d-block fs-5 mb-1">Patas</span>
                                    <span className="fw-bold d-block fs-5" style={{ color: '#A67C52' }}>& Lares</span>
                                </div>
                            </div>
                        </div>

                        <div className="col-md-4 text-center text-md-start border-start-md ps-md-4" style={{ color: '#e0e0e0' }}>
                            <p className="mb-1 small">CNPJ 00.000.000/0000-00</p>
                            <p className="mb-1 small">Sombrio/SC</p>
                            <p className="mb-0 small">
                                Dúvidas e informações: <a href="mailto:pataselares@gmail.com" className="text-white text-decoration-underline">pataselares@gmail.com</a>
                            </p>
                        </div>

                        <div className="col-md-4 text-center text-md-end text-white-50 small">
                            Copyright © 2026 Patas & Lares | Powered by Patas & Lares
                        </div>

                    </div>
                </div>
            </footer>
        </div>
    );
}