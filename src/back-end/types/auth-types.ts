// src/back-end/types/auth-types.ts
export interface SignupRequest {
  name: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface User {
  id: string;
  name: string;
  email: string;

}
export interface UserUpdateData {
  name?: string;
  email?: string;
  password?: string;
  lastLoginAt?: Date;
}
