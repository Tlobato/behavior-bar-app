import { User } from '../types';
import api from './axiosConfig';
import { jwtDecode } from 'jwt-decode';

interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

interface DecodedToken {
  sub: string;
  exp: number;
  role: string;
  name: string;
  email: string;
  id: number;
}

export const authService = {
  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/login', { email, password });
    return response.data;
  },

  logout(): void {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  },

  getCurrentUser(): User | null {
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) return null;
    return this.getUserFromToken(accessToken);
  },

  getUserFromToken(token: string): User | null {
    try {
      const decoded = jwtDecode<DecodedToken>(token);
      return {
        id: decoded.id,
        name: decoded.name,
        email: decoded.email,
        role: decoded.role as 'USER' | 'ADMIN' | 'TUTOR'
      };
    } catch (error) {
      console.error('Erro ao decodificar token:', error);
      return null;
    }
  },

  isAuthenticated(): boolean {
    return !!localStorage.getItem('accessToken');
  },

  isAdmin(): boolean {
    const user = this.getCurrentUser();
    return user?.role === 'ADMIN';
  },

  isTutor(): boolean {
    const user = this.getCurrentUser();
    return user?.role === 'TUTOR';
  },

  isAdminOrTutor(): boolean {
    const user = this.getCurrentUser();
    return user?.role === 'ADMIN' || user?.role === 'TUTOR';
  },

  async refreshTokens(): Promise<boolean> {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      console.log('Refresh token encontrado:', !!refreshToken);
      
      if (!refreshToken) {
        console.error('Refresh token não encontrado');
        return false;
      }

      console.log('Tentando atualizar token com refresh token...');
      const response = await api.post<{ accessToken: string }>('/auth/refresh', { refreshToken });
      console.log('Resposta do refresh token:', response.status);
      
      localStorage.setItem('accessToken', response.data.accessToken);
      console.log('Novo access token armazenado');
      return true;
    } catch (error) {
      console.error('Erro ao atualizar tokens:', error);
      return false;
    }
  }
};