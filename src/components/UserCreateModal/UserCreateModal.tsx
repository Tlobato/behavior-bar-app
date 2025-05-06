import React, { useState } from 'react';
import './UserCreateModal.css';

interface UserCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (userData: { name: string; username: string; senha: string; role: 'USER' | 'ADMIN' }) => void;
}

const UserCreateModal: React.FC<UserCreateModalProps> = ({ isOpen, onClose, onCreate }) => {
  const [userData, setUserData] = useState({
    name: '', // Nome inicial vazio
    username: '', // Email inicial vazio
    senha: '', // Senha inicial vazia
    role: 'USER' as 'USER' | 'ADMIN', // Papel padrão como "USER"
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setUserData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleCreate = () => {
    onCreate(userData); // Passa os dados do usuário para o método de criação
    onClose(); // Fecha o modal
  };

  if (!isOpen) return null; // Não renderiza o modal se ele estiver fechado

  return (
    <div className="modal">
      <div className="modal-content">
        <h2>Criar Novo Usuário</h2>
        <div className="modal-divider"></div> {/* Divider abaixo do título */}
        <form autoComplete="off"> {/* Desativa o autocompletar no formulário */}
          <label>Nome:</label>
          <input
            type="text"
            name="name"
            value={userData.name}
            onChange={handleInputChange}
            autoComplete="off" /* Desativa o autocompletar */
          />

          <label>Email:</label>
          <input
            type="email"
            name="username"
            value={userData.username}
            onChange={handleInputChange}
            autoComplete="off" /* Desativa o autocompletar */
          />

          <label>Senha:</label>
          <input
            type="password"
            name="senha"
            value={userData.senha}
            onChange={handleInputChange}
            autoComplete="new-password" /* Valor recomendado para senhas */
          />

          <label>Papel:</label>
          <select
            name="role"
            value={userData.role}
            onChange={handleInputChange}
          >
            <option value="USER">Usuário</option>
            <option value="ADMIN">Administrador</option>
          </select>

          <div className="modal-actions">
            <button type="button" onClick={handleCreate} className="create-user-button">
              Criar
            </button>
            <button type="button" onClick={onClose} className="cancel-button">
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserCreateModal;