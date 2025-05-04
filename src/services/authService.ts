// src/services/authService.ts
import { User } from '../types';

// Usuários mockados para testes
const mockUsers = [
  {
    id: 1,
    username: 'admin',
    password: 'admin123',
    role: 'admin',
    name: 'Administrador'
  },
  {
    id: 2,
    username: 'crianca',
    password: '123456',
    role: 'user',
    name: 'Criança'
  }
];

// Simula armazenamento de sessão
let currentUser: User | null = null;

export const authService = {
  login(username: string, password: string): Promise<User | null> {
    return new Promise((resolve) => {
      // Simula um delay de rede
      setTimeout(() => {
        const user = mockUsers.find(
          u => u.username === username && u.password === password
        );
        
        if (user) {
          // Não incluir a senha no objeto de usuário retornado
          const { password, ...userWithoutPassword } = user;
          currentUser = userWithoutPassword as User;
          
          // Salvar no localStorage para persistir entre refreshes
          localStorage.setItem('currentUser', JSON.stringify(currentUser));
          
          resolve(currentUser);
        } else {
          resolve(null);
        }
      }, 500);
    });
  },
  
  logout(): void {
    currentUser = null;
    localStorage.removeItem('currentUser');
  },
  
  getCurrentUser(): User | null {
    if (currentUser) return currentUser;
    
    // Tentar recuperar do localStorage
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      currentUser = JSON.parse(savedUser);
      return currentUser;
    }
    
    return null;
  },
  
  isAuthenticated(): boolean {
    return this.getCurrentUser() !== null;
  },
  
  isAdmin(): boolean {
    const user = this.getCurrentUser();
    return user !== null && user.role === 'admin';
  }
};