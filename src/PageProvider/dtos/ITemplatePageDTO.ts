interface ITemplateVariables {
  [key: string]: string | boolean;
}

export default interface ITemplatePageDTO {
  file: string;
  variables: ITemplateVariables;
}
