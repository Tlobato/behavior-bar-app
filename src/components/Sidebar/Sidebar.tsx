import React from 'react';
import './Sidebar.css';
import { FaUsers, FaStar, FaGift, FaChartBar } from 'react-icons/fa'; // Adicionei FaChartBar para Board
import { useNavigate, useLocation } from 'react-router-dom';
import { authService } from '../../services/authService';

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const pathname = location.pathname;

  // Obter o usuário atual e verificar se é admin
  const currentUser = authService.getCurrentUser();
  const isAdmin = currentUser?.role === 'ADMIN';

  // Verificar páginas atuais
  const isOnBoardPage = pathname.includes('/board');
  const isOnRewardsPage = pathname.includes('/rewards');
  const isOnUsersPage = pathname === '/users';

  return (
    <div className="sidebar">
      {/* Ícone de usuários - apenas para admins e não na própria página de usuários */}
      {isAdmin && !isOnUsersPage && (
        <div 
          className="sidebar-icon" 
          onClick={() => navigate('/users')} 
          title="Gerenciar Usuários"
        >
          <FaUsers />
        </div>
      )}

      {/* Ícone de Board - aparece na página de recompensas, mas não na própria página de board */}
      {!isOnBoardPage && (
        <div 
          className="sidebar-icon" 
          onClick={() => navigate(
            currentUser ? `/user/${currentUser.id}/board` : '/'
          )} 
          title="Board de Pontuação"
        >
          <FaChartBar />
        </div>
      )}

      {/* Ícone de recompensas - aparece no board e na página de usuários, mas não na própria página de recompensas */}
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