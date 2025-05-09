// src/components/BehaviorBar/BehaviorBar.tsx
import React from 'react';
import './BehaviorBar.css'; // Importa os estilos específicos do componente
import { BehaviorState } from '../../types';

interface BehaviorBarProps {
  behaviorState: BehaviorState;
  userName: string; // Adiciona a nova prop para o nome do usuário
}

const BehaviorBar: React.FC<BehaviorBarProps> = ({ behaviorState, userName }) => {
  const { currentPoints, maxPoints } = behaviorState;

  // Cálculo da porcentagem para definir o tamanho da barra
  const percentage = (currentPoints / maxPoints) * 100;

  // Determinar a cor da barra com base na pontuação
  const getBarColor = () => {
    if (percentage >= 90) return '#4CAF50'; // Verde para boa pontuação
    if (percentage >= 70) return '#FFC107'; // Amarelo para pontuação média
    return '#F44336'; // Vermelho para baixa pontuação
  };

  return (
    <div className="behavior-bar-container">
      {/* Atualiza o título para incluir o nome do usuário */}
      <h2>Barra de comportamento - {userName}</h2>

      <div className="score-display">
        <span className="score-text">{currentPoints} / {maxPoints} pontos</span>
      </div>

      <div className="bar-container">
        <div
          className="bar-fill"
          style={{
            width: `${percentage}%`,
            backgroundColor: getBarColor(),
          }}
        ></div>
      </div>

      <div className="status-message">
        {percentage >= 90 && <p>Muito bom! Continue assim! 👍</p>}
        {percentage < 90 && percentage >= 40 && <p>Tem espaço para melhorar! 🙂</p>}
        {percentage < 70 && <p>Vamos melhorar esse comportamento! 🙁</p>}
      </div>
    </div>
  );
};

export default BehaviorBar;