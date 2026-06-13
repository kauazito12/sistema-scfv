const pool = require('../config/database');

const buscarFrequenciaPorOficinaEData = async (req, res) => {
  const { oficinaId, data } = req.params;

  try {
    const vinculados = await pool.query(
      `
      SELECT
        ao.aluno_id,
        a.nome,
        a.ativo
      FROM aluno_oficina ao
      INNER JOIN alunos a ON a.id = ao.aluno_id
      WHERE ao.oficina_id = $1
      ORDER BY a.nome ASC
      `,
      [oficinaId]
    );

    const frequencias = await pool.query(
      `
      SELECT
        aluno_id,
        oficina_id,
        data,
        presente,
        COALESCE(atestado, false) AS atestado,
        COALESCE(observacao_atestado, '') AS observacao_atestado
      FROM frequencia
      WHERE oficina_id = $1 AND data = $2
      `,
      [oficinaId, data]
    );

    const mapaFrequencia = {};

    for (const item of frequencias.rows) {
      mapaFrequencia[item.aluno_id] = {
        presente: item.presente,
        atestado: item.atestado,
        observacao_atestado: item.observacao_atestado,
      };
    }

    const resultado = vinculados.rows.map((aluno) => {
      const registro = mapaFrequencia[aluno.aluno_id];

      return {
        aluno_id: aluno.aluno_id,
        nome: aluno.nome,
        ativo: aluno.ativo,
        presente: registro ? registro.presente : true,
        atestado: registro ? registro.atestado : false,
        observacao_atestado: registro ? registro.observacao_atestado : '',
      };
    });

    res.json(resultado);
  } catch (error) {
    console.error('Erro ao buscar frequência:', error);
    res.status(500).json({ erro: 'Erro ao buscar frequência.' });
  }
};

const salvarFrequencia = async (req, res) => {
  const { oficina_id, data, registros } = req.body;

  if (!oficina_id || !data || !Array.isArray(registros)) {
    return res.status(400).json({
      erro: 'oficina_id, data e registros são obrigatórios.',
    });
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    for (const registro of registros) {
      const presente = registro.presente === true;
      const atestado = presente ? false : registro.atestado === true;
      const observacaoAtestado = atestado
        ? registro.observacao_atestado || ''
        : '';

      await client.query(
        `
        INSERT INTO frequencia (
          aluno_id,
          oficina_id,
          data,
          presente,
          atestado,
          observacao_atestado
        )
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (aluno_id, oficina_id, data)
        DO UPDATE SET
          presente = EXCLUDED.presente,
          atestado = EXCLUDED.atestado,
          observacao_atestado = EXCLUDED.observacao_atestado
        `,
        [
          registro.aluno_id,
          oficina_id,
          data,
          presente,
          atestado,
          observacaoAtestado,
        ]
      );
    }

    await client.query('COMMIT');

    res.json({ mensagem: 'Frequência salva com sucesso.' });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Erro ao salvar frequência:', error);
    res.status(500).json({ erro: 'Erro ao salvar frequência.' });
  } finally {
    client.release();
  }
};

const atualizarRegistroFrequencia = async (req, res) => {
  const {
    aluno_id,
    oficina_id,
    data,
    presente,
    atestado,
    observacao_atestado,
  } = req.body;

  if (!aluno_id || !oficina_id || !data || presente === undefined) {
    return res.status(400).json({
      erro: 'aluno_id, oficina_id, data e presente são obrigatórios.',
    });
  }

  try {
    const presenteFinal = presente === true;
    const atestadoFinal = presenteFinal ? false : atestado === true;
    const observacaoFinal = atestadoFinal ? observacao_atestado || '' : '';

    const resultado = await pool.query(
      `
      INSERT INTO frequencia (
        aluno_id,
        oficina_id,
        data,
        presente,
        atestado,
        observacao_atestado
      )
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (aluno_id, oficina_id, data)
      DO UPDATE SET
        presente = EXCLUDED.presente,
        atestado = EXCLUDED.atestado,
        observacao_atestado = EXCLUDED.observacao_atestado
      RETURNING *
      `,
      [
        aluno_id,
        oficina_id,
        data,
        presenteFinal,
        atestadoFinal,
        observacaoFinal,
      ]
    );

    res.json(resultado.rows[0]);
  } catch (error) {
    console.error('Erro ao atualizar registro de frequência:', error);
    res.status(500).json({
      erro: 'Erro ao atualizar registro de frequência.',
    });
  }
};

