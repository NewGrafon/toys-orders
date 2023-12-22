import { Inject, Injectable } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { TgButton, TgPopupParams } from '../../static/interfaces/telegram.interfaces';

@Injectable({
  providedIn: 'root',
})
export class TelegramService {
  private readonly window;
  tg;

  constructor(@Inject(DOCUMENT) private readonly _document: Document) {
    this.window = this._document.defaultView;
    // @ts-expect-error
    this.tg = this.window.Telegram.WebApp;
    // @ts-ignore
    this.tg.expand();
  }

  get MainButton(): TgButton {
    return this.tg.MainButton;
  }

  showPopup(tgPopupParams: TgPopupParams, cb?: Function): void {
    return this.tg.showPopup(tgPopupParams, cb);
  }
}
