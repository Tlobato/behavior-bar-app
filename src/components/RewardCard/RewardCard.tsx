import React from 'react';
import './RewardCard.css';
import { RewardCardProps } from '../../types';
import { FaImage } from 'react-icons/fa'; // Importando o ícone de imagem

const RewardCard: React.FC<RewardCardProps> = ({ title, imageUrl, points, isAvailable = false, onClick }) => {
  return (
    <div className="reward-card">
      <div className="image-container">
        {imageUrl ? (
          <img src={imageUrl} alt={title} className="reward-image" />
        ) : (
          <div className="placeholder-image">
            <FaImage size={50} color="#cccccc" />
          </div>
        )}
      </div>
      
      <div className="text-container">
        <h3 className="reward-title">{title}</h3>
      </div>
      
      <div className="action-container">
        <p className="reward-points">{points} pontos</p>
        <button
          className="reward-button"
          onClick={onClick}
          disabled={!isAvailable}
        >
          Resgatar Prêmio
        </button>
      </div>
    </div>
  );
};

export default RewardCard;