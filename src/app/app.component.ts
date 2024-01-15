import {Component, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {Event, NavigationEnd, Router, RouterOutlet} from '@angular/router';
import {HeaderComponent} from './components/header/header.component';
import {ApiService} from './services/api/api.service';
import {IAppUser} from './static/types/app-user.type';
import {COOKIE_TOKEN} from './static/consts/token.const';
import {CookieService} from 'ngx-cookie-service';
import {UserRole} from './static/enums/user.enums';
import {ColorInfo} from "./static/interfaces/colors-info.interface";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, HeaderComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {

  protected _appUser: IAppUser;

  private _currentUrl: string = '';
  public static get currentUrl(): string {
    return AppComponent.Instance._currentUrl;
  }

  private _colorsInfo: ColorInfo[] = [];
  public static get colorsInfo(): ColorInfo[] {
    return AppComponent.Instance._colorsInfo;
  }

  protected static instance: AppComponent;

  public static get Instance() {
    return this.instance;
  }

  public static get appUser(): IAppUser {
    return this.instance._appUser;
  }

  public async logout(): Promise<void> {
    this.cookieService.delete(COOKIE_TOKEN);
    window.location.reload();
  }

  private static routeChangeCount: number = 0;

  static get RouteChangeCount(): number {
    return AppComponent.routeChangeCount;
  }

  AuthUrls = (): string[] => ['/create', '/list', '/current'].concat(this.AdminAuthUrls);
  AdminAuthUrls: string[] = ['/admin'];

  private static cbAfterUpdateUser: any[] = [];

  public static WaitForUpdateUser(cb?: (url: string) => void) {
    AppComponent.cbAfterUpdateUser.push(cb);
  }

  public static navigationEventFinished: boolean = false;

  public static async updateUser(): Promise<IAppUser> {
    let user: IAppUser = await AppComponent.Instance.api.userInfo();
    if (user) {
      user.logged = true;
    } else {
      user = {
        firstname: undefined,
        id: undefined,
        lastname: undefined,
        logged: false,
        role: undefined,
      };
    }

    AppComponent.Instance._appUser = user;

    return user;
  }

  constructor(
    private readonly router: Router,
    private readonly api: ApiService,
    private readonly cookieService: CookieService,
  ) {

    AppComponent.instance = this;

    router.events.subscribe(async (event: Event) => {

      if (event instanceof NavigationEnd) {

        AppComponent.navigationEventFinished = false;

        const user: IAppUser = await AppComponent.updateUser();

        let url: string = window.location.pathname;
        console.log(user);
        
        if (user !== undefined) {
          if (!user.logged && this.AuthUrls().includes(url)) {
            console.log(`not logged`);
            url = '/';
            await this.router.navigateByUrl('/');
          }

          if (user.role !== UserRole.Admin && this.AdminAuthUrls.includes(url)) {
            console.log(`not admin in admin-zone`);
            url = '/list';
            await this.router.navigateByUrl('/list');
          }

          if (user.role !== UserRole.Deliver && url === 'current') {
            console.log(`not deliver in deliver-zone`);
            url = '/list';
            await this.router.navigateByUrl('/list');
          }

          if (user.role !== UserRole.Worker && url === 'create') {
            console.log(`not worker in worker-zone`);
            url = '/list';
            await this.router.navigateByUrl('/list');
          }

          if (user.logged && url === '/') {
            console.log(`logged in auth-zone`);
            if (user.role === UserRole.Admin) {
              url = '/admin';
              await this.router.navigateByUrl('/admin');
            } else {
              url = '/list';
              await this.router.navigateByUrl('/list');
            }
          }
        } else {
          console.log(`user undefined`);
          url = '/';
          await this.router.navigateByUrl('/');
        }

        AppComponent.Instance._currentUrl = url;
        console.log(`url: ${url}`);
        for (const cb of AppComponent.cbAfterUpdateUser) {
          await cb(url);
        }
        AppComponent.cbAfterUpdateUser = [];

        AppComponent.routeChangeCount++;

        AppComponent.navigationEventFinished = true;
      }

    });

  }

  async ngOnInit() {
    const colorsJson = (await this.api.getColorsInfo()) || [];

    const keys = Object.keys(colorsJson);
    const values = Object.values(colorsJson);

    for (let i = 0; i < keys.length; i++) {
      AppComponent.Instance._colorsInfo[i] = {
        code: values[i],
        color: keys[i],
      }
    }

    console.log(AppComponent.Instance._colorsInfo);
  }
}
