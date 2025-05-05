import React from 'react';
import './Header.css'; // Importa os estilos do componente

interface HeaderProps {
  projectName: string; // Nome do projeto
  userName: string;    // Nome do usuário logado
  onLogout: () => void; // Função para deslogar
}

const Header: React.FC<HeaderProps> = ({ projectName, userName, onLogout }) => {
  return (
    <header className="header">
      <div className="header-left">
        <h1 className="project-name">{projectName}</h1>
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