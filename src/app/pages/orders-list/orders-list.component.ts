import { Component } from '@angular/core';
import {IAppUser} from "../../app.component";

export const enum OrderType {
  Current = "Активные заказы",
  Created = "Созданные вами заказы",
  Other = "Остальное"
}

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

@Component({
  selector: 'app-orders-list',
  standalone: true,
  imports: [],
  templateUrl: './orders-list.component.html',
  styleUrl: './orders-list.component.scss'
})
export class OrdersListComponent {
  readonly orders: IOrder[] = [];


  getById(id: number) {
    return this.orders.find((order) => order.id === id);
  }

  get byGroup() {
    return this.orders.reduce((group, order: IOrder) => {
      // @ts-ignore
      if (!group[order.type]) {
        // @ts-ignore
        group[order.type] = [];
      }
      // @ts-ignore
      group[order.type].push(order);
      return group;
    }, {});
  }
}
