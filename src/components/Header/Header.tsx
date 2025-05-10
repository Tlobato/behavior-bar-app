// Header.tsx
import React from 'react';
import './Header.css';

interface HeaderProps {
  projectName: string;
  userName: string;
  onLogout: () => void;
  pageName?: string; // Nova prop opcional para o nome da página
}

const Header: React.FC<HeaderProps> = ({ projectName, userName, onLogout, pageName }) => {
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