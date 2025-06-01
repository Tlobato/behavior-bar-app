import React from 'react';
import './BehaviorBar.css';
import { BehaviorBarProps } from '../../types';
import { FaGift } from 'react-icons/fa';

const BehaviorBar: React.FC<BehaviorBarProps> = ({ behaviorState, userName, rewardPoints }) => {
  const { currentPoints, maxPoints } = behaviorState;
  
  const percentage = Math.min(Math.max((currentPoints / maxPoints) * 100, 0), 100);
  
  return (
    <div className="behavior-bar-container">
      <div className="user-info">
        <h2>{userName}</h2>
        
        {rewardPoints !== undefined && (
          <div className="reward-points">
            <span className="gift-icon">
              <FaGift />
            </span>
            <span>{rewardPoints} pts</span>
          </div>
        )}
      </div>
      
      <div className="thermometer-container">
        <div className="thermometer-bar">
          <div className="segment segment-bad">
            <span className="segment-label">Ruim</span>
          </div>
          <div className="segment segment-regular">
            <span className="segment-label">Regular</span>
          </div>
          <div className="segment segment-good">
            <span className="segment-label">Bom</span>
          </div>
          <div className="segment segment-excellent">
            <span className="segment-label">Excelente</span>
          </div>
          
          <div className="opacity-layer" style={{ width: `${100 - percentage}%`, right: '0' }}></div>
        </div>
      </div>
    </div>
  );
};

export default BehaviorBar;