import React from 'react';
import './Sidebar.css';
import { FaUsers, FaStar, FaGift } from 'react-icons/fa'; // Adicionei FaGift para recompensas
import { useNavigate, useLocation } from 'react-router-dom'; // Adicionei useLocation

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation(); // Para obter a localização atual
  const pathname = location.pathname;

  // Verifica se estamos na página BoardPage (pode ter URLs como /user/123/board)
  const isOnBoardPage = pathname.includes('/board');
  // Verifica se estamos na página de recompensas
  const isOnRewardsPage = pathname.includes('/rewards');
  // Verifica se estamos na página de usuários
  const isOnUsersPage = pathname === '/users';

  return (
    <div className="sidebar">
      {/* Ícone de usuários - aparece em todas as páginas, exceto na própria página de usuários */}
      {!isOnUsersPage && (
        <div 
          className="sidebar-icon" 
          onClick={() => navigate('/users')} 
          title="Gerenciar Usuários"
        >
          <FaUsers />
        </div>
      )}

      {/* Ícone de recompensas - aparece na BoardPage e na página de usuários, mas não na própria página de recompensas */}
      {(isOnBoardPage || isOnUsersPage) && !isOnRewardsPage && (
        <div 
          className="sidebar-icon" 
          onClick={() => navigate('/rewards')} 
          title="Recompensas"
        >
          <FaGift />
        </div>
      )}

      {/* Ícone de estrela - aparece como placeholder em todas as páginas */}
      <div className="sidebar-icon placeholder" title="Wishlist (Futuro)">
        <FaStar />
      </div>
    </div>
  );
};

export default Sidebar;