export interface IToy {
  partName: string;
  code: string;
}

export interface IApiCreateToy extends IToy {}

export interface IApiToyResponse extends IToy {
  id: number;
}

export interface IApiCreateToyResponse extends IApiToyResponse {}
