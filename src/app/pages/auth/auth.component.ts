import { Component, OnInit } from '@angular/core';
import { TelegramService } from '../../services/telegram/telegram.service';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService } from '../../services/api/api.service';
import { IApiAuth } from '../../static/interfaces/auth.interface';
import { JsonPipe } from '@angular/common';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [ReactiveFormsModule, JsonPipe],
  templateUrl: './auth.component.html',
  styleUrl: './auth.component.scss',
})
export class AuthComponent implements OnInit {

  private static instance: AuthComponent;
  get Instance() {
    return AuthComponent.instance;
  }

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

  onSubmitting: boolean = false;
  async onSubmit() {
    const _this = AuthComponent.instance;

    if (_this.onSubmitting) {
      return;
    }
    _this.onSubmitting = true;

    _this.telegram.MainButton.showProgress(false);
    const body: IApiAuth = {
      id: _this.authForm.controls.id.value as string,
      password: _this.authForm.controls.password.value as string,
    };
    const result = await _this.api.auth(body);

    _this.telegram.MainButton.hideProgress();

    _this.onSubmitting = false;
  }

  constructor(
    private readonly telegram: TelegramService,
    private readonly api: ApiService,
  ) {
  }

  ngOnInit() {
    AuthComponent.instance = this;
  }
}
