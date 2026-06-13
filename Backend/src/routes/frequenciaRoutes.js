const express = require('express');
const router = express.Router();

const {
  buscarFrequenciaPorOficinaEData,
  salvarFrequencia,
  atualizarRegistroFrequencia,
  relatorioFrequencia,
  relatorioMensalFrequencia,
} = require('../controllers/frequenciaController');

router.get('/relatorio/:oficinaId', relatorioFrequencia);
router.get('/relatorio-mensal/:oficinaId/:ano/:mes', relatorioMensalFrequencia);
router.put('/registro', atualizarRegistroFrequencia);

router.get('/:oficinaId/:data', buscarFrequenciaPorOficinaEData);
router.post('/', salvarFrequencia);

module.exports = router;