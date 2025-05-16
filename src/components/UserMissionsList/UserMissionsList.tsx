import React, { useEffect, useState } from 'react';
import { Mission } from '../../types';
import { missionService } from '../../services/missionService';
import { useNavigate } from 'react-router-dom';
import { FaTasks, FaClipboardList } from 'react-icons/fa';
import { formatDateTime } from '../../utils/dateUtils';
import './UserMissionsList.css';

interface UserMissionsListProps {
  userId: number;
}

const UserMissionsList: React.FC<UserMissionsListProps> = ({ userId }) => {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  
  const navigate = useNavigate();

  // Função para traduzir o status da missão
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

  // Buscar apenas missões do usuário atual
  useEffect(() => {
    const fetchUserMissions = async () => {
      if (!userId) return;
      
      setIsLoading(true);
      try {
        // Buscar todas as missões
        const allMissions = await missionService.getMissions();
        // Filtrar apenas as do usuário atual
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

  // Redirecionar para a página de gerenciamento de tarefas
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
          <ul className="missions-list">
            {missions.map(mission => (
              <li key={mission.id}>
                <div className="mission-info">
                  <strong className="mission-name">{mission.name}</strong>
                  <div className="mission-details">
                    <span>{translateStatus(mission.status)}</span>
                    <span style={{ float: 'right' }}>
                      {formatDateTime(mission.deadline)}
                    </span>
                  </div>
                </div>
                <FaTasks 
                  className="mission-icon" 
                  onClick={() => handleViewTasks(mission)} 
                  title="Ver Tarefas"
                />
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default UserMissionsList;