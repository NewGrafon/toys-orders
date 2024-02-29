import { CommonModule } from '@angular/common';
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
import { IApiCreateToy } from '../../static/interfaces/toy.interfaces';

@Component({
  selector: 'app-create-toy',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, RouterLink, CommonModule],
  templateUrl: './create-toy.component.html',
  styleUrl: './create-toy.component.scss',
})
export class CreateToyComponent {
  private static instance: CreateToyComponent;

  createToyForm = new FormGroup({
    partName: new FormControl('', [
      Validators.required,
      Validators.minLength(1),
    ]),
    code: new FormControl('', [Validators.required, Validators.minLength(1)]),
  });

  get partNameValid(): boolean {
    const valid = !(
      this.createToyForm.controls.partName.invalid &&
      this.createToyForm.controls.partName.touched
    );

    if (valid) {
      this.formCheck();
    }

    return valid;
  }

  get codeValid(): boolean {
    const valid = !(
      this.createToyForm.controls.code.invalid &&
      this.createToyForm.controls.code.touched
    );

    if (valid) {
      this.formCheck();
    }

    return valid;
  }

  formCheck(): void {
    if (
      this.createToyForm.controls.partName.valid &&
      this.createToyForm.controls.code.valid
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
    const _this = CreateToyComponent.instance;

    if (_this.onSubmitting) {
      return;
    }
    _this.onSubmitting = true;

    _this.telegram.MainButton.showProgress(false);

    const body: IApiCreateToy = {
      partName: _this.createToyForm.controls.partName.value as string,
      code: _this.createToyForm.controls.code.value as string,
    };

    const result = await _this.api.createToy(body);

    if (result) {
      _this.telegram.showPopup({
        title: 'Успех!',
        message: `Новая деталь игрушки успешно создана.`,
        buttons: [
          {
            type: 'ok',
            text: 'Ок',
          },
        ],
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
    CreateToyComponent.instance = this;
  }
}
