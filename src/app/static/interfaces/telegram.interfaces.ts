export interface TgButton {
  show: () => void;
  hide: () => void;
  setText: (text: string) => void;
  onClick: (callback: Function) => void;
  offClick: (callback: Function) => void;
  showProgress: (leaveActive: boolean) => void;
  hideProgress: () => void;
}

// export interface TgPopup {
//   showPopup: (tgPopupParams: TgPopupParams, callback: Function) => void;
// }

export interface TgPopupParams {
  title?: string;
  message: string;
  buttons?: TgPopupButton[];
}

export interface TgPopupButton {
  id?: string;
  type?: 'default' | 'ok' | 'close' | 'cancel' | 'destructive';
  text?: string;
}
