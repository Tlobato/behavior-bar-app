import React, { useEffect, useState } from 'react';
import './MissionPage.css';
import { Mission } from '../../types';
import { missionService } from '../../services/missionService';
import { useNavigate } from 'react-router-dom';
import { FaTrash, FaEdit, FaTasks } from 'react-icons/fa'; // Ícones
import { authService } from '../../services/authService';
import Header from '../../components/Header/Header';
import MissionCreateModal from '../../components/MissionCreateModal/MissionCreateModal';
import MissionEditModal from '../../components/MissionEditModal/MissionEditModal';
import Modal from '../../components/Modal/Modal';
import NewRegistrationComponent from '../../components/NewRegistrationComponent/NewRegistrationComponent';
import Sidebar from '../../components/Sidebar/Sidebar';
import { usePageTitle } from '../../hooks/usePageTitle';

const MissionPage: React.FC = () => {
    const [missions, setMissions] = useState<Mission[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>('');
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
    const [missionToDelete, setMissionToDelete] = useState<number | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
    const [missionToEdit, setMissionToEdit] = useState<Mission | null>(null);

    const navigate = useNavigate();
    const currentUser = authService.getCurrentUser();
    const pageName = usePageTitle();

    const handleLogout = () => {
        authService.logout();
        navigate('/login');
    };

    // Carregar lista de missões ao montar o componente
    useEffect(() => {
        const fetchMissions = async () => {
            try {
                const fetchedMissions = await missionService.getMissions();
                setMissions(fetchedMissions);
            } catch (err) {
                console.error('Erro ao buscar missões:', err);
                setError('Não foi possível carregar as missões.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchMissions();
    }, []);

    // Abrir o modal de edição
    const openEditModal = (mission: Mission) => {
        setMissionToEdit(mission);
        setIsEditModalOpen(true);
    };

    const handleUpdate = async (missionId: number, missionData: {
        name: string;
        description: string;
        rewardPoints: number;
        deadline: string;
        userId: number;
      }) => {
        try {
          const success = await missionService.updateMission(missionId, missionData);
          if (success) {
            setMissions(missions.map(mission =>
              mission.id === missionId ? { ...mission, ...missionData } : mission
            ));
          } else {
            alert('Erro ao atualizar missão.');
          }
        } catch (error) {
          console.error('Erro ao atualizar missão:', error);
        }
      };

    // Excluir missão
    const handleDelete = async () => {
        if (missionToDelete !== null) {
            const success = await missionService.deleteMission(missionToDelete);
            if (success) {
                setMissions(missions.filter(mission => mission.id !== missionToDelete));
            } else {
                alert('Erro ao excluir missão.');
            }
            setIsDeleteModalOpen(false);
        }
    };

    // Abrir o modal de exclusão
    const openDeleteModal = (missionId: number) => {
        setMissionToDelete(missionId);
        setIsDeleteModalOpen(true);
    };

    // Redirecionar para a página de gerenciamento de tarefas
    const handleManageTasks = (mission: Mission) => {
        navigate(`/missions/${mission.id}/tasks`);
    };

    // Criar nova missão
    const handleCreateMission = async (missionData: {
        name: string;
        description: string;
        rewardPoints: number;
        deadline: string;
        userId: number;
    }) => {
        try {
            const createdMission = await missionService.createMission(missionData);

            if (createdMission) {
                setMissions([...missions, createdMission]);
            } else {
                alert('Erro ao criar missão.');
            }
        } catch (error) {
            console.error('Erro ao criar missão:', error);
        }
    };

    return (
        <div className="mission-page">
            <Header
                projectName="Behavior Bar"
                userName={currentUser?.name || 'Usuário'}
                onLogout={handleLogout}
                pageName={pageName}
            />

            <div className="page-content">
                <Sidebar />

                <main className="main-content">
                    <div className="mission-container">
                        <NewRegistrationComponent
                            title="Nova Missão"
                            buttonText="Criar"
                            onButtonClick={() => setIsModalOpen(true)}
                        />

                        {isLoading && <p>Carregando missões...</p>}
                        {error && <p className="error-message">{error}</p>}

                        {!isLoading && !error && (
                            <div className="table-container">
                                <table className="mission-table">
                                    <thead>
                                        <tr>
                                            <th>Missão</th>
                                            <th>Status</th>
                                            <th>Prazo</th>
                                            <th>Ações</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {missions.map(mission => (
                                            <tr key={mission.id}>
                                                <td>{mission.name}</td>
                                                <td>{mission.status}</td>
                                                <td>{mission.deadline}</td>
                                                <td className="action-icons">
                                                    <div
                                                        className="action-icon"
                                                        title="Gerenciar Tarefas"
                                                        onClick={() => handleManageTasks(mission)}
                                                    >
                                                        <FaTasks />
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
                        )}
                    </div>
                </main>
            </div>

            <MissionCreateModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onCreate={handleCreateMission}
            />

            <MissionEditModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                onUpdate={handleUpdate}
                mission={missionToEdit}
            />

            <Modal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDelete}
                title="Excluir Missão"
                message="Tem certeza que deseja excluir esta missão? Esta ação não pode ser desfeita."
            />
        </div>
    );
};

export default MissionPage;