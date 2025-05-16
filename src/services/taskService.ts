import axios from 'axios';
import { MissionTask, MissionTaskRequest, MissionTaskUpdateRequest, MissionTaskStatus } from '../types';

const API_URL = 'http://localhost:8080/tasks'; // URL base para os endpoints de tarefas

export const taskService = {
  // Listar todas as tarefas
  async getAllTasks(): Promise<MissionTask[]> {
    try {
      const token = localStorage.getItem('token'); // Recupera o token JWT armazenado

      const response = await axios.get(API_URL, {
        headers: {
          Authorization: `Bearer ${token}`, // Inclui o token JWT no cabeçalho
        },
      });

      return response.data.map((task: any) => ({
        id: task.id,
        name: task.name,
        status: task.status as MissionTaskStatus,
        observation: task.observation,
        createdAt: task.createdAt,
        missionId: task.missionId,
        userId: task.userId,
      }));
    } catch (error) {
      console.error('Erro ao buscar tarefas:', error);
      return []; // Retorna um array vazio em caso de erro
    }
  },

  // Obter uma única tarefa pelo ID
  async getTaskById(id: number): Promise<MissionTask | null> {
    try {
      const token = localStorage.getItem('token');

      const response = await axios.get(`${API_URL}/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return {
        id: response.data.id,
        name: response.data.name,
        status: response.data.status as MissionTaskStatus,
        observation: response.data.observation,
        createdAt: response.data.createdAt,
        missionId: response.data.missionId,
        userId: response.data.userId,
      };
    } catch (error) {
      console.error('Erro ao buscar tarefa por ID:', error);
      return null;
    }
  },

  // Criar uma nova tarefa
  async createTask(taskRequest: MissionTaskRequest): Promise<MissionTask | null> {
    try {
      const token = localStorage.getItem('token');

      const response = await axios.post(API_URL, taskRequest, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return {
        id: response.data.id,
        name: response.data.name,
        status: response.data.status as MissionTaskStatus,
        observation: response.data.observation,
        createdAt: response.data.createdAt,
        missionId: response.data.missionId,
        userId: response.data.userId,
      };
    } catch (error) {
      console.error('Erro ao criar tarefa:', error);
      return null;
    }
  },

  // Atualizar informações de uma tarefa existente
  async updateTask(
    id: number,
    taskUpdateRequest: MissionTaskUpdateRequest
  ): Promise<boolean> {
    try {
      const token = localStorage.getItem('token');

      const response = await axios.put(`${API_URL}/${id}`, taskUpdateRequest, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.status === 200;
    } catch (error) {
      console.error('Erro ao atualizar tarefa:', error);
      return false;
    }
  },

  // Excluir uma tarefa
  async deleteTask(id: number): Promise<boolean> {
    try {
      const token = localStorage.getItem('token');

      await axios.delete(`${API_URL}/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return true;
    } catch (error) {
      console.error('Erro ao excluir tarefa:', error);
      return false;
    }
  },

  // Buscar tarefas por missão
  async getTasksByMissionId(missionId: number): Promise<MissionTask[]> {
    try {
      const token = localStorage.getItem('token');

      const response = await axios.get(`${API_URL}/mission/${missionId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data.map((task: any) => ({
        id: task.id,
        name: task.name,
        status: task.status as MissionTaskStatus,
        observation: task.observation,
        createdAt: task.createdAt,
        missionId: task.missionId,
        userId: task.userId,
      }));
    } catch (error) {
      console.error(`Erro ao buscar tarefas da missão ID ${missionId}:`, error);
      return [];
    }
  }
};