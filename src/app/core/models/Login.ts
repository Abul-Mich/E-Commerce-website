import { IUserResponse } from './User';

export interface ILoginResponse {
  token: string;
  user: IUserResponse;
}

export interface ILoginRequest {
  email: string;
  password: string;
}
