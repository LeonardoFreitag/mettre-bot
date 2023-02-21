"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _libphonenumberJs = _interopRequireWildcard(require("libphonenumber-js"));
var _venomBot = require("venom-bot");
var _fs = _interopRequireDefault(require("fs"));
var _path = _interopRequireDefault(require("path"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }
function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }
class Sender {
  get isConnected() {
    return this.connected;
  }
  get qrCode() {
    return this.qr;
  }
  get isSistemInitializing() {
    return this.systemInitializing;
  }
  constructor() {
    this.client = void 0;
    this.connected = void 0;
    this.qr = void 0;
    this.systemInitializing = void 0;
  } // this.initialize();

  async sendText(to, body) {
    if (!(0, _libphonenumberJs.isValidPhoneNumber)(to, "BR")) {
      throw new Error("Número de telefone inválido!");
    }
    let phoneNumber = (0, _libphonenumberJs.default)(to, "BR")?.format("E.164")?.replace("+", "");
    phoneNumber = phoneNumber.includes("@c.us") ? phoneNumber : `${phoneNumber}@c.us`;

    // console.log("phoneNumber", phoneNumber);
    await this.client.sendText(phoneNumber, body);
  }
  initialize() {
    const qr = (base64Qr, asciiQR, attempts) => {
      this.qr = {
        base64Qr,
        asciiQR,
        attempts
      };
    };
    const status = statusSession => {
      this.connected = ["isLogged", "qrReadSuccess", "chatsAvailable"].includes(statusSession);
    };
    const start = async client => {
      this.client = client;
      client.onStateChange(state => {
        this.connected = state === _venomBot.SocketState.CONNECTED;
      });
    };
    this.systemInitializing = true;
    (0, _venomBot.create)("mettre", qr, status).then(client => start(client)).catch(error => console.error(error));
  }
  async getIsConnected() {
    try {
      return await this.client.isConnected();
    } catch {
      return false;
    }
  }
  async getConnectionState() {
    return await this.client.getConnectionState();
  }
  async disconect() {
    let logOut = false;
    let killService = false;
    try {
      logOut = await this.client.close();
    } catch {
      logOut = false;
    }
    try {
      killService = await this.client.killServiceWorker();
    } catch {
      killService = false;
    }
    const dir = _path.default.resolve(__dirname, "..", "tokens");
    _fs.default.rmSync(dir, {
      recursive: true,
      force: true
    });
    this.qr = {};
    const logOutData = {
      logOut,
      killService
    };
    this.connected = false;
    this.systemInitializing = false;
    return logOutData;
  }
}
var _default = Sender;
exports.default = _default;