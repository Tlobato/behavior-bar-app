import axios from 'axios';

// Interceptor para adicionar o token JWT no cabeçalho de todas as requisições
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('token'); // Obtém o token do localStorage
  if (token) {
    config.headers.Authorization = `Bearer ${token}`; // Adiciona o token no cabeçalho
  }
  return config;
}, (error) => {
  return Promise.reject(error); // Tratamento de erro
});