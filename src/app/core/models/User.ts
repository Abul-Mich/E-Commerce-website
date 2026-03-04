export interface IUserResponse {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  username: string;
  role: string;
  dateofBirth: Date;
  imageUrl: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserRequest {
  email: string;
  firstName: string;
  lastName: string;
  username: string;
  password: string;
  dateofBirth?: Date;
  imageUrl?: string;
}
