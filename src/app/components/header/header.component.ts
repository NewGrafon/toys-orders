import { Component } from '@angular/core';
import { AppComponent } from '../../app.component';
import { Router, RouterLink } from '@angular/router';
import { CommonModule, JsonPipe } from '@angular/common';
import { IAppUser } from '../../static/types/app-user.type';
import { CookieService } from 'ngx-cookie-service';
import { UserRole } from '../../static/enums/user.enums';
import { TelegramService } from '../../services/telegram/telegram.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    JsonPipe,
    RouterLink,
    CommonModule,
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent {

  private static instance: HeaderComponent;

  opened: boolean = false;

  get url(): string {
    return window.location.pathname;
  }

  get user(): IAppUser {
    return AppComponent.appUser;
  }

  async logout(): Promise<void> {
    this.telegram.showPopup({
        title: 'Выход из аккаунта',
        message: `Вы уверены что хотите выйти из аккаунта?`,
        buttons: [
          {
            id: '64',
            type: 'ok',
            text: 'Да',
          },
          {
            id: '0',
            type: 'cancel',
            text: 'Нет',
          },
        ],
      },
      async (id: string) => {
        if (id === '64') {
          await AppComponent.Instance.logout();
        }
      });
  }

  switchMenu(): void {
    this.opened = !this.opened;
  }

  constructor(
    private readonly router: Router,
    private readonly cookieService: CookieService,
    private readonly telegram: TelegramService,
  ) {
    HeaderComponent.instance = this;
  }

  protected readonly UserRole = UserRole;
}
