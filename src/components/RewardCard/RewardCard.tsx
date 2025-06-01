import React, { useState } from 'react';
import './RewardCard.css';
import { RewardCardProps } from '../../types';
import { FaImage, FaEdit, FaTrash, FaCheckCircle } from 'react-icons/fa';
import { authService } from '../../services/authService';

const RewardCard: React.FC<RewardCardProps> = ({
  title,
  description = "Descrição não disponível",
  imageUrl,
  points,
  isAvailable = false,
  onClick,
  onEdit,
  onDelete,
  isRedeemed,
  onInsufficientPoints
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

  const handleDisabledClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onInsufficientPoints) onInsufficientPoints();
  };

  return (
    <div className="reward-card-wrapper">
      <div className={`reward-card ${isFlipped ? 'is-flipped' : ''}`}>
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
            ) : isRedeemed ? (
              <button
                className="reward-redeemed-btn"
                disabled
              >
                <FaCheckCircle style={{ color: '#4CAF50', marginRight: 6 }} />
                Resgatada
              </button>
            ) : !isAvailable ? (
              <button
                className="reward-redeemed-btn"
                onClick={handleDisabledClick}
              >
                Resgatar Prêmio
              </button>
            ) : (
              <button
                className="redeem-mission-btn"
                onClick={handleRedeemClick}
              >
                Resgatar Prêmio
              </button>
            )}
          </div>
        </div>

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