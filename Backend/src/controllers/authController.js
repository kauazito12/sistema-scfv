const pool = require('../config/database');

const login = async (req, res) => {
  const { login, senha } = req.body;

  try {
    const result = await pool.query(
      'SELECT * FROM administradores WHERE login = $1 AND senha = $2',
      [login, senha]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ erro: 'Login ou senha inválidos.' });
    }

    return res.json({
      mensagem: 'Login realizado com sucesso.',
      admin: result.rows[0],
    });
  } catch (error) {
    console.error('Erro no login:', error);
    return res.status(500).json({ erro: 'Erro interno no servidor.' });
  }
};

module.exports = { login };