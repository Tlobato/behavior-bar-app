// src/components/BehaviorBar/BehaviorBar.tsx
import React from 'react';
import './BehaviorBar.css';
import { BehaviorState } from '../../types';

interface BehaviorBarProps {
  behaviorState: BehaviorState;
  userName: string;
}

const BehaviorBar: React.FC<BehaviorBarProps> = ({ behaviorState, userName }) => {
  const { currentPoints, maxPoints } = behaviorState;
  
  // Cálculo da porcentagem para definir o preenchimento da barra
  const percentage = (currentPoints / maxPoints) * 100;
  
  return (
    <div className="behavior-bar-container">
      <h2>{userName}</h2>
      
      <div className="thermometer-container">
        <div className="thermometer-bar">
          {/* Segmentos de cor completa */}
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
          
          {/* Camada de opacidade */}
          <div className="opacity-layer" style={{ width: `${100 - percentage}%`, right: '0' }}></div>
        </div>
      </div>
    </div>
  );
};

export default BehaviorBar;