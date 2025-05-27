import axios from 'axios';
import { User } from '../types';
import { jwtDecode } from 'jwt-decode';

const API_URL = 'http://localhost:8080/api/auth'; // URL base da API de autenticação

export const authService = {
  // Método de Login
  async login(username: string, password: string, keepLoggedIn: boolean = false): Promise<User | null> {
    try {
      // Envia as credenciais para o backend
      const response = await axios.post(`${API_URL}/login`, {
        username,
        password,
      });

      // Salva o token JWT retornado pelo backend
      const { token } = response.data;
      if (keepLoggedIn) {
        localStorage.setItem('token', token);
      } else {
        sessionStorage.setItem('token', token);
      }

      // Decodifica o token para obter informações do usuário
      const decodedToken: { [key: string]: any } = jwtDecode(token);
      const user: User = {
        id: decodedToken.id, // Decodifica o ID do token, se disponível
        email: decodedToken.sub, // "sub" geralmente é o email ou username no JWT
        role: decodedToken.role, // Mantém o valor original do token (ADMIN | USER)
        name: decodedToken.name || '', // Adiciona outros campos, se necessário
        password: decodedToken.password
      };

      // Salva o usuário decodificado no localStorage/sessionStorage para fácil acesso
      const userStr = JSON.stringify(user);
      if (keepLoggedIn) {
        localStorage.setItem('currentUser', userStr);
      } else {
        sessionStorage.setItem('currentUser', userStr);
      }

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
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('currentUser');
  },

  // Obtém o usuário atual do localStorage
  getCurrentUser(): User | null {
    const savedUser = localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser');
    if (savedUser) {
      return JSON.parse(savedUser);
    }
    return null;
  },

  // Verifica se o usuário está autenticado
  isAuthenticated(): boolean {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
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

  // Verifica se o e-mail existe no backend
  async checkEmailExists(email: string): Promise<boolean> {
    try {
      const response = await axios.get(`http://localhost:8080/api/users/check-email?email=${encodeURIComponent(email)}`);
      return response.data.exists;
    } catch (err) {
      throw new Error('Erro ao verificar e-mail');
    }
  },

  // Onboarding: cria tenant e admin
  async onboarding(email: string, name: string, password: string): Promise<User | null> {
    try {
      // Usa o nome como tenantName (pode ajustar para outro campo se quiser)
      await axios.post(`http://localhost:8080/api/users/onboarding?tenantName=${encodeURIComponent(name)}`, {
        nome: name,
        email,
        senha: password,
      });
      // Login automático após onboarding
      return await this.login(email, password);
    } catch (err) {
      return null;
    }
  },
};