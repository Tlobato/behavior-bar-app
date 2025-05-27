import axios from 'axios';
import { User } from '../types';
import { jwtDecode } from 'jwt-decode';

const API_URL = 'http://localhost:8080/api/auth'; // URL base da API de autenticação

export const authService = {
  // Método de Login
  async login(username: string, password: string): Promise<User | null> {
    try {
      // Envia as credenciais para o backend
      const response = await axios.post(`${API_URL}/login`, {
        username,
        password,
      });

      // Salva o token JWT retornado pelo backend
      const { token } = response.data;
      localStorage.setItem('token', token);

      // Decodifica o token para obter informações do usuário
      const decodedToken: { [key: string]: any } = jwtDecode(token);
      const user: User = {
        id: decodedToken.id, // Decodifica o ID do token, se disponível
        email: decodedToken.sub, // "sub" geralmente é o email ou username no JWT
        role: decodedToken.role, // Mantém o valor original do token (ADMIN | USER)
        name: decodedToken.name || '', // Adiciona outros campos, se necessário
        password: decodedToken.password
      };

      // Salva o usuário decodificado no localStorage para fácil acesso
      localStorage.setItem('currentUser', JSON.stringify(user));

      return user;
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      return null;
    }
  },

  // Método de Logout
  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
  },

  // Obtém o usuário atual do localStorage
  getCurrentUser(): User | null {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      return JSON.parse(savedUser);
    }
    return null;
  },

  // Verifica se o usuário está autenticado
  isAuthenticated(): boolean {
    const token = localStorage.getItem('token');
    return !!token; // Retorna true se o token existir
  },

  // Verifica se o usuário é um administrador
  isAdmin(): boolean {
    const user = this.getCurrentUser();
    return user !== null && (user.role === 'ADMIN' || user.role === 'TUTOR');
  },

  // Verifica se o usuário é tutor
  isTutor(): boolean {
    const user = this.getCurrentUser();
    return user !== null && user.role === 'TUTOR';
  },
};