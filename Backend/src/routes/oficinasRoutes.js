const express = require("express");
const router = express.Router();

const {
  listarOficinas,
  criarOficina,
  atualizarOficina,
  excluirOficina,
} = require("../controllers/oficinasController");

router.get("/", listarOficinas);
router.post("/", criarOficina);
router.put("/:id", atualizarOficina);
router.delete("/:id", excluirOficina);

module.exports = router;