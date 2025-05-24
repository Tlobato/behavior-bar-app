import { useState, useEffect } from 'react';
import { User } from '../types';
import { userService } from '../services/userService';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { useUser } from '../contexts/UserContext';
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
  const { user: currentUser } = useUser();
  const pageName = usePageTitle();

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const fetchedUsers = await userService.getUsers();
        const mappedUsers = fetchedUsers.map(user => ({
          id: user.id,
          name: user.nome || user.name,
          email: user.email,
          role: user.role,
          rewardPoints: user.rewardPoints
        }));
        let filteredUsers = mappedUsers.filter(user => Number(user.id) !== Number(currentUser?.id));
        // Filtro extra para TUTOR: só vê USER
        if (currentUser?.role === 'TUTOR') {
          filteredUsers = filteredUsers.filter(user => user.role === 'USER');
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
  }, [currentUser]);

  const openEditModal = (user: User) => {
    setUserToEdit(user);
    setIsEditModalOpen(true);
  };

  const handleUpdate = async (userId: number, userData: { name: string; email: string; role: 'USER' | 'ADMIN' | 'TUTOR' }) => {
    try {
      await userService.updateUser(userId, userData);
      setUsers(prevUsers => prevUsers.map(user => 
        user.id === userId 
          ? { ...user, name: userData.name, email: userData.email, role: userData.role }
          : user
      ));
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      alert('Não foi possível atualizar o usuário. Por favor, tente novamente.');
    }
  };

  const handleDelete = async () => {
    if (userToDelete !== null) {
      try {
        await userService.deleteUser(userToDelete);
        setUsers(prevUsers => prevUsers.filter(user => user.id !== userToDelete));
        setIsDeleteModalOpen(false);
      } catch (error) {
        console.error('Erro ao excluir usuário:', error);
        alert('Não foi possível excluir o usuário. Por favor, tente novamente.');
      }
    }
  };

  const openDeleteModal = (userId: number) => {
    setUserToDelete(userId);
    setIsDeleteModalOpen(true);
  };

  const handleAccessBoard = (user: User) => {
    navigate(`/user/${user.id}/board`);
  };

  const handleCreateUser = async (userData: { name: string; email: string; senha: string; role: 'USER' | 'ADMIN' | 'TUTOR' }) => {
    try {
      const createdUser = await userService.createUser(userData);
      console.log("Usuário criado retornado pelo backend:", createdUser);

      if (createdUser) {
        const mappedUser: User = {
          id: createdUser.id,
          name: createdUser.nome || userData.name,
          email: createdUser.email,
          role: createdUser.role,
          rewardPoints: createdUser.rewardPoints,
          nome: createdUser.nome
        };
        setUsers(prevUsers => [...prevUsers, mappedUser]);
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