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
  async createUser(user: Omit<User, 'id'>): Promise<User | null> {
    try {
      const response = await axios.post(API_URL, user);
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
      const response = await axios.put(`${API_URL}/${id}`, user, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.status === 200;
    } catch (error) {
      console.error(`Erro ao atualizar usuário com ID ${id}:`, error);
      return false;
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
      return response.status === 200;
    } catch (error) {
      console.error(`Erro ao excluir usuário com ID ${id}:`, error);
      return false;
    }
  },
};