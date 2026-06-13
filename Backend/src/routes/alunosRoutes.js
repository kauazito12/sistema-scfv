const express = require('express');
const router = express.Router();

const {
  listarAlunos,
  cadastrarAluno,
  editarAluno,
  relatorioAluno,
  atualizarObservacao,
  atualizarStatus,
  atualizarPontoEmbarque,
  excluirAluno,
} = require('../controllers/alunosController');

router.get('/', listarAlunos);
router.get('/:id/relatorio', relatorioAluno);

router.post('/', cadastrarAluno);
router.put('/:id', editarAluno);
router.put('/:id/observacao', atualizarObservacao);
router.put('/:id/status', atualizarStatus);
router.put('/:id/ponto-embarque', atualizarPontoEmbarque);
router.delete('/:id', excluirAluno);

module.exports = router;