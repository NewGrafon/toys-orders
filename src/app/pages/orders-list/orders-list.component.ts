import { Component } from '@angular/core';
import { IApiOrdersByTimestamp } from '../../static/interfaces/order.interfaces';
import { IAppUser } from '../../static/types/app-user.type';
import { AppComponent } from '../../app.component';
import { ApiService } from '../../services/api/api.service';
import { UserRole } from '../../static/enums/user.enums';
import { NgClass } from '@angular/common';
import { OrderType } from '../../static/enums/order.enum';
import { FormsModule } from '@angular/forms';
import { TelegramService } from '../../services/telegram/telegram.service';
import { ColorInfo } from '../../static/interfaces/colors-info.interface';
import { timeDifference } from '../../static/functions/time-difference.function';
import { Router } from '@angular/router';

@Component({
  selector: 'app-orders-list',
  standalone: true,
  imports: [NgClass, FormsModule],
  templateUrl: './orders-list.component.html',
  styleUrl: './orders-list.component.scss',
})
export class OrdersListComponent {
  get user(): IAppUser {
    return AppComponent.appUser;
  }

  currentDate: Date = new Date();
  timestamps: IApiOrdersByTimestamp[] | undefined;

  // getById(id: number) {
  //   return this.orders?.find((order) => order.id === id);
  // }

  deliverOpened: boolean = false;

  get CurrentTimestamps(): IApiOrdersByTimestamp[] {
    return (
      this.timestamps?.filter(
        (timestamp) => timestamp.orders[0].takenBy?.id === this.user?.id,
      ) || []
    );
  }

  workerOpened: boolean = false;

  get CreatedTimestamps(): IApiOrdersByTimestamp[] {
    return (
      this.timestamps?.filter(
        (timestamp) => timestamp.orders[0].creator?.id === this.user?.id,
      ) || []
    );
  }

  otherOpened: boolean = false;

  get OtherTimestamps(): IApiOrdersByTimestamp[] {
    return (
      this.timestamps?.filter(
        (timestamp) =>
          timestamp.orders[0].takenBy?.id !== this.user?.id &&
          timestamp.orders[0].creator?.id !== this.user?.id,
      ) || []
    );
  }

  timestampDecisionChoosing: boolean = false;

  async takeOrders(timestamp: string): Promise<void> {
    if (this.timestampDecisionChoosing) {
      return;
    }
    this.timestampDecisionChoosing = true;

    this.telegram.showPopup(
      {
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
      },
      async (btnId: string) => {
        if (btnId === '64') {
          const result = await this.api.takeOrders(timestamp);
          if (result) {
            this.telegram.showPopup({
              title: 'Успех!',
              message: 'Заказ успешно взят.',
            });
          }
          await this.updateOrders();
        }
      },
    );

    this.timestampDecisionChoosing = false;
  }

  async closeOrders(timestamp: string): Promise<void> {
    if (this.timestampDecisionChoosing) {
      return;
    }
    this.timestampDecisionChoosing = true;

    this.telegram.showPopup(
      {
        title: 'Подтверждение',
        message:
          'Вы уверены что хотите закрыть этот заказ? Если да, то выберите один из исходов закрытия: "Завершение" или "Отказ от заказа"',
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
      },
      async (btnId: string) => {
        if (btnId === '63') {
          const result = await this.api.closeOrders(timestamp, false, []);
          if (result) {
            this.telegram.showPopup({
              title: 'Успех!',
              message: 'Вы отказались от заказа.',
            });
          }
          await this.updateOrders();
        } else if (btnId === '64') {
          const unixTimestamp = new Date(timestamp).getTime().toString();
          localStorage.setItem(unixTimestamp, timestamp);
          await this.router.navigateByUrl(
            `/edit-order-by-deliver/${unixTimestamp}`,
          );
          window.location.reload();
        }
      },
    );

    this.timestampDecisionChoosing = false;
  }

  async cancelOrders(timestamp: string): Promise<void> {
    if (this.timestampDecisionChoosing) {
      return;
    }
    this.timestampDecisionChoosing = true;

    this.telegram.showPopup(
      {
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
      },
      async (btnId: string) => {
        if (btnId === '64') {
          const result = await this.api.cancelOrders(timestamp);
          if (result) {
            this.telegram.showPopup({
              title: 'Успех!',
              message: 'Заказ успешно отменен.',
            });
          }
          await this.updateOrders();
        }
      },
    );

    this.timestampDecisionChoosing = false;
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

    this.timestamps = undefined;

    const newTimestamps: IApiOrdersByTimestamp[] = (
      await this.api.getAllOrders()
    ).filter(
      (timestamp: IApiOrdersByTimestamp) =>
        timestamp.orders[0].deletedAt === null && !timestamp.orders[0].isClosed,
    );

    newTimestamps.forEach((timestamp, firstIndex) => {
      timestamp.orders.forEach((order, deepIndex) => {
        newTimestamps[firstIndex].orders[deepIndex].color =
          AppComponent.colorsInfo.filter(
            (_color: ColorInfo) =>
              _color.code === timestamp.orders[deepIndex].colorCode,
          )[0].color;
      });
    });
    console.log(newTimestamps);

    for (let i = 0; i < newTimestamps.length; i++) {
      newTimestamps[i].type = OrderType.Other;
      if (newTimestamps[i].orders[0].takenBy?.id === this.user?.id) {
        newTimestamps[i].type = OrderType.Current;
      }
      if (newTimestamps[i].orders[0].creator?.id === this.user?.id) {
        newTimestamps[i].type = OrderType.Created;
      }
    }
    this.timestamps = newTimestamps;

    this.updatingOrders = false;
  }

  constructor(
    private readonly api: ApiService,
    private readonly telegram: TelegramService,
    readonly router: Router,
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
  protected readonly timeDifference = timeDifference;
}
