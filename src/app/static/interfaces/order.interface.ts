import { IAppUser } from '../types/app-user.type';
import { OrderType } from '../enums/order.enum';

export interface IOrder {
  id: number;
  code: string;
  color: string;
  colorCode: string;
  amount: number;
  deliverDesk: string;
  type: OrderType;
  createdBy: IAppUser;
}
