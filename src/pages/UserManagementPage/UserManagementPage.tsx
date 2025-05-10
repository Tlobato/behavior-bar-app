import React, { useEffect, useState } from 'react';
import './UserManagementPage.css';
import { User } from '../../types';
import { userService } from '../../services/userService';
import { useNavigate } from 'react-router-dom';
import { FaTrash, FaEdit, FaChartBar } from 'react-icons/fa';
import { authService } from '../../services/authService';
import { useUser } from '../../context/UserContext'; // Importa o contexto do usuário
import Header from '../../components/Header/Header';
import UserCreateModal from '../../components/UserCreateModal/UserCreateModal';
import Modal from '../../components/Modal/Modal';
import NewRegistrationComponent from '../../components/NewRegistrationComponent/NewRegistrationComponent';

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false); // Controla o modal de exclusão
  const [userToDelete, setUserToDelete] = useState<number | null>(null); // Armazena o ID do usuário a ser excluído

  const navigate = useNavigate();
  const { setUser } = useUser(); // Usa o contexto para definir o usuário clicado

  // Obtém o usuário logado
  const currentUser = authService.getCurrentUser();

  // Função de logout
  const handleLogout = () => {
    authService.logout(); // Limpa o localStorage
    navigate('/login'); // Redireciona para a tela de login
  };

  // Carregar lista de usuários ao montar o componente
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const fetchedUsers = await userService.getUsers();
        // Filtra apenas os usuários com role "USER"
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

  // Excluir usuário
  const handleDelete = async () => {
    if (userToDelete !== null) {
      const success = await userService.deleteUser(userToDelete);
      if (success) {
        setUsers(users.filter(user => user.id !== userToDelete));
      } else {
        alert('Erro ao excluir usuário.');
      }
      setIsDeleteModalOpen(false); // Fecha o modal após a exclusão
    }
  };

  // Abrir o modal de exclusão
  const openDeleteModal = (userId: number) => {
    setUserToDelete(userId); // Define o usuário a ser excluído
    setIsDeleteModalOpen(true); // Abre o modal
  };

  // Redirecionar para o board do usuário
  const handleAccessBoard = (user: User) => {
    setUser(user); // Define o usuário clicado no contexto
    navigate(`/user/${user.id}/board`); // Redireciona para a página de board
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
        setUsers([...users, mappedUser]); // Atualiza a lista de usuários
      } else {
        alert('Erro ao criar usuário.');
      }
    } catch (error) {
      console.error('Erro ao criar usuário:', error);
    }
  };

  return (
    <div className="user-management-page">
      <Header
        projectName="Behavior Bar"
        userName={currentUser?.name || 'Usuário'}
        onLogout={handleLogout} // Passa a função de logout para o Header
      />

      <main className="user-management-container">
        <NewRegistrationComponent
          title="Novo Usuário"
          buttonText="Criar"
          onButtonClick={() => setIsModalOpen(true)}
        />

        {isLoading && <p>Carregando usuários...</p>}
        {error && <p className="error-message">{error}</p>}

        {!isLoading && !error && (
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
                        onClick={() => handleAccessBoard(user)} // Passa o objeto completo do usuário
                      >
                        <FaChartBar />
                      </div>
                      <div
                        className="action-icon"
                        title="Editar"
                        onClick={() => alert('Função de edição ainda não implementada.')}
                      >
                        <FaEdit />
                      </div>
                      <div
                        className="action-icon delete-icon"
                        title="Excluir"
                        onClick={() => openDeleteModal(user.id)} // Abre o modal de exclusão
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
      </main>

      <UserCreateModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreate={handleCreateUser}
      />

      {/* Modal de exclusão */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)} // Fecha o modal
        onConfirm={handleDelete} // Confirma a exclusão
        title="Excluir Usuário"
        message="Tem certeza que deseja excluir este usuário? Esta ação não pode ser desfeita."
      />
    </div>
  );
};

export default UserManagement;