import { Component } from '@angular/core';
import { TelegramService } from '../../services/telegram/telegram.service';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService } from '../../services/api/api.service';
import { IApiAuth } from '../../static/interfaces/auth.interface';
import { JsonPipe } from '@angular/common';
import { CookieService } from 'ngx-cookie-service';
import { COOKIE_TOKEN } from '../../static/consts/token.const';
import { AppComponent } from '../../app.component';
import { IAppUser } from '../../static/types/app-user.type';
import { UserRole } from '../../static/enums/user.enums';
import { Router } from '@angular/router';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [ReactiveFormsModule, JsonPipe],
  templateUrl: './auth.component.html',
  styleUrl: './auth.component.scss',
})
export class AuthComponent {

  protected get user(): IAppUser {
    return AppComponent.appUser;
  }

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
    if (result.session_token) {
      const date = new Date();
      const value: number = Number.isNaN(result.expiresIn) 
                              ? Number.parseInt(result.expiresIn.slice(0, -1)) 
                              : Number.parseInt(result.expiresIn);
      switch (true) {
        case result.expiresIn.includes('y'): {
          date.setFullYear(date.getFullYear() + value);
          break;
        }
        case result.expiresIn.includes('m'): {
          date.setMonth(date.getMonth() + value);
          break;
        }
        case result.expiresIn.includes('d'): {
          date.setDate(date.getDate() + value);
          break;
        }
        case result.expiresIn.includes('h'): {
          date.setHours(date.getHours() + value);
          break;
        }
        case result.expiresIn.includes('s') || !Number.isNaN(result.expiresIn): {
          date.setSeconds(date.getSeconds() + value);
          break;
        }
      }
      
      _this.cookieService.set(COOKIE_TOKEN, result.session_token, date);
      _this.telegram.MainButton.hide();
      // const user = await AppComponent.updateUser();
      // if (user?.logged) {
      //   if (user.role === UserRole.Admin) {
      //     await _this.router.navigateByUrl('/admin');
      //   } else {
      //     await _this.router.navigateByUrl('/list');
      //   }
      // } else {
      //   await _this.router.navigateByUrl('/');
      // }
      window.location.reload();
    }

    _this.telegram.MainButton.offClick(_this.onSubmit);
    _this.telegram.MainButton.hideProgress();

    _this.onSubmitting = false;
  }

  constructor(
    private readonly telegram: TelegramService,
    private readonly api: ApiService,
    private readonly cookieService: CookieService,
    private readonly router: Router,
  ) {
    AuthComponent.instance = this;
  }
}
