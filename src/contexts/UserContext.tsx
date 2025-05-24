import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';
import { userService } from '../services/userService';
import { User } from '../types';

interface UserContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string, keepLogged?: boolean) => Promise<void>;
  logout: () => void;
  refreshUserData: () => Promise<void>;
  setUser: (user: User | null) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeUser = async () => {
      try {
        const accessToken = localStorage.getItem('accessToken');
        if (accessToken) {
          // Buscar usuário do backend via /me
          const userData = await userService.getCurrentUser();
          if (userData) {
            setUser(userData);
          } else {
            setUser(null);
          }
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Erro ao inicializar usuário:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    initializeUser();
  }, []);

  const login = async (email: string, password: string, keepLogged: boolean = true) => {
    try {
      setLoading(true);
      setError(null);
      await authService.login(email, password, keepLogged);
      // Buscar usuário do backend após login
      const userData = await userService.getCurrentUser();
      if (userData) {
        setUser(userData);
      } else {
        setUser(null);
      }
    } catch (error) {
      setError('Erro ao fazer login. Verifique suas credenciais.');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const refreshUserData = async () => {
    try {
      const accessToken = localStorage.getItem('accessToken');
      if (accessToken) {
        const userData = await userService.getCurrentUser();
        if (userData) {
          setUser(userData);
        }
      }
    } catch (error) {
      console.error('Erro ao atualizar dados do usuário:', error);
    }
  };

  return (
    <UserContext.Provider value={{ user, loading, error, login, logout, refreshUserData, setUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser deve ser usado dentro de um UserProvider');
  }
  return context;
}; 