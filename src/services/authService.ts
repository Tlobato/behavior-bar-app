import axios from 'axios';
import { User } from '../types';
import { jwtDecode } from "jwt-decode";

const API_URL = 'http://localhost:8080/api/auth'; // URL base da API de autenticação

export const authService = {
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
        id: decodedToken.id, // Decodifique o ID do token, se disponível
        username: decodedToken.sub, // "sub" é geralmente o email ou username no JWT
        role: decodedToken.role.toLowerCase(), // Normaliza para minúsculas (admin | user)
        name: decodedToken.name || '', // Adicione outros campos, se necessário
      };

      // Salva o usuário decodificado no localStorage para fácil acesso
      localStorage.setItem('currentUser', JSON.stringify(user));

      return user;
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      return null;
    }
  },

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
  },

  getCurrentUser(): User | null {
    // Verifica se o usuário está armazenado no localStorage
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      return JSON.parse(savedUser);
    }
    return null;
  },

  isAuthenticated(): boolean {
    // Verifica se existe um token JWT armazenado
    const token = localStorage.getItem('token');
    return !!token;
  },

  isAdmin(): boolean {
    const user = this.getCurrentUser();
    return user !== null && user.role === 'admin'; // Comparação com minúsculas
  },
};