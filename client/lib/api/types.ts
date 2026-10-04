export interface User {
    id: string;
    email: string;
    name: string;
    isEmailVerified: boolean;
    lastLoginAt: string;
    createdAt: string;
    updatedAt: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  name?: string;
}


export interface AuthResponse {
  user: User;
  token: string;
}

export interface ApiSuccessResponse<T> {
  status: 'success';
  data: T;
}

export interface ApiErrorData {
  status: 'error';
  message: string;
  code?: string;
}