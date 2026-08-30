import api from './client';
import { User } from '../types';

export interface LoginPayload { email: string; password: string; }
export interface RegisterPayload { email: string; username: string; password: string; full_name?: string; }
export interface AuthResponse { access_token: string; token_type: string; user: User; }

export const authApi = {
  login: async (data: LoginPayload): Promise<AuthResponse> => {
    const res = await api.post('/auth/login', data);
    return res.data;
  },
  register: async (data: RegisterPayload): Promise<AuthResponse> => {
    const res = await api.post('/auth/register', data);
    return res.data;
  },
  me: async (): Promise<User> => {
    const res = await api.get('/auth/me');
    return res.data;
  },
  updateProfile: async (data: { full_name?: string; username?: string }): Promise<User> => {
    const res = await api.put('/auth/me', data);
    return res.data;
  },
};
