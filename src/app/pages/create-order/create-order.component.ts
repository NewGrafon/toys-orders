import { Component } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { IApiCreateUser } from '../../static/interfaces/create-user.interfaces';
import { TelegramService } from '../../services/telegram/telegram.service';
import { ApiService } from '../../services/api/api.service';
import { CookieService } from 'ngx-cookie-service';
import { IApiCreateOrder } from '../../static/interfaces/order.interface';
import { ColorInfo } from '../../static/interfaces/colors-info.interface'
import { AppComponent } from "../../app.component";
import { similarity } from '../../static/functions/string-similarity.function';
import { CommonModule } from '@angular/common';
import { IColorSimilarityItem } from '../../static/interfaces/create-order.interfaces';

@Component({
  selector: 'app-create-order',
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    RouterLink,
    CommonModule,
  ],
  templateUrl: './create-order.component.html',
  styleUrl: './create-order.component.scss',
})
export class CreateOrderComponent {
  private static instance: CreateOrderComponent;

  get colorsInfo(): ColorInfo[] {
    return AppComponent.colorsInfo;
  }

  createOrderForm = new FormGroup({
    // fullText: new FormControl('', [Validators.required, Validators.minLength(1)]),
    partName: new FormControl('', [Validators.required, Validators.minLength(1)]),
    code: new FormControl('', [Validators.required, Validators.minLength(1)]),
    color: new FormControl('', [Validators.required, Validators.minLength(1)]),
    amount: new FormControl('', [Validators.required, Validators.min(1), Validators.minLength(1)]),
    desktop: new FormControl('', [Validators.required, Validators.minLength(1)]),
  });

  // get fullTextValid(): boolean {
  //   const valid = !(this.createOrderForm.controls.fullText.invalid && this.createOrderForm.controls.fullText.touched);

  //   if (valid) {
  //     this.formCheck();
  //   }

  //   return valid;
  // }

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

  private colorSimilarityList: IColorSimilarityItem[] = [];
  get ColorSimilarityList(): IColorSimilarityItem[] {
    return this.colorSimilarityList || [];
  }

  get ColorStrings(): string[] {
    return this.colorsInfo.map((color) => {
      return `${color.code} - ${color.color}`;
    });
  }

  get colorValid(): boolean {
    let valid = !(this.createOrderForm.controls.color.invalid && this.createOrderForm.controls.color.touched);
    const inputValue: string = this.createOrderForm.controls.color.value as string;

    if (this.ColorStrings.includes(inputValue)) {
      valid = true;
      this.colorSimilarityList = [];
    } else if (inputValue.length > 0) {
      const colorStrings: string[] = this.ColorStrings;
      
      valid = colorStrings.includes(inputValue);

      if (!valid) {
        const localColorSimilarityList: any = {};

        colorStrings.forEach((color) => {
          const code = color.split(' - ')[0];
          const str: string = `${code} - ${color}`;
          const longer: string = inputValue.length >= str.length ? inputValue : str;
          const shorter: string = longer === inputValue ? str : inputValue;
          localColorSimilarityList['sim-' + code] = similarity(longer, shorter);
        });        

        for (let i = 1; i <= Object.keys(localColorSimilarityList).length; i++) {
          const code = i;
          const similarity = localColorSimilarityList['sim-' + i];
          const obj: IColorSimilarityItem = {
            code,
            similarity,
          };
          localColorSimilarityList['sim-' + i] = obj;
        }

        const sorted: IColorSimilarityItem[] = (Object.values(localColorSimilarityList) as IColorSimilarityItem[])
          .sort(
            function (a: IColorSimilarityItem, b: IColorSimilarityItem) {
              if (a.similarity < b.similarity) {
                return -1;
              }
              if (a.similarity > b.similarity) {
                return 1;
              }
              return 0;
            }
          )
          .reverse()
          .filter((obj: any) => obj.similarity > 0)
          // .slice(0, 5)
          .sort(
            function (a: IColorSimilarityItem, b: IColorSimilarityItem) {
              if (a.code < b.code) {
                return -1;
              }
              if (a.code > b.code) {
                return 1;
              }
              return 0;
            }
          );

          const inputCode: number = Number(inputValue);
          if (!Number.isNaN(inputValue) && inputCode >= 1 && inputCode <= this.colorsInfo.length) {
            let codeIndex: number = -1;
            sorted.every((color: IColorSimilarityItem, index) => {
              if (inputCode === color.code) {
                codeIndex = index;
                return false;
              }

              return true;
            });
            if (codeIndex !== -1) {
              const firstColor = {
                code: sorted[0].code,
                similarity: sorted[0].similarity,
              }
              sorted[0] = sorted[codeIndex];
              sorted[codeIndex] = firstColor;
            }
          }
          
          let same: boolean = true;

          sorted.every((color: IColorSimilarityItem, index: number) => {           
            const currentColor = this.colorSimilarityList[index];

            if (color.similarity !== currentColor?.similarity || color.code !== currentColor?.code) {
              same = false;
              return false;
            }

            return true;
          });

          if (!same) {
            this.colorSimilarityList = sorted;
          }
      }
    } else {
      this.colorSimilarityList = [];
    }

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
      // this.createOrderForm.controls.fullText.valid
      this.createOrderForm.controls.partName.valid &&
      this.createOrderForm.controls.code.valid &&
      this.createOrderForm.controls.color.valid &&
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
    const colorSplitted = (_this.createOrderForm.controls.color.value as string).split(' - ');
    const body: IApiCreateOrder = {
      // fullText: _this.createOrderForm.controls.fullText.value as string,
      partName: _this.createOrderForm.controls.partName.value as string,
      code: _this.createOrderForm.controls.code.value as string,
      colorCode: colorSplitted[0],
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
