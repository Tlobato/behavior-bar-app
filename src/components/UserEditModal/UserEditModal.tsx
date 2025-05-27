import React, { useState, useEffect } from 'react';
import './UserEditModal.css';
import { UserEditModalProps } from '../../types';
import { authService } from '../../services/authService';

const UserEditModal: React.FC<UserEditModalProps> = ({ isOpen, onClose, onUpdate, user }) => {
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    role: 'USER' as 'USER' | 'ADMIN',
  });

  const currentUser = authService.getCurrentUser();

  useEffect(() => {
    if (user) {
      setUserData({
        name: user.name,
        email: user.email,
        role: user.role as 'USER' | 'ADMIN',
      });
    }
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setUserData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleUpdate = () => {
    if (user) {
      onUpdate(user.id, userData);
      onClose();
    }
  };

  if (!isOpen || !user) return null;

  return (
    <div className="modal">
      <div className="modal-content">
        <h2>Editar Usuário</h2>
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

          <label>Papel:</label>
          <select
            name="role"
            value={userData.role}
            onChange={handleInputChange}
          >
            <option value="USER">Usuário</option>
            {currentUser?.role === 'ADMIN' && <option value="ADMIN">Administrador</option>}
            {currentUser?.role === 'ADMIN' && <option value="TUTOR">Tutor</option>}
          </select>

          <div className="modal-actions">
            <button type="button" onClick={handleUpdate} className="update-user-button">
              Atualizar
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

export default UserEditModal;