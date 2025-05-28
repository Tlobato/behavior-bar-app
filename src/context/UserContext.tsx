import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { userService } from '../services/userService';
import { authService } from '../services/authService';

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

  // Função para carregar os dados do usuário do servidor
  const refreshUserData = async () => {
    // Verifica se existe token antes de tentar buscar usuário
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (!token) {
      setUser(null);
      setIsLoading(false);
      return;
    }
    const currentUser = authService.getCurrentUser();
    if (currentUser && currentUser.id) {
      setIsLoading(true);
      try {
        const userData = await userService.getUserById(currentUser.id);
        if (userData) {
          setUser(userData);
        }
      } catch (error) {
        console.error('Erro ao atualizar dados do usuário:', error);
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