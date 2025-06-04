import axios from 'axios';
import { User } from '../types';

const API_URL = 'http://localhost:8080/api/users'; // URL base para os endpoints de usuários

export const userService = {
  // Listar todos os usuários
  async getUsers(): Promise<User[]> {
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const response = await axios.get(API_URL, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      // Mapeia os dados retornados do backend para os nomes usados no frontend
      return response.data.map((user: any) => ({
        id: user.id,
        name: user.name, // Já vem como name
        email: user.email,
        role: user.role,
        rewardPoints: user.rewardPoints,
        profileImageUrl: user.profileImageUrl || null, // Usa a URL completa
      }));
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
      return []; // Retorna um array vazio em caso de erro
    }
  },

  // Obter um único usuário pelo ID
  async getUserById(id: number): Promise<User | null> {
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const response = await axios.get(`${API_URL}/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      return {
        id: response.data.id,
        name: response.data.name,
        email: response.data.email,
        role: response.data.role,
        rewardPoints: response.data.rewardPoints,
        profileImageUrl: response.data.profileImageUrl || null, // Usa a URL completa
      };
    } catch (error) {
      console.error('Erro ao buscar usuário por ID:', error);
      return null;
    }
  },

  async createUser(user: Omit<User, 'id'>): Promise<{ id: number; nome: string; email: string; role: 'USER' | 'ADMIN' | 'TUTOR' } | null> {
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
  
      // Mapeia os campos para corresponder aos nomes esperados no backend
      const payload = {
        nome: user.name, // Mapeia "name" para "nome"
        email: user.email,
        senha: user.password,
        role: user.role,
      };
  
      const response = await axios.post(API_URL, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data; // Retorna o formato esperado pelo backend
    } catch (error) {
      console.error('Erro ao criar usuário:', error);
      return null;
    }
  },

  // Atualizar informações de um usuário existente
  async updateUser(id: number, user: { name: string; email: string; role: 'USER' | 'ADMIN' | 'TUTOR' }): Promise<boolean> {
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      
      // Mapeia os campos para corresponder aos nomes esperados no backend
      const payload = {
        nome: user.name, // Mapeia "name" para "nome"
        email: user.email,
        role: user.role,
      };

      await axios.put(`${API_URL}/${id}`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      return true; // Retorna true se a atualização for bem-sucedida
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      return false; // Retorna false em caso de erro
    }
  },

  // Excluir um usuário
  async deleteUser(id: number): Promise<boolean> {
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
  
      await axios.delete(`${API_URL}/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return true; // Retorna true se a exclusão for bem-sucedida
    } catch (error) {
      console.error('Erro ao excluir usuário:', error);
      return false; // Retorna false em caso de erro
    }
  },

  // Atualizar apenas os pontos de recompensa do usuário
  async updateUserRewardPoints(id: number, rewardPoints: number): Promise<boolean> {
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      await axios.patch(`${API_URL}/${id}/rewardPoints`, { rewardPoints }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return true;
    } catch (error) {
      console.error('Erro ao atualizar pontos de recompensa do usuário:', error);
      return false;
    }
  },

  // Atualizar perfil do usuário autenticado
  async updateProfile(data: {
    name: string;
    email: string;
    currentPassword?: string;
    newPassword?: string;
    confirmPassword?: string;
  }): Promise<boolean> {
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      await axios.patch(`${API_URL}/me`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return true;
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      return false;
    }
  },

  // Upload de foto de perfil do usuário autenticado
  async uploadProfileImage(imageFile: File): Promise<string | null> {
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const formData = new FormData();
      formData.append('image', imageFile);
      const response = await axios.post(`${API_URL}/me/profile-image`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data.imageUrl || null;
    } catch (error) {
      console.error('Erro ao fazer upload da foto de perfil:', error);
      return null;
    }
  },
};