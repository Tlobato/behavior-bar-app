import axios from 'axios';
import { User } from '../types';

const API_URL = 'http://localhost:8080/api/users'; // URL base para os endpoints de usuários

export const userService = {
  // Listar todos os usuários
  async getUsers(): Promise<User[]> {
    try {
      const response = await axios.get(API_URL); // Faz a chamada GET para obter os usuários
      // Mapeia os dados retornados do backend para os nomes usados no frontend
      return response.data.map((user: any) => ({
        id: user.id,
        name: user.nome, // Mapeia "nome" para "name"
        email: user.email, // Mapeia "email" para "email"
        role: user.role, // Mantém o papel como está
      }));
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
      return []; // Retorna um array vazio em caso de erro
    }
  },
  async createUser(user: Omit<User, 'id'>): Promise<{ id: number; nome: string; email: string; role: 'USER' | 'ADMIN' } | null> {
    try {
      const token = localStorage.getItem('token'); // Recupera o token JWT armazenado
  
      // Mapeia os campos para corresponder aos nomes esperados no backend
      const payload = {
        nome: user.name, // Mapeia "name" para "nome"
        email: user.email,
        senha: user.password,
        role: user.role,
      };
  
      const response = await axios.post(API_URL, payload, {
        headers: {
          Authorization: `Bearer ${token}`, // Inclui o token JWT no cabeçalho
        },
      });
      return response.data; // Retorna o formato esperado pelo backend
    } catch (error) {
      console.error('Erro ao criar usuário:', error);
      return null;
    }
  },

// Atualizar informações de um usuário existente
async updateUser(id: number, user: { name: string; email: string; role: 'USER' | 'ADMIN' }): Promise<boolean> {
  try {
    const token = localStorage.getItem('token'); // Recupera o token JWT armazenado
    
    // Mapeia os campos para corresponder aos nomes esperados no backend
    const payload = {
      nome: user.name, // Mapeia "name" para "nome"
      email: user.email,
      role: user.role,
    };

    await axios.put(`${API_URL}/${id}`, payload, {
      headers: {
        Authorization: `Bearer ${token}`, // Inclui o token JWT no cabeçalho
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
      const token = localStorage.getItem('token'); // Recupera o token JWT armazenado
  
      await axios.delete(`${API_URL}/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`, // Inclui o token JWT no cabeçalho
        },
      });
      return true; // Retorna true se a exclusão for bem-sucedida
    } catch (error) {
      console.error('Erro ao excluir usuário:', error);
      return false; // Retorna false em caso de erro
    }
  },
};