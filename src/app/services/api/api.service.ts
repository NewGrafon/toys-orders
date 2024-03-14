import { Injectable } from '@angular/core';
import ky from 'ky';
import {
  type IApiAuth,
  type IApiAuthResponse,
} from '../../static/interfaces/auth.interface';
import { CookieService } from 'ngx-cookie-service';
import { COOKIE_TOKEN } from '../../static/consts/token.const';
import { TelegramService } from '../telegram/telegram.service';
import { IAppUser } from '../../static/types/app-user.type';
import {
  IApiCreateUser,
  IApiEditUser,
} from '../../static/interfaces/create-user.interfaces';
import {
  IApiOrdersByTimestamp,
  IEditOrderByDeliver,
  IOrder,
} from '../../static/interfaces/order.interfaces';
import { Router } from '@angular/router';
import { IApiCart, ICartToy } from '../../static/interfaces/cart.interfaces';
import {
  IApiCreateToyResponse,
  IApiToyResponse,
  IToy,
} from '../../static/interfaces/toy.interfaces';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
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
          if (body.statusCode >= 400 && body.statusCode < 500) {
            console.error(_input.url);
            console.error(body.message);

            if (body.statusCode !== 401 && !_input.url.includes('users/me')) {
              console.error(_input.url);
              this.tg.showPopup({
                title: 'Ошибка',
                message: body.message as string,
                buttons: [
                  {
                    type: 'ok',
                    text: 'Ок',
                  },
                ],
              });
              await this.router.navigateByUrl('/');
              window.location.reload();
            }
          }
        },
      ],
    },
  });

  constructor(
    private readonly cookieService: CookieService,
    private readonly tg: TelegramService,
    private readonly router: Router,
  ) {}

  public async auth(body: IApiAuth): Promise<IApiAuthResponse> {
    let result: IApiAuthResponse;
    try {
      result = await this.api
        .post('auth/login', {
          json: body,
        })
        .json();
      console.log(result);

      if (result?.session_token === undefined) {
        result.session_token = null;
      }
      return result;
    } catch (e) {
      console.error(e);
      result = {
        session_token: null,
        expiresIn: '0',
      };
    }

    return result;
  }

  public async userInfo(): Promise<IAppUser> {
    let result: IAppUser;

    try {
      result = await this.api.get('users/me').json();
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
      result = (await this.api.get('users/get_all').json()) || [];
    } catch (e) {
      console.error(e);
      result = [];
    }

    return result;
  }

  public async createUser(body: IApiCreateUser): Promise<boolean> {
    let result: boolean;

    try {
      result = await this.api
        .post('users/create', {
          json: body,
        })
        .json();
    } catch (e) {
      console.error(e);
      result = false;
    }

    return result;
  }

  public async editUser(userId: number, body: IApiEditUser): Promise<boolean> {
    let result: boolean;

    try {
      console.log(`users/edit/${userId}`);

      result = await this.api
        .patch(`users/edit/${userId}`, {
          json: body,
        })
        .json();
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

  public async changeAmountInCart(cartToy: ICartToy): Promise<IAppUser> {
    let result: IAppUser;

    try {
      result = await this.api
        .post(`orders/change_in_cart`, {
          json: cartToy,
        })
        .json();
    } catch (e) {
      console.error(e);
      result = undefined;
    }

    return result;
  }

  public async removeFromCart(cartToy: ICartToy): Promise<IAppUser> {
    let result: IAppUser;

    try {
      result = await this.api
        .delete(`orders/remove_from_cart`, {
          json: cartToy,
        })
        .json();
    } catch (e) {
      console.error(e);
      result = undefined;
    }

    return result;
  }

  public async getToyById(
    id: number | string,
  ): Promise<IApiToyResponse | undefined> {
    let result: IApiToyResponse | undefined;

    try {
      result = await this.api.get(`toys/${id}`).json();
    } catch (e) {
      console.error(e);
      result = undefined;
    }

    return result;
  }

  public async getAllOrders(): Promise<IApiOrdersByTimestamp[]> {
    let result: IApiOrdersByTimestamp[];

    try {
      result = await this.api.get('orders/get_all').json();
    } catch (e) {
      console.error(e);
      result = [];
    }

    return result;
  }

  public async getOrdersByTimestamp(
    timestamp: number | string,
  ): Promise<IOrder[]> {
    let result: IOrder[];

    try {
      result = await this.api
        .get(`orders/get_by_timestamp/${timestamp}`)
        .json();
    } catch (e) {
      console.error(e);
      result = [];
    }

    return result;
  }

  public async confirmCart(cart: IApiCart): Promise<IOrder[]> {
    let result: IOrder[];

    try {
      result = await this.api
        .post('orders/confirm_cart', {
          json: cart,
        })
        .json();
    } catch (e) {
      console.error(e);
      result = [];
    }

    return result;
  }

  public async takeOrders(cartTimestamp: string): Promise<boolean> {
    let result: boolean;

    try {
      result = await this.api.patch(`orders/take/${cartTimestamp}`).json();
    } catch (e) {
      console.error(e);
      result = false;
    }

    return result;
  }

  public async closeOrders(
    cartTimestamp: string,
    isFinishedNotCancel: boolean,
    editedOrders: IEditOrderByDeliver[],
  ): Promise<boolean> {
    let result: boolean;

    try {
      result = await this.api
        .patch(`orders/close/${cartTimestamp}/${isFinishedNotCancel}`, {
          json: {
            editedOrders,
          },
        })
        .json();
    } catch (e) {
      console.error(e);
      result = false;
    }

    return result;
  }

  public async cancelOrders(cartTimestamp: string): Promise<boolean> {
    let result: boolean;

    try {
      result = await this.api.delete(`orders/cancel/${cartTimestamp}`).json();
    } catch (e) {
      console.error(e);
      result = false;
    }

    return result;
  }

  public async getColorsInfo(): Promise<object> {
    let result: object;

    try {
      result = await this.api.get(`orders/colors_info`).json();
    } catch (e) {
      console.error(e);
      result = {};
    }

    return result;
  }

  public async createToy(
    toy: IToy,
  ): Promise<IApiCreateToyResponse | undefined> {
    let result: IApiCreateToyResponse | undefined;

    try {
      result = await this.api
        .post('toys/create', {
          json: toy,
        })
        .json();
    } catch (e) {
      console.error(e);
      result = undefined;
    }

    return result;
  }

  public async deleteToy(toyId: number): Promise<boolean | undefined> {
    let result: boolean | undefined;

    try {
      result = await this.api.delete(`toys/${toyId}`).json();
    } catch (e) {
      console.error(e);
      result = undefined;
    }

    return result;
  }

  public async getAllToys(): Promise<IApiToyResponse[]> {
    let result: IApiToyResponse[];

    try {
      result = await this.api.get(`toys/get_all`).json();
    } catch (e) {
      console.error(e);
      result = [];
    }

    return result;
  }
}
