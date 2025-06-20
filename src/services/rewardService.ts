import axios from 'axios';
import { BackendReward, Reward } from '../types';

const API_URL = 'http://localhost:8080/api/rewards'; // URL base da API de recompensas

export const rewardService = {
  async getAllRewards(): Promise<Reward[]> {
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const response = await axios.get(API_URL, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      

      
      // Mapear os dados para garantir compatibilidade
      return response.data.map((reward: BackendReward) => ({
        id: reward.id,
        title: reward.title,
        description: reward.description,
        points: reward.pointsRequired, // Mapear pointsRequired para points
        imageUrl: reward.imageUrl,
        active: reward.active
      }));
    } catch (error) {
      console.error('Erro ao buscar recompensas:', error);
      return [];
    }
  },

  // Buscar uma recompensa específica por ID
  async getRewardById(id: number): Promise<Reward | null> {
    try {
      // Obter o token do localStorage
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');

      const response = await axios.get(`${API_URL}/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error(`Erro ao buscar recompensa com ID ${id}:`, error);
      return null;
    }
  },

  async createReward(rewardData: {
    title: string,
    description: string,
    points: number,
    imageFile?: File | null,
    active?: boolean
  }): Promise<Reward | null> {
    try {
      // Obter o token do localStorage
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');

      // Criar um FormData para enviar os dados multipart
      const formData = new FormData();
      formData.append('title', rewardData.title);
      formData.append('description', rewardData.description); // Adicionando o campo description
      formData.append('pointsRequired', rewardData.points.toString());

      // Adicione o campo ativo se estiver definido
      if (rewardData.active !== undefined) {
        formData.append('active', rewardData.active.toString());
      }

      // Adicionar a imagem, se existir
      if (rewardData.imageFile) {
        formData.append('image', rewardData.imageFile);
      } else {
        // Se não tiver imagem, precisamos verificar como o backend lida com isso
        throw new Error('Uma imagem é necessária para criar uma recompensa');
      }

      // Para debug: verifique o que está sendo enviado
      console.log("Enviando dados para o servidor:", {
        title: rewardData.title,
        description: rewardData.description,
        pointsRequired: rewardData.points,
        active: rewardData.active,
        image: rewardData.imageFile?.name
      });

      // Enviar a requisição com os headers corretos
      const response = await axios.post(API_URL, formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      return response.data;
    } catch (error) {
      console.error('Erro ao criar recompensa:', error);
      throw error; // Propaga o erro para que possamos tratá-lo no componente
    }
  },

  // Atualizar uma recompensa existente
  async updateReward(id: number, rewardData: {
    title: string,
    description: string,
    points: number,
    imageFile?: File | null,
    active?: boolean
  }): Promise<Reward | null> {
    try {
      // Obter o token do localStorage
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');

      // Criar um FormData para enviar os dados multipart
      const formData = new FormData();
      formData.append('title', rewardData.title);
      formData.append('description', rewardData.description);
      formData.append('pointsRequired', rewardData.points.toString());

      // Adicionar o campo ativo se estiver definido
      if (rewardData.active !== undefined) {
        formData.append('active', rewardData.active.toString());
      }

      // Adicionar a imagem, se existir
      if (rewardData.imageFile) {
        formData.append('image', rewardData.imageFile);
      }

      const response = await axios.put(`${API_URL}/${id}`, formData, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error(`Erro ao atualizar recompensa com ID ${id}:`, error);
      return null;
    }
  },

  // Excluir uma recompensa
  async deleteReward(id: number): Promise<boolean> {
    try {
      // Obter o token do localStorage
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');

      await axios.delete(`${API_URL}/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return true;
    } catch (error) {
      console.error(`Erro ao excluir recompensa com ID ${id}:`, error);
      return false;
    }
  },

  // Upload de imagem para uma recompensa
  async uploadRewardImage(file: File): Promise<string | null> {
    try {
      // Obter o token do localStorage
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');

      const formData = new FormData();
      formData.append('image', file);

      const response = await axios.post(`${API_URL}/upload`, formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      return response.data.imageUrl;
    } catch (error) {
      console.error('Erro ao fazer upload da imagem:', error);
      return null;
    }
  },

  // Desativar uma recompensa
  async deactivateReward(id: number): Promise<boolean> {
    try {
      // Obter o token do localStorage
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');

      await axios.put(`${API_URL}/${id}/deactivate`, {}, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return true;
    } catch (error) {
      console.error(`Erro ao desativar recompensa com ID ${id}:`, error);
      return false;
    }
  },

  // Obter recompensas disponíveis com base nos pontos
  async getAvailableRewards(points: number): Promise<Reward[]> {
    try {
      // Obter o token do localStorage
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');

      const response = await axios.get(`${API_URL}/available`, {
        params: { points },
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar recompensas disponíveis:', error);
      return [];
    }
  },

  // Buscar histórico de resgates do usuário logado
  async getUserRedemptions(): Promise<any[]> {
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const response = await axios.get('http://localhost:8080/api/redemptions/my-redemptions', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar histórico de resgates:', error);
      return [];
    }
  },

  // Realizar o resgate de uma recompensa
  async redeemReward(data: { rewardId: number }): Promise<any> {
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const response = await axios.post('http://localhost:8080/api/redemptions', data, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error: any) {
      throw error;
    }
  },

  async getAllRewardsAdmin(): Promise<Reward[]> {
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const response = await axios.get(`${API_URL}/all`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data.map((reward: BackendReward) => ({
        id: reward.id,
        title: reward.title,
        description: reward.description,
        points: reward.pointsRequired,
        imageUrl: reward.imageUrl,
        active: reward.active
      }));
    } catch (error) {
      console.error('Erro ao buscar todas as recompensas (admin):', error);
      return [];
    }
  },

  /**
   * Busca o histórico de resgates de recompensas (ADMIN/TUTOR)
   * @param params Filtros opcionais: userId, status, startDate, endDate, rewardId
   */
  async getRewardRedemptions(params: {
    userId?: number;
    status?: string;
    startDate?: string;
    endDate?: string;
    rewardId?: number;
  } = {}) {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    const query = Object.entries(params)
      .filter(([_, v]) => v !== undefined && v !== null && v !== '')
      .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v as string)}`)
      .join('&');
    const url = `/api/redemptions${query ? `?${query}` : ''}`;
    const response = await fetch(url, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Erro ao buscar histórico de resgates');
    return await response.json();
  },
};