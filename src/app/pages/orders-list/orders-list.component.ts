import { Component } from '@angular/core';
import { IOrder } from '../../static/interfaces/order.interface';

@Component({
  selector: 'app-orders-list',
  standalone: true,
  imports: [],
  templateUrl: './orders-list.component.html',
  styleUrl: './orders-list.component.scss',
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
