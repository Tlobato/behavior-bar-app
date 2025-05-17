import React from 'react';
import './TaskList.css';
import { FaTrash, FaEdit, FaCheck, FaTimes, FaCheckCircle } from 'react-icons/fa';
import { Mission, MissionTask, MissionTaskStatus } from '../../types';
import { formatDateTime } from '../../utils/dateUtils';

interface TaskListProps {
  tasks: MissionTask[];
  mission: Mission | null;
  isAdmin: boolean;
  isLoading: boolean;
  error: string;
  onCompleteTask: (taskId: number) => void;
  onAcceptTask: (taskId: number) => void;
  onRejectTask: (taskId: number) => void;
  onEditTask: (taskId: number) => void;
  onDeleteTask: (taskId: number) => void;
}

const TaskList: React.FC<TaskListProps> = ({
  tasks,
  mission,
  isAdmin,
  isLoading,
  error,
  onCompleteTask,
  onAcceptTask,
  onRejectTask,
  onEditTask,
  onDeleteTask
}) => {
  // Função para traduzir o status da tarefa
  const translateStatus = (status: MissionTaskStatus): string => {
    switch (status) {
      case MissionTaskStatus.AVAILABLE:
        return 'Disponível';
      case MissionTaskStatus.PENDING:
        return 'Aguardando Avaliação';
      case MissionTaskStatus.APPROVED:
        return 'Aprovada';
      case MissionTaskStatus.DENIED:
        return 'Negada';
      default:
        return status;
    }
  };

  if (isLoading) {
    return <p className="loading-message">Carregando tarefas...</p>;
  }

  if (error) {
    return <p className="error-message">{error}</p>;
  }

  return (
    <div className="table-container">
      <table className="task-table">
        <thead>
          <tr>
            <th>Tarefa</th>
            <th>Status</th>
            <th>Prazo</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map(task => (
            <tr key={task.id}>
              <td>{task.name}</td>
              <td>{translateStatus(task.status)}</td>
              <td>{mission?.deadline ? formatDateTime(mission.deadline) : 'Sem prazo'}</td>
              <td className="action-icons">
                {/* Botão de marcar como concluído para tarefas disponíveis (para usuários) */}
                {!isAdmin && task.status === MissionTaskStatus.AVAILABLE && (
                  <div
                    className="action-icon complete-task-icon"
                    title="Marcar como concluído"
                    onClick={() => onCompleteTask(task.id)}
                  >
                    <FaCheckCircle />
                  </div>
                )}
              
                {/* Exibir botões de aceitar/rejeitar apenas para admins e quando o status for PENDING */}
                {isAdmin && task.status === MissionTaskStatus.PENDING && (
                  <>
                    <div
                      className="action-icon accept-icon"
                      title="Aceitar"
                      onClick={() => onAcceptTask(task.id)}
                    >
                      <FaCheck />
                    </div>
                    <div
                      className="action-icon reject-icon"
                      title="Rejeitar"
                      onClick={() => onRejectTask(task.id)}
                    >
                      <FaTimes />
                    </div>
                  </>
                )}
                
                {/* Exibir botões de editar/excluir apenas para admins */}
                {isAdmin && (
                  <>
                    <div
                      className="action-icon"
                      title="Editar"
                      onClick={() => onEditTask(task.id)}
                    >
                      <FaEdit />
                    </div>
                    <div
                      className="action-icon delete-icon"
                      title="Excluir"
                      onClick={() => onDeleteTask(task.id)}
                    >
                      <FaTrash />
                    </div>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TaskList;