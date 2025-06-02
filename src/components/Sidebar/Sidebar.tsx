import React from 'react';
import './Sidebar.css';
import { FaUsers, FaStar, FaGift, FaChartBar, FaTasks, FaHistory } from 'react-icons/fa';
import { useNavigate, useLocation } from 'react-router-dom';
import { authService } from '../../services/authService';

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const pathname = location.pathname;

  const currentUser = authService.getCurrentUser();
  const isAdmin = currentUser?.role === 'ADMIN' || currentUser?.role === 'TUTOR';

  const isOnBoardPage = pathname.includes('/board');
  const isOnRewardsPage = pathname.includes('/rewards');
  const isOnUsersPage = pathname === '/users';
  const isOnMissionsPage = pathname.startsWith('/missions');

  return (
    <div className="sidebar">
      {isAdmin && !isOnUsersPage && (
        <div 
          className="sidebar-icon" 
          onClick={() => navigate('/users')} 
          title="Gerenciar Usuários"
        >
          <FaUsers />
        </div>
      )}

      {isAdmin && !isOnMissionsPage && (
        <div 
          className="sidebar-icon" 
          onClick={() => navigate('/missions')} 
          title="Gerenciar Missões"
        >
          <FaTasks />
        </div>
      )}

      {isAdmin && (
        <div
          className="sidebar-icon"
          onClick={() => navigate('/reward-redemptions')}
          title="Histórico de Resgates"
        >
          <FaHistory />
        </div>
      )}

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

      {(isOnBoardPage || isOnUsersPage || isOnMissionsPage || (pathname.startsWith('/missions/') && !isAdmin)) && !isOnRewardsPage && (
        <div 
          className="sidebar-icon" 
          onClick={() => navigate('/rewards')} 
          title="Recompensas"
        >
          <FaGift />
        </div>
      )}

      <div className="sidebar-icon placeholder" title="Wishlist (Futuro)">
        <FaStar />
      </div>
    </div>
  );
};

export default Sidebar;