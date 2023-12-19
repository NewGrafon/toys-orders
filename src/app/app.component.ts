import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Event, NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { HeaderComponent } from './pages/header/header.component';
import { UserRole } from './static/enums/user.enums';

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
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  private _appUser: IAppUser;

  public get appUser(): IAppUser {
    return this._appUser;
  }

  private static routeChangeCount: number = 0;

  static get RouteChangeCount(): number {
    return AppComponent.routeChangeCount;
  }

  AuthUrls = (): string[] => ['/profile'].concat(this.AdminAuthUrls);
  AdminAuthUrls: string[] = ['/admin'];

  private static cbAfterUpdateUser: any[] = [];

  public static WaitForUpdateUser(cb?: (url: string) => void) {
    AppComponent.cbAfterUpdateUser.push(cb);
  }

  public static navigationEventFinished: boolean = false;

  constructor(private router: Router) {

    router.events.subscribe(async (event: Event) => {

      if (event instanceof NavigationEnd) {

        AppComponent.navigationEventFinished = false;

        // consts response = await fetch('/api/get_account_info');
        // consts user = await response.json();
        // if (response.ok && user.error !== undefined) {
        //   UpdateUser({
        //     firstname: null,
        //     lastname: null,
        //     email: null,
        //     phone: null,
        //     accountType: 0,
        //     created: null,
        //   }, false);
        // } else {
        //   UpdateUser(user, true);
        // }

        for (const cb of AppComponent.cbAfterUpdateUser) {
          const urlTree = this.router.parseUrl(event.url);
          const urlWithoutParams = urlTree.root.children['primary'].segments.map(it => it.path).join('/');
          cb(urlWithoutParams);
        }
        AppComponent.cbAfterUpdateUser = [];

        // let notAllowed: boolean = false;
        // if (isLogged && ['/login', '/registration'].includes(event.url)) {
        //   PopupSystemComponent.SendMessage('Пользователь уже авторизован.');
        //   notAllowed = true;
        // }
        //
        // if (!isLogged && this.AuthUrls().includes(event.url)) {
        //   PopupSystemComponent.SendMessage('Пользователь не авторизован.');
        //   notAllowed = true;
        // }

        // if (userInfo.accountType < 1 && this.AdminAuthUrls.includes(event.url)) {
        //   PopupSystemComponent.SendMessage('Недостаточно прав доступа.');
        //   notAllowed = true;
        // }
        //
        // if (notAllowed) {
        //   await this.router.navigateByUrl('/');
        // }

        AppComponent.routeChangeCount++;

        AppComponent.navigationEventFinished = true;
      }

    });

  }

  ngOnInit() {
    //
  }
}
