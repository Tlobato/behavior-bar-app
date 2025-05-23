import React from 'react';
import { UserListProps } from '../../types';
import { FaTrash, FaEdit, FaChartBar, FaUserFriends } from 'react-icons/fa';
import './UserList.css';

const UserList: React.FC<UserListProps> = ({
  users,
  isLoading,
  error,
  onAccessBoard,
  onEditUser,
  onDeleteUser
}) => {
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

  if (isLoading) {
    return <p className="loading-message">Carregando usuários...</p>;
  }

  if (error) {
    return <p className="error-message">{error}</p>;
  }

  if (users.length === 0) {
    return renderEmptyState();
  }

  return (
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
                {user.role === 'USER' && (
                  <div
                    className="action-icon"
                    title="Board"
                    onClick={() => onAccessBoard(user)}
                  >
                    <FaChartBar />
                  </div>
                )}
                <div
                  className="action-icon"
                  title="Editar"
                  onClick={() => onEditUser(user)}
                >
                  <FaEdit />
                </div>
                <div
                  className="action-icon delete-icon"
                  title="Excluir"
                  onClick={() => onDeleteUser(user.id)}
                >
                  <FaTrash />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UserList;