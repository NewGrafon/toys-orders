import {Component} from '@angular/core';
import {TelegramService} from "../../services/telegram.service";
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './auth.component.html',
  styleUrl: './auth.component.scss'
})
export class AuthComponent {

  authForm = new FormGroup({
    id: new FormControl('', [Validators.required, Validators.min(0)]),
    password: new FormControl('', Validators.required),
  })

  get idIsValid(): boolean {
    return !(this.authForm.controls.id.invalid && this.authForm.controls.id.touched);
  }

  get passwordIsValid(): boolean {
    return !(this.authForm.controls.password.invalid && this.authForm.controls.password.touched);
  }

  onSubmit() {

  }

  constructor(private telegram: TelegramService) {
    this.telegram?.MainButton?.show();
  }
}
