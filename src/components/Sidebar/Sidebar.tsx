import React from 'react';
import './Sidebar.css';
import { FaUsers, FaStar, FaGift, FaChartBar, FaTasks } from 'react-icons/fa'; // Adicionado FaTasks para Missões
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
  const isOnMissionsPage = pathname === '/missions'; // Adicionado para verificar se está na página de missões

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

      {/* Ícone de Missões - apenas para admins e não na própria página de missões */}
      {isAdmin && !isOnMissionsPage && (
        <div 
          className="sidebar-icon" 
          onClick={() => navigate('/missions')} 
          title="Gerenciar Missões"
        >
          <FaTasks />
        </div>
      )}

      {/* Ícone de Board - aparece na página de recompensas, mas não na própria página de board */}
      {!isAdmin && !isOnBoardPage && (
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

      {/* Ícone de recompensas - aparece no board, na página de usuários, e na página de missões, mas não na própria página de recompensas */}
      {(isOnBoardPage || isOnUsersPage || isOnMissionsPage) && !isOnRewardsPage && (
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