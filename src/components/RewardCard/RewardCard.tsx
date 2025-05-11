import React from 'react';
import './RewardCard.css';
import { RewardCardProps } from '../../types';
import { FaImage, FaEdit, FaTrash } from 'react-icons/fa';
import { authService } from '../../services/authService';

const RewardCard: React.FC<RewardCardProps> = ({ 
  title, 
  imageUrl, 
  points, 
  isAvailable = false, 
  onClick, 
  onEdit, 
  onDelete 
}) => {
  const isAdmin = authService.isAdmin();

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
        
        {isAdmin ? (
          <div className="admin-buttons">
            <button 
              className="edit-button" 
              onClick={onEdit}
            >
              <FaEdit /> Editar
            </button>
            <button 
              className="delete-button" 
              onClick={onDelete}
            >
              <FaTrash /> Excluir
            </button>
          </div>
        ) : (
          <button
            className="reward-button"
            onClick={onClick}
            disabled={!isAvailable}
          >
            Resgatar Prêmio
          </button>
        )}
      </div>
    </div>
  );
};

export default RewardCard;