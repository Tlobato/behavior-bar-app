import axios from 'axios';
import { Mission } from '../types';

const API_URL = 'http://localhost:8080/api/missions'; // URL base para os endpoints de missões

export const missionService = {
  // Listar todas as missões
  async getMissions(): Promise<Mission[]> {
    try {
      const response = await axios.get(API_URL); // Faz a chamada GET para obter as missões
      return response.data.map((mission: any) => ({
        id: mission.id,
        name: mission.name,
        description: mission.description,
        rewardPoints: mission.rewardPoints,
        status: mission.status,
        createdAt: mission.createdAt,
        deadline: mission.deadline,
        userId: mission.userId,
        adminId: mission.adminId,
        tasks: mission.tasks, // Mantém a lista de tarefas como está
      }));
    } catch (error) {
      console.error('Erro ao buscar missões:', error);
      return []; // Retorna um array vazio em caso de erro
    }
  },

  // Obter uma única missão pelo ID
  async getMissionById(id: number): Promise<Mission | null> {
    try {
      const token = localStorage.getItem('token');

      const response = await axios.get(`${API_URL}/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`, // Inclui o token JWT no cabeçalho
        },
      });

      return {
        id: response.data.id,
        name: response.data.name,
        description: response.data.description,
        rewardPoints: response.data.rewardPoints,
        status: response.data.status,
        createdAt: response.data.createdAt,
        deadline: response.data.deadline,
        userId: response.data.userId,
        adminId: response.data.adminId,
        tasks: response.data.tasks,
      };
    } catch (error) {
      console.error('Erro ao buscar missão por ID:', error);
      return null;
    }
  },

  // Criar uma nova missão
  async createMission(missionData: {
    name: string;
    description: string;
    rewardPoints: number;
    deadline: string;
    userId: number;
  }): Promise<Mission | null> {
    try {
      const token = localStorage.getItem('token'); // Recupera o token JWT armazenado

      const response = await axios.post(API_URL, missionData, {
        headers: {
          Authorization: `Bearer ${token}`, // Inclui o token JWT no cabeçalho
        },
      });

      return {
        id: response.data.id,
        name: response.data.name,
        description: response.data.description,
        rewardPoints: response.data.rewardPoints,
        status: response.data.status,
        createdAt: response.data.createdAt,
        deadline: response.data.deadline,
        userId: response.data.userId,
        adminId: response.data.adminId,
        tasks: response.data.tasks || [], // Inicializa como um array vazio se não houver tarefas
      };
    } catch (error) {
      console.error('Erro ao criar missão:', error);
      return null; // Retorna null em caso de erro
    }
  },

  // Atualizar informações de uma missão existente
  async updateMission(
    id: number,
    missionData: {
      name: string;
      description: string;
      rewardPoints: number;
      deadline: string;
      userId: number;
    }
  ): Promise<boolean> {
    try {
      const token = localStorage.getItem('token'); // Recupera o token JWT armazenado

      const response = await axios.put(`${API_URL}/${id}`, missionData, {
        headers: {
          Authorization: `Bearer ${token}`, // Inclui o token JWT no cabeçalho
        },
      });

      return response.status === 200; // Retorna true se a atualização for bem-sucedida
    } catch (error) {
      console.error('Erro ao atualizar missão:', error);
      return false; // Retorna false em caso de erro
    }
  },

  // Excluir uma missão
  async deleteMission(id: number): Promise<boolean> {
    try {
      const token = localStorage.getItem('token'); // Recupera o token JWT armazenado

      await axios.delete(`${API_URL}/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`, // Inclui o token JWT no cabeçalho
        },
      });
      return true; // Retorna true se a exclusão for bem-sucedida
    } catch (error) {
      console.error('Erro ao excluir missão:', error);
      return false; // Retorna false em caso de erro
    }
  },
};