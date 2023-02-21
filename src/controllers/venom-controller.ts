import { Request, Response } from "express";
import Sender from "../sender";
import HandleBarsSpageProvider from "../PageProvider/HandleBarsPageProvider/HandleBarsPageProvider";
import path from "path";
import { QrCodeModel } from "../PageProvider/models/QrCodeModel";
import fs from "fs";

const sender = new Sender();

export const inicialize = (request: Request, response: Response) => {
  try {
    const dir = path.resolve(__dirname, "..", "tokens");
    fs.rmSync(dir, { recursive: true, force: true });

    sender.initialize();
    response
      .status(200)
      .send({ statusDescription: "Inicializando...", status: false });
  } catch (error) {
    response.status(400).send({ error });
  }
};

export const getIsConnected = async (request: Request, response: Response) => {
  let status = false;
  try {
    status = await sender.getIsConnected();
  } catch {
    return response.status(400).send({ status });
  }
  return response.status(200).send({ status });
};

export const getConnectionState = async (
  request: Request,
  response: Response
) => {
  try {
    const status = await sender.getConnectionState();
    return response.status(200).send({ status });
  } catch {
    return response.status(400).send({ status: "error" });
  }
};

export const sentText = async (request: Request, response: Response) => {
  const { number, message } = request.body;
  try {
    await sender.sendText(number, message);
    return response.status(200).json({ message: "mensagem enviada" });
  } catch (error) {
    response.status(500).json({ status: "error", message: error });
  }
};

export const getQrCode = async (request: Request, response: Response) => {
  const handlebars = new HandleBarsSpageProvider();

  const systemInitializing = sender.isSistemInitializing;

  const qr_code = sender.qrCode ?? ({} as QrCodeModel);

  if (!systemInitializing) {
    const htmlFile = path.resolve(
      __dirname,
      "..",
      "PageProvider",
      "views",
      "other_message.hbs"
    );
    const pageWithData = await handlebars.parse({
      file: htmlFile,
      variables: { message: "BOT desconectado." },
    });
    return response.send(pageWithData);
  }

  if (qr_code.base64Qr === undefined) {
    const htmlFile = path.resolve(
      __dirname,
      "..",
      "PageProvider",
      "views",
      "other_message.hbs"
    );
    const pageWithData = await handlebars.parse({
      file: htmlFile,
      variables: {
        message: "Gerando QRCode. Aguarde alguns segundos...",
      },
    });
    return response.send(pageWithData);
  }

  const systemIsConnected = await sender.getIsConnected();
  if (systemIsConnected) {
    const htmlFile = path.resolve(
      __dirname,
      "..",
      "PageProvider",
      "views",
      "other_message.hbs"
    );
    const pageWithData = await handlebars.parse({
      file: htmlFile,
      variables: {
        message: "Sistema conectado!",
      },
    });
    return response.send(pageWithData);
  }

  const htmlFile = path.resolve(
    __dirname,
    "..",
    "PageProvider",
    "views",
    "qrcode_venon.hbs"
  );
  const pageWithData = await handlebars.parse({
    file: htmlFile,
    variables: { qrcode: qr_code.base64Qr },
  });
  return response.send(pageWithData);
};

export const disconect = (request: Request, response: Response) => {
  const data = sender.disconect();
  return response.send(data);
};
