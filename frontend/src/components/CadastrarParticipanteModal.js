import React, { useState } from "react";
import api from "../services/api";

function CadastrarParticipanteModal({ isOpen, onClose }) {
  const [formData, setFormData] = useState({
    nome: "",
    cpf: "",
    nis: "",
    responsavel1: "",
    responsavel2: "",
    telefone: "",
    endereco: "",
    transporte: false,
  });

  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      await api.post("/alunos", formData);

      alert("Participante cadastrado com sucesso!");

      setFormData({
        nome: "",
        cpf: "",
        nis: "",
        responsavel1: "",
        responsavel2: "",
        telefone: "",
        endereco: "",
        transporte: false,
      });

      onClose();
    } catch (error) {
      console.error("Erro ao cadastrar participante:", error);
      alert("Erro ao cadastrar participante");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="login-modal cadastro-modal">
        <h2>Cadastrar participante</h2>

        <form onSubmit={handleSubmit} className="admin-form">
          <input
            type="text"
            name="nome"
            placeholder="Nome"
            value={formData.nome}
            onChange={handleChange}
            required
          />

          <input
            type="text"
            name="cpf"
            placeholder="CPF"
            value={formData.cpf}
            onChange={handleChange}
          />

          <input
            type="text"
            name="nis"
            placeholder="NIS"
            value={formData.nis}
            onChange={handleChange}
          />

          <input
            type="text"
            name="responsavel1"
            placeholder="Responsável 1"
            value={formData.responsavel1}
            onChange={handleChange}
          />

          <input
            type="text"
            name="responsavel2"
            placeholder="Responsável 2"
            value={formData.responsavel2}
            onChange={handleChange}
          />

          <input
            type="text"
            name="telefone"
            placeholder="Telefone"
            value={formData.telefone}
            onChange={handleChange}
            required
          />

          <input
            type="text"
            name="endereco"
            placeholder="Endereço"
            value={formData.endereco}
            onChange={handleChange}
            required
          />

          <div className="toggle-container">
            <span>Usa transporte?</span>

            <label className="switch">
              <input
                type="checkbox"
                name="transporte"
                checked={formData.transporte}
                onChange={handleChange}
              />
              <span className="slider"></span>
            </label>
          </div>

          <div className="modal-buttons">
            <button type="submit" disabled={loading}>
              {loading ? "Salvando..." : "Salvar"}
            </button>

            <button type="button" className="btn-cancelar" onClick={onClose}>
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CadastrarParticipanteModal;