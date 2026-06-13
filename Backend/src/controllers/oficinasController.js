const db = require("../config/database");

const listarOficinas = async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM oficinas ORDER BY id ASC");
    res.json(result.rows);
  } catch (error) {
    console.error("Erro ao listar oficinas:", error);
    res.status(500).json({ mensagem: "Erro ao listar oficinas" });
  }
};

const criarOficina = async (req, res) => {
  const { nome, descricao, responsavel, dia_semana, horario } = req.body;

  try {
    const result = await db.query(
      `INSERT INTO oficinas (nome, descricao, responsavel, dia_semana, horario)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [nome, descricao, responsavel, dia_semana, horario]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Erro ao criar oficina:", error);
    res.status(500).json({ mensagem: "Erro ao criar oficina" });
  }
};

const atualizarOficina = async (req, res) => {
  const { id } = req.params;
  const { nome, descricao, responsavel, dia_semana, horario } = req.body;

  try {
    const result = await db.query(
      `UPDATE oficinas
       SET nome = $1, descricao = $2, responsavel = $3, dia_semana = $4, horario = $5
       WHERE id = $6
       RETURNING *`,
      [nome, descricao, responsavel, dia_semana, horario, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ mensagem: "Oficina não encontrada" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Erro ao atualizar oficina:", error);
    res.status(500).json({ mensagem: "Erro ao atualizar oficina" });
  }
};

const excluirOficina = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await db.query(
      "DELETE FROM oficinas WHERE id = $1 RETURNING *",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ mensagem: "Oficina não encontrada" });
    }

    res.json({ mensagem: "Oficina excluída com sucesso" });
  } catch (error) {
    console.error("Erro ao excluir oficina:", error);
    res.status(500).json({ mensagem: "Erro ao excluir oficina" });
  }
};

module.exports = {
  listarOficinas,
  criarOficina,
  atualizarOficina,
  excluirOficina,
};