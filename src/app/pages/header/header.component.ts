import { Component } from '@angular/core';
import {AppComponent, IAppUser} from "../../app.component";

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  get user(): IAppUser {
    console.log(1)
    return this.appComponent.appUser;
  }
  constructor(private readonly appComponent: AppComponent) {}
}
