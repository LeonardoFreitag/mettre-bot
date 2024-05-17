require("dotenv").config();

const { Auth } = require("./auth");
const { Connection, ConnectionStatus } = require("./connection");

const express = require("express");

console.log(process.env.PROTOCOL);

const http = require(process.env.PROTOCOL || "http");
const port = process.env.PORT || 5001;

const fileUpload = require("express-fileupload");
const fs = require("fs");

const app = express();
// let options = {};

// if (process.env.PROTOCOL == 'https') {
//     options = {
//         key: fs.readFileSync(process.env.SSL_KEY || "certificado.key"),
//         cert: fs.readFileSync(process.env.SSL_CERT || "certificado.cert")
//     };
// }

const server = http.createServer(app);

app.use(express.json({ limit: "500mb" }));
app.use(
  express.urlencoded({
    extended: true,
    limit: "500mb",
  })
);

// Middleware to add headers
app.use(function (req, res, next) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "*");
  res.setHeader("Access-Control-Allow-Headers", "*");
  res.setHeader("Access-Control-Allow-Credentials", true);

  next();
});

// Middleware to check user
app.use(Auth.check);

app.use(
  fileUpload({
    debug: false,
  })
);

app.get("/session/:id", (req, res) => {
  const connection = Connection.getConnection(req.params.id, req.query.db_id);

  res.status(200).json({
    id: connection.id,
    status: connection.getStatus(),
    message: connection.getStatusMessage(),
    qr: connection.qr,
  });
});

app.get("/session-qr/:id", (req, res) => {
  const connection = Connection.getConnection(req.params.id, req.query.db_id);

  if (connection.getStatus() == ConnectionStatus.QR) {
    res.status(200).send(`<img src="${connection.qr}">`);
  } else {
    res.status(201).send(`Status: ${connection.getStatusMessage()}`);
  }
});

app.get("/disconnect/:id", (req, res) => {
  Connection.disconnect(req, res);
});

app.post("/send-message/:id", async (req, res) => {
  if (!Connection.hasConnection(req.params.id)) {
    return res.status(422).json({
      status: false,
      message: `Conexão ${req.params.id} não encontrada`,
    });
  }

  const connection = Connection.getConnection(req.params.id);

  await connection.sendMessage(req, res);
});

const secret = Auth.createAuth();

server.listen(port, function () {
  console.log("API rodando em http://localhost:" + port);
  console.log(
    "Para iniciar " +
      process.env.PROTOCOL +
      "://localhost:" +
      port +
      "/session/12345678?auth=" +
      secret
  );
  console.log(
    "Para iniciar " +
      process.env.PROTOCOL +
      "://localhost:" +
      port +
      "/session-qr/12345678?auth=" +
      secret
  );
});
