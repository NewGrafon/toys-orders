import { Component } from '@angular/core';
import { AppComponent, IAppUser } from '../../app.component';
import { Router } from '@angular/router';
import { JsonPipe } from '@angular/common';

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
    return this.appComponent.appUser;
  }

  constructor(
    private readonly appComponent: AppComponent,
    private readonly router: Router,
  ) {
    AppComponent.WaitForUpdateUser((url) => {
      this._currentUrl = url;
    });
  }
}
