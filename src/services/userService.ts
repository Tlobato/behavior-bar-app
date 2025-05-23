import axios from 'axios';
import { User } from '../types';

const API_URL = 'http://localhost:8080/api/users';

export const userService = {
  // Listar todos os usuários
  async getUsers(): Promise<User[]> {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.get(API_URL, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
      return [];
    }
  },

  // Obter um usuário específico por ID
  async getUserById(id: number): Promise<User | null> {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.get(`${API_URL}/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error(`Erro ao buscar usuário com ID ${id}:`, error);
      return null;
    }
  },

  // Obter o usuário atual
  async getCurrentUser(): Promise<User | null> {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        console.error('Token não encontrado');
        return null;
      }

      const response = await axios.get(`${API_URL}/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar usuário atual:', error);
      return null;
    }
  },

  // Criar um novo usuário
  async createUser(user: { name: string; email: string; senha: string; role: 'USER' | 'ADMIN' | 'TUTOR' }): Promise<User | null> {
    try {
      // Mapeando os campos do frontend para o backend
      const userData = {
        nome: user.name,
        email: user.email,
        senha: user.senha,
        role: user.role,
        rewardPoints: 0 // Valor inicial padrão
      };
      
      const response = await axios.post(API_URL, userData);
      return response.data;
    } catch (error) {
      console.error('Erro ao criar usuário:', error);
      return null;
    }
  },

  // Atualizar um usuário existente
  async updateUser(id: number, user: Partial<User>): Promise<boolean> {
    try {
      const token = localStorage.getItem('accessToken');
      // Mapeando os campos do frontend para o backend
      const userData = {
        nome: user.name, // Mapeando 'name' para 'nome'
        email: user.email,
        role: user.role,
        // Não enviamos senha na atualização
        // Não enviamos rewardPoints na atualização
      };
      
      const response = await axios.put(`${API_URL}/${id}`, userData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.status >= 200 && response.status < 300;
    } catch (error) {
      console.error(`Erro ao atualizar usuário com ID ${id}:`, error);
      throw error; // Propaga o erro para ser tratado pelo componente
    }
  },

  // Excluir um usuário
  async deleteUser(id: number): Promise<boolean> {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.delete(`${API_URL}/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      // Considera sucesso qualquer status 2xx (200, 201, 204, etc)
      return response.status >= 200 && response.status < 300;
    } catch (error) {
      console.error(`Erro ao excluir usuário com ID ${id}:`, error);
      throw error; // Propaga o erro para ser tratado pelo componente
    }
  },
};