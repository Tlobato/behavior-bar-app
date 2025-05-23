import React, { useState, useEffect } from 'react';
import './TaskEditModal.css';
import { MissionTask, MissionTaskStatus } from '../../types';

interface TaskEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (taskId: number, taskData: Partial<MissionTask>) => void;
  task: MissionTask | null;
}

const TaskEditModal: React.FC<TaskEditModalProps> = ({
  isOpen,
  onClose,
  onUpdate,
  task
}) => {
  const [taskData, setTaskData] = useState<Partial<MissionTask>>({
    name: '',
    status: MissionTaskStatus.AVAILABLE
  });

  useEffect(() => {
    if (task) {
      setTaskData({
        name: task.name,
        status: task.status
      });
    }
  }, [task]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setTaskData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleUpdate = () => {
    if (!task || !taskData.name) {
      alert('Por favor, preencha pelo menos o nome da tarefa.');
      return;
    }

    onUpdate(task.id, taskData);
    onClose();
  };

  if (!isOpen || !task) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Editar Tarefa</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>

        <form className="task-form">
          <div className="form-group">
            <label htmlFor="name">Nome da Tarefa</label>
            <input
              type="text"
              id="name"
              name="name"
              value={taskData.name}
              onChange={handleInputChange}
              placeholder="Digite o nome da tarefa"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="status">Status</label>
            <select
              id="status"
              name="status"
              value={taskData.status}
              onChange={(e) => setTaskData(prev => ({ ...prev, status: e.target.value as MissionTaskStatus }))}
              disabled
            >
              <option value={MissionTaskStatus.AVAILABLE}>Disponível</option>
              <option value={MissionTaskStatus.PENDING}>Pendente</option>
              <option value={MissionTaskStatus.APPROVED}>Aprovado</option>
              <option value={MissionTaskStatus.DENIED}>Negado</option>
            </select>
            <small>O status não pode ser alterado manualmente</small>
          </div>

          <div className="modal-actions">
            <button type="button" onClick={handleUpdate} className="update-task-button">
              Salvar
            </button>
            <button type="button" onClick={onClose} className="cancel-button">
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskEditModal; 