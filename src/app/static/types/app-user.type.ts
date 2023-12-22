import { UserRole } from '../enums/user.enums';

export type IAppUser = {
  id?: number;
  firstname?: string;
  lastname?: string;
  role?: UserRole;
  deletedAt?: number | null;
  logged: boolean;
} | undefined;
