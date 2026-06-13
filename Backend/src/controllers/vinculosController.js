const pool = require('../config/database');

const criarVinculo = async (req, res) => {
  const { aluno_id, oficina_id } = req.body;

  if (!aluno_id || !oficina_id) {
    return res.status(400).json({
      erro: 'aluno_id e oficina_id são obrigatórios.',
    });
  }

  try {
    await pool.query(
      `
      INSERT INTO aluno_oficina (aluno_id, oficina_id)
      VALUES ($1, $2)
      ON CONFLICT DO NOTHING
      `,
      [aluno_id, oficina_id]
    );

    res.json({ mensagem: 'Oficina vinculada com sucesso.' });
  } catch (error) {
    console.error('Erro ao vincular oficina:', error);
    res.status(500).json({ erro: 'Erro ao vincular oficina.' });
  }
};

const removerVinculo = async (req, res) => {
  const { alunoId, oficinaId } = req.params;

  try {
    await pool.query(
      `
      DELETE FROM aluno_oficina
      WHERE aluno_id = $1 AND oficina_id = $2
      `,
      [alunoId, oficinaId]
    );

    res.json({ mensagem: 'Oficina desvinculada com sucesso.' });
  } catch (error) {
    console.error('Erro ao desvincular oficina:', error);
    res.status(500).json({ erro: 'Erro ao desvincular oficina.' });
  }
};

module.exports = {
  criarVinculo,
  removerVinculo,
};