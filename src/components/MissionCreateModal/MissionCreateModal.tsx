import React, { useState, useEffect, useRef } from 'react';
import './MissionCreateModal.css';
import { FaChevronDown, FaChevronUp, FaCalendarAlt } from 'react-icons/fa';
import { userService } from '../../services/userService';
import { MissionCreateModalProps, User } from '../../types';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const MissionCreateModal: React.FC<MissionCreateModalProps> = ({ isOpen, onClose, onCreate }) => {
  const [missionData, setMissionData] = useState({
    name: '',
    description: '',
    rewardPoints: 0,
    deadline: '',
    userId: 0,
  });
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedUserName, setSelectedUserName] = useState('Selecione um usuário');
  const [dropdownDirection, setDropdownDirection] = useState<'down' | 'up'>('down');
  
  const dropdownRef = useRef<HTMLDivElement>(null);
  const selectHeaderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      fetchUsers();
      setSelectedDate(null);
    }
  }, [isOpen]);

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

  const calculateDropdownDirection = () => {
    if (selectHeaderRef.current) {
      const rect = selectHeaderRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const spaceBelow = windowHeight - rect.bottom;
      const spaceAbove = rect.top;
      
      if (spaceAbove > spaceBelow || spaceBelow < 200) {
        setDropdownDirection('up');
      } else {
        setDropdownDirection('down');
      }
    }
  };

  const handleOpenDropdown = () => {
    calculateDropdownDirection();
    setIsDropdownOpen(true);
  };

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const fetchedUsers = await userService.getUsers();
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

  const handleDateChange = (date: Date | null) => {
    setSelectedDate(date);
    if (date) {
      const formattedDate = date.toISOString().slice(0, 16);
      setMissionData(prev => ({
        ...prev,
        deadline: formattedDate
      }));
    } else {
      setMissionData(prev => ({
        ...prev,
        deadline: ''
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
    setSelectedDate(null);
    setSelectedUserName('Selecione um usuário');
  };

  if (!isOpen) return null;
  
  const DatePickerCustomInput = React.forwardRef<HTMLDivElement, { value?: string; onClick?: () => void }>(
    ({ value, onClick }, ref) => (
      <div className="date-picker-custom-input" onClick={onClick} ref={ref}>
        <span>{value || "Selecione data e hora"}</span>
        <FaCalendarAlt />
      </div>
    )
  );

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
          <div className="date-picker-container">
            <DatePicker
              selected={selectedDate}
              onChange={handleDateChange}
              showTimeSelect
              timeFormat="HH:mm"
              timeIntervals={15}
              timeCaption="Hora"
              dateFormat="dd/MM/yyyy HH:mm"
              customInput={<DatePickerCustomInput />}
              popperPlacement="bottom"
              wrapperClassName="date-picker-wrapper"
              popperClassName="date-picker-popper"
              todayButton="Hoje"
              isClearable
              placeholderText="Selecione data e hora"
            />
          </div>

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