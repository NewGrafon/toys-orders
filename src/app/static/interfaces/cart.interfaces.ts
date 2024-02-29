export interface ICartToy {
  id: number;
  colorCode: string;
  amount: number;
}

export interface ICart {
  cart: ICartToy[];
  desktop: string;
}

export interface IApiChangeInCart extends ICartToy {}
