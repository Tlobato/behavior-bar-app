import React from 'react';
import './Header.css';
import { FaGift } from 'react-icons/fa';
import { useNavigate, useLocation } from 'react-router-dom';
import { HeaderProps } from '../../types';

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