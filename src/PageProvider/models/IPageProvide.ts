import ITemplatePage from "../dtos/ITemplatePageDTO";

export default interface IPageProvider {
  parse(data: ITemplatePage): Promise<string>;
}
