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
import { CookieService } from 'ngx-cookie-service';
import { IApiCreateUser } from '../../static/interfaces/create-user.interfaces';
import { UserRole } from '../../static/enums/user.enums';

@Component({
  selector: 'app-create-user',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, RouterLink],
  templateUrl: './create-user.component.html',
  styleUrl: './create-user.component.scss',
})
export class CreateUserComponent {
  private static instance: CreateUserComponent;

  createUserForm = new FormGroup({
    firstname: new FormControl('', [
      Validators.required,
      Validators.minLength(1),
    ]),
    lastname: new FormControl('', [
      Validators.required,
      Validators.minLength(1),
    ]),
    password: new FormControl('', [
      Validators.required,
      Validators.minLength(1),
    ]),
    role: new FormControl('', [Validators.required]),
  });

  get firstnameValid(): boolean {
    const valid = !(
      this.createUserForm.controls.firstname.invalid &&
      this.createUserForm.controls.firstname.touched
    );

    if (valid) {
      this.formCheck();
    }

    return valid;
  }

  get lastnameValid(): boolean {
    const valid = !(
      this.createUserForm.controls.lastname.invalid &&
      this.createUserForm.controls.lastname.touched
    );

    if (valid) {
      this.formCheck();
    }

    return valid;
  }

  get passwordValid(): boolean {
    const valid = !(
      this.createUserForm.controls.password.invalid &&
      this.createUserForm.controls.password.touched
    );

    if (valid) {
      this.formCheck();
    }

    return valid;
  }

  get roleValid(): boolean {
    const valid =
      this.createUserForm.controls.role.value !== '' ||
      this.createUserForm.controls.role.untouched;

    if (valid) {
      this.formCheck();
    }

    return valid;
  }

  formCheck(): void {
    if (
      this.createUserForm.controls.firstname.valid &&
      this.createUserForm.controls.lastname.valid &&
      this.createUserForm.controls.password.valid &&
      this.createUserForm.controls.role.value !== ''
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
    const _this = CreateUserComponent.instance;

    if (_this.onSubmitting) {
      return;
    }
    _this.onSubmitting = true;

    _this.telegram.MainButton.showProgress(false);
    const body: IApiCreateUser = {
      firstname: _this.createUserForm.controls.firstname.value as string,
      lastname: _this.createUserForm.controls.lastname.value as string,
      password: _this.createUserForm.controls.password.value as string,
      role: _this.createUserForm.controls.role.value as UserRole,
    };

    const result = await _this.api.createUser(body);
    if (result) {
      _this.telegram.showPopup({
        title: 'Успех!',
        message: `Пользователь успешно создан. Сообщите работнику пароль, после закрытия этого окна вы больше не сможете просмотреть его. Пароль: "${body.password}"`,
        buttons: [
          {
            type: 'ok',
            text: 'Ок',
          },
        ],
      });
      _this.telegram.MainButton.hide();
      await _this.router.navigateByUrl('/admin');
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
    private readonly cookieService: CookieService,
  ) {
    CreateUserComponent.instance = this;
  }

  protected readonly UserRole = UserRole;
}
