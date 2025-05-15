import React, { useState, useEffect, useRef } from 'react';
import './MissionCreateModal.css';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { userService } from '../../services/userService';
import { MissionCreateModalProps, User } from '../../types';

const MissionCreateModal: React.FC<MissionCreateModalProps> = ({ isOpen, onClose, onCreate }) => {
  const [missionData, setMissionData] = useState({
    name: '',
    description: '',
    rewardPoints: 0,
    deadline: '',
    userId: 0,
  });
  const [users, setUsers] = useState<User[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedUserName, setSelectedUserName] = useState('Selecione um usuário');
  const [dropdownDirection, setDropdownDirection] = useState<'down' | 'up'>('down');
  
  const dropdownRef = useRef<HTMLDivElement>(null);
  const selectHeaderRef = useRef<HTMLDivElement>(null);

  // Carregar lista de usuários quando o modal abrir
  useEffect(() => {
    if (isOpen) {
      fetchUsers();
    }
  }, [isOpen]);

  // Fechar dropdown ao clicar fora dele
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Determinar a direção do dropdown com base no espaço disponível
  const calculateDropdownDirection = () => {
    if (selectHeaderRef.current) {
      const rect = selectHeaderRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const spaceBelow = windowHeight - rect.bottom;
      const spaceAbove = rect.top;
      
      // Se houver mais espaço acima do que abaixo, ou se o espaço abaixo for insuficiente
      if (spaceAbove > spaceBelow || spaceBelow < 200) {
        setDropdownDirection('up');
      } else {
        setDropdownDirection('down');
      }
    }
  };

  // Abrir dropdown
  const handleOpenDropdown = () => {
    calculateDropdownDirection();
    setIsDropdownOpen(true);
  };

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const fetchedUsers = await userService.getUsers();
      // Filtrar apenas usuários com role USER
      const regularUsers = fetchedUsers.filter(user => user.role === 'USER');
      setUsers(regularUsers);
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
    } finally {
      setIsLoading(false);
    }
  };

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

  const handleUserSelect = (user: User) => {
    setMissionData((prev) => ({
      ...prev,
      userId: user.id,
    }));
    setSelectedUserName(user.name);
    setIsDropdownOpen(false);
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
    setSelectedUserName('Selecione um usuário');
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

          <label>Usuário Responsável:</label>
          <div className="custom-select-container" ref={dropdownRef}>
            <div 
              className="custom-select-header" 
              ref={selectHeaderRef}
              onClick={() => isDropdownOpen ? setIsDropdownOpen(false) : handleOpenDropdown()}
            >
              <span>{selectedUserName}</span>
              <div className={`dropdown-arrow ${isDropdownOpen ? 'open' : ''}`}>
                {dropdownDirection === 'down' ? <FaChevronDown /> : <FaChevronUp />}
              </div>
            </div>
            
            {isDropdownOpen && (
              <div className={`custom-select-options ${dropdownDirection === 'up' ? 'dropdown-up' : 'dropdown-down'}`}>
                {isLoading ? (
                  <div className="select-loading">Carregando usuários...</div>
                ) : users.length > 0 ? (
                  users.map((user) => (
                    <div 
                      key={user.id} 
                      className="select-option" 
                      onClick={() => handleUserSelect(user)}
                    >
                      {user.name}
                    </div>
                  ))
                ) : (
                  <div className="select-no-data">Nenhum usuário disponível</div>
                )}
              </div>
            )}
          </div>

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