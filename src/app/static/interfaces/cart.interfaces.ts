export interface ICartToy {
  id: number;
  colorCode: string;
  amount: number;
}

export interface ICart {
  cart?: ICartToy[];
  desktop: string;
}

export interface IApiCart extends ICart {}

export interface IApiChangeInCart extends ICartToy {}
