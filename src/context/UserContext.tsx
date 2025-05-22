import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { userService } from '../services/userService';
import { authService } from '../services/authService';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';

interface UserContextProps {
  user: User | null;
  setUser: (user: User | null) => void;
  refreshUserData: () => Promise<void>;
  isLoading: boolean;
}

const UserContext = createContext<UserContextProps | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Função para verificar se o token está expirado
  const isTokenExpired = (): boolean => {
    const token = localStorage.getItem('token');
    if (!token) return true;

    try {
      const decodedToken: any = jwtDecode(token);
      const currentTime = Date.now() / 1000;
      return decodedToken.exp < currentTime;
    } catch {
      return true;
    }
  };

  // Função para carregar os dados do usuário do servidor
  const refreshUserData = async () => {
    const currentUser = authService.getCurrentUser();
    
    // Se o token estiver expirado, limpa os dados do usuário
    if (isTokenExpired()) {
      authService.logout();
      setUser(null);
      setIsLoading(false);
      return;
    }

    if (currentUser && currentUser.id) {
      setIsLoading(true);
      try {
        const userData = await userService.getUserById(currentUser.id);
        if (userData) {
          setUser((prevUser) => (prevUser?.id === currentUser.id ? userData : userData));
        }
      } catch (error) {
        console.error('Erro ao atualizar dados do usuário:', error);
        // Se houver erro 403, limpa os dados do usuário
        if (axios.isAxiosError(error) && error.response?.status === 403) {
          authService.logout();
          setUser(null);
        }
      } finally {
        setIsLoading(false);
      }
    } else {
      setUser(null);
      setIsLoading(false);
    }
  };

  // Efeito para carregar dados iniciais
  useEffect(() => {
    refreshUserData();
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser, refreshUserData, isLoading }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = (): UserContextProps => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser deve ser usado dentro de um UserProvider');
  }
  return context;
};