const relatorioFrequencia = async (req, res) => {
  const { oficinaId } = req.params;

  try {
    const resultado = await pool.query(
      `
      SELECT 
        a.id AS aluno_id,
        a.nome,
        COUNT(CASE WHEN f.presente = true THEN 1 END) AS presencas,
        COUNT(CASE WHEN f.presente = false THEN 1 END) AS faltas,
        COUNT(CASE WHEN f.atestado = true THEN 1 END) AS atestados
      FROM aluno_oficina ao
      INNER JOIN alunos a ON a.id = ao.aluno_id
      LEFT JOIN frequencia f 
        ON f.aluno_id = a.id AND f.oficina_id = ao.oficina_id
      WHERE ao.oficina_id = $1
      GROUP BY a.id, a.nome
      ORDER BY a.nome ASC
      `,
      [oficinaId]
    );

    res.json(resultado.rows);
  } catch (error) {
    console.error('Erro no relatório geral:', error);
    res.status(500).json({ erro: 'Erro no relatório geral.' });
  }
};

const relatorioMensalFrequencia = async (req, res) => {
  const { oficinaId, ano, mes } = req.params;

  try {
    const alunosVinculados = await pool.query(
      `
      SELECT
        ao.aluno_id,
        a.nome
      FROM aluno_oficina ao
      INNER JOIN alunos a ON a.id = ao.aluno_id
      WHERE ao.oficina_id = $1
      ORDER BY a.nome ASC
      `,
      [oficinaId]
    );

    const frequenciasMes = await pool.query(
      `
      SELECT
        f.aluno_id,
        TO_CHAR(CAST(f.data AS DATE), 'DD/MM') AS data_formatada,
        TO_CHAR(CAST(f.data AS DATE), 'YYYY-MM-DD') AS data_iso,
        f.presente,
        COALESCE(f.atestado, false) AS atestado,
        COALESCE(f.observacao_atestado, '') AS observacao_atestado
      FROM frequencia f
      WHERE f.oficina_id = $1
        AND EXTRACT(YEAR FROM CAST(f.data AS DATE)) = $2
        AND EXTRACT(MONTH FROM CAST(f.data AS DATE)) = $3
      ORDER BY CAST(f.data AS DATE) ASC
      `,
      [oficinaId, Number(ano), Number(mes)]
    );

    const datasUnicas = [];
    const datasControle = new Set();

    for (const item of frequenciasMes.rows) {
      if (!datasControle.has(item.data_formatada)) {
        datasControle.add(item.data_formatada);
        datasUnicas.push({
          data_formatada: item.data_formatada,
          data_iso: item.data_iso,
        });
      }
    }

    const mapaRegistros = {};

    for (const item of frequenciasMes.rows) {
      if (!mapaRegistros[item.aluno_id]) {
        mapaRegistros[item.aluno_id] = {};
      }

      mapaRegistros[item.aluno_id][item.data_formatada] = {
        presente: item.presente,
        atestado: item.atestado,
        observacao_atestado: item.observacao_atestado,
        data_iso: item.data_iso,
      };
    }

    const alunos = alunosVinculados.rows.map((aluno) => {
      const registrosAluno = mapaRegistros[aluno.aluno_id] || {};

      let presencas = 0;
      let faltas = 0;
      let atestados = 0;

      Object.values(registrosAluno).forEach((registro) => {
        if (registro.presente === true) presencas += 1;
        if (registro.presente === false) faltas += 1;
        if (registro.atestado === true) atestados += 1;
      });

      return {
        aluno_id: aluno.aluno_id,
        nome: aluno.nome,
        registros: registrosAluno,
        presencas,
        faltas,
        atestados,
      };
    });

    res.json({
      mes: Number(mes),
      ano: Number(ano),
      datas: datasUnicas,
      alunos,
    });
  } catch (error) {
    console.error('Erro no relatório mensal:', error);
    res.status(500).json({ erro: 'Erro no relatório mensal.' });
  }
};

module.exports = {
  buscarFrequenciaPorOficinaEData,
  salvarFrequencia,
  atualizarRegistroFrequencia,
  relatorioFrequencia,
  relatorioMensalFrequencia,
};