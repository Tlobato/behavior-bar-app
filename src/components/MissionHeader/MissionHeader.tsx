import React from 'react';
import { FaCheckCircle } from 'react-icons/fa';
import { MissionHeaderProps } from '../../types';
import './MissionHeader.css';
import Confetti from 'react-confetti';

const MissionHeader: React.FC<MissionHeaderProps> = ({
  mission,
  user,
  tasks,
  missionProgress,
  isMissionCompleted,
}) => {
  if (!mission || !user) return null;

  return (
    <div className="mission-info-container" style={{ position: 'relative' }}>
      {isMissionCompleted && (
        <Confetti
          numberOfPieces={180}
          recycle={false}
          width={window.innerWidth}
          height={250}
          style={{ position: 'absolute', left: 0, top: 0, pointerEvents: 'none', zIndex: 10 }}
        />
      )}
      <h2>Missão: {mission.name}</h2>
      <p>Responsável: {user.name}</p>

      {tasks.length > 0 && (
        <div className="mission-progress-container">
          <div className="mission-progress-stats">
            <span>{missionProgress}% concluído</span>
            {isMissionCompleted && (
              <span className="mission-completed">
                <FaCheckCircle color="#4CAF50" /> Missão cumprida!
              </span>
            )}
          </div>
          <div className="mission-progress-bar">
            <div
              className={`mission-progress-fill ${isMissionCompleted ? 'completed' : ''}`}
              style={{ width: `${missionProgress}%` }}
            ></div>
          </div>
          <div className="mission-progress-details">
            <span>{tasks.filter(task => task.status === "APPROVED").length} de {tasks.length} tarefas concluídas</span>
            {mission?.deadline && (
              <span>
                Prazo: {new Date(mission.deadline).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MissionHeader;