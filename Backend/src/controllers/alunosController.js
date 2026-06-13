const pool = require('../config/database');

const listarAlunos = async (req, res) => {
  try {
    const resultado = await pool.query(`
      SELECT
        a.id,
        a.nome,
        a.data_nascimento,
        a.cpf,
        a.nis,
        a.responsavel1,
        a.responsavel2,
        a.telefone,
        a.endereco,
        a.transporte,
        a.observacao,
        a.ativo,
        a.ponto_embarque_id,
        pe.nome AS ponto_embarque_nome,
        COALESCE(
          ARRAY_AGG(ao.oficina_id) FILTER (WHERE ao.oficina_id IS NOT NULL),
          '{}'
        ) AS oficinas_ids
      FROM alunos a
      LEFT JOIN aluno_oficina ao ON ao.aluno_id = a.id
      LEFT JOIN pontos_embarque pe ON pe.id = a.ponto_embarque_id
      GROUP BY a.id, pe.nome
      ORDER BY a.nome ASC
    `);

    res.json(resultado.rows);
  } catch (error) {
    console.error('Erro ao listar alunos:', error);
    res.status(500).json({ erro: 'Erro ao listar alunos.' });
  }
};

const relatorioAluno = async (req, res) => {
  const { id } = req.params;

  try {
    const aluno = await pool.query(
      `
      SELECT
        a.id,
        a.nome,
        a.data_nascimento,
        a.cpf,
        a.nis,
        a.responsavel1,
        a.responsavel2,
        a.telefone,
        a.endereco,
        a.transporte,
        a.observacao,
        a.ativo,
        a.ponto_embarque_id,
        pe.nome AS ponto_embarque_nome
      FROM alunos a
      LEFT JOIN pontos_embarque pe ON pe.id = a.ponto_embarque_id
      WHERE a.id = $1
      `,
      [id]
    );

    if (aluno.rows.length === 0) {
      return res.status(404).json({ erro: 'Participante não encontrado.' });
    }

    const oficinas = await pool.query(
      `
      SELECT
        o.id,
        o.nome,
        o.descricao,
        o.responsavel,
        o.dia_semana,
        o.horario
      FROM aluno_oficina ao
      INNER JOIN oficinas o ON o.id = ao.oficina_id
      WHERE ao.aluno_id = $1
      ORDER BY o.nome ASC
      `,
      [id]
    );

    const resumoFrequencia = await pool.query(
      `
      SELECT
        o.id AS oficina_id,
        o.nome AS oficina_nome,
        COUNT(CASE WHEN f.presente = true THEN 1 END) AS presencas,
        COUNT(CASE WHEN f.presente = false THEN 1 END) AS faltas,
        COUNT(CASE WHEN f.atestado = true THEN 1 END) AS atestados
      FROM aluno_oficina ao
      INNER JOIN oficinas o ON o.id = ao.oficina_id
      LEFT JOIN frequencia f
        ON f.aluno_id = ao.aluno_id
        AND f.oficina_id = ao.oficina_id
      WHERE ao.aluno_id = $1
      GROUP BY o.id, o.nome
      ORDER BY o.nome ASC
      `,
      [id]
    );

    const historicoFrequencia = await pool.query(
      `
      SELECT
        f.id,
        f.data,
        TO_CHAR(CAST(f.data AS DATE), 'DD/MM/YYYY') AS data_formatada,
        f.presente,
        COALESCE(f.atestado, false) AS atestado,
        COALESCE(f.observacao_atestado, '') AS observacao_atestado,
        o.nome AS oficina_nome
      FROM frequencia f
      INNER JOIN oficinas o ON o.id = f.oficina_id
      WHERE f.aluno_id = $1
      ORDER BY CAST(f.data AS DATE) DESC, o.nome ASC
      `,
      [id]
    );

    res.json({
      aluno: aluno.rows[0],
      oficinas: oficinas.rows,
      resumoFrequencia: resumoFrequencia.rows,
      historicoFrequencia: historicoFrequencia.rows,
    });
  } catch (error) {
    console.error('Erro ao gerar relatório do participante:', error);
    res.status(500).json({ erro: 'Erro ao gerar relatório do participante.' });
  }
};

