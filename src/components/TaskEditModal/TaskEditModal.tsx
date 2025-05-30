import React, { useState, useEffect } from 'react';
import '../TaskCreateModal/TaskCreateModal.css';
import { MissionTask, MissionTaskStatus } from '../../types';

interface TaskEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (taskId: number, updatedTask: Partial<MissionTask>) => void;
  task: MissionTask | null;
}

const TaskEditModal: React.FC<TaskEditModalProps> = ({ isOpen, onClose, onUpdate, task }) => {
  const [taskData, setTaskData] = useState<Partial<MissionTask>>({
    name: '',
    description: '',
    status: MissionTaskStatus.AVAILABLE,
  });

  useEffect(() => {
    if (task && isOpen) {
      setTaskData({
        name: task.name,
        description: task.description || '',
        status: task.status,
      });
    }
  }, [task, isOpen]);

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
    if (!taskData.name) {
      alert('Por favor, preencha o nome da tarefa.');
      return;
    }
    if (task) {
      onUpdate(task.id, taskData);
    }
  };

  if (!isOpen || !task) return null;

  return (
    <div className="modal">
      <div className="modal-content task-modal-content">
        <h2>Editar Tarefa</h2>
        <div className="modal-divider"></div>

        <form autoComplete="off">
          <label>Nome da Tarefa:</label>
          <input
            type="text"
            name="name"
            value={taskData.name || ''}
            onChange={handleInputChange}
            placeholder="Ex: Implementar funcionalidade X"
          />

          <label>Descrição (opcional):</label>
          <textarea
            name="description"
            value={taskData.description || ''}
            onChange={handleInputChange}
            rows={4}
            placeholder="Descreva os detalhes da tarefa..."
          />

          <div className="modal-actions">
            <button
              type="button"
              onClick={handleUpdate}
              className="create-task-button"
            >
              Salvar
            </button>
            <button
              type="button"
              onClick={onClose}
              className="cancel-button"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskEditModal; 