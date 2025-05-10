// Header.tsx
import React from 'react';
import './Header.css';
import { FaGift } from 'react-icons/fa';
import { useNavigate, useLocation } from 'react-router-dom'; // Adicionamos useLocation

interface HeaderProps {
  projectName: string;
  userName: string;
  onLogout: () => void;
  pageName?: string;
}

const Header: React.FC<HeaderProps> = ({ projectName, userName, onLogout, pageName }) => {
  const navigate = useNavigate();
  const location = useLocation(); // Para obter a rota atual
  
  // Verifica se o usuário está na página de recompensas
  const isRewardsPage = location.pathname.includes('/rewards');
  
  const goToRewards = () => {
    navigate('/rewards');
  };

  return (
    <header className="header">
      <div className="header-left">
        <h1 className="project-name">
          {projectName}
          {pageName && (
            <>
              <span className="page-divider"> | </span>
              <span className="page-name">{pageName}</span>
            </>
          )}
        </h1>
      </div>
      <div className="header-right">
        {/* Ícone de recompensas - só exibe quando NÃO estamos na página de recompensas */}
        {!isRewardsPage && (
          <div className="header-icon" onClick={goToRewards} title="Recompensas">
            <FaGift />
          </div>
        )}
        <span className="user-name">{userName}</span>
        <span className="profile-icon">👤</span>
        <button className="logout-button-header" onClick={onLogout}>
          Sair
        </button>
      </div>
    </header>
  );
};

export default Header;