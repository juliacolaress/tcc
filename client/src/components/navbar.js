import React from "react";

// Importamos bootstrap para melhorar o visual
import "bootstrap/dist/css/bootstrap.css";
import "bootstrap/dist/js/bootstrap.bundle";

// Importamos NavLink para usar o roteamento do React
import { NavLink } from "react-router-dom";
import Logo from "./Logo.png";

export default function Navbar() {
    return (
        <nav className="navbar navbar-expand-lg navbar-light bg-light p-2">
            <div className="container-fluid"> 
                {/* Logo clica e volta para a Home */}
                <NavLink className="navbar-brand" to="/">
                    <img style={{ "width": "120px" }} src={Logo} alt="Logo do IFC" />
                </NavLink>
                
                <button
                    className="navbar-toggler"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#navbarSupportedContent"
                >
                    <span className="navbar-toggler-icon"></span>
                </button>

                <div className="collapse navbar-collapse" id="navbarSupportedContent">
                    <ul className="navbar-nav ms-auto">
                        {/* Link para a lista de pessoas/usuários */}
                        <li className="nav-item">
                            <NavLink className="nav-link fw-bold" to="/">
                                HOME
                            </NavLink>
                        </li>
                        <li className="nav-item">
                            <NavLink className="nav-link fw-bold" to="/">
                                USUÁRIOS
                            </NavLink>
                        </li>
                    
                        <li className="nav-item">
                            <NavLink className="nav-link fw-bold" to="/animais">
                                ANIMAIS
                            </NavLink>
                        </li>
                        <li className="nav-item">
                            <NavLink className="nav-link fw-bold" to="/doacoes">
                                DOAÇÕES
                            </NavLink>
                        </li>
                         <li className="nav-item">
                            <NavLink className="nav-link fw-bold" to="/voluntarios">
                                VOLUNTÁRIOS
                            </NavLink>
                        </li>
                        
                    </ul>
                </div>
            </div>
        </nav>
    );
}