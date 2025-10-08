require("dotenv").config();
const express = require("express");
const path = require("path");
const app = express();

// Configurações
const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.join(__dirname, "public");

// Middleware
app.use(express.json());
app.use(express.static(PUBLIC_DIR));

// Rota principal
app.get("/", (req, res) => {
  res.sendFile(path.join(PUBLIC_DIR, "index.html"));
});

// Tratamento de erros 404
app.use((req, res) => {
  res.status(404).send("Página não encontrada");
});

// Inicialização do servidor
app.listen(PORT, () => {
  console.log("=".repeat(60));
  console.log(`Servidor HTTP iniciado`);
  console.log(`Endereço: http://localhost:${PORT}`);
  console.log(`Diretório público: ${PUBLIC_DIR}`);
  console.log("=".repeat(60));
  console.log("Servidor pronto para receber requisições...\n");
});
