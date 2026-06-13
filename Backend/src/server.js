const express = require("express");
const cors = require("cors");

const alunosRoutes = require("./routes/alunosRoutes");
const oficinasRoutes = require("./routes/oficinasRoutes");
const frequenciaRoutes = require("./routes/frequenciaRoutes");
const pontosEmbarqueRoutes = require("./routes/pontosEmbarqueRoutes");
const vinculosRoutes = require("./routes/vinculosRoutes");
const authRoutes = require("./routes/authRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("API SCFV rodando");
});

app.use("/alunos", alunosRoutes);
app.use("/oficinas", oficinasRoutes);
app.use("/frequencia", frequenciaRoutes);
app.use("/pontos-embarque", pontosEmbarqueRoutes);
app.use("/vinculos", vinculosRoutes);
app.use("/auth", authRoutes);

const PORT = 3001;

const server = app.listen(PORT, () => {
  console.log(`Servidor SCFV rodando na porta ${PORT}`);
});

server.on("error", (error) => {
  console.error("Erro ao iniciar servidor:", error);
});

/* Mantém o processo ativo */
setInterval(() => {}, 1000);