export interface IApiAuth {
  id: string;
  password: string;
}

export interface IApiAuthResponse {
  session_token: string | null;
  expiresIn: string;
}
