const express = require('express');
const router = express.Router();

const {
  criarVinculo,
  removerVinculo,
} = require('../controllers/vinculosController');

router.post('/', criarVinculo);
router.delete('/:alunoId/:oficinaId', removerVinculo);

module.exports = router;