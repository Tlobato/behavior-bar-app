import React from 'react';
import { FaTrash, FaEdit, FaTasks } from 'react-icons/fa';
import { MissionListProps } from '../../types';
import Hotspot from '../Hotspot/Hotspot';
import { formatDateTime } from '../../utils/dateUtils';
import { translateMissionStatus } from '../../utils/statusUtils';
import './MissionList.css';
import { FaClipboardList } from 'react-icons/fa';

const MissionList: React.FC<MissionListProps> = ({
  missions,
  isLoading,
  error,
  shouldShowHotspot,
  getUserName,
  handleManageTasks,
  openEditModal,
  openDeleteModal,
  handleHotspotClose
}) => {
  const renderEmptyState = () => {
    return (
      <div className="empty-state">
        <div className="empty-icon">
          <FaClipboardList size={50} color="#cccccc" />
        </div>
        <h2>Nenhuma missão cadastrada</h2>
        <p>Crie sua primeira missão clicando no botão "Criar" acima!</p>
      </div>
    );
  };

  if (isLoading) return <p>Carregando missões...</p>;
  if (error) return <p className="error-message">{error}</p>;
  if (missions.length === 0) return renderEmptyState();

  return (
    <div className="table-container">
      <table className="mission-table">
        <thead>
          <tr>
            <th>Missão</th>
            <th>Status</th>
            <th>Prazo</th>
            <th>Usuário</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {missions.map((mission, index) => (
            <tr key={mission.id}>
              <td>{mission.name}</td>
              <td>{translateMissionStatus(mission.status)}</td>
              <td>{formatDateTime(mission.deadline)}</td>
              <td>{getUserName(mission.userId)}</td>
              <td className="action-icons">
                <div className="action-icon-wrapper">
                  <div
                    className="action-icon"
                    title="Gerenciar Tarefas"
                    onClick={() => handleManageTasks(mission)}
                  >
                    <FaTasks />
                  </div>
                  {shouldShowHotspot && index === 0 && (
                    <Hotspot
                      message="Clique aqui para adicionar tarefas à sua missão!"
                      position="left"
                      onClose={handleHotspotClose}
                    />
                  )}
                </div>
                <div
                  className="action-icon"
                  title="Editar"
                  onClick={() => openEditModal(mission)}
                >
                  <FaEdit />
                </div>
                <div
                  className="action-icon delete-icon"
                  title="Excluir"
                  onClick={() => openDeleteModal(mission.id)}
                >
                  <FaTrash />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default MissionList;