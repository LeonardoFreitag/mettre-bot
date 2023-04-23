const { Client, MessageMedia, LocalAuth } = require("whatsapp-web.js");
// const { Db } = require('./model/db');
const { phoneNumberFormatter } = require("./helpers/formatter");
const qrcode = require("qrcode");

const ConnectionStatus = {
  INIT: "INIT",
  QR: "QR",
  READY: "READY",
  AUTH_FAIL: "AUTH_FAIL",
  DISCONECT: "DISCONECT",
};

const ConnectionStatusMessage = {
  INIT: "Iniciando",
  QR: "Escaneie o QR Code para conectar",
  READY: "Conexão estabelecida",
  AUTH_FAIL: "Falha na conexão",
  DISCONECT: "Desconectado",
};

const ConnectionStatusDb = {
  INIT: "D",
  QR: "D",
  READY: "C",
  AUTH_FAIL: "D",
  DISCONECT: "D",
};

const connections = [];

class Connection {
  static getConnection(id, dbId) {
    if (!connections[id]) {
      const connection = new Connection(id, dbId);
      connections[id] = connection;
    }

    return connections[id];
  }

  static hasConnection(id) {
    return connections[id];
  }

  constructor(id, dbId) {
    console.log("Criando conexao", id);

    this.id = id;
    this.dbId = dbId;
    this.qr = "";
    this.qrTry = 0;

    this.setStatus(ConnectionStatus.INIT);

    this.createClient();
  }

  createClient() {
    this.client = new Client({
      restartOnAuthFail: true,
      puppeteer: {
        headless: true,
        // executablePath: '/usr/bin/chromium-browser',
        args: [
          "--no-sandbox",
          "--disable-setuid-sandbox",
          "--disable-dev-shm-usage",
          "--disable-accelerated-2d-canvas",
          "--no-first-run",
          "--no-zygote",
          "--single-process", // <- this one doesn't works in Windows
          "--disable-gpu",
          "--disable-setuid-sandbox",
        ],
      },
      authStrategy: new LocalAuth({
        clientId: this.id,
      }),
    });

    this.client.initialize();

    this.client.on("ready", (session) => {
      console.log("Ready", this.id);

      this.setStatus(ConnectionStatus.READY);

      this.qr = "";
    });

    this.client.on("qr", (qr) => {
      console.log("QR recebido", this.id, this.qrTry, qr);

      this.qrTry++;
      // connections[id].message = 'Escaneie o QR Code para conectar';

      if (this.qrTry >= 5) {
        this.client.destroy();

        delete connections[this.id];

        console.log("Tentativa maxima execedida", this.id);

        return;
      }

      qrcode.toDataURL(qr, (err, qrCode) => {
        this.qr = qrCode;
      });

      this.setStatus(ConnectionStatus.QR);
    });

    this.client.on("auth_failure", function () {
      console.log("auth_failure", id);

      this.setStatus(ConnectionStatus.AUTH_FAIL);
    });

    this.client.on("disconnected", (reason) => {
      console.log("disconnected", this.id);

      this.setStatus(ConnectionStatus.DISCONECT);

      this.client.destroy();

      delete connections[this.id];
    });
  }

  async sendMessage(req, res) {
    try {
      const sender = req.params.id;
      const number = phoneNumberFormatter(req.body.number);
      const message = req.body.message;

      if (this.getStatus() != ConnectionStatus.READY) {
        return res.status(422).json({
          status: false,
          message: `Conexão ${sender}: ${this.getStatusMessage()}`,
        });
      }

      const client = this.client;

      if (!client) {
        return res.status(422).json({
          status: false,
          message: `Sessão: ${sender} não encontrada`,
        });
      }

      const isRegisteredNumber = await client.isRegisteredUser(number);

      if (!isRegisteredNumber) {
        return res.status(422).json({
          status: false,
          message: "Número não registrado",
        });
      }

      if (req.body.file) {
        const fileUrl = req.body.file;

        let mimetype;
        let attachment = "";

        if (req.body.file_type && req.body.file_type == "base64") {
          mimetype = req.body.file_content_type;
          attachment = req.body.file;
        } else {
          attachment = await axios
            .get(fileUrl, {
              responseType: "arraybuffer",
            })
            .then((response) => {
              mimetype = response.headers["content-type"];
              return response.data.toString("base64");
            });
        }

        const media = new MessageMedia(mimetype, attachment, "Arquivo");

        client
          .sendMessage(number, media, {})
          .then((response) => {
            res.status(200).json({
              status: true,
              response: response,
            });
          })
          .catch((err) => {
            res.status(500).json({
              status: false,
              response: err,
            });
          });
      } else {
        client
          .sendMessage(number, message)
          .then((response) => {
            res.status(200).json({
              status: true,
              response: response,
            });
          })
          .catch((err) => {
            res.status(500).json({
              status: false,
              response: err,
            });
          });
      }
    } catch (error) {
      res.status(500).json({
        status: false,
        response: error,
      });
    }
  }

  static disconnect(req, res) {
    if (connections[req.params.id]) {
      connections[req.params.id].client.destroy();
      delete connections[req.params.id];

      res.status(200).json({
        id: req.params.id,
        status: true,
        message: "Conexão desconectada com sucesso",
      });
    } else {
      res.status(200).json({
        id: req.params.id,
        status: false,
        message: "Conexão inválida",
      });
    }
  }

  getClient() {
    return this.client;
  }

  getStatus() {
    return this.status;
  }

  setStatus(status) {
    this.status = status;

    // if (this.dbId) {
    //     Db.changeConnectionStatus(this.dbId, this.id, ConnectionStatusDb[status]);
    // }

    return this;
  }

  getStatusMessage() {
    return ConnectionStatusMessage[this.getStatus()];
  }
}

module.exports = {
  Connection,
  ConnectionStatus,
  ConnectionStatusMessage,
};
