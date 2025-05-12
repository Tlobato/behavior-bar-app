import React from 'react';
import { Infraction } from '../../types';
import './BehaviorHistory.css';

interface BehaviorHistoryProps {
  infractions: Infraction[];
  formatDate: (date: Date) => string;
  isAdmin: boolean;
}

const BehaviorHistory: React.FC<BehaviorHistoryProps> = ({ infractions, formatDate, isAdmin }) => {
  return (
    <div className="history-section">
      <h3>Histórico de Comportamentos</h3>
      {infractions.length === 0 ? (
        <p>Sem comportamentos registrados. Ótimo trabalho!</p>
      ) : (
        <div className="infraction-list-container">
          <ul className="infraction-list">
            {infractions.map((infraction: Infraction) => (
              <li key={infraction.id}>
                <strong>
                  {infraction.customDescription || infraction.behaviorTypeName || "Sem descrição disponível"}
                </strong>
                <div>
                  <span>{infraction.points} pontos</span>
                  <span style={{ float: 'right' }}>{formatDate(infraction.timestamp)}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default BehaviorHistory;