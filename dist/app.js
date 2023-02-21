"use strict";

var _express = _interopRequireDefault(require("express"));
var _venomController = require("./controllers/venom-controller");
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
const app = (0, _express.default)();
app.use(_express.default.json());
app.use(_express.default.urlencoded({
  extended: false
}));
app.get("/initialize", _venomController.inicialize);
app.get("/qrcode", _venomController.getQrCode);
app.get("/isConnected", _venomController.getIsConnected);
app.get("/getConnectionState", _venomController.getConnectionState);
app.post("/send", _venomController.sentText);
app.post("/disconect", _venomController.disconect);
app.listen(3001, () => {
  console.log("👽 API Rodando!");
});