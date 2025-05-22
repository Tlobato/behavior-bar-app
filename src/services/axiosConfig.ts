import axios from 'axios';
import { authService } from './authService';

// Configuração base do Axios
const api = axios.create({
  baseURL: 'http://localhost:8080/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar o token em todas as requisições
api.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem('accessToken');
    console.log('Token encontrado na requisição:', !!accessToken);
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => {
    console.error('Erro no interceptor de requisição:', error);
    return Promise.reject(error);
  }
);

// Interceptor para tratar erros 401 e tentar refresh token
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    console.log('Erro na resposta:', error.response?.status, error.response?.data);

    // Se o erro for 401 e não for uma tentativa de refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      console.log('Tentando atualizar o token...');
      originalRequest._retry = true;

      try {
        // Tenta atualizar o token
        const success = await authService.refreshTokens();
        console.log('Resultado da atualização do token:', success);
        
        if (success) {
          // Se conseguiu atualizar, tenta a requisição original novamente
          const accessToken = localStorage.getItem('accessToken');
          console.log('Novo token obtido:', !!accessToken);
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        console.error('Erro ao atualizar token:', refreshError);
      }

      // Se não conseguiu atualizar o token, faz logout
      console.log('Falha ao atualizar token, fazendo logout...');
      authService.logout();
      window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);

export default api; 