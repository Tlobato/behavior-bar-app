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
    const currentUser = authService.getCurrentUser();
    if (currentUser && currentUser.id) {
      setIsLoading(true);
      try {
        const userData = await userService.getUserById(currentUser.id);
        if (userData) {
          // Atualiza apenas se o usuário atual for o mesmo no contexto
          setUser((prevUser) => (prevUser?.id === currentUser.id ? userData : userData)); // Ajuste: Sempre atualiza com os dados mais recentes
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