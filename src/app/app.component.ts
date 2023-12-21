import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Event, NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { HeaderComponent } from './pages/header/header.component';
import { ApiService } from './services/api/api.service';
import { IAppUser } from './static/types/app-user.type';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, HeaderComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  protected _appUser: IAppUser;

  protected static instance: AppComponent;

  public static get Instance() {
    return this.instance;
  }

  public static get appUser(): IAppUser {
    return this.instance._appUser;
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

  constructor(
    private readonly router: Router,
    private readonly api: ApiService,
  ) {

    AppComponent.instance = this;

    router.events.subscribe(async (event: Event) => {

      if (event instanceof NavigationEnd) {

        AppComponent.navigationEventFinished = false;

        let user: IAppUser = await this.api.userInfo();
        if (user) {
          user.logged = true;
        } else {
          user = {
            firstname: undefined,
            id: undefined,
            lastname: undefined,
            logged: false,
            role: undefined
          };
        }

        this._appUser = user;

        console.log(AppComponent.cbAfterUpdateUser);
        for (const cb of AppComponent.cbAfterUpdateUser) {
          const urlTree = this.router.parseUrl(event.url);
          const urlWithoutParams = urlTree.root.children['primary']?.segments.map(it => it.path).join('/') || '/';
          await cb(urlWithoutParams);
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

  }
}
