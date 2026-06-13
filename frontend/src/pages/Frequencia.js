import React, { useEffect, useState } from 'react';
import api from '../services/api';

function Frequencia() {
  const [oficinas, setOficinas] = useState([]);
  const [oficinaSelecionada, setOficinaSelecionada] = useState('');
  const [dataSelecionada, setDataSelecionada] = useState('');
  const [alunos, setAlunos] = useState([]);
  const [mensagem, setMensagem] = useState('');
  const [buscou, setBuscou] = useState(false);

  useEffect(() => {
    buscarOficinas();
    const hoje = new Date().toISOString().split('T')[0];
    setDataSelecionada(hoje);
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

  const carregarFrequencia = async () => {
    if (!oficinaSelecionada || !dataSelecionada) {
      alert('Selecione a oficina e a data.');
      return;
    }

    setMensagem('');
    setBuscou(true);

    try {
      const response = await api.get(
        `/frequencia/${oficinaSelecionada}/${dataSelecionada}`
      );
      setAlunos(response.data);
    } catch (error) {
      console.error('Erro ao carregar frequência:', error);
      alert('Erro ao carregar frequência.');
    }
  };

  const marcarPresenca = (alunoId, valor) => {
    setAlunos((prev) =>
      prev.map((aluno) =>
        aluno.aluno_id === alunoId ? { ...aluno, presente: valor } : aluno
      )
    );
  };

  const salvarFrequencia = async () => {
    if (!oficinaSelecionada || !dataSelecionada || alunos.length === 0) {
      alert('Carregue os participantes antes de salvar.');
      return;
    }

    try {
      await api.post('/frequencia', {
        oficina_id: oficinaSelecionada,
        data: dataSelecionada,
        registros: alunos.map((aluno) => ({
          aluno_id: aluno.aluno_id,
          presente: aluno.presente,
        })),
      });

      setMensagem('Frequência salva com sucesso.');
    } catch (error) {
      console.error('Erro ao salvar frequência:', error);
      alert('Erro ao salvar frequência.');
    }
  };

  return (
    <div className="page-container">
      <div className="page-header clean-header">
        <h2>Controle de Frequência</h2>
        <p>Selecione a oficina e a data para lançar a presença dos participantes.</p>
      </div>

      <div className="content-card">
        <div className="frequencia-top-grid">
          <div className="field-block">
            <label>Oficina</label>
            <select
              value={oficinaSelecionada}
              onChange={(e) => setOficinaSelecionada(e.target.value)}
            >
              <option value="">Selecione uma oficina</option>
              {oficinas.map((oficina) => (
                <option key={oficina.id} value={oficina.id}>
                  {oficina.nome}
                </option>
              ))}
            </select>
          </div>

          <div className="field-block">
            <label>Data</label>
            <input
              type="date"
              value={dataSelecionada}
              onChange={(e) => setDataSelecionada(e.target.value)}
            />
          </div>

          <div className="field-block button-align">
            <button type="button" className="big-blue-btn" onClick={carregarFrequencia}>
              Carregar
            </button>
          </div>
        </div>
      </div>

      {mensagem && <p className="clean-success">{mensagem}</p>}

      {alunos.length > 0 && (
        <>
          <div className="excel-table-card" style={{ marginTop: '20px' }}>
            <div className="excel-scroll-area">
              <table className="frequencia-excel-table">
                <thead>
                  <tr>
                    <th>Nome</th>
                    <th>Status</th>
                    <th>Presente</th>
                    <th>Falta</th>
                  </tr>
                </thead>
                <tbody>
                  {alunos.map((aluno) => (
                    <tr key={aluno.aluno_id}>
                      <td>{aluno.nome}</td>
                      <td>
                        <span
                          className={
                            aluno.ativo ? 'status-badge active' : 'status-badge inactive'
                          }
                        >
                          {aluno.ativo ? 'Ativo' : 'Inativo'}
                        </span>
                      </td>
                      <td className="excel-checkbox-cell">
                        <input
                          type="radio"
                          name={`frequencia-${aluno.aluno_id}`}
                          checked={aluno.presente === true}
                          onChange={() => marcarPresenca(aluno.aluno_id, true)}
                        />
                      </td>
                      <td className="excel-checkbox-cell">
                        <input
                          type="radio"
                          name={`frequencia-${aluno.aluno_id}`}
                          checked={aluno.presente === false}
                          onChange={() => marcarPresenca(aluno.aluno_id, false)}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="frequencia-save-area">
            <button type="button" className="big-blue-btn" onClick={salvarFrequencia}>
              Salvar Frequência
            </button>
          </div>
        </>
      )}

      {buscou && alunos.length === 0 && (
        <div className="empty-card-message">
          Nenhum participante vinculado a esta oficina.
        </div>
      )}
    </div>
  );
}

export default Frequencia;