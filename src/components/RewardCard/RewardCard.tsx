import React from 'react';
import './RewardCard.css'; // Importa o CSS para aplicar os estilos definidos
import { RewardCardProps } from '../../types';

const RewardCard: React.FC<RewardCardProps> = ({ title, imageUrl, points, isAvailable = false, onClick }) => {
  return (
    <div className="reward-card">
      <img src={imageUrl} alt={title} className="reward-image" />
      <h3 className="reward-title">{title}</h3>
      <p className="reward-points">{points} pontos</p>
      <button
        className="reward-button"
        onClick={onClick} // Chama a função passada como prop
        disabled={!isAvailable} // Desativa o botão se a funcionalidade ainda não estiver implementada
      >
        Resgatar Prêmio
      </button>
    </div>
  );
};

export default RewardCard;