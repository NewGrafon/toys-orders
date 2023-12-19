import { Component } from '@angular/core';
import { TelegramService } from '../../services/telegram/telegram.service';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService } from '../../services/api/api.service';
import { IApiAuth } from '../../static/interfaces/auth.interface';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './auth.component.html',
  styleUrl: './auth.component.scss',
})
export class AuthComponent {

  authForm = new FormGroup({
    id: new FormControl('', [Validators.required, Validators.pattern(/^\d+$/), Validators.min(0)]),
    password: new FormControl('', Validators.required),
  });

  get idIsValid(): boolean {
    const valid: boolean = !(this.authForm.controls.id.invalid && this.authForm.controls.id.touched);

    if (valid) {
      this.formCheck();
    }

    return valid;
  }

  get passwordIsValid(): boolean {
    const valid: boolean = !(this.authForm.controls.password.invalid && this.authForm.controls.password.touched);

    if (valid) {
      this.formCheck();
    }

    return valid;
  }

  formCheck() {
    if (this.authForm.controls.id.valid && this.authForm.controls.password.valid) {
      this.telegram.MainButton.setText('Продолжить');
      this.telegram.MainButton.onClick(this.onSubmit);
      this.telegram.MainButton.show();
    } else {
      this.telegram.MainButton.offClick(this.onSubmit);
      this.telegram.MainButton.hide();
    }
  }

  async onSubmit() {
    this.telegram.MainButton.showProgress(false);

    const body: IApiAuth = {
      id: this.authForm.controls.id.value as string,
      password: this.authForm.controls.password.value as string,
    };

    const result = await this.api.auth(body);

    this.telegram.MainButton.hideProgress();
  }

  constructor(
    private readonly telegram: TelegramService,
    private readonly api: ApiService,
  ) {
  }
}
