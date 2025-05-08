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
        username: user.email, // Mapeia "email" para "username"
        role: user.role, // Mantém o papel como está
      }));
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
      return []; // Retorna um array vazio em caso de erro
    }
  },

  // Criar um novo usuário
  async createUser(user: Omit<User, 'id'>): Promise<User | null> {
    try {
      const response = await axios.post(API_URL, user); // Faz a chamada POST para criar um novo usuário
      return response.data; // Retorna o usuário criado
    } catch (error) {
      console.error('Erro ao criar usuário:', error);
      return null; // Retorna null em caso de erro
    }
  },

  // Atualizar informações de um usuário existente
  async updateUser(id: number, user: Partial<User>): Promise<User | null> {
    try {
      const response = await axios.put(`${API_URL}/${id}`, user); // Faz a chamada PUT para atualizar o usuário
      return response.data; // Retorna o usuário atualizado
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      return null; // Retorna null em caso de erro
    }
  },

  // Excluir um usuário
  async deleteUser(id: number): Promise<boolean> {
    try {
      await axios.delete(`${API_URL}/${id}`); // Faz a chamada DELETE para remover o usuário
      return true; // Retorna true se a exclusão for bem-sucedida
    } catch (error) {
      console.error('Erro ao excluir usuário:', error);
      return false; // Retorna false em caso de erro
    }
  },
};