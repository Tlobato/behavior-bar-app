import React, { useEffect, useState } from 'react';
import './UserManagementPage.css';
import { User } from '../../types';
import { userService } from '../../services/userService';
import { useNavigate } from 'react-router-dom';
import { FaTrash, FaEdit, FaChartBar, FaUserFriends } from 'react-icons/fa';
import { authService } from '../../services/authService';
import { useUser } from '../../context/UserContext';
import Header from '../../components/Header/Header';
import UserCreateModal from '../../components/UserCreateModal/UserCreateModal';
import UserEditModal from '../../components/UserEditModal/UserEditModal';
import Modal from '../../components/Modal/Modal';
import NewRegistrationComponent from '../../components/NewRegistrationComponent/NewRegistrationComponent';
import Sidebar from '../../components/Sidebar/Sidebar';
import { usePageTitle } from '../../hooks/usePageTitle';

const UserManagement: React.FC = () => {
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

  // Carregar lista de usuários ao montar o componente
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const fetchedUsers = await userService.getUsers();
        const filteredUsers = fetchedUsers.filter(user => user.role === 'USER');
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

  // Abrir o modal de edição
  const openEditModal = (user: User) => {
    setUserToEdit(user);
    setIsEditModalOpen(true);
  };

  // Atualizar usuário
  const handleUpdate = async (userId: number, userData: { name: string; email: string; role: 'USER' | 'ADMIN' }) => {
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

  // Excluir usuário
  const handleDelete = async () => {
    if (userToDelete !== null) {
      const success = await userService.deleteUser(userToDelete);
      if (success) {
        setUsers(users.filter(user => user.id !== userToDelete));
      } else {
        alert('Erro ao excluir usuário.');
      }
      setIsDeleteModalOpen(false);
    }
  };

  // Abrir o modal de exclusão
  const openDeleteModal = (userId: number) => {
    setUserToDelete(userId);
    setIsDeleteModalOpen(true);
  };

  // Redirecionar para o board do usuário
  const handleAccessBoard = (user: User) => {
    setUser(user);
    navigate(`/user/${user.id}/board`);
  };

  const handleCreateUser = async (userData: { name: string; email: string; password: string; role: 'USER' | 'ADMIN' }) => {
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

  // Renderiza o estado vazio (sem usuários)
  const renderEmptyState = () => {
    return (
      <div className="empty-state">
        <div className="empty-icon">
          <FaUserFriends size={50} color="#cccccc" />
        </div>
        <h2>Nenhum usuário cadastrado</h2>
          <p>Crie seu primeiro usuário clicando no botão "Criar" acima!</p>
      </div>
    );
  };

  return (
    <div className="user-management-page">
      <Header
        projectName="Behavior Bar"
        userName={currentUser?.name || 'Usuário'}
        onLogout={handleLogout}
        pageName={pageName}
      />
      
      <div className="page-content">
        <Sidebar />
        
        <main className="main-content">
          <div className="user-management-container">
            <NewRegistrationComponent
              title="Novo Usuário"
              buttonText="Criar"
              onButtonClick={() => setIsModalOpen(true)}
            />

            {isLoading && <p>Carregando usuários...</p>}
            {error && <p className="error-message">{error}</p>}

            {!isLoading && !error && users.length === 0 && renderEmptyState()}

            {!isLoading && !error && users.length > 0 && (
              <div className="table-container">
                <table className="user-table">
                  <thead>
                    <tr>
                      <th>Nome</th>
                      <th>Email</th>
                      <th>Papel</th>
                      <th>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(user => (
                      <tr key={user.id}>
                        <td>{user.name}</td>
                        <td>{user.email}</td>
                        <td>{user.role}</td>
                        <td className="action-icons">
                          <div
                            className="action-icon"
                            title="Board"
                            onClick={() => handleAccessBoard(user)}
                          >
                            <FaChartBar />
                          </div>
                          <div
                            className="action-icon"
                            title="Editar"
                            onClick={() => openEditModal(user)}
                          >
                            <FaEdit />
                          </div>
                          <div
                            className="action-icon delete-icon"
                            title="Excluir"
                            onClick={() => openDeleteModal(user.id)}
                          >
                            <FaTrash />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>

      <UserCreateModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreate={handleCreateUser}
      />

      <UserEditModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onUpdate={handleUpdate}
        user={userToEdit}
      />

      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Excluir Usuário"
        message="Tem certeza que deseja excluir este usuário? Esta ação não pode ser desfeita."
      />
    </div>
  );
};

export default UserManagement;