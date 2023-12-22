import { UserRole } from '../enums/user.enums';

export interface IApiCreateUser {
  firstname: string;
  lastname: string;
  password: string;
  role: UserRole;
}
