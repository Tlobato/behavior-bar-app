import React, { useEffect, useState } from 'react';
import './UserManagement.css';
import { User } from '../../types';
import { userService } from '../../services/userService';
import { useNavigate } from 'react-router-dom';
import Header from '../Header/Header'; // Importa o Header
import UserCreateModal from '../UserCreateModal/UserCreateModal'; // Importa o componente do modal

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false); // Estado para controlar o modal

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

  // Lidar com criação de usuário
  const handleCreateUser = async (userData: { name: string; username: string; senha: string; role: 'USER' | 'ADMIN' }) => {
    try {
      // Normaliza o valor de role para minúsculas
      const normalizedUserData = {
        ...userData,
        role: userData.role.toLowerCase() as 'admin' | 'user',
      };

      const createdUser = await userService.createUser(normalizedUserData);
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
                    <td>
                      <button onClick={() => handleAccessBoard(user.id)} className="action-button">
                        <i className="fas fa-chart-bar"></i> Board
                      </button>
                      <button onClick={() => alert('Função de edição ainda não implementada.')} className="action-button">
                        <i className="fas fa-edit"></i> Editar
                      </button>
                      <button onClick={() => handleDelete(user.id)} className="action-button delete">
                        <i className="fas fa-trash"></i> Excluir
                      </button>
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