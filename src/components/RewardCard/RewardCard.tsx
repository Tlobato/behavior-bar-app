import React, { useState } from 'react';
import './RewardCard.css';
import { RewardCardProps } from '../../types';
import { FaImage, FaEdit, FaTrash } from 'react-icons/fa';
import { authService } from '../../services/authService';

const RewardCard: React.FC<RewardCardProps> = ({ 
  title, 
  description = "Descrição não disponível",
  imageUrl, 
  points, 
  isAvailable = false, 
  onClick, 
  onEdit, 
  onDelete 
}) => {
  const isAdmin = authService.isAdmin();
  const [isFlipped, setIsFlipped] = useState(false);

  const handleFlip = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    const target = e.target as HTMLElement;
    if (
      target.tagName === 'BUTTON' || 
      target.closest('button') ||
      target.classList.contains('edit-button') || 
      target.classList.contains('delete-button')
    ) {
      return;
    }
    
    setIsFlipped(!isFlipped);
  };

  const handleRedeemClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onClick) onClick();
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onEdit) onEdit();
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete) onDelete();
  };

  return (
    <div className="reward-card-wrapper">
      <div className={`reward-card ${isFlipped ? 'is-flipped' : ''}`}>
        {/* Frente do Card */}
        <div className="card-front" onClick={handleFlip}>
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
                  onClick={handleEditClick}
                >
                  <FaEdit /> Editar
                </button>
                <button 
                  className="delete-button" 
                  onClick={handleDeleteClick}
                >
                  <FaTrash /> Excluir
                </button>
              </div>
            ) : (
              <button
                className="reward-button"
                onClick={handleRedeemClick}
                disabled={!isAvailable}
              >
                Resgatar Prêmio
              </button>
            )}
          </div>
        </div>

        {/* Verso do Card */}
        <div className="card-back" onClick={handleFlip}>
          <div className="card-back-content">
            <h3 className="card-back-title">{title}</h3>
            <p className="card-back-description">{description}</p>
            <p className="card-back-points">{points} pontos</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RewardCard;