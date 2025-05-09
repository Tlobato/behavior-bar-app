import React, { useEffect, useState } from 'react';
import './UserManagement.css';
import { User } from '../../types';
import { userService } from '../../services/userService';
import { useNavigate } from 'react-router-dom';
import { FaTrash, FaEdit, FaChartBar } from 'react-icons/fa';
import Header from '../Header/Header';
import UserCreateModal from '../UserCreateModal/UserCreateModal';
import Modal from '../Modal/Modal'; // Importa o modal de confirmação

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false); // Controla o modal de exclusão
  const [userToDelete, setUserToDelete] = useState<number | null>(null); // Armazena o ID do usuário a ser excluído

  const navigate = useNavigate();

  // Carregar lista de usuários ao montar o componente
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const fetchedUsers = await userService.getUsers();
        setUsers(fetchedUsers);
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
  const handleAccessBoard = (userId: number) => {
    navigate(`/user/${userId}/board`);
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
      <Header projectName="Behavior Bar" userName="João Silva" onLogout={() => console.log('Logout')} />

      <main className="user-management-container">
        <div className="new-user-container">
          <div className="new-user-section">
            <h2>Novo Usuário</h2>
            <button onClick={() => setIsModalOpen(true)} className="new-user-button">Criar</button>
          </div>
        </div>

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
                        onClick={() => handleAccessBoard(user.id)}
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