import React, { useState, useEffect } from 'react';
import './UserCreateModal.css';
import { UserCreateModalProps } from '../../types';
import { authService } from '../../services/authService';

const UserCreateModal: React.FC<UserCreateModalProps> = ({ isOpen, onClose, onCreate }) => {
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    senha: '',
    role: 'USER' as 'USER' | 'ADMIN' | 'TUTOR',
  });

  const currentUser = authService.getCurrentUser();
  const isAdmin = currentUser?.role === 'ADMIN';
  const isTutor = currentUser?.role === 'TUTOR';

  useEffect(() => {
    // Se for tutor, força o papel como USER
    if (isTutor) {
      setUserData(prev => ({ ...prev, role: 'USER' }));
    }
  }, [isTutor]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setUserData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleCreate = () => {
    onCreate(userData);
    onClose();
  };

  if (!isOpen) return null;
  return (
    <div className="modal">
      <div className="modal-content">
        <h2>Criar Novo Usuário</h2>
        <div className="modal-divider"></div>
        <form autoComplete="off">
          <label>Nome:</label>
          <input
            type="text"
            name="name"
            value={userData.name}
            onChange={handleInputChange}
            autoComplete="off"
          />

          <label>Email:</label>
          <input
            type="email"
            name="email"
            value={userData.email}
            onChange={handleInputChange}
            autoComplete="off"
          />

          <label>Senha:</label>
          <input
            type="password"
            name="senha"
            value={userData.senha}
            onChange={handleInputChange}
            autoComplete="new-password"
          />

          <label>Papel:</label>
          <select
            name="role"
            value={userData.role}
            onChange={handleInputChange}
            disabled={isTutor} // Desabilita a seleção se for tutor
          >
            <option value="USER">Usuário</option>
            {isAdmin && <option value="TUTOR">Tutor</option>}
            {isAdmin && <option value="ADMIN">Administrador</option>}
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