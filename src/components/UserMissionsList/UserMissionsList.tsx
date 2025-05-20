import React, { useEffect, useState } from 'react';
import { Mission, UserMissionsListProps } from '../../types';
import { missionService } from '../../services/missionService';
import { useNavigate } from 'react-router-dom';
import { FaTasks, FaClipboardList, FaClock } from 'react-icons/fa';
import { formatDateTime } from '../../utils/dateUtils';
import './UserMissionsList.css';

const UserMissionsList: React.FC<UserMissionsListProps> = ({ userId }) => {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  
  const navigate = useNavigate();

  const translateStatus = (status: string): string => {
    switch (status) {
      case 'IN_PROGRESS':
        return 'Em progresso';
      case 'COMPLETED':
        return 'Finalizada';
      case 'FAIL':
        return 'Não concluída';
      default:
        return status;
    }
  };

  useEffect(() => {
    const fetchUserMissions = async () => {
      if (!userId) return;
      
      setIsLoading(true);
      try {
        const allMissions = await missionService.getMissions();
        const userMissions = allMissions.filter(mission => mission.userId === userId);
        setMissions(userMissions);
      } catch (err) {
        console.error('Erro ao buscar missões do usuário:', err);
        setError('Não foi possível carregar suas missões.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserMissions();
  }, [userId]);

  const handleViewTasks = (mission: Mission) => {
    navigate(`/missions/${mission.id}/tasks`);
  };

  return (
    <div className="missions-section">
      <h3>Minhas Missões</h3>
      
      {isLoading && <p>Carregando missões...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      
      {!isLoading && !error && missions.length === 0 ? (
        <div className="missions-empty">
          <div className="missions-empty-icon">
            <FaClipboardList />
          </div>
          <p>Sem missões atribuídas. Aguarde novas designações!</p>
        </div>
      ) : (
        <div className="missions-list-container">
          <div className="missions-header">
            <span className="mission-title-header">Missão</span>
            <span className="mission-status-header">Status</span>
            <span className="mission-deadline-header">Prazo</span>
            <span className="mission-tasks-header">Tarefas</span>
          </div>
          <ul className="missions-list">
            {missions.map(mission => (
              <li key={mission.id}>
                <span className="mission-title">{mission.name}</span>
                <span className="mission-status">{translateStatus(mission.status)}</span>
                <span className="mission-deadline">
                  <FaClock 
                    className="deadline-icon" 
                    title={formatDateTime(mission.deadline)}
                  />
                </span>
                <span className="mission-tasks">
                  <FaTasks 
                    className="mission-icon" 
                    onClick={() => handleViewTasks(mission)} 
                    title="Ver Tarefas"
                  />
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default UserMissionsList;