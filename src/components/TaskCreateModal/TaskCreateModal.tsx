import React, { useState } from 'react';
import './TaskCreateModal.css';
import { MissionTask, MissionTaskStatus } from '../../types';

interface TaskCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (task: Partial<MissionTask>) => void;
  missionId: number;
}

const TaskCreateModal: React.FC<TaskCreateModalProps> = ({ 
  isOpen, 
  onClose, 
  onCreate, 
  missionId 
}) => {
  const [taskData, setTaskData] = useState<Partial<MissionTask>>({
    name: '',
    description: '',
    status: MissionTaskStatus.AVAILABLE,
    missionId: missionId,
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setTaskData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCreate = () => {
    if (!taskData.name) {
      alert('Por favor, preencha pelo menos o nome da tarefa.');
      return;
    }

    // Garantir que o missionId esteja definido
    onCreate({
      ...taskData,
      missionId: missionId
    });
    resetForm();
  };

  const resetForm = () => {
    setTaskData({
      name: '',
      description: '',
      status: MissionTaskStatus.AVAILABLE,
      missionId: missionId,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="modal">
      <div className="modal-content task-modal-content">
        <h2>Criar Nova Tarefa</h2>
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
              onClick={handleCreate} 
              className="create-task-button"
            >
              Criar
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

export default TaskCreateModal;