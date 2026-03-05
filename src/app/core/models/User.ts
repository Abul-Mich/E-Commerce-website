export interface IUserResponse {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  username: string;
  role: string;
  dateOfBirth: string;
  imageUrl: string;
  createdAt: string;
  upstringdAt: string;
}

export interface IUserRequest {
  email: string;
  firstName: string;
  lastName: string;
  username: string;
  password: string;
  dateOfBirth?: string;
  imageUrl?: string;
}
