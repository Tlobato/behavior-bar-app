import axios from 'axios';

// Interceptor para adicionar o token JWT no cabeçalho de todas as requisições
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken'); // Corrigido para usar a chave correta
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  console.error('Erro na configuração da requisição:', error);
  return Promise.reject(error);
});

// Interceptor para tratamento de erros de resposta
axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expirado ou inválido
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default axios;