import { Injectable } from '@angular/core';
import ky from 'ky';
import { type IApiAuth, type IApiAuthResponse } from '../../static/interfaces/auth.interface';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private readonly api = ky.create({
    prefixUrl: '',
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
