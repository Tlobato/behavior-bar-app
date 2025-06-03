import React, { useState, useEffect } from 'react';
import './Header.css';
import { FaGift } from 'react-icons/fa';
import { useNavigate, useLocation } from 'react-router-dom';
import { HeaderProps } from '../../types';
import NotificationBell, { Notification } from '../NotificationBell/NotificationBell';
import { notificationService } from '../../services/notificationService';

const Header: React.FC<HeaderProps> = ({
  projectName,
  userName,
  onLogout,
  pageName,
  rewardPoints,
  userRole
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  const isRewardsPage = location.pathname.includes('/rewards');
  const isUserType = userRole === 'USER';

  const goToRewards = () => {
    if (!isRewardsPage) {
      navigate('/rewards');
    }
  };

  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    async function fetchNotifications() {
      const data = await notificationService.getNotifications();
      setNotifications(data);
    }
    fetchNotifications();
  }, []);

  const handleMarkAsRead = async (id: number) => {
    const success = await notificationService.markAsRead(id);
    if (success) {
      setNotifications((prev) => prev.map(n => n.id === id ? { ...n, read: true } : n));
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    if (notification.type === 'REWARD_REDEMPTION' && notification.redemptionId) {
      navigate(`/reward-redemptions?highlight=${notification.redemptionId}`);
    }
    // Outros tipos de notificação podem ser tratados aqui
  };

  const handleClearAllNotifications = async () => {
    const success = await notificationService.markAllAsRead();
    if (success) {
      setNotifications([]);
    }
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
        <NotificationBell
          notifications={notifications}
          onMarkAsRead={handleMarkAsRead}
          onNotificationClick={handleNotificationClick}
          onClearAll={handleClearAllNotifications}
        />
        {isUserType && (
          <div className="reward-points-container">
            <span className="reward-points">{rewardPoints}</span>
            <div
              className={`header-icon ${isRewardsPage ? 'disabled-icon' : ''}`}
              onClick={!isRewardsPage ? goToRewards : undefined}
              title={isRewardsPage ? "Você está na página de recompensas" : "Recompensas"}
            >
              <FaGift />
            </div>
          </div>
        )}

        {!isUserType && !isRewardsPage && (
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