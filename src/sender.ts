import parsePhoneNumber, { isValidPhoneNumber } from "libphonenumber-js";
import { create, Whatsapp, Message, SocketState } from "venom-bot";
import { QrCodeModel } from "./PageProvider/models/QrCodeModel";
import fs from "fs";
import path from "path";
import { ILogOutModel } from "./PageProvider/models/ILogOutModel";

class Sender {
  private client: Whatsapp;
  private connected: boolean;
  private qr: QrCodeModel;
  private systemInitializing: boolean;

  get isConnected(): boolean {
    return this.connected;
  }

  get qrCode(): QrCodeModel {
    return this.qr;
  }

  get isSistemInitializing(): boolean {
    return this.systemInitializing;
  }

  constructor() {
    // this.initialize();
  }

  async sendText(to: string, body: string) {
    if (!isValidPhoneNumber(to, "BR")) {
      throw new Error("Número de telefone inválido!");
    }

    let phoneNumber = parsePhoneNumber(to, "BR")
      ?.format("E.164")
      ?.replace("+", "") as string;

    phoneNumber = phoneNumber.includes("@c.us")
      ? phoneNumber
      : `${phoneNumber}@c.us`;

    // console.log("phoneNumber", phoneNumber);
    await this.client.sendText(phoneNumber, body);
  }

  initialize() {
    const qr = (base64Qr: string, asciiQR: string, attempts: number) => {
      this.qr = { base64Qr, asciiQR, attempts };
    };

    const status = (statusSession: string) => {
      this.connected = ["isLogged", "qrReadSuccess", "chatsAvailable"].includes(
        statusSession
      );
    };

    const start = async (client: Whatsapp) => {
      this.client = client;
      client.onStateChange((state) => {
        this.connected = state === SocketState.CONNECTED;
      });
    };

    this.systemInitializing = true;

    create("mettre", qr, status)
      .then((client) => start(client))
      .catch((error) => console.error(error));
  }

  async getIsConnected(): Promise<boolean> {
    try {
      return await this.client.isConnected();
    } catch {
      return false;
    }
  }

  async getConnectionState(): Promise<SocketState> {
    return await this.client.getConnectionState();
  }

  async disconect(): Promise<ILogOutModel> {
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
    const dir = path.resolve(__dirname, "..", "tokens");
    fs.rmSync(dir, { recursive: true, force: true });
    this.qr = {} as QrCodeModel;
    const logOutData: ILogOutModel = {
      logOut,
      killService,
    };
    this.connected = false;
    this.systemInitializing = false;
    return logOutData;
  }
}

export default Sender;
