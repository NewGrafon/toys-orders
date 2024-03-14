import { Component } from '@angular/core';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { ApiService } from '../../services/api/api.service';
import { TelegramService } from '../../services/telegram/telegram.service';
import {
  IEditOrderByDeliver,
  IOrder,
} from '../../static/interfaces/order.interfaces';
import { NgClass } from '@angular/common';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { timeDifference } from '../../static/functions/time-difference.function';

@Component({
  selector: 'app-edit-order-by-deliver',
  standalone: true,
  imports: [NgClass, FormsModule, FormsModule, ReactiveFormsModule, RouterLink],
  templateUrl: './edit-order-by-deliver.component.html',
  styleUrl: './edit-order-by-deliver.component.scss',
})
export class EditOrderByDeliverComponent {
  private static instance: EditOrderByDeliverComponent;
  currentDate: Date = new Date();
  timestamp: string = '';

  timestampOrders: IOrder[] | undefined = undefined;
  editedOrders: IEditOrderByDeliver[] = [];

  setPopupInputValue(index: number): void {
    const doc: HTMLInputElement = document.getElementById(
      `popup${index}`,
    ) as HTMLInputElement;

    let value = Number.parseInt(doc?.value || '0');
    if (this.timestampOrders) {
      if (value > this.timestampOrders[index]?.amount) {
        value = this.timestampOrders[index]?.amount;
      }
      if (value < 0) {
        value = 0;
      }

      if (value === this.timestampOrders[index]?.amount) {
        const choiseAll = document.getElementById(
          `choise${index}_all`,
        ) as HTMLInputElement;
        console.log(choiseAll);

        choiseAll.checked = true;
        this.editedOrders[index].type = 'all';
        this.editedOrders[index].newAmount = undefined;
      } else if (value === 0) {
        const choiseNone = document.getElementById(
          `choise${index}_none`,
        ) as HTMLInputElement;
        choiseNone.checked = true;
        this.editedOrders[index].type = 'none';
        this.editedOrders[index].newAmount = undefined;
      } else {
        this.editedOrders[index].newAmount = value;
      }
    }
  }

  confirmOrdersForm = new FormGroup({
    editerOrdersCompleted: new FormControl('', [
      Validators.required,
      Validators.minLength(1),
    ]),
  });

  get editedOrdersCompletedValid(): boolean {
    let valid: boolean = true;

    this.editedOrders.every((order) => {
      if (order?.type === undefined) {
        valid = false;
        return false;
      }

      if (order.type === 'not-all' && order.newAmount === undefined) {
        valid = false;
        return false;
      }

      return true;
    });

    console.log(valid);

    if (valid) {
      this.confirmOrdersForm.controls.editerOrdersCompleted.setValue('1');
    } else {
      this.confirmOrdersForm.controls.editerOrdersCompleted.setValue(null);
    }

    this.formCheck();

    return valid;
  }

  formCheck(): void {
    if (this.confirmOrdersForm.controls.editerOrdersCompleted.valid) {
      this.telegram.MainButton.setText('Продолжить');
      this.telegram.MainButton.onClick(this.onSubmit);
      this.telegram.MainButton.show();
    } else {
      this.telegram.MainButton.offClick(this.onSubmit);
      this.telegram.MainButton.hide();
    }
  }

  onSubmitting: boolean = false;

  async onSubmit(): Promise<void> {
    const _this = EditOrderByDeliverComponent.instance;

    if (_this.onSubmitting) {
      return;
    }
    _this.onSubmitting = true;

    _this.telegram.MainButton.showProgress(false);

    _this.telegram.showPopup(
      {
        title: 'Подтверждение',
        message: 'Подтвердить закрытие заказа?',
        buttons: [
          {
            id: '64',
            text: 'Завершение',
          },
          {
            id: '0',
            type: 'cancel',
          },
        ],
      },
      async (btnId: string) => {
        if (btnId === '64') {
          if (
            !_this.timestampOrders ||
            !_this.timestampOrders[0]?.cartTimestamp
          ) {
            return;
          }

          const result = await _this.api.closeOrders(
            _this.timestampOrders[0].cartTimestamp,
            true,
            _this.editedOrders,
          );
          if (result) {
            _this.telegram.showPopup({
              title: 'Успех!',
              message: 'Вы подтвердили закрытие заказа.',
            });
          }
          await _this.router.navigateByUrl('/list');
          window.location.reload();
        }
      },
    );
    _this.telegram.MainButton.hide();

    _this.telegram.MainButton.offClick(_this.onSubmit);
    _this.telegram.MainButton.hideProgress();

    _this.onSubmitting = false;
  }

  constructor(
    private readonly telegram: TelegramService,
    private readonly api: ApiService,
    private readonly router: Router,
    readonly activatedRoute: ActivatedRoute,
  ) {
    EditOrderByDeliverComponent.instance = this;
  }

  async ngOnInit(): Promise<void> {
    const urlUnixTimestamp =
      this.activatedRoute.snapshot.paramMap.get('timestamp') || '';

    this.timestamp = localStorage.getItem(urlUnixTimestamp) || '';
    console.log(urlUnixTimestamp, this.timestamp);

    if (urlUnixTimestamp.length > 0 && this.timestamp.length > 0) {
      const timestampOrders = await this.api.getOrdersByTimestamp(
        this.timestamp,
      );
      this.timestampOrders = timestampOrders;
      console.log(this.timestampOrders);
    }

    this.editedOrders =
      this.timestampOrders?.map((order) => {
        return {
          orderId: order.id,
          newAmount: undefined,
          type: undefined,
        };
      }) || [];
  }

  protected readonly timeDifference = timeDifference;
}
