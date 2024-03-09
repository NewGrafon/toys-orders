import { Component } from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { TelegramService } from '../../services/telegram/telegram.service';
import { ApiService } from '../../services/api/api.service';
import { ColorInfo } from '../../static/interfaces/colors-info.interface';
import { AppComponent } from '../../app.component';
import { CommonModule } from '@angular/common';
import { IApiToyResponse, IToy } from '../../static/interfaces/toy.interfaces';
import { IApiChangeInCart } from '../../static/interfaces/cart.interfaces';
import {
  ISimilarityItem,
  matchSortStringsToOneString,
} from '../../static/functions/string-similarity.function';

@Component({
  selector: 'app-create-order',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, RouterLink, CommonModule],
  templateUrl: './create-order.component.html',
  styleUrl: './create-order.component.scss',
})
export class CreateOrderComponent {
  private static instance: CreateOrderComponent;

  get colorsInfo(): ColorInfo[] {
    return AppComponent.colorsInfo;
  }

  get allToys(): IApiToyResponse[] {
    return AppComponent.allToys;
  }

  createOrderForm = new FormGroup({
    toyFind: new FormControl('', []),
    toyInput: new FormControl('', [
      Validators.required,
      Validators.minLength(1),
    ]),
    color: new FormControl('', [Validators.required, Validators.minLength(1)]),
    amount: new FormControl('', [
      Validators.required,
      Validators.min(1),
      Validators.minLength(1),
    ]),
    desktop: new FormControl('', [
      Validators.required,
      Validators.minLength(1),
    ]),
  });

  get stageOne(): boolean {
    return !this.createOrderForm.controls.toyInput.valid;
  }

  toyFindSimilarityList: IToy[] = [];
  get toyFindValid(): boolean {
    const inputValue: string =
      this.createOrderForm.controls.toyFind.value || '';

    if (inputValue.length > 0) {
      const unq = '{[]}';

      const simList: IToy[] = matchSortStringsToOneString(
        this.allToys.map((toy) => `${toy.partName}${unq}${toy.code}`),
        inputValue,
      ).map((simItem: ISimilarityItem) => {
        return {
          partName: simItem.str.split(unq)[0],
          code: simItem.str.split(unq)[1],
        };
      });

      let same: boolean = true;
      if (simList.length !== this.toyFindSimilarityList.length) {
        same = false;
      } else {
        this.toyFindSimilarityList.every((toy, index) => {
          if (
            simList[index].partName !== toy.partName ||
            simList[index].code !== toy.code
          ) {
            same = false;
            return false;
          }

          return true;
        });
      }

      if (!same) {
        this.toyFindSimilarityList = simList;
      }
    } else {
      this.toyFindSimilarityList = [];
    }

    return true;
  }

  get stageTwo(): boolean {
    return !this.createOrderForm.controls.color.valid;
  }

  get toyInputValid(): boolean {
    const inputValue: string = this.createOrderForm.controls.toyInput
      .value as string;

    const toyStrings: string[] = this.allToys.map(
      (toy) => `${toy.partName} - ${toy.code}`,
    );

    const valid = toyStrings.includes(inputValue);

    if (valid) {
      this.formCheck();
    }

    return valid;
  }

  get ColorStrings(): string[] {
    return this.colorsInfo.map((color) => {
      return `${color.code} - ${color.color}`;
    });
  }

  get colorValid(): boolean {
    const inputValue: string = this.createOrderForm.controls.color
      .value as string;

    const ColorStrings = this.colorsInfo.map((color) => {
      return `${color.code} - ${color.color}`;
    });

    const valid = ColorStrings.includes(inputValue);

    if (valid) {
      this.formCheck();
    }

    return valid;
  }

  get amountValid(): boolean {
    const valid = !(
      this.createOrderForm.controls.amount.invalid &&
      this.createOrderForm.controls.amount.touched
    );

    if (valid) {
      this.formCheck();
    }

    return valid;
  }

  formCheck(): void {
    if (
      this.createOrderForm.controls.toyInput.valid &&
      this.createOrderForm.controls.color.valid &&
      this.createOrderForm.controls.amount.valid
    ) {
      this.telegram.MainButton.setText('Добавить в корзину');
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
    const colorSplitted = (
      _this.createOrderForm.controls.color.value as string
    ).split(' - ')[1];

    const toySplitted = (
      _this.createOrderForm.controls.toyInput.value as string
    ).split(' - ');

    const toyId: number = _this.allToys.filter((toy) => {
      if (toy.partName === toySplitted[0] && toy.code === toySplitted[1]) {
        return true;
      }
      return false;
    })[0]?.id;

    if (toyId === undefined) {
      _this.telegram.showPopup({
        title: 'Ошибка!',
        message: `Произошла ошибка при попытке узнать id игрушки!\nПопробуйте снова создать заказ.`,
        buttons: [
          {
            type: 'ok',
            text: 'Ок',
          },
        ],
      });
      _this.telegram.MainButton.hide();
      window.location.reload();
    }

    const body: IApiChangeInCart = {
      id: toyId,
      colorCode: colorSplitted,
      amount:
        Number.parseInt(
          _this.createOrderForm.controls.amount.value as string,
        ) || 1,
    };

    const result = await _this.api.changeAmountInCart(body);

    if (result) {
      _this.telegram.showPopup(
        {
          title: 'Успех!',
          message: `Заказ успешно добавлен в корзину.`,
          buttons: [
            {
              id: '64',
              // type: 'ok',
              text: 'Перейти в корзину',
            },
            {
              id: '0',
              // type: 'ok',
              text: 'Создать новый заказ',
            },
          ],
        },
        async (btnId: string): Promise<void> => {
          _this.telegram.MainButton.hide();
          if (btnId === '64') {
            await _this.router.navigateByUrl('/cart');
          }
          window.location.reload();
        },
      );
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
