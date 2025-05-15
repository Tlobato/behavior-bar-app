import React, { useState, useEffect, useCallback } from 'react';
import './MissionEditModal.css';
import { FaUser } from 'react-icons/fa';
import { userService } from '../../services/userService';
import { MissionEditModalProps } from '../../types';

const MissionEditModal: React.FC<MissionEditModalProps> = ({ isOpen, onClose, onUpdate, mission }) => {
  const [missionData, setMissionData] = useState({
    name: '',
    description: '',
    rewardPoints: 0,
    deadline: '',
    userId: 0,
  });
  const [selectedUserName, setSelectedUserName] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Função para buscar detalhes do usuário da missão
  const fetchUserDetails = useCallback(async (userId: number) => {
    setIsLoading(true);
    try {
      // Busca apenas o usuário específico da missão
      const user = await userService.getUserById(userId);
      if (user) {
        setSelectedUserName(user.name);
      } else {
        setSelectedUserName('Usuário não encontrado');
      }
    } catch (error) {
      console.error('Erro ao buscar detalhes do usuário:', error);
      setSelectedUserName('Erro ao carregar usuário');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Inicializar dados quando o modal é aberto
  useEffect(() => {
    if (isOpen && mission) {
      setMissionData({
        name: mission.name,
        description: mission.description || '',
        rewardPoints: mission.rewardPoints,
        deadline: mission.deadline || '',
        userId: mission.userId,
      });
      
      // Buscar nome do usuário selecionado
      fetchUserDetails(mission.userId);
    }
  }, [isOpen, mission, fetchUserDetails]);

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

  const handleUpdate = () => {
    const { name, description, rewardPoints, deadline, userId } = missionData;

    // Validação básica
    if (!name || !description || !rewardPoints || !deadline || !userId) {
      alert('Por favor, preencha todos os campos corretamente.');
      return;
    }

    if (mission) {
      onUpdate(mission.id, missionData);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal">
      <div className="modal-content mission-modal-content">
        <h2>Editar Missão</h2>
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

          <label>Usuário Responsável:</label>
          <div className="user-display-container">
            {isLoading ? (
              <div className="user-loading">Carregando detalhes do usuário...</div>
            ) : (
              <>
                <div className="user-icon-wrapper">
                  <FaUser />
                </div>
                <span className="user-name">{selectedUserName}</span>
                <div className="non-editable-badge">Não editável</div>
              </>
            )}
          </div>
          <div className="user-info-note">
            A atribuição de usuário não pode ser alterada após a criação da missão.
          </div>

          <div className="modal-actions">
            <button type="button" onClick={handleUpdate} className="update-mission-button">
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

export default MissionEditModal;