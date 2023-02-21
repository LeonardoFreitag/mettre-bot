import express, { Request, Response } from "express";
import {
  inicialize,
  getIsConnected,
  sentText,
  getQrCode,
  disconect,
  getConnectionState,
} from "./controllers/venom-controller";
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.get("/initialize", inicialize);

app.get("/qrcode", getQrCode);

app.get("/isConnected", getIsConnected);

app.get("/getConnectionState", getConnectionState);

app.post("/send", sentText);

app.post("/disconect", disconect);

app.listen(3001, () => {
  console.log("👽 API Rodando!");
});
