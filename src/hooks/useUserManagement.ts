import { useState, useEffect } from 'react';
import { User } from '../types';
import { userService } from '../services/userService';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { useUser } from '../context/UserContext';
import { usePageTitle } from './usePageTitle';

export const useUserManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [userToDelete, setUserToDelete] = useState<number | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [userToEdit, setUserToEdit] = useState<User | null>(null);
  
  const navigate = useNavigate();
  const { setUser } = useUser();
  const currentUser = authService.getCurrentUser();
  const pageName = usePageTitle();

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const fetchedUsers = await userService.getUsers();
        let filteredUsers;
        if (currentUser?.role === 'ADMIN') {
          filteredUsers = fetchedUsers.filter(user => user.id !== currentUser.id);
        } else {
          filteredUsers = fetchedUsers.filter(user => user.role === 'USER');
        }
        setUsers(filteredUsers);
      } catch (err) {
        console.error('Erro ao buscar usuários:', err);
        setError('Não foi possível carregar os usuários.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const openEditModal = (user: User) => {
    setUserToEdit(user);
    setIsEditModalOpen(true);
  };

  const handleUpdate = async (userId: number, userData: { name: string; email: string; role: 'USER' | 'ADMIN' | 'TUTOR' }) => {
    if (currentUser?.role === 'TUTOR' && userData.role !== 'USER') {
      alert('Tutores só podem editar usuários do tipo USER.');
      return;
    }
    try {
      const success = await userService.updateUser(userId, userData);
      if (success) {
        setUsers(users.map(user => 
          user.id === userId ? { ...user, ...userData } : user
        ));
      } else {
        alert('Erro ao atualizar usuário.');
      }
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
    }
  };

  const handleDelete = async () => {
    if (userToDelete !== null) {
      const user = users.find(u => u.id === userToDelete);
      if (currentUser?.role === 'TUTOR' && user?.role !== 'USER') {
        alert('Tutores só podem deletar usuários do tipo USER.');
        setIsDeleteModalOpen(false);
        return;
      }
      const success = await userService.deleteUser(userToDelete);
      if (success) {
        setUsers(users.filter(user => user.id !== userToDelete));
      } else {
        alert('Erro ao excluir usuário.');
      }
      setIsDeleteModalOpen(false);
    }
  };

  const openDeleteModal = (userId: number) => {
    setUserToDelete(userId);
    setIsDeleteModalOpen(true);
  };

  const handleAccessBoard = (user: User) => {
    setUser(user);
    navigate(`/user/${user.id}/board`);
  };

  const handleCreateUser = async (userData: { name: string; email: string; password: string; role: 'USER' | 'ADMIN' | 'TUTOR' }) => {
    if (currentUser?.role === 'TUTOR' && userData.role !== 'USER') {
      alert('Tutores só podem criar usuários do tipo USER.');
      return;
    }
    try {
      const createdUser = await userService.createUser(userData);
      console.log("Usuário criado retornado pelo backend:", createdUser);

      if (createdUser) {
        const mappedUser: User = {
          id: createdUser.id,
          name: createdUser.nome,
          email: createdUser.email,
          role: createdUser.role,
        };
        setUsers([...users, mappedUser]);
      } else {
        alert('Erro ao criar usuário.');
      }
    } catch (error) {
      console.error('Erro ao criar usuário:', error);
    }
  };

  return {
    users,
    isLoading,
    error,
    isModalOpen,
    isDeleteModalOpen,
    isEditModalOpen,
    userToEdit,
    currentUser,
    pageName,
    
    setIsModalOpen,
    setIsDeleteModalOpen,
    setIsEditModalOpen,
    
    handleLogout,
    openEditModal,
    handleUpdate,
    openDeleteModal,
    handleDelete,
    handleAccessBoard,
    handleCreateUser
  };
};