import React, { useEffect, useState } from 'react';
import api from '../services/api';

function RelatorioFrequencia() {
  const [oficinas, setOficinas] = useState([]);
  const [oficinaSelecionada, setOficinaSelecionada] = useState('');
  const [anoSelecionado, setAnoSelecionado] = useState(new Date().getFullYear());
  const [resumoGeral, setResumoGeral] = useState([]);
  const [mesSelecionado, setMesSelecionado] = useState(new Date().getMonth() + 1);

  const [relatorioMensal, setRelatorioMensal] = useState({
    datas: [],
    alunos: [],
    mes: new Date().getMonth() + 1,
    ano: new Date().getFullYear(),
  });

  const [mensagem, setMensagem] = useState('');
  const [carregandoResumo, setCarregandoResumo] = useState(false);
  const [carregandoMensal, setCarregandoMensal] = useState(false);

  const [mostrarModalEdicao, setMostrarModalEdicao] = useState(false);
  const [registroEditando, setRegistroEditando] = useState(null);

  const meses = [
    { numero: 1, nome: 'Janeiro' },
    { numero: 2, nome: 'Fevereiro' },
    { numero: 3, nome: 'Março' },
    { numero: 4, nome: 'Abril' },
    { numero: 5, nome: 'Maio' },
    { numero: 6, nome: 'Junho' },
    { numero: 7, nome: 'Julho' },
    { numero: 8, nome: 'Agosto' },
    { numero: 9, nome: 'Setembro' },
    { numero: 10, nome: 'Outubro' },
    { numero: 11, nome: 'Novembro' },
    { numero: 12, nome: 'Dezembro' },
  ];

  useEffect(() => {
    buscarOficinas();
  }, []);

  const buscarOficinas = async () => {
    try {
      const response = await api.get('/oficinas');
      setOficinas(response.data);
    } catch (error) {
      console.error('Erro ao buscar oficinas:', error);
      setMensagem('Erro ao buscar oficinas.');
    }
  };

  const carregarResumoGeral = async (oficinaId) => {
    setCarregandoResumo(true);

    try {
      const response = await api.get(`/frequencia/relatorio/${oficinaId}`);
      setResumoGeral(response.data);
    } catch (error) {
      console.error('Erro ao carregar resumo geral:', error);
      setResumoGeral([]);
      throw error;
    } finally {
      setCarregandoResumo(false);
    }
  };

  const carregarRelatorioMensal = async (oficinaId, ano, mes) => {
    setCarregandoMensal(true);

    try {
      const response = await api.get(
        `/frequencia/relatorio-mensal/${oficinaId}/${ano}/${mes}`
      );

      setRelatorioMensal(response.data);
    } catch (error) {
      console.error('Erro ao carregar relatório mensal:', error);
      setRelatorioMensal({
        datas: [],
        alunos: [],
        mes,
        ano,
      });
      throw error;
    } finally {
      setCarregandoMensal(false);
    }
  };

  const carregarTudo = async () => {
    if (!oficinaSelecionada) {
      setMensagem('Selecione uma oficina.');
      return;
    }

    setMensagem('');

    try {
      await carregarResumoGeral(oficinaSelecionada);
      await carregarRelatorioMensal(
        oficinaSelecionada,
        anoSelecionado,
        mesSelecionado
      );
    } catch (error) {
      setMensagem('Erro ao carregar relatório.');
    }
  };

  const trocarMes = async (mes) => {
    setMesSelecionado(mes);
    setMensagem('');

    if (!oficinaSelecionada) return;

    try {
      await carregarRelatorioMensal(oficinaSelecionada, anoSelecionado, mes);
    } catch (error) {
      setMensagem('Erro ao carregar relatório mensal.');
    }
  };

  const abrirEdicaoRegistro = (aluno, dataInfo) => {
    if (!oficinaSelecionada) {
      alert('Selecione uma oficina antes de editar.');
      return;
    }

    const registro = aluno.registros[dataInfo.data_formatada] || {
      presente: true,
      atestado: false,
      observacao_atestado: '',
      data_iso: dataInfo.data_iso,
    };

    setRegistroEditando({
      aluno_id: aluno.aluno_id,
      nome: aluno.nome,
      data_formatada: dataInfo.data_formatada,
      data_iso: dataInfo.data_iso,
      presente: registro.presente,
      atestado: registro.atestado || false,
      observacao_atestado: registro.observacao_atestado || '',
    });

    setMostrarModalEdicao(true);
  };

  const salvarEdicaoRegistro = async () => {
    if (!registroEditando || !oficinaSelecionada) return;

    try {
      await api.put('/frequencia/registro', {
        aluno_id: registroEditando.aluno_id,
        oficina_id: oficinaSelecionada,
        data: registroEditando.data_iso,
        presente: registroEditando.presente,
        atestado:
          registroEditando.presente === true ? false : registroEditando.atestado,
        observacao_atestado:
          registroEditando.presente === true
            ? ''
            : registroEditando.observacao_atestado || '',
      });

      setMostrarModalEdicao(false);
      setRegistroEditando(null);

      await carregarResumoGeral(oficinaSelecionada);
      await carregarRelatorioMensal(
        oficinaSelecionada,
        anoSelecionado,
        mesSelecionado
      );
    } catch (error) {
      console.error('Erro ao editar registro:', error);
      alert('Erro ao editar frequência.');
    }
  };

  const simboloRegistro = (registro) => {
    if (!registro) return '-';
    if (registro.presente === true) return 'P';
    if (registro.presente === false && registro.atestado === true) return 'A';
    if (registro.presente === false) return 'F';
    return '-';
  };

  const nomeMesSelecionado =
    meses.find((mes) => mes.numero === mesSelecionado)?.nome || '';

  return (
    <div className="page-container">
      <div className="page-header clean-header">
        <h2>Relatório de Frequência</h2>
        <p>Total de presenças, faltas e atestados por aluno, com detalhamento mensal.</p>
      </div>

      <div className="content-card">
        <div
          className="frequencia-top-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: '2fr 1fr 1fr',
            gap: '14px',
            alignItems: 'end',
          }}
        >
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
            <label>Ano</label>
            <input
              type="number"
              value={anoSelecionado}
              onChange={(e) => setAnoSelecionado(e.target.value)}
              placeholder="Ex: 2026"
            />
          </div>

          <div className="field-block button-align">
            <button type="button" className="big-blue-btn" onClick={carregarTudo}>
              Carregar
            </button>
          </div>
        </div>
      </div>

      {mensagem && (
        <p className="clean-success" style={{ color: '#b42318' }}>
          {mensagem}
        </p>
      )}

      <div className="excel-table-card" style={{ marginTop: '20px' }}>
        <div className="excel-scroll-area">
          <table className="frequencia-excel-table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Presenças</th>
                <th>Faltas</th>
                <th>Atestados</th>
              </tr>
            </thead>

            <tbody>
              {carregandoResumo ? (
                <tr>
                  <td colSpan="4">Carregando resumo...</td>
                </tr>
              ) : resumoGeral.length > 0 ? (
                resumoGeral.map((item) => (
                  <tr key={item.aluno_id}>
                    <td>{item.nome}</td>
                    <td>{item.presencas}</td>
                    <td>{item.faltas}</td>
                    <td>{item.atestados}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4">Nenhum dado geral encontrado.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="page-header clean-header" style={{ marginTop: '28px' }}>
        <h3 style={{ marginBottom: '4px' }}>
          Relatório mensal - {nomeMesSelecionado}/{anoSelecionado}
        </h3>
        <p>
          Clique em uma marcação para corrigir presença, falta ou lançar atestado.
        </p>
      </div>

      <div className="excel-table-card" style={{ marginTop: '12px' }}>
        <div className="excel-scroll-area">
          <table className="frequencia-excel-table">
            <thead>
              <tr>
                <th>Nome</th>

                {relatorioMensal.datas.map((data) => (
                  <th key={data.data_formatada}>{data.data_formatada}</th>
                ))}

                <th>Presenças</th>
                <th>Faltas</th>
                <th>Atestados</th>
              </tr>
            </thead>

            <tbody>
              {carregandoMensal ? (
                <tr>
                  <td colSpan={relatorioMensal.datas.length + 4}>
                    Carregando relatório mensal...
                  </td>
                </tr>
              ) : relatorioMensal.alunos.length > 0 ? (
                relatorioMensal.alunos.map((aluno) => (
                  <tr key={aluno.aluno_id}>
                    <td>{aluno.nome}</td>

                    {relatorioMensal.datas.map((data) => {
                      const registro = aluno.registros[data.data_formatada];

                      return (
                        <td key={`${aluno.aluno_id}-${data.data_formatada}`}>
                          <button
                            type="button"
                            onClick={() => abrirEdicaoRegistro(aluno, data)}
                            title={
                              registro?.observacao_atestado
                                ? registro.observacao_atestado
                                : 'Clique para editar'
                            }
                            style={{
                              border: 'none',
                              borderRadius: '6px',
                              padding: '5px 10px',
                              cursor: 'pointer',
                              fontWeight: '700',
                              background:
                                simboloRegistro(registro) === 'P'
                                  ? '#d1fae5'
                                  : simboloRegistro(registro) === 'A'
                                  ? '#fef3c7'
                                  : simboloRegistro(registro) === 'F'
                                  ? '#fee2e2'
                                  : '#e5e7eb',
                              color: '#0f2f4f',
                            }}
                          >
                            {simboloRegistro(registro)}
                          </button>
                        </td>
                      );
                    })}

                    <td>{aluno.presencas}</td>
                    <td>{aluno.faltas}</td>
                    <td>{aluno.atestados}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={relatorioMensal.datas.length + 4}>
                    Nenhum lançamento encontrado para este mês.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div
        className="content-card"
        style={{
          marginTop: '26px',
          marginBottom: '10px',
          paddingBottom: '10px',
        }}
      >
        <div
          style={{
            display: 'flex',
            gap: '8px',
            overflowX: 'auto',
            paddingBottom: '6px',
          }}
        >
          {meses.map((mes) => (
            <button
              key={mes.numero}
              type="button"
              onClick={() => trocarMes(mes.numero)}
              style={{
                border: 'none',
                borderRadius: '10px 10px 0 0',
                padding: '10px 16px',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                fontWeight: mesSelecionado === mes.numero ? '700' : '600',
                background: mesSelecionado === mes.numero ? '#1f5d99' : '#dfe7f1',
                color: mesSelecionado === mes.numero ? '#ffffff' : '#214b7a',
                boxShadow:
                  mesSelecionado === mes.numero
                    ? '0 -2px 8px rgba(0,0,0,0.08)'
                    : 'none',
              }}
            >
              {mes.nome}
            </button>
          ))}
        </div>
      </div>

      {mostrarModalEdicao && registroEditando && (
        <div className="modal-overlay">
          <div
            className="modal"
            style={{
              width: '460px',
              maxWidth: '94%',
              padding: '24px',
              borderRadius: '16px',
              background: '#f8fbff',
            }}
          >
            <h3 style={{ color: '#123d68', marginBottom: '10px' }}>
              Editar frequência
            </h3>

            <p style={{ marginBottom: '14px' }}>
              <strong>{registroEditando.nome}</strong> —{' '}
              {registroEditando.data_formatada}
            </p>

            <div style={{ display: 'flex', gap: '20px', marginBottom: '14px' }}>
              <label>
                <input
                  type="radio"
                  checked={registroEditando.presente === true}
                  onChange={() =>
                    setRegistroEditando((prev) => ({
                      ...prev,
                      presente: true,
                      atestado: false,
                      observacao_atestado: '',
                    }))
                  }
                />{' '}
                Presente
              </label>

              <label>
                <input
                  type="radio"
                  checked={registroEditando.presente === false}
                  onChange={() =>
                    setRegistroEditando((prev) => ({
                      ...prev,
                      presente: false,
                    }))
                  }
                />{' '}
                Falta
              </label>
            </div>

            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '12px',
              }}
            >
              <input
                type="checkbox"
                checked={registroEditando.atestado === true}
                disabled={registroEditando.presente === true}
                onChange={(e) =>
                  setRegistroEditando((prev) => ({
                    ...prev,
                    presente: false,
                    atestado: e.target.checked,
                    observacao_atestado: e.target.checked
                      ? prev.observacao_atestado
                      : '',
                  }))
                }
              />
              Falta com atestado
            </label>

            <input
              type="text"
              value={registroEditando.observacao_atestado || ''}
              disabled={
                registroEditando.presente === true ||
                registroEditando.atestado !== true
              }
              onChange={(e) =>
                setRegistroEditando((prev) => ({
                  ...prev,
                  observacao_atestado: e.target.value,
                }))
              }
              placeholder="Observação do atestado"
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '8px',
                border: '1px solid #c9d7e6',
                marginBottom: '18px',
              }}
            />

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 120px',
                gap: '12px',
              }}
            >
              <button
                type="button"
                className="big-blue-btn"
                onClick={salvarEdicaoRegistro}
              >
                Salvar
              </button>

              <button
                type="button"
                className="nav-sair-btn"
                onClick={() => {
                  setMostrarModalEdicao(false);
                  setRegistroEditando(null);
                }}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default RelatorioFrequencia;