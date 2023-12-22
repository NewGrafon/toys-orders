import { Component, OnInit } from '@angular/core';
import { IAppUser } from '../../static/types/app-user.type';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../services/api/api.service';
import { AppComponent } from '../../app.component';
import { UserRole } from '../../static/enums/user.enums';
import { TelegramService } from '../../services/telegram/telegram.service';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [
    RouterLink,
  ],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.scss',
})
export class AdminComponent implements OnInit {
  users: IAppUser[] | undefined;

  deletingUser: boolean = false;
  async deleteUser(id: number): Promise<void> {
    if (this.deletingUser) {
      return;
    }
    this.deletingUser = true;

    this.telegram.showPopup({
        title: 'Подтверждение',
        message: 'Вы уверены что хотите удалить аккаунт?',
        buttons: [
          {
            id: '64',
            type: 'ok',
          },
          {
            id: '0',
            type: 'cancel',
          },
        ],
      },
      async (btnId: string) => {
        if (btnId === '64') {
          const result = await this.api.deleteUser(id);
          if (result) {
            this.telegram.showPopup({
              title: 'Успех!',
              message: 'Пользователь успешно удален',
            });
            window.location.reload();
          }
        }
      });

    this.deletingUser = false;
  }

  constructor(
    private readonly api: ApiService,
    private readonly telegram: TelegramService,
  ) {

  }

  async ngOnInit() {
    const interval = setInterval(async () => {
      if (AppComponent.appUser !== undefined) {
        clearInterval(interval);
        if (AppComponent.appUser.role !== UserRole.Admin) {
          window.location.reload();
        }

        this.users = (await this.api.getAllUsers())?.filter((user: IAppUser) => user?.id !== AppComponent.appUser?.id);
        console.log(this.users);
      }
    }, 16.67);
  }
}
