import React from "react";
import { useNavigate } from "react-router-dom";

export default function BackButton({ destinoPadrao = "/", alinhamento = "start" }) {
  const navigate = useNavigate();

  const voltar = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate(destinoPadrao);
    }
  };

  return (
    <div className={`d-flex justify-content-${alinhamento}`}>
      <button
        type="button"
        onClick={voltar}
        className="btn btn-outline-secondary px-4 py-2 d-inline-flex align-items-center"
        style={{ borderRadius: '6px', fontWeight: '500' }}
      >
        <i className="bi bi-arrow-left me-2"></i> Voltar
      </button>
    </div>
  );
}