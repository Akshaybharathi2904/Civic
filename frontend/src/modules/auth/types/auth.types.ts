import { User } from '../../../shared/types';

export interface LoginCredentials {
  email: string;
  password?: string;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password?: string;
  role?: User['role'];
  department?: string;
  ward?: string;
  city?: string;
  phone?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}
