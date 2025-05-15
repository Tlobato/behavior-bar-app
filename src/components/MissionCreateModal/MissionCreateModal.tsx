import React, { useState } from 'react';
import './MissionCreateModal.css';

interface MissionCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (missionData: {
    name: string;
    description: string;
    rewardPoints: number;
    deadline: string;
    userId: number;
  }) => void;
}

const MissionCreateModal: React.FC<MissionCreateModalProps> = ({ isOpen, onClose, onCreate }) => {
  const [missionData, setMissionData] = useState({
    name: '',
    description: '',
    rewardPoints: 0,
    deadline: '',
    userId: 0,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;

    if (type === 'number') {
      setMissionData((prev) => ({
        ...prev,
        [name]: value ? parseInt(value, 10) : 0,
      }));
    } else {
      setMissionData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleCreate = () => {
    const { name, description, rewardPoints, deadline, userId } = missionData;

    // Validação básica
    if (!name || !description || !rewardPoints || !deadline || !userId) {
      alert('Por favor, preencha todos os campos corretamente.');
      return;
    }

    onCreate(missionData);
    resetForm();
  };

  const resetForm = () => {
    setMissionData({
      name: '',
      description: '',
      rewardPoints: 0,
      deadline: '',
      userId: 0,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="modal">
      <div className="modal-content mission-modal-content">
        <h2>Criar Nova Missão</h2>
        <div className="modal-divider"></div>

        <form autoComplete="off">
          <label>Nome da Missão:</label>
          <input
            type="text"
            name="name"
            value={missionData.name}
            onChange={handleInputChange}
            placeholder="Ex: Missão de Teste"
          />

          <label>Descrição:</label>
          <textarea
            name="description"
            value={missionData.description}
            onChange={handleInputChange}
            rows={4}
            placeholder="Descreva a missão..."
          />

          <label>Pontos de Recompensa:</label>
          <input
            type="number"
            name="rewardPoints"
            value={missionData.rewardPoints}
            onChange={handleInputChange}
            min="1"
            placeholder="Ex: 100"
          />

          <label>Prazo (Deadline):</label>
          <input
            type="datetime-local"
            name="deadline"
            value={missionData.deadline}
            onChange={handleInputChange}
          />

          <label>ID do Usuário:</label>
          <input
            type="number"
            name="userId"
            value={missionData.userId}
            onChange={handleInputChange}
            min="1"
            placeholder="Ex: 2"
          />

          <div className="modal-actions">
            <button type="button" onClick={handleCreate} className="create-mission-button">
              Criar
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

export default MissionCreateModal;