import ITemplatePageDTO from "../dtos/ITemplatePageDTO";
import IPageProvider from "../models/IPageProvide";
import handlebars from "handlebars";
import fs from "fs";

class HandleBarsSpageProvider implements IPageProvider {
  public async parse({ file, variables }: ITemplatePageDTO): Promise<string> {
    const template = await fs.promises.readFile(file, {
      encoding: "utf-8",
    });
    const parsedTemplate = handlebars.compile(template);
    return parsedTemplate(variables);
  }
}

export default HandleBarsSpageProvider;
