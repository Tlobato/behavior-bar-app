import React, { useEffect, useState } from 'react';
import './MissionPage.css';
import { Mission, User } from '../../types';
import { missionService } from '../../services/missionService';
import { userService } from '../../services/userService';
import { useNavigate } from 'react-router-dom';
import { FaTrash, FaEdit, FaTasks, FaClipboardList } from 'react-icons/fa';
import { authService } from '../../services/authService';
import Header from '../../components/Header/Header';
import MissionCreateModal from '../../components/MissionCreateModal/MissionCreateModal';
import MissionEditModal from '../../components/MissionEditModal/MissionEditModal';
import Modal from '../../components/Modal/Modal';
import NewRegistrationComponent from '../../components/NewRegistrationComponent/NewRegistrationComponent';
import Sidebar from '../../components/Sidebar/Sidebar';
import { usePageTitle } from '../../hooks/usePageTitle';
import { formatDateTime } from '../../utils/dateUtils';
// Novas importações
import Hotspot from '../../components/Hotspot/Hotspot'; // Ajuste o caminho conforme sua estrutura
import { checkFirstMissionCreated, markFirstMissionCreated } from '../../utils/onboardingUtils';
import { translateMissionStatus } from '../../utils/statusUtils';

const MissionPage: React.FC = () => {
    const [missions, setMissions] = useState<Mission[]>([]);
    const [users, setUsers] = useState<{[key: number]: User}>({});
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>('');
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
    const [missionToDelete, setMissionToDelete] = useState<number | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
    const [missionToEdit, setMissionToEdit] = useState<Mission | null>(null);
    // Novo estado para controlar a visibilidade do hotspot
    const [shouldShowHotspot, setShouldShowHotspot] = useState<boolean>(false);

    const navigate = useNavigate();
    const currentUser = authService.getCurrentUser();
    const pageName = usePageTitle();

    const handleLogout = () => {
        authService.logout();
        navigate('/login');
    };

    // Função para obter o nome do usuário pelo ID
    const getUserName = (userId: number | undefined): string => {
        if (!userId) return 'Não atribuído';
        return users[userId]?.name || 'Usuário não encontrado';
    };

    // Carregar lista de missões ao montar o componente
    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                // Buscar usuários
                const fetchedUsers = await userService.getUsers();
                const usersMap: {[key: number]: User} = {};
                fetchedUsers.forEach(user => {
                    usersMap[user.id] = user;
                });
                setUsers(usersMap);
                
                // Buscar missões
                const fetchedMissions = await missionService.getMissions();
                setMissions(fetchedMissions);
            } catch (err) {
                console.error('Erro ao buscar dados:', err);
                setError('Não foi possível carregar os dados.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    // Novo useEffect para verificar se deve mostrar o hotspot
    useEffect(() => {
        if (currentUser && missions.length > 0) {
            // Verifica se é a primeira vez que o usuário vê missões
            const shouldShow = checkFirstMissionCreated(currentUser.id);
            setShouldShowHotspot(shouldShow);
        }
    }, [missions, currentUser]);

    // Função para lidar com o fechamento do hotspot
    const handleHotspotClose = () => {
        if (currentUser) {
            markFirstMissionCreated(currentUser.id);
            setShouldShowHotspot(false);
        }
    };

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
            setIsEditModalOpen(false);
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
                setIsModalOpen(false);
                
                // Vamos verificar se o hotspot deve ser exibido após criar uma missão
                if (currentUser && missions.length === 0) {
                    setShouldShowHotspot(true);
                }
            } else {
                alert('Erro ao criar missão.');
            }
        } catch (error) {
            console.error('Erro ao criar missão:', error);
        }
    };

    // Renderiza o estado vazio (sem missões)
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

                        {!isLoading && !error && missions.length === 0 && renderEmptyState()}

                        {!isLoading && !error && missions.length > 0 && (
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
                                                    {/* Modificação aqui para adicionar o hotspot */}
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