import { Component } from '@angular/core';
import { IOrder } from '../../static/interfaces/order.interfaces';
import { IAppUser } from '../../static/types/app-user.type';
import { AppComponent } from '../../app.component';
import { ApiService } from '../../services/api/api.service';
import { UserRole } from '../../static/enums/user.enums';
import { NgClass } from '@angular/common';
import { OrderType } from '../../static/enums/order.enum';
import { FormsModule } from '@angular/forms';
import { TelegramService } from '../../services/telegram/telegram.service';
import { ColorInfo } from '../../static/interfaces/colors-info.interface';

@Component({
  selector: 'app-orders-list',
  standalone: true,
  imports: [
    NgClass,
    FormsModule,
  ],
  templateUrl: './orders-list.component.html',
  styleUrl: './orders-list.component.scss',
})
export class OrdersListComponent {
  get user(): IAppUser {
    return AppComponent.appUser;
  }

  currentDate: Date = new Date();
  orders: IOrder[] | undefined;

  // getById(id: number) {
  //   return this.orders?.find((order) => order.id === id);
  // }

  deliverOpened: boolean = false;

  get CurrentOrders(): IOrder[] {
    return this.orders?.filter((order) => order.takenBy?.id === this.user?.id) || [];
  }

  workerOpened: boolean = false;

  get CreatedOrders(): IOrder[] {
    return this.orders?.filter((order) => order.creator?.id === this.user?.id) || [];
  }

  otherOpened: boolean = false;

  get OtherOrders(): IOrder[] {
    return this.orders?.filter((order) => order.takenBy?.id !== this.user?.id && order.creator?.id !== this.user?.id) || [];
  }

  orderDecisionChoosing: boolean = false;

  async takeOrder(id: number): Promise<void> {
    if (this.orderDecisionChoosing) {
      return;
    }
    this.orderDecisionChoosing = true;

    this.telegram.showPopup({
      title: 'Подтверждение',
      message: 'Вы уверены что хотите взять этот заказ?',
      buttons: [
        {
          id: '64',
          type: 'ok',
        },
        {
          id: '0',
          type: 'cancel',
        },
      ],
    }, async (btnId: string) => {
      if (btnId === '64') {
        const result = await this.api.takeOrder(id);
        if (result) {
          this.telegram.showPopup({
            title: 'Успех!',
            message: 'Заказ успешно взят.',
          });
        }
        await this.updateOrders();
      }
    });

    this.orderDecisionChoosing = false;
  }

  async closeOrder(id: number): Promise<void> {
    if (this.orderDecisionChoosing) {
      return;
    }
    this.orderDecisionChoosing = true;

    this.telegram.showPopup({
      title: 'Подтверждение',
      message: 'Вы уверены что хотите закрыть этот заказ? Если да, то выберите один из исходов закрытия: "Завершение" или "Отказ от заказа"',
      buttons: [
        {
          id: '64',
          text: 'Завершение',
        },
        {
          id: '63',
          text: 'Отказ от заказа',
        },
        {
          id: '0',
          type: 'cancel',
        },
      ],
    }, async (btnId: string) => {
      if (btnId === '64' || btnId === '63') {
        const result = await this.api.closeOrder(id, btnId === '64');
        if (result) {
          this.telegram.showPopup({
            title: 'Успех!',
            message: btnId === '64' ? 'Заказ успешно завершен.' : 'Вы отказались от заказа.',
          });
        }
        await this.updateOrders();
      }
    });

    this.orderDecisionChoosing = false;
  }

  async cancelOrder(id: number): Promise<void> {
    if (this.orderDecisionChoosing) {
      return;
    }
    this.orderDecisionChoosing = true;

    this.telegram.showPopup({
      title: 'Подтверждение',
      message: 'Вы уверены что хотите отменить этот заказ?',
      buttons: [
        {
          id: '64',
          type: 'ok',
        },
        {
          id: '0',
          type: 'cancel',
        },
      ],
    }, async (btnId: string) => {
      if (btnId === '64') {
        const result = await this.api.cancelOrder(id);
        if (result) {
          this.telegram.showPopup({
            title: 'Успех!',
            message: 'Заказ успешно отменен.',
          });
        }
        await this.updateOrders();
      }
    });

    this.orderDecisionChoosing = false;
  }

  timeDifference(createDate: number | Date): string {
    let result: string = '';

    createDate = new Date(createDate);
    const diffMs = (createDate.getTime() - this.currentDate.getTime()); // milliseconds between now & Christmas
    const diffDays = (Math.floor(diffMs / 86400000) * -1) - 1; // days
    const diffHrs = (Math.floor((diffMs % 86400000) / 3600000) * -1) - 1; // hours
    const diffMins = (Math.round(((diffMs % 86400000) % 3600000) / 60000) * -1); // minutes

    if (diffDays > 0) {
      result += `${diffDays} дней, `;
    }
    if (diffHrs > 0) {
      result += `${diffHrs} часов, `;
    }
    result += `${diffMins} минут назад`;

    return result;
  }

  get refreshIcon(): HTMLElement | null {
    return document.getElementById('refreshIcon');
  }

  updatingOrders: boolean = false;

  async updateOrders() {
    if (this.updatingOrders) {
      return;
    }
    this.updatingOrders = true;

    if (this.refreshIcon) {
      this.refreshIcon.classList.add('rotate');
      setTimeout(() => {
        this.refreshIcon?.classList?.remove('rotate');
      }, 500);
    }

    this.orders = undefined;
    this.orders = (await this.api.getAllOrders()).filter((order: IOrder) => order.deletedAt === null && !order.isClosed);
    this.orders = this.orders.map((color) => {
      color.color = AppComponent.colorsInfo.filter((_color: ColorInfo) => _color.code === color.colorCode)[0].color;
      return color;
    });
    console.log(this.orders);
    
    for (let i = 0; i < this.orders.length; i++) {
      this.orders[i].type = OrderType.Other;
      if (this.orders[i].takenBy?.id === this.user?.id) {
        this.orders[i].type = OrderType.Current;
      }
      if (this.orders[i].creator?.id === this.user?.id) {
        this.orders[i].type = OrderType.Created;
      }
    }

    this.updatingOrders = false;
  }

  constructor(
    private readonly api: ApiService,
    private readonly telegram: TelegramService,
  ) {
    const interval = setInterval(async () => {
      if (this.user !== undefined) {
        clearInterval(interval);
        if (this.user.logged) {
          if (this.user?.role === UserRole.Deliver) {
            this.deliverOpened = true;
          } else if (this.user?.role === UserRole.Worker) {
            this.workerOpened = true;
          } else {
            this.otherOpened = true;
          }
          this.updateOrders();
        }

        setInterval(() => {
          this.currentDate = new Date();
        }, 1000);

        // console.log(
        //   this.CurrentOrders,
        //   this.CreatedOrders,
        //   this.OtherOrders,
        // );
      }
    }, 16.67);
  }

  protected readonly UserRole = UserRole;
  protected readonly OrderType = OrderType;
}
