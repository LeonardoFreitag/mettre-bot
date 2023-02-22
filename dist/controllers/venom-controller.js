"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.sentText = exports.inicialize = exports.getQrCode = exports.getIsConnected = exports.getConnectionState = exports.disconect = void 0;
var _sender = _interopRequireDefault(require("../sender"));
var _HandleBarsPageProvider = _interopRequireDefault(require("../PageProvider/HandleBarsPageProvider/HandleBarsPageProvider"));
var _path = _interopRequireDefault(require("path"));
var _fs = _interopRequireDefault(require("fs"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
const sender = new _sender.default();
const inicialize = (request, response) => {
  try {
    const dir = _path.default.resolve(__dirname, "..", "tokens");
    try {
      _fs.default.rmSync(dir, {
        recursive: true,
        force: true
      });
    } catch (error) {
      console.log("não deletou a pasta");
    }
    sender.initialize();
    response.status(200).send({
      statusDescription: "Inicializando...",
      status: false
    });
  } catch (error) {
    response.status(400).send({
      error
    });
  }
};
exports.inicialize = inicialize;
const getIsConnected = async (request, response) => {
  let status = false;
  try {
    status = await sender.getIsConnected();
  } catch {
    return response.status(400).send({
      status
    });
  }
  return response.status(200).send({
    status
  });
};
exports.getIsConnected = getIsConnected;
const getConnectionState = async (request, response) => {
  try {
    const status = await sender.getConnectionState();
    return response.status(200).send({
      status
    });
  } catch {
    return response.status(400).send({
      status: "error"
    });
  }
};
exports.getConnectionState = getConnectionState;
const sentText = async (request, response) => {
  const {
    number,
    message
  } = request.body;
  try {
    await sender.sendText(number, message);
    return response.status(200).json({
      message: "mensagem enviada"
    });
  } catch (error) {
    response.status(500).json({
      status: "error",
      message: error
    });
  }
};
exports.sentText = sentText;
const getQrCode = async (request, response) => {
  const handlebars = new _HandleBarsPageProvider.default();
  const systemInitializing = sender.isSistemInitializing;
  const qr_code = sender.qrCode ?? {};
  if (!systemInitializing) {
    const htmlFile = _path.default.resolve(__dirname, "..", "PageProvider", "views", "other_message.hbs");
    const pageWithData = await handlebars.parse({
      file: htmlFile,
      variables: {
        message: "BOT desconectado."
      }
    });
    return response.send(pageWithData);
  }
  if (qr_code.base64Qr === undefined) {
    const htmlFile = _path.default.resolve(__dirname, "..", "PageProvider", "views", "other_message.hbs");
    const pageWithData = await handlebars.parse({
      file: htmlFile,
      variables: {
        message: "Gerando QRCode. Aguarde alguns segundos..."
      }
    });
    return response.send(pageWithData);
  }
  const systemIsConnected = await sender.getIsConnected();
  if (systemIsConnected) {
    const htmlFile = _path.default.resolve(__dirname, "..", "PageProvider", "views", "other_message.hbs");
    const pageWithData = await handlebars.parse({
      file: htmlFile,
      variables: {
        message: "Sistema conectado!"
      }
    });
    return response.send(pageWithData);
  }
  const htmlFile = _path.default.resolve(__dirname, "..", "PageProvider", "views", "qrcode_venon.hbs");
  const pageWithData = await handlebars.parse({
    file: htmlFile,
    variables: {
      qrcode: qr_code.base64Qr
    }
  });
  return response.send(pageWithData);
};
exports.getQrCode = getQrCode;
const disconect = async (request, response) => {
  return response.send({
    close: true,
    killServiceWork: true
  });
};
exports.disconect = disconect;