import {Component, Inject, OnInit} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import {TelegramService} from "./services/telegram.service";
import {HeaderComponent} from "./pages/header/header.component";

export const enum UserRole {
  Worker = "Сборщик",
  Deliver = "Доставщик",
  Admin = "Админ",
}

export type IAppUser = {
  id: number;
  firstname: string;
  lastname: string;
  role: UserRole;
  logged: boolean;
} | undefined;

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, HeaderComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  private _appUser: IAppUser;

  public get appUser(): IAppUser {
    return this._appUser;
  }
  constructor() {

  }

  ngOnInit() {
    //
  }
}
