import { IAppUser } from '../types/app-user.type';
import { OrderType } from '../enums/order.enum';

export interface IOrder {
  id: number;
  code: string;
  color: string;
  colorCode: string;
  amount: number;
  desktop: string;
  type: OrderType;
  takenBy: IAppUser;
  creator: IAppUser;
  isClosed: boolean;
  createdAt: number | Date;
  updatedAt: number | Date;
  deletedAt: number | Date;
}

export interface IApiCreateOrder {
  codeName: string;
  code: string;
  color: string;
  colorCode: string;
  amount: number;
  desktop: string;
}
