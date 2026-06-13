import React, { useEffect, useState } from 'react';
import api from '../services/api';

function AdminDashboard() {
  const [oficinas, setOficinas] = useState([]);
  const [form, setForm] = useState({
    nome: '',
    descricao: '',
    responsavel: '',
    dia_semana: '',
    horario: '',
  });
  const [editandoId, setEditandoId] = useState(null);

  useEffect(() => {
    buscarOficinas();
  }, []);

  const buscarOficinas = async () => {
    try {
      const response = await api.get('/oficinas');
      setOficinas(response.data);
    } catch (error) {
      console.error('Erro ao buscar oficinas:', error);
      alert('Erro ao buscar oficinas.');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const limparFormulario = () => {
    setForm({
      nome: '',
      descricao: '',
      responsavel: '',
      dia_semana: '',
      horario: '',
    });
    setEditandoId(null);
  };

  const salvarOficina = async (e) => {
    e.preventDefault();

    try {
      if (editandoId) {
        await api.put(`/oficinas/${editandoId}`, form);
      } else {
        await api.post('/oficinas', form);
      }

      limparFormulario();
      await buscarOficinas();
    } catch (error) {
      console.error('Erro ao salvar oficina:', error);
      alert('Erro ao salvar oficina.');
    }
  };

  const editarOficina = (oficina) => {
    setForm({
      nome: oficina.nome || '',
      descricao: oficina.descricao || '',
      responsavel: oficina.responsavel || '',
      dia_semana: oficina.dia_semana || '',
      horario: oficina.horario || '',
    });

    setEditandoId(oficina.id);

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  const excluirOficina = async (id) => {
    const confirmar = window.confirm('Deseja realmente excluir esta oficina?');
    if (!confirmar) return;

    try {
      await api.delete(`/oficinas/${id}`);
      await buscarOficinas();
    } catch (error) {
      console.error('Erro ao excluir oficina:', error);
      alert('Erro ao excluir oficina.');
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h2>Painel Administrativo de Oficinas</h2>
        <p>Cadastre, edite e remova oficinas do sistema.</p>
      </div>

      <div className="admin-form-card">
        <form onSubmit={salvarOficina}>
          <div className="admin-oficina-grid admin-oficina-grid-top">
            <div className="admin-field">
              <label>Nome da oficina</label>
              <input
                type="text"
                name="nome"
                value={form.nome}
                onChange={handleChange}
                placeholder="Digite o nome da oficina"
                required
              />
            </div>

            <div className="admin-field">
              <label>Descrição</label>
              <textarea
                name="descricao"
                value={form.descricao}
                onChange={handleChange}
                placeholder="Digite a descrição"
                required
              />
            </div>
          </div>

          <div className="admin-oficina-grid admin-oficina-grid-bottom">
            <div className="admin-field">
              <label>Responsável</label>
              <input
                type="text"
                name="responsavel"
                value={form.responsavel}
                onChange={handleChange}
                placeholder="Digite o responsável"
                required
              />
            </div>

            <div className="admin-field">
              <label>Dia da semana</label>
              <input
                type="text"
                name="dia_semana"
                value={form.dia_semana}
                onChange={handleChange}
                placeholder="Ex: Segunda-feira"
                required
              />
            </div>

            <div className="admin-field">
              <label>Horário</label>
              <input
                type="text"
                name="horario"
                value={form.horario}
                onChange={handleChange}
                placeholder="Ex: 14:00"
                required
              />
            </div>
          </div>

          <div className="admin-form-actions">
            <button type="submit" className="btn-primary">
              {editandoId ? 'Atualizar Oficina' : 'Cadastrar Oficina'}
            </button>

            {editandoId && (
              <button
                type="button"
                className="btn-secondary"
                onClick={limparFormulario}
              >
                Cancelar Edição
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="oficinas-grid">
        {oficinas.length > 0 ? (
          oficinas.map((oficina) => (
            <div key={oficina.id} className="oficina-card">
              <h3>{oficina.nome}</h3>
              <p>{oficina.descricao}</p>

              <div className="oficina-info">
                <strong>Responsável:</strong> {oficina.responsavel}
              </div>

              <div className="oficina-info">
                <strong>Dia:</strong> {oficina.dia_semana}
              </div>

              <div className="oficina-info">
                <strong>Horário:</strong> {oficina.horario}
              </div>

              <div className="actions-group" style={{ marginTop: '14px' }}>
                <button
                  type="button"
                  className="btn-edit"
                  onClick={() => editarOficina(oficina)}
                >
                  Editar
                </button>

                <button
                  type="button"
                  className="btn-delete"
                  onClick={() => excluirOficina(oficina.id)}
                >
                  Excluir
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="empty-card-message">Nenhuma oficina cadastrada.</div>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;