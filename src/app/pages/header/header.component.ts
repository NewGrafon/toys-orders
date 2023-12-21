import { Component } from '@angular/core';
import { AppComponent } from '../../app.component';
import { NavigationEnd, Router, Event } from '@angular/router';
import { JsonPipe } from '@angular/common';
import { IAppUser } from '../../static/types/app-user.type';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    JsonPipe,
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent {
  private _currentUrl: string = '/';
  get currentUrl() {
    return this._currentUrl;
  }

  get user(): IAppUser {
    return AppComponent.appUser;
  }

  constructor(
    private readonly appComponent: AppComponent,
    private readonly router: Router,
  ) {
    router.events.subscribe((event: Event) => {
      if (event instanceof NavigationEnd) {
        AppComponent.WaitForUpdateUser((url) => {
          this._currentUrl = url;
        });
      }
    });
  }
}
