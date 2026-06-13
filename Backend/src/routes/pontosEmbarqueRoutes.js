const express = require('express');
const router = express.Router();

const {
  listarPontos,
  cadastrarPonto,
  excluirPonto,
} = require('../controllers/pontosEmbarqueController');

router.get('/', listarPontos);
router.post('/', cadastrarPonto);
router.delete('/:id', excluirPonto);

module.exports = router;