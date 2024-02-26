import { Component, OnInit } from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { TelegramService } from '../../services/telegram/telegram.service';
import { ApiService } from '../../services/api/api.service';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { IApiEditUser } from '../../static/interfaces/create-user.interfaces';

@Component({
  selector: 'app-edit-user',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, RouterLink],
  templateUrl: './edit-user.component.html',
  styleUrl: './edit-user.component.scss',
})
export class EditUserComponent implements OnInit {
  private static instance: EditUserComponent;

  id: number = -1;

  editUserForm = new FormGroup({
    password: new FormControl('', [
      Validators.required,
      Validators.minLength(1),
    ]),
  });

  get passwordValid(): boolean {
    const valid = !(
      this.editUserForm.controls.password.invalid &&
      this.editUserForm.controls.password.touched
    );

    if (valid) {
      this.formCheck();
    }

    return valid;
  }

  formCheck(): void {
    if (this.editUserForm.controls.password.valid) {
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
    const _this = EditUserComponent.instance;

    if (_this.onSubmitting) {
      return;
    }
    _this.onSubmitting = true;

    _this.telegram.MainButton.showProgress(false);
    const body: IApiEditUser = {
      password: _this.editUserForm.controls.password.value as string,
    };

    const result = await _this.api.editUser(_this.id, body);
    if (result) {
      _this.telegram.showPopup({
        title: 'Успех!',
        message: `Пароль успешно изменен. Сообщите работнику пароль, после закрытия этого окна вы больше не сможете просмотреть его. Пароль: "${body?.password}"`,
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
    private readonly activatedRoute: ActivatedRoute,
  ) {
    EditUserComponent.instance = this;
  }

  ngOnInit() {
    const id = Number(this.activatedRoute.snapshot.paramMap.get('id'));
    this.id = id;
  }
}
