import React, { useEffect, useState } from 'react';
import './UserManagement.css';
import { User } from '../../types';
import { userService } from '../../services/userService';
import { useNavigate } from 'react-router-dom';
import { FaTrash, FaEdit, FaChartBar } from 'react-icons/fa'; // Importa ícones do React Icons
import Header from '../Header/Header';
import UserCreateModal from '../UserCreateModal/UserCreateModal'; // Importa o componente do modal

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

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
  const handleDelete = async (userId: number) => {
    if (window.confirm('Tem certeza que deseja excluir este usuário?')) {
      const success = await userService.deleteUser(userId);
      if (success) {
        setUsers(users.filter(user => user.id !== userId));
      } else {
        alert('Erro ao excluir usuário.');
      }
    }
  };

  // Redirecionar para o board do usuário
  const handleAccessBoard = (userId: number) => {
    navigate(`/user/${userId}/board`);
  };

  const handleCreateUser = async (userData: { name: string; username: string; senha: string; role: 'USER' | 'ADMIN' }) => {
    try {
      const createdUser = await userService.createUser(userData); // Envia os dados diretamente sem conversão
      if (createdUser) {
        setUsers([...users, createdUser]); // Adiciona o novo usuário à lista
      } else {
        alert('Erro ao criar usuário.');
      }
    } catch (error) {
      console.error('Erro ao criar usuário:', error);
    }
  };

  return (
    <div className="user-management-page">
      {/* Header */}
      <Header projectName="Behavior Bar" userName="João Silva" onLogout={() => console.log('Logout')} />

      <main className="user-management-container">
        {/* Container de Novo Usuário */}
        <div className="new-user-container">
          <div className="new-user-section">
            <h2>Novo Usuário</h2>
            <button onClick={() => setIsModalOpen(true)} className="new-user-button">Criar</button>
          </div>
        </div>

        {/* Mensagem de erro ou carregamento */}
        {isLoading && <p>Carregando usuários...</p>}
        {error && <p className="error-message">{error}</p>}

        {/* Tabela de Usuários */}
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
                    <td>{user.username}</td>
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
                        onClick={() => handleDelete(user.id)}
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

      {/* Modal de criação de usuário */}
      <UserCreateModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreate={handleCreateUser}
      />
    </div>
  );
};

export default UserManagement;