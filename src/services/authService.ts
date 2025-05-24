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

// Novo método para buscar o usuário logado via /api/users/me
async function fetchCurrentUser(): Promise<User | null> {
  const token = localStorage.getItem('accessToken');
  if (!token) return null;
  try {
    const response = await fetch('/api/users/me', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    if (!response.ok) return null;
    const user = await response.json();
    return user;
  } catch (error) {
    return null;
  }
}

// Atualizar o método de login para buscar o usuário logado do backend
async function login(email: string, password: string, keepLogged: boolean = true): Promise<AuthResponse> {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  if (!response.ok) {
    throw new Error('Falha no login');
  }
  const data = await response.json();
  localStorage.setItem('accessToken', data.accessToken);
  if (keepLogged) {
    localStorage.setItem('refreshToken', data.refreshToken);
  } else {
    localStorage.removeItem('refreshToken');
  }

  // Buscar o usuário logado do backend e salvar no localStorage
  const user = await fetchCurrentUser();
  if (user) {
    localStorage.setItem('currentUser', JSON.stringify(user));
  }
  return data;
}

export const authService = {
  logout(): void {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  },

  getCurrentUser(): User | null {
    const userStr = localStorage.getItem('currentUser');
    if (!userStr) return null;
    try {
      return JSON.parse(userStr) as User;
    } catch (error) {
      return null;
    }
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

      console.log('Tentando atualizar o token com refresh token...');
      const response = await api.post<{ accessToken: string }>(
        '/auth/refresh',
        {},
        { headers: { Authorization: `Bearer ${refreshToken}` } }
      );
      console.log('Resposta do refresh token:', response.status);
      
      localStorage.setItem('accessToken', response.data.accessToken);
      console.log('Novo access token armazenado');
      return true;
    } catch (error) {
      console.error('Erro ao atualizar tokens:', error);
      return false;
    }
  },

  fetchCurrentUser: fetchCurrentUser,
  login,
};