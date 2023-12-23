import { Component } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { IApiCreateUser } from '../../static/interfaces/create-user.interfaces';
import { TelegramService } from '../../services/telegram/telegram.service';
import { ApiService } from '../../services/api/api.service';
import { CookieService } from 'ngx-cookie-service';
import { IApiCreateOrder } from '../../static/interfaces/order.interface';
import { log } from '@angular-devkit/build-angular/src/builders/ssr-dev-server';

@Component({
  selector: 'app-create-order',
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    RouterLink,
  ],
  templateUrl: './create-order.component.html',
  styleUrl: './create-order.component.scss',
})
export class CreateOrderComponent {
  private static instance: CreateOrderComponent;

  createOrderForm = new FormGroup({
    partName: new FormControl('', [Validators.required, Validators.minLength(1)]),
    code: new FormControl('', [Validators.required, Validators.minLength(1)]),
    color: new FormControl('', [Validators.required, Validators.minLength(1)]),
    colorCode: new FormControl('', [Validators.required, Validators.minLength(1)]),
    amount: new FormControl('', [Validators.required, Validators.min(1), Validators.minLength(1)]),
    desktop: new FormControl('', [Validators.required, Validators.minLength(1)]),
  });

  get partNameValid(): boolean {
    const valid = !(this.createOrderForm.controls.partName.invalid && this.createOrderForm.controls.partName.touched);

    if (valid) {
      this.formCheck();
    }

    return valid;
  }

  get codeValid(): boolean {
    const valid = !(this.createOrderForm.controls.code.invalid && this.createOrderForm.controls.code.touched);

    if (valid) {
      this.formCheck();
    }

    return valid;
  }

  get colorValid(): boolean {
    const valid = !(this.createOrderForm.controls.color.invalid && this.createOrderForm.controls.color.touched);

    if (valid) {
      this.formCheck();
    }

    return valid;
  }

  get colorCodeValid(): boolean {
    const valid = !(this.createOrderForm.controls.colorCode.invalid && this.createOrderForm.controls.colorCode.touched);

    if (valid) {
      this.formCheck();
    }

    return valid;
  }

  get amountValid(): boolean {
    const valid = !(this.createOrderForm.controls.amount.invalid && this.createOrderForm.controls.amount.touched);

    if (valid) {
      this.formCheck();
    }

    return valid;
  }

  get desktopValid(): boolean {
    const valid = !(this.createOrderForm.controls.desktop.invalid && this.createOrderForm.controls.desktop.touched);

    if (valid) {
      this.formCheck();
    }

    return valid;
  }

  formCheck(): void {
    if (
      this.createOrderForm.controls.partName.valid &&
      this.createOrderForm.controls.code.valid &&
      this.createOrderForm.controls.color.valid &&
      this.createOrderForm.controls.colorCode.valid &&
      this.createOrderForm.controls.desktop.valid
    ) {
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
    const _this = CreateOrderComponent.instance;

    if (_this.onSubmitting) {
      return;
    }
    _this.onSubmitting = true;

    _this.telegram.MainButton.showProgress(false);
    const body: IApiCreateOrder = {
      partName: _this.createOrderForm.controls.partName.value as string,
      code: _this.createOrderForm.controls.code.value as string,
      color: _this.createOrderForm.controls.color.value as string,
      colorCode: _this.createOrderForm.controls.colorCode.value as string,
      amount: Number.parseInt(_this.createOrderForm.controls.amount.value as string) || 1,
      desktop: _this.createOrderForm.controls.desktop.value as string,
    };

    const result = await _this.api.createOrder(body);

    if (result) {
      _this.telegram.showPopup({
        title: 'Успех!',
        message: `Заказ успешно создан.`,
        buttons: [{
          type: 'ok',
          text: 'Ок',
        }],
      });
      _this.telegram.MainButton.hide();
      await _this.router.navigateByUrl('/list');
      window.location.reload();
    }

    _this.telegram.MainButton.offClick(_this.onSubmit);
    _this.telegram.MainButton.hideProgress();

    _this.onSubmitting = false;
  }

  constructor(
    private readonly telegram: TelegramService,
    private readonly api: ApiService,
    private readonly router: Router,
  ) {
    CreateOrderComponent.instance = this;
  }
}
