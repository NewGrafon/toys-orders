import { Injectable } from '@angular/core';
import ky from 'ky';
import { type IApiAuth, type IApiAuthResponse } from '../../static/interfaces/auth.interface';
import { CookieService } from 'ngx-cookie-service';
import { COOKIE_TOKEN } from '../../static/consts/token.const';
import { TelegramService } from '../telegram/telegram.service';
import { IAppUser } from '../../static/types/app-user.type';
import { IApiCreateUser } from '../../static/interfaces/create-user.interfaces';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  constructor(
    private readonly cookieService: CookieService,
    private readonly tg: TelegramService,
  ) {
  }

  private readonly api = ky.create({
    prefixUrl: '/api/',
    headers: {
      authorization: this.cookieService.get(COOKIE_TOKEN),
    },
    retry: 0,
    hooks: {
      afterResponse: [
        async (_input, _options, res) => {
          const body = await res.json();
          if (body.statusCode >= 400 && body.statusCode < 500 && !_input.url.includes('users/me')) {
            this.tg.showPopup({
              title: 'Ошибка',
              message: body.message as string,
              buttons: [{
                type: 'ok',
                text: 'Ок',
              }],
            });
          }
        },
      ],
    },
  });

  public async auth(body: IApiAuth): Promise<IApiAuthResponse> {
    let result: IApiAuthResponse;
    try {
      result = await this.api
        .post('auth/login', {
          json: body,
        }).json();
      if (result?.session_token === undefined) {
        result.session_token = null;
      }
      return result;
    } catch (e) {
      console.error(e);
      result = {
        session_token: null,
      };
    }

    return result;
  }

  public async userInfo(): Promise<IAppUser> {
    let result: IAppUser;

    try {
      result = await this.api
        .get('users/me').json();
      if (!result?.id) {
        result = undefined;
      }
    } catch (e) {
      console.error(e);
      result = undefined;
    }

    return result;
  }

  public async getAllUsers(): Promise<IAppUser[]> {
    let result: IAppUser[];

    try {
      result = await this.api.get('users/get_all').json() || [];
    } catch (e) {
      console.error(e);
      result = [];
    }

    return result;
  }

  public async createUser(body: IApiCreateUser): Promise<boolean> {
    let result: boolean = false;

    try {
      result = await this.api.post('users/create', {
        json: body,
      }).json();
    } catch (e) {
      console.error(e);
      result = false;
    }

    return result;
  }

  public async deleteUser(id: number): Promise<boolean> {
    let result: boolean;

    try {
      result = await this.api.delete(`users/${id}`).json();
    } catch (e) {
      console.error(e);
      result = false;
    }

    return result;
  }
}
