import axios from 'axios';

export interface Notification {
  id: number;
  message: string;
  read: boolean;
  createdAt: string;
  type: string;
  redemptionId?: number;
}

const API_URL = 'http://localhost:8080/api/notifications';

export const notificationService = {
  async getNotifications(): Promise<Notification[]> {
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const response = await axios.get(API_URL, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar notificações:', error);
      return [];
    }
  },

  async markAsRead(id: number): Promise<boolean> {
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      await axios.patch(`${API_URL}/${id}/read`, {}, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return true;
    } catch (error) {
      console.error('Erro ao marcar notificação como lida:', error);
      return false;
    }
  },
}; 