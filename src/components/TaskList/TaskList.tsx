import React from 'react';
import './TaskList.css';
import { FaTrash, FaEdit, FaCheck, FaTimes, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';
import { MissionTaskStatus, TaskListProps } from '../../types';
import { formatDateTime } from '../../utils/dateUtils';
import { translateStatus } from '../../utils/statusUtils';

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
                {!isAdmin && (
                  <>
                    {(task.status === MissionTaskStatus.AVAILABLE || task.status === MissionTaskStatus.DENIED) && (
                      <div
                        className="action-icon complete-task-icon"
                        title={task.status === MissionTaskStatus.DENIED ? "Tentar novamente" : "Marcar como concluído"}
                        onClick={() => onCompleteTask(task.id)}
                      >
                        <FaCheckCircle />
                      </div>
                    )}

                    {task.status === MissionTaskStatus.PENDING && (
                      <div
                        className="action-icon pending-icon"
                        title="Aguardando avaliação do Administrador"
                      >
                        <FaExclamationCircle />
                      </div>
                    )}
                    
                    {task.status === MissionTaskStatus.APPROVED && (
                      <div
                        className="action-icon approved-icon"
                        title="Tarefa aprovada"
                      >
                        <FaCheckCircle />
                      </div>
                    )}
                  </>
                )}

                {isAdmin && (
                  <>
                    {task.status === MissionTaskStatus.PENDING && (
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
                    
                    {task.status === MissionTaskStatus.APPROVED && (
                      <div
                        className="action-icon approved-icon"
                        title="Tarefa aprovada"
                      >
                        <FaCheckCircle />
                      </div>
                    )}
                    
                    {task.status !== MissionTaskStatus.APPROVED && (
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