const cadastrarAluno = async (req, res) => {
  const {
    nome,
    data_nascimento,
    cpf,
    nis,
    responsavel1,
    responsavel2,
    telefone,
    endereco,
    transporte,
    ponto_embarque_id,
  } = req.body;

  if (!nome) {
    return res.status(400).json({ erro: 'Nome é obrigatório.' });
  }

  try {
    const resultado = await pool.query(
      `
      INSERT INTO alunos (
        nome,
        data_nascimento,
        cpf,
        nis,
        responsavel1,
        responsavel2,
        telefone,
        endereco,
        transporte,
        ponto_embarque_id,
        ativo
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, true)
      RETURNING *
      `,
      [
        nome,
        data_nascimento || null,
        cpf || null,
        nis || null,
        responsavel1 || null,
        responsavel2 || null,
        telefone || null,
        endereco || null,
        transporte || false,
        transporte ? ponto_embarque_id || null : null,
      ]
    );

    res.status(201).json(resultado.rows[0]);
  } catch (error) {
    console.error('Erro ao cadastrar aluno:', error);
    res.status(500).json({ erro: 'Erro ao cadastrar aluno.' });
  }
};

const editarAluno = async (req, res) => {
  const { id } = req.params;

  const {
    nome,
    data_nascimento,
    cpf,
    nis,
    responsavel1,
    responsavel2,
    telefone,
    endereco,
    transporte,
    ponto_embarque_id,
  } = req.body;

  if (!nome) {
    return res.status(400).json({ erro: 'Nome é obrigatório.' });
  }

  try {
    const resultado = await pool.query(
      `
      UPDATE alunos
      SET
        nome = $1,
        data_nascimento = $2,
        cpf = $3,
        nis = $4,
        responsavel1 = $5,
        responsavel2 = $6,
        telefone = $7,
        endereco = $8,
        transporte = $9,
        ponto_embarque_id = $10
      WHERE id = $11
      RETURNING *
      `,
      [
        nome,
        data_nascimento || null,
        cpf || null,
        nis || null,
        responsavel1 || null,
        responsavel2 || null,
        telefone || null,
        endereco || null,
        transporte || false,
        transporte ? ponto_embarque_id || null : null,
        id,
      ]
    );

    res.json(resultado.rows[0]);
  } catch (error) {
    console.error('Erro ao editar aluno:', error);
    res.status(500).json({ erro: 'Erro ao editar aluno.' });
  }
};

const atualizarObservacao = async (req, res) => {
  const { id } = req.params;
  const { observacao } = req.body;

  try {
    const resultado = await pool.query(
      `
      UPDATE alunos
      SET observacao = $1
      WHERE id = $2
      RETURNING *
      `,
      [observacao || '', id]
    );

    res.json(resultado.rows[0]);
  } catch (error) {
    console.error('Erro ao atualizar observação:', error);
    res.status(500).json({ erro: 'Erro ao atualizar observação.' });
  }
};

const atualizarStatus = async (req, res) => {
  const { id } = req.params;
  const { ativo } = req.body;

  try {
    const resultado = await pool.query(
      `
      UPDATE alunos
      SET ativo = $1
      WHERE id = $2
      RETURNING *
      `,
      [ativo, id]
    );

    res.json(resultado.rows[0]);
  } catch (error) {
    console.error('Erro ao atualizar status:', error);
    res.status(500).json({ erro: 'Erro ao atualizar status.' });
  }
};

const atualizarPontoEmbarque = async (req, res) => {
  const { id } = req.params;
  const { ponto_embarque_id } = req.body;

  try {
    const resultado = await pool.query(
      `
      UPDATE alunos
      SET ponto_embarque_id = $1
      WHERE id = $2
      RETURNING *
      `,
      [ponto_embarque_id || null, id]
    );

    res.json(resultado.rows[0]);
  } catch (error) {
    console.error('Erro ao atualizar ponto de embarque:', error);
    res.status(500).json({ erro: 'Erro ao atualizar ponto de embarque.' });
  }
};

const excluirAluno = async (req, res) => {
  const { id } = req.params;

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    await client.query(`DELETE FROM aluno_oficina WHERE aluno_id = $1`, [id]);
    await client.query(`DELETE FROM frequencia WHERE aluno_id = $1`, [id]);
    await client.query(`DELETE FROM alunos WHERE id = $1`, [id]);

    await client.query('COMMIT');

    res.json({ mensagem: 'Aluno excluído com sucesso.' });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Erro ao excluir aluno:', error);
    res.status(500).json({ erro: 'Erro ao excluir aluno.' });
  } finally {
    client.release();
  }
};

module.exports = {
  listarAlunos,
  cadastrarAluno,
  editarAluno,
  relatorioAluno,
  atualizarObservacao,
  atualizarStatus,
  atualizarPontoEmbarque,
  excluirAluno,
};