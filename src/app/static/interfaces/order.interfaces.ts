import { IAppUser } from '../types/app-user.type';
import { OrderType } from '../enums/order.enum';
import { IApiToyResponse } from './toy.interfaces';

export interface IOrder {
  id: number;
  // fullText: string;
  cartTimestamp: string;
  toy: IApiToyResponse;
  color?: string;
  colorCode: string;
  amount: number;
  desktop: string;
  takenBy: IAppUser;
  creator: IAppUser;
  isClosed: boolean;
  createdAt: number | Date;
  updatedAt: number | Date;
  deletedAt: number | Date;
}

export interface IApiCreateOrder {
  // fullText: string;
  partName: string;
  code: string;
  colorCode: string;
  amount: number;
  desktop: string;
}

export interface IApiOrdersByTimestamp {
  cartTimestamp: string;
  orders: IOrder[];
  type: OrderType;
}
