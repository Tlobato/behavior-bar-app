import React from 'react';
import './Sidebar.css';
import { FaUsers, FaStar } from 'react-icons/fa'; // Importa os ícones do react-icons
import { useNavigate } from 'react-router-dom';

const Sidebar: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="sidebar">
      <div className="sidebar-icon" onClick={() => navigate('/users')} title="Gerenciar Usuários">
        <FaUsers /> {/* Usa o ícone diretamente */}
      </div>
      <div className="sidebar-icon placeholder" title="Wishlist (Futuro)">
        <FaStar /> {/* Usa o ícone diretamente */}
      </div>
    </div>
  );
};

export default Sidebar;