import { Component } from '@angular/core';
import { IApiCart, ICart } from '../../static/interfaces/cart.interfaces';
import { AppComponent } from '../../app.component';
import { LocalStorageKeys } from '../../static/enums/local-storage-keys.enum';
import { TelegramService } from '../../services/telegram/telegram.service';
import { ApiService } from '../../services/api/api.service';
import { Router, RouterLink } from '@angular/router';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, RouterLink, CommonModule],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.scss',
})
export class CartComponent {
  static instance: CartComponent;

  readonly appComponent = AppComponent;

  get userCart(): ICart {
    return {
      cart: AppComponent.appUser?.cart,
      desktop: localStorage.getItem(LocalStorageKeys.cartDesktop) || '',
    };
  }

  async changeAmountItem(
    id: number,
    colorCode: string,
    amount: number,
  ): Promise<void> {
    await this.api.changeAmountInCart({
      id,
      colorCode,
      amount,
    });
    await AppComponent.updateUser();
  }

  async removeFromCart(id: number, colorCode: string): Promise<void> {
    await this.api.removeFromCart({
      id,
      colorCode,
      amount: 0,
    });
    await AppComponent.updateUser();
  }

  cartForm = new FormGroup({
    desktop: new FormControl('', [
      Validators.required,
      Validators.minLength(1),
    ]),
  });

  get desktopValid(): boolean {
    const valid = !(
      this.cartForm.controls.desktop.invalid &&
      this.cartForm.controls.desktop.touched
    );

    if (valid) {
      localStorage.setItem(
        LocalStorageKeys.cartDesktop,
        this.cartForm.controls.desktop.value as string,
      );
      this.formCheck();
    }

    return valid;
  }

  formCheck(): void {
    if (
      this.cartForm.controls.desktop.valid &&
      this.userCart.cart &&
      this.userCart.cart.length > 0
    ) {
      this.telegram.MainButton.setText(
        `Подтвердить заказ${this.userCart.cart.length > 1 ? 'ы' : ''}`,
      );
      this.telegram.MainButton.onClick(this.onSubmit);
      this.telegram.MainButton.show();
    } else {
      this.telegram.MainButton.offClick(this.onSubmit);
      this.telegram.MainButton.hide();
    }
  }

  onSubmitting: boolean = false;

  async onSubmit(): Promise<void> {
    const _this = CartComponent.instance;

    if (_this.onSubmitting) {
      return;
    }
    _this.onSubmitting = true;

    _this.telegram.MainButton.showProgress(false);

    const body: IApiCart = _this.userCart;

    if (body.cart === undefined) {
      return;
    }
    const cartLengthLetter: string = body.cart?.length > 1 ? 'ы' : '';
    const result = await _this.api.confirmCart(body);

    if (result) {
      _this.telegram.showPopup({
        title: 'Успех!',
        message: `Заказ${cartLengthLetter} успешно опубликован${cartLengthLetter}!`,
        buttons: [
          {
            type: 'ok',
            text: 'Ок',
          },
        ],
      });
      _this.telegram.MainButton.hide();
      await _this.router.navigateByUrl('/cart');
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
    CartComponent.instance = this;
    this.cartForm.controls.desktop.setValue(
      localStorage.getItem(LocalStorageKeys.cartDesktop) || '',
    );
  }
}
