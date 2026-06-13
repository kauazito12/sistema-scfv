const pool = require('../config/database');

const listarPontos = async (req, res) => {
  try {
    const resultado = await pool.query(`
      SELECT id, nome
      FROM pontos_embarque
      ORDER BY nome ASC
    `);

    res.json(resultado.rows);
  } catch (error) {
    console.error('Erro ao listar pontos de embarque:', error);
    res.status(500).json({ erro: 'Erro ao listar pontos de embarque.' });
  }
};

const cadastrarPonto = async (req, res) => {
  const { nome } = req.body;

  if (!nome || !nome.trim()) {
    return res.status(400).json({ erro: 'Nome do ponto é obrigatório.' });
  }

  try {
    const resultado = await pool.query(
      `
      INSERT INTO pontos_embarque (nome)
      VALUES ($1)
      RETURNING *
      `,
      [nome.trim()]
    );

    res.status(201).json(resultado.rows[0]);
  } catch (error) {
    console.error('Erro ao cadastrar ponto de embarque:', error);
    res.status(500).json({ erro: 'Erro ao cadastrar ponto de embarque.' });
  }
};

const excluirPonto = async (req, res) => {
  const { id } = req.params;

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    await client.query(
      `
      UPDATE alunos
      SET ponto_embarque_id = NULL
      WHERE ponto_embarque_id = $1
      `,
      [id]
    );

    await client.query(
      `
      DELETE FROM pontos_embarque
      WHERE id = $1
      `,
      [id]
    );

    await client.query('COMMIT');

    res.json({ mensagem: 'Ponto de embarque excluído com sucesso.' });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Erro ao excluir ponto de embarque:', error);
    res.status(500).json({ erro: 'Erro ao excluir ponto de embarque.' });
  } finally {
    client.release();
  }
};

module.exports = {
  listarPontos,
  cadastrarPonto,
  excluirPonto,
};