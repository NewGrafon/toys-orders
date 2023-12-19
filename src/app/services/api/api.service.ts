import { Injectable } from '@angular/core';
import ky from 'ky';
import { type IApiAuth, type IApiAuthResponse } from '../../static/interfaces/auth.interface';
import { CookieService } from 'ngx-cookie-service';
import { AuthComponent } from '../../pages/auth/auth.component';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  constructor(private readonly cookieService: CookieService) {
  }

  private readonly api = ky.create({
    prefixUrl: 'api.toys-orders.ru/',
    headers: {
      authorization: this.cookieService.get('access_token')
    },
    retry: 0,
    hooks: {
      afterResponse: [
        async (res) => {
          const body = await res.json();
          console.log(body);
        }
      ]
    }
  });

  public async auth(body: IApiAuth): Promise<IApiAuthResponse> {
    let result: IApiAuthResponse;
    try {
      result = await this.api
        .post('auth', {
          json: body,
        }).json();
    } catch (e) {
      console.error(e);
      result = {
        session_token: null,
      };
    }

    return result;
  }
}
