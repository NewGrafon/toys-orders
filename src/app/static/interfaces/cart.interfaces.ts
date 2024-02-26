export interface ICartToy {
  id: number;
  colorCode: string;
  amount: number;
}

export interface ICart {
  cart: ICartToy[];
  desktop: string;
}

export interface IApiToyResponse {
  id: number;
  partName: string;
  code: string;
}
