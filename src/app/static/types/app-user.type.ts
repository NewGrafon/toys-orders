import { UserRole } from '../enums/user.enums';
import { ICartToy } from '../interfaces/cart.interfaces';

export type IAppUser =
  | {
      id?: number;
      firstname?: string;
      lastname?: string;
      role?: UserRole;
      cart?: ICartToy[];
      deletedAt?: number | null;
      logged: boolean;
    }
  | undefined;
