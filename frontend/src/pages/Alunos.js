import React, { useEffect, useState } from 'react';
import api from '../services/api';

function Alunos() {
  const [alunos, setAlunos] = useState([]);
  const [oficinas, setOficinas] = useState([]);
  const [pontosEmbarque, setPontosEmbarque] = useState([]);

  const [mostrarModal, setMostrarModal] = useState(false);
  const [mostrarModalPontos, setMostrarModalPontos] = useState(false);
  const [mostrarModalRelatorio, setMostrarModalRelatorio] = useState(false);

  const [modoEdicao, setModoEdicao] = useState(false);
  const [alunoEditandoId, setAlunoEditandoId] = useState(null);
  const [novoPonto, setNovoPonto] = useState('');
  const [relatorioAluno, setRelatorioAluno] = useState(null);

  const [filtroIdade, setFiltroIdade] = useState('GERAL');

  const [form, setForm] = useState({
    nome: '',
    data_nascimento: '',
    cpf: '',
    nis: '',
    responsavel1: '',
    responsavel2: '',
    telefone: '',
    endereco: '',
    transporte: false,
    ponto_embarque_id: '',
  });

  useEffect(() => {
    buscarAlunos();
    buscarOficinas();
    buscarPontosEmbarque();
  }, []);

  const buscarAlunos = async () => {
    try {
      const response = await api.get('/alunos');
      setAlunos(response.data);
    } catch (error) {
      console.error('Erro ao buscar alunos:', error);
      alert('Erro ao buscar participantes.');
    }
  };

  const buscarOficinas = async () => {
    try {
      const response = await api.get('/oficinas');
      setOficinas(response.data);
    } catch (error) {
      console.error('Erro ao buscar oficinas:', error);
      alert('Erro ao buscar oficinas.');
    }
  };

  const buscarPontosEmbarque = async () => {
    try {
      const response = await api.get('/pontos-embarque');
      setPontosEmbarque(response.data);
    } catch (error) {
      console.error('Erro ao buscar pontos de embarque:', error);
      alert('Erro ao buscar pontos de embarque.');
    }
  };

  const abrirRelatorioAluno = async (alunoId) => {
    try {
      const response = await api.get(`/alunos/${alunoId}/relatorio`);
      setRelatorioAluno(response.data);
      setMostrarModalRelatorio(true);
    } catch (error) {
      console.error('Erro ao gerar relatório:', error);
      alert('Erro ao gerar relatório do participante.');
    }
  };

  const imprimirRelatorio = () => {
  const conteudo = document.querySelector('.relatorio-print-area');

  if (!conteudo) {
    alert('Relatório não encontrado.');
    return;
  }

  const janela = window.open('', '_blank', 'width=900,height=700');

  janela.document.write(`
    <html>
      <head>
        <title>Relatório do Participante</title>

        <style>
          @page {
            size: A4;
            margin: 12mm;
          }

          body {
            font-family: Arial, Helvetica, sans-serif;
            color: #123d68;
            background: white;
            margin: 0;
            padding: 0;
          }

          h2 {
            font-size: 22px;
            margin-bottom: 6px;
            color: #123d68;
          }

          h3 {
            font-size: 18px;
            margin-top: 20px;
            margin-bottom: 10px;
            color: #123d68;
          }

          p {
            font-size: 12px;
            margin: 5px 0;
          }

          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 16px;
          }

          th, td {
            font-size: 11px;
            padding: 6px 8px;
            border-bottom: 1px solid #d8e2ef;
            text-align: left;
          }

          th {
            background: #d9e5f3;
            color: #123d68;
          }

          .no-print,
          .ocultar-na-impressao {
            display: none !important;
          }

          .termo-imagem-print {
            display: block !important;
            page-break-before: always;
            color: #000;
            padding-top: 20mm;
          }

          .termo-imagem-print h3 {
            text-align: center;
            font-size: 22px;
            text-transform: uppercase;
            color: #123d68;
            margin-bottom: 30px;
          }

          .termo-imagem-print p {
            font-size: 14px;
            line-height: 1.9;
            text-align: justify;
            color: #000;
            margin-bottom: 20px;
          }

          .assinatura-termo {
            margin: 90px auto 0 auto;
            width: 380px;
            border-top: 1px solid #000;
            text-align: center;
            padding-top: 8px;
            color: #000;
            font-size: 13px;
          }

          .data-termo {
            margin-top: 40px;
            color: #000;
            font-size: 14px;
          }
        </style>
      </head>

      <body>
        ${conteudo.innerHTML}
      </body>
    </html>
  `);

  janela.document.close();
  janela.focus();

  setTimeout(() => {
    janela.print();
  }, 500);
};

  const formatarDataParaInput = (data) => {
    if (!data) return '';
    const dataObj = new Date(data);
    if (Number.isNaN(dataObj.getTime())) return '';
    return dataObj.toISOString().split('T')[0];
  };

  const formatarData = (data) => {
    if (!data) return 'Não informada';
    const dataFormatada = new Date(data);
    if (Number.isNaN(dataFormatada.getTime())) return 'Não informada';
    return dataFormatada.toLocaleDateString('pt-BR');
  };

  const calcularIdade = (dataNascimento) => {
    if (!dataNascimento) return '-';

    const nascimento = new Date(dataNascimento);
    const hoje = new Date();

    let idade = hoje.getFullYear() - nascimento.getFullYear();
    const mes = hoje.getMonth() - nascimento.getMonth();

    if (mes < 0 || (mes === 0 && hoje.getDate() < nascimento.getDate())) {
      idade--;
    }

    return idade;
  };

  const abrirModalCadastro = () => {
    setModoEdicao(false);
    setAlunoEditandoId(null);
    setForm({
      nome: '',
      data_nascimento: '',
      cpf: '',
      nis: '',
      responsavel1: '',
      responsavel2: '',
      telefone: '',
      endereco: '',
      transporte: false,
      ponto_embarque_id: '',
    });
    setMostrarModal(true);
  };

  const abrirModalEdicao = (aluno) => {
    setModoEdicao(true);
    setAlunoEditandoId(aluno.id);
    setForm({
      nome: aluno.nome || '',
      data_nascimento: formatarDataParaInput(aluno.data_nascimento),
      cpf: aluno.cpf || '',
      nis: aluno.nis || '',
      responsavel1: aluno.responsavel1 || '',
      responsavel2: aluno.responsavel2 || '',
      telefone: aluno.telefone || '',
      endereco: aluno.endereco || '',
      transporte: !!aluno.transporte,
      ponto_embarque_id: aluno.ponto_embarque_id || '',
    });
    setMostrarModal(true);
  };

  const fecharModal = () => {
    setMostrarModal(false);
    setModoEdicao(false);
    setAlunoEditandoId(null);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name === 'transporte' && !checked) {
      setForm((prev) => ({
        ...prev,
        transporte: false,
        ponto_embarque_id: '',
      }));
      return;
    }

    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const salvarAluno = async () => {
    if (!form.nome.trim()) {
      alert('Informe o nome do participante.');
      return;
    }

    try {
      const dados = {
        ...form,
        ponto_embarque_id: form.transporte ? form.ponto_embarque_id || null : null,
      };

      if (modoEdicao) {
        await api.put(`/alunos/${alunoEditandoId}`, dados);
      } else {
        await api.post('/alunos', dados);
      }

      fecharModal();
      buscarAlunos();
    } catch (error) {
      console.error('Erro ao salvar participante:', error);
      alert('Erro ao salvar participante.');
    }
  };

  const salvarObservacao = async (alunoId, observacao) => {
    try {
      await api.put(`/alunos/${alunoId}/observacao`, { observacao });
      buscarAlunos();
    } catch (error) {
      console.error('Erro ao salvar observação:', error);
      alert('Erro ao salvar observação.');
    }
  };

  const alterarObservacaoLocal = (alunoId, valor) => {
    setAlunos((prev) =>
      prev.map((aluno) =>
        aluno.id === alunoId ? { ...aluno, observacao: valor } : aluno
      )
    );
  };

  const alterarStatus = async (alunoId, ativoAtual) => {
    try {
      await api.put(`/alunos/${alunoId}/status`, { ativo: !ativoAtual });
      buscarAlunos();
    } catch (error) {
      console.error('Erro ao alterar status:', error);
      alert('Erro ao alterar status do participante.');
    }
  };

  const excluirAluno = async (alunoId) => {
    const confirmar = window.confirm('Deseja realmente excluir este participante?');
    if (!confirmar) return;

    try {
      await api.delete(`/alunos/${alunoId}`);
      buscarAlunos();
    } catch (error) {
      console.error('Erro ao excluir participante:', error);
      alert('Erro ao excluir participante.');
    }
  };

  const cadastrarPontoEmbarque = async () => {
    if (!novoPonto.trim()) {
      alert('Informe o nome do ponto de embarque.');
      return;
    }

    try {
      await api.post('/pontos-embarque', { nome: novoPonto });
      setNovoPonto('');
      buscarPontosEmbarque();
    } catch (error) {
      console.error('Erro ao cadastrar ponto de embarque:', error);
      alert('Erro ao cadastrar ponto de embarque.');
    }
  };

  const excluirPontoEmbarque = async (id) => {
    const confirmar = window.confirm(
      'Deseja realmente excluir este ponto de embarque?'
    );
    if (!confirmar) return;

    try {
      await api.delete(`/pontos-embarque/${id}`);
      buscarPontosEmbarque();
      buscarAlunos();
    } catch (error) {
      console.error('Erro ao excluir ponto de embarque:', error);
      alert('Erro ao excluir ponto de embarque.');
    }
  };

  const atualizarPontoAluno = async (alunoId, pontoId) => {
    try {
      await api.put(`/alunos/${alunoId}/ponto-embarque`, {
        ponto_embarque_id: pontoId || null,
      });
      buscarAlunos();
    } catch (error) {
      console.error('Erro ao atualizar ponto de embarque:', error);
      alert('Erro ao atualizar ponto de embarque do participante.');
    }
  };

  const alternarOficinaAluno = async (aluno, oficinaId) => {
    const oficinasAtuais = Array.isArray(aluno.oficinas_ids)
      ? aluno.oficinas_ids
      : [];

    const jaVinculado = oficinasAtuais
      .map((id) => Number(id))
      .includes(Number(oficinaId));

    try {
      if (jaVinculado) {
        await api.delete(`/vinculos/${aluno.id}/${oficinaId}`);
      } else {
        await api.post('/vinculos', {
          aluno_id: aluno.id,
          oficina_id: oficinaId,
        });
      }

      buscarAlunos();
    } catch (error) {
      console.error('Erro ao alterar vínculo com oficina:', error);
      alert('Erro ao vincular/desvincular oficina.');
    }
  };

  const alunoTemOficina = (aluno, oficinaId) => {
    if (!Array.isArray(aluno.oficinas_ids)) return false;

    return aluno.oficinas_ids
      .map((id) => Number(id))
      .includes(Number(oficinaId));
  };

  const alunosFiltrados = alunos.filter((aluno) => {
    if (filtroIdade === 'GERAL') return true;

    const idade = calcularIdade(aluno.data_nascimento);
    if (idade === '-') return false;

    if (filtroIdade === 'CRIANCA') return idade >= 0 && idade <= 11;
    if (filtroIdade === 'ADOLESCENTE') return idade >= 12 && idade <= 17;
    if (filtroIdade === 'ADULTO') return idade >= 18 && idade <= 59;
    if (filtroIdade === 'IDOSO') return idade >= 60;

    return true;
  });

  return (
    <div className="page-container">
      <div className="page-header clean-header">
        <h2>Participantes Cadastrados</h2>
      </div>

      <div className="participantes-acoes-topo">
        <div className="filtro-etario-container">
          <label>Filtrar por faixa etária</label>

          <select
            value={filtroIdade}
            onChange={(e) => setFiltroIdade(e.target.value)}
            className="filtro-etario"
          >
            <option value="GERAL">GERAL</option>
            <option value="CRIANCA">CRIANÇAS</option>
            <option value="ADOLESCENTE">ADOLESCENTES</option>
            <option value="ADULTO">ADULTOS</option>
            <option value="IDOSO">IDOSOS</option>
          </select>
        </div>

        <div className="participantes-botoes-topo">
          <button
            type="button"
            className="big-blue-btn"
            onClick={() => setMostrarModalPontos(true)}
            style={{ width: '220px', padding: '10px 14px', fontSize: '14px' }}
          >
            Pontos de embarque
          </button>

          <button
            type="button"
            className="big-blue-btn"
            onClick={abrirModalCadastro}
            style={{ width: '180px', padding: '10px 14px', fontSize: '14px' }}
          >
            Novo participante
          </button>
        </div>
      </div>

      <div className="excel-table-card">
        <div className="excel-scroll-area">
          <table className="frequencia-excel-table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Data Nasc.</th>
                <th>Idade</th>
                <th>CPF</th>
                <th>NIS</th>
                <th>Transporte</th>
                <th>Ponto de Embarque</th>
                <th>Responsável 1</th>
                <th>Responsável 2</th>
                <th>Endereço</th>
                <th>Telefone</th>
                <th>Observação</th>
                <th>Situação</th>
                <th>Ações</th>

                {oficinas.map((oficina) => (
                  <th key={oficina.id}>{oficina.nome}</th>
                ))}
              </tr>
            </thead>

            <tbody>
              {alunosFiltrados.length > 0 ? (
                alunosFiltrados.map((aluno) => (
                  <tr key={aluno.id}>
                    <td>{aluno.nome}</td>
                    <td>{formatarData(aluno.data_nascimento)}</td>
                    <td>{calcularIdade(aluno.data_nascimento)}</td>
                    <td>{aluno.cpf || '-'}</td>
                    <td>{aluno.nis || '-'}</td>
                    <td>{aluno.transporte ? 'Sim' : 'Não'}</td>

                    <td>
                      {aluno.transporte ? (
                        <select
                          value={aluno.ponto_embarque_id || ''}
                          onChange={(e) => atualizarPontoAluno(aluno.id, e.target.value)}
                          style={{
                            minWidth: '180px',
                            padding: '7px',
                            borderRadius: '7px',
                            border: '1px solid #c9d7e6',
                            background: '#fff',
                          }}
                        >
                          <option value="">Sem ponto</option>

                          {pontosEmbarque.map((ponto) => (
                            <option key={ponto.id} value={ponto.id}>
                              {ponto.nome}
                            </option>
                          ))}
                        </select>
                      ) : (
                        '-'
                      )}
                    </td>

                    <td>{aluno.responsavel1 || '-'}</td>
                    <td>{aluno.responsavel2 || '-'}</td>
                    <td>{aluno.endereco || '-'}</td>
                    <td>{aluno.telefone || '-'}</td>

                    <td>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <input
                          type="text"
                          value={aluno.observacao || ''}
                          onChange={(e) =>
                            alterarObservacaoLocal(aluno.id, e.target.value)
                          }
                          placeholder="Digite uma observação"
                          style={{
                            minWidth: '180px',
                            padding: '6px',
                            borderRadius: '6px',
                            border: '1px solid #c9d7e6',
                          }}
                        />

                        <button
                          type="button"
                          onClick={() =>
                            salvarObservacao(aluno.id, aluno.observacao || '')
                          }
                          style={{
                            background: '#6b7c8f',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '6px',
                            padding: '6px 10px',
                            cursor: 'pointer',
                            fontWeight: '600',
                          }}
                        >
                          Salvar
                        </button>
                      </div>
                    </td>

                    <td>
                      <span
                        className={
                          aluno.ativo ? 'status-badge active' : 'status-badge inactive'
                        }
                      >
                        {aluno.ativo ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>

                    <td>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                          type="button"
                          onClick={() => abrirModalEdicao(aluno)}
                          style={{
                            background: '#3578e5',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '6px',
                            padding: '6px 10px',
                            cursor: 'pointer',
                            fontWeight: '600',
                          }}
                        >
                          Editar
                        </button>

                        <button
                          type="button"
                          onClick={() => excluirAluno(aluno.id)}
                          style={{
                            background: '#f04438',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '6px',
                            padding: '6px 10px',
                            cursor: 'pointer',
                            fontWeight: '600',
                          }}
                        >
                          Excluir
                        </button>

                        <button
                          type="button"
                          onClick={() => alterarStatus(aluno.id, aluno.ativo)}
                          style={{
                            background: aluno.ativo ? '#f79009' : '#12b76a',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '6px',
                            padding: '6px 10px',
                            cursor: 'pointer',
                            fontWeight: '600',
                          }}
                        >
                          {aluno.ativo ? 'Inativar' : 'Ativar'}
                        </button>

                        <button
                          type="button"
                          onClick={() => abrirRelatorioAluno(aluno.id)}
                          style={{
                            background: '#123d68',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '6px',
                            padding: '6px 10px',
                            cursor: 'pointer',
                            fontWeight: '600',
                          }}
                        >
                          📄 Relatório
                        </button>
                      </div>
                    </td>

                    {oficinas.map((oficina) => (
                      <td key={`${aluno.id}-${oficina.id}`} style={{ textAlign: 'center' }}>
                        <input
                          type="checkbox"
                          checked={alunoTemOficina(aluno, oficina.id)}
                          onChange={() => alternarOficinaAluno(aluno, oficina.id)}
                        />
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={14 + oficinas.length}>
                    Nenhum participante encontrado para esta faixa etária.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {mostrarModal && (
        <div className="modal-overlay">
          <div
            className="modal"
            style={{
              width: '520px',
              maxWidth: '94%',
              padding: '26px',
              borderRadius: '16px',
              background: '#f8fbff',
            }}
          >
            <h3 style={{ marginBottom: '20px', color: '#123d68' }}>
              {modoEdicao ? 'Editar participante' : 'Cadastrar participante'}
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <input name="nome" placeholder="Nome" value={form.nome} onChange={handleChange} />
              <input type="date" name="data_nascimento" value={form.data_nascimento} onChange={handleChange} />
              <input name="cpf" placeholder="CPF" value={form.cpf} onChange={handleChange} />
              <input name="nis" placeholder="NIS" value={form.nis} onChange={handleChange} />
              <input name="responsavel1" placeholder="Responsável 1" value={form.responsavel1} onChange={handleChange} />
              <input name="responsavel2" placeholder="Responsável 2" value={form.responsavel2} onChange={handleChange} />
              <input name="telefone" placeholder="Telefone" value={form.telefone} onChange={handleChange} />
              <input name="endereco" placeholder="Endereço" value={form.endereco} onChange={handleChange} />

              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#123d68', fontWeight: '500' }}>
                <input type="checkbox" name="transporte" checked={form.transporte} onChange={handleChange} />
                Usa transporte?
              </label>

              {form.transporte && (
                <select
                  name="ponto_embarque_id"
                  value={form.ponto_embarque_id}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    height: '42px',
                    border: '1px solid #c9d7e6',
                    borderRadius: '9px',
                    padding: '0 12px',
                    fontSize: '15px',
                    background: '#ffffff',
                  }}
                >
                  <option value="">Selecione o ponto de embarque</option>
                  {pontosEmbarque.map((ponto) => (
                    <option key={ponto.id} value={ponto.id}>
                      {ponto.nome}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div style={{ marginTop: '22px', display: 'grid', gridTemplateColumns: '1fr 120px', gap: '12px' }}>
              <button type="button" className="big-blue-btn" onClick={salvarAluno}>
                {modoEdicao ? 'Salvar alterações' : 'Salvar'}
              </button>

              <button type="button" className="nav-sair-btn" onClick={fecharModal}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {mostrarModalPontos && (
        <div className="modal-overlay">
          <div
            className="modal"
            style={{
              width: '520px',
              maxWidth: '94%',
              padding: '26px',
              borderRadius: '16px',
              background: '#f8fbff',
            }}
          >
            <h3 style={{ marginBottom: '20px', color: '#123d68' }}>
              Pontos de embarque
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 120px', gap: '10px', marginBottom: '18px' }}>
              <input
                type="text"
                placeholder="Digite o ponto de embarque"
                value={novoPonto}
                onChange={(e) => setNovoPonto(e.target.value)}
              />

              <button
                type="button"
                className="big-blue-btn"
                onClick={cadastrarPontoEmbarque}
                style={{ padding: '10px', fontSize: '14px' }}
              >
                Adicionar
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {pontosEmbarque.length > 0 ? (
                pontosEmbarque.map((ponto) => (
                  <div
                    key={ponto.id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      background: '#e8f0fa',
                      padding: '10px 12px',
                      borderRadius: '10px',
                      color: '#123d68',
                      fontWeight: '600',
                    }}
                  >
                    <span>{ponto.nome}</span>

                    <button
                      type="button"
                      onClick={() => excluirPontoEmbarque(ponto.id)}
                      style={{
                        border: 'none',
                        background: '#ef4452',
                        color: '#fff',
                        borderRadius: '8px',
                        padding: '6px 10px',
                        cursor: 'pointer',
                        fontWeight: '700',
                      }}
                    >
                      Excluir
                    </button>
                  </div>
                ))
              ) : (
                <p style={{ color: '#48617d' }}>
                  Nenhum ponto de embarque cadastrado.
                </p>
              )}
            </div>

            <div style={{ marginTop: '20px' }}>
              <button
                type="button"
                className="nav-sair-btn"
                onClick={() => setMostrarModalPontos(false)}
                style={{ width: '100%' }}
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {mostrarModalRelatorio && relatorioAluno && (
        <div className="modal-overlay">
          <div
            className="modal relatorio-print-area"
            style={{
              width: '900px',
              maxWidth: '96%',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '28px',
              borderRadius: '16px',
              background: '#ffffff',
            }}
          >
            <h2 style={{ color: '#123d68', marginBottom: '8px' }}>
              Relatório do Participante
            </h2>

            <p style={{ marginBottom: '20px', color: '#48617d' }}>
              Dados gerais, oficinas vinculadas e histórico de frequência.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '20px' }}>
              <p><strong>Nome:</strong> {relatorioAluno.aluno.nome}</p>
              <p><strong>Data de nascimento:</strong> {formatarData(relatorioAluno.aluno.data_nascimento)}</p>
              <p><strong>Idade:</strong> {calcularIdade(relatorioAluno.aluno.data_nascimento)}</p>
              <p><strong>CPF:</strong> {relatorioAluno.aluno.cpf || '-'}</p>
              <p><strong>NIS:</strong> {relatorioAluno.aluno.nis || '-'}</p>
              <p><strong>Telefone:</strong> {relatorioAluno.aluno.telefone || '-'}</p>
              <p><strong>Responsável 1:</strong> {relatorioAluno.aluno.responsavel1 || '-'}</p>
              <p><strong>Responsável 2:</strong> {relatorioAluno.aluno.responsavel2 || '-'}</p>
              <p><strong>Endereço:</strong> {relatorioAluno.aluno.endereco || '-'}</p>
              <p><strong>Transporte:</strong> {relatorioAluno.aluno.transporte ? 'Sim' : 'Não'}</p>
              <p><strong>Ponto de embarque:</strong> {relatorioAluno.aluno.ponto_embarque_nome || '-'}</p>
              <p><strong>Situação:</strong> {relatorioAluno.aluno.ativo ? 'Ativo' : 'Inativo'}</p>
            </div>

            <p style={{ marginBottom: '18px' }}>
              <strong>Observação:</strong> {relatorioAluno.aluno.observacao || 'Nenhuma observação registrada.'}
            </p>

            <h3 style={{ color: '#123d68', marginBottom: '10px' }}>Oficinas vinculadas</h3>
            <table className="frequencia-excel-table tabela-oficinas-relatorio" style={{ marginBottom: '20px' }}>
              <thead>
                <tr>
                  <th>Oficina</th>
                  <th className="ocultar-na-impressao">Responsável</th>
                  <th>Dia</th>
                  <th className="ocultar-na-impressao">Horário</th>
                </tr>
              </thead>

              <tbody>
                {relatorioAluno.oficinas.length > 0 ? (
                  relatorioAluno.oficinas.map((oficina) => (
                    <tr key={oficina.id}>
                      <td>{oficina.nome}</td>
                      <td className="ocultar-na-impressao">{oficina.responsavel || '-'}</td>
                      <td>{oficina.dia_semana || '-'}</td>
                      <td className="ocultar-na-impressao">{oficina.horario || '-'}</td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan="4">Nenhuma oficina vinculada.</td></tr>
                )}
              </tbody>
            </table>

            <h3 style={{ color: '#123d68', marginBottom: '10px' }}>Resumo de frequência</h3>
            <table className="frequencia-excel-table" style={{ marginBottom: '20px' }}>
              <thead>
                <tr>
                  <th>Oficina</th>
                  <th>Presenças</th>
                  <th>Faltas</th>
                  <th>Atestados</th>
                </tr>
              </thead>

              <tbody>
                {relatorioAluno.resumoFrequencia.length > 0 ? (
                  relatorioAluno.resumoFrequencia.map((item) => (
                    <tr key={item.oficina_id}>
                      <td>{item.oficina_nome}</td>
                      <td>{item.presencas}</td>
                      <td>{item.faltas}</td>
                      <td>{item.atestados}</td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan="4">Nenhum registro de frequência.</td></tr>
                )}
              </tbody>
            </table>

            <h3 style={{ color: '#123d68', marginBottom: '10px' }}>Histórico de frequência</h3>
            <table className="frequencia-excel-table">
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Oficina</th>
                  <th>Situação</th>
                  <th>Atestado</th>
                  <th>Observação</th>
                </tr>
              </thead>

              <tbody>
                {relatorioAluno.historicoFrequencia.length > 0 ? (
                  relatorioAluno.historicoFrequencia.map((item, index) => (
                    <tr key={`${item.oficina_nome}-${item.data_formatada}-${index}`}>
                      <td>{item.data_formatada}</td>
                      <td>{item.oficina_nome}</td>
                      <td>{item.presente ? 'Presente' : 'Falta'}</td>
                      <td>{item.atestado ? 'Sim' : 'Não'}</td>
                      <td>{item.observacao_atestado || '-'}</td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan="5">Nenhum histórico encontrado.</td></tr>
                )}
              </tbody>
            </table>

            <div className="termo-imagem-print">
              <h3>Termo de Autorização de Uso de Imagem</h3>

              <p>
                Eu, <strong>{relatorioAluno.aluno.responsavel1 || relatorioAluno.aluno.responsavel2 || '________________________________'}</strong>,
                responsável pelo(a) participante <strong>{relatorioAluno.aluno.nome}</strong>,
                nascido(a) em <strong>{formatarData(relatorioAluno.aluno.data_nascimento)}</strong>,
                CPF <strong>{relatorioAluno.aluno.cpf || '________________'}</strong>,
                NIS <strong>{relatorioAluno.aluno.nis || '________________'}</strong>,
                residente no endereço <strong>{relatorioAluno.aluno.endereco || '________________'}</strong>,
                autorizo o uso de sua imagem em registros fotográficos e audiovisuais das atividades realizadas pelo SCFV,
                para fins institucionais, informativos e de divulgação das ações desenvolvidas.
              </p>

              <p>
                Declaro estar ciente de que esta autorização é concedida de forma gratuita, exclusivamente para fins relacionados às atividades do serviço.
              </p>

              <div className="assinatura-termo">
                <span>Assinatura do responsável</span>
              </div>

              <p className="data-termo">
                Data: ____ / ____ / ______
              </p>
            </div>

            <div
              style={{
                marginTop: '24px',
                display: 'grid',
                gridTemplateColumns: '1fr 140px',
                gap: '12px',
              }}
              className="no-print"
            >
              <button type="button" className="big-blue-btn" onClick={imprimirRelatorio}>
                Gerar relatório / imprimir
              </button>

              <button
                type="button"
                className="nav-sair-btn"
                onClick={() => setMostrarModalRelatorio(false)}
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Alunos;