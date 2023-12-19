import { Inject, Injectable } from '@angular/core';
import { DOCUMENT } from '@angular/common';

interface TgButton {
  show: () => void;
  hide: () => void;
  setText: (text: string) => void;
  onClick: (callback: Function) => void;
  offClick: (callback: Function) => void;
  showProgress: (leaveActive: boolean) => void;
  hideProgress: () => void;
}

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
  }

  get MainButton(): TgButton {
    return this.tg.MainButton;
  }
}
