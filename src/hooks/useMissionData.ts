import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mission, User } from '../types';
import { missionService } from '../services/missionService';
import { userService } from '../services/userService';
import { authService } from '../services/authService';
import { usePageTitle } from './usePageTitle';
import { checkFirstMissionCreated, markFirstMissionCreated } from '../utils/onboardingUtils';

export function useMissionData() {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [users, setUsers] = useState<{[key: number]: User}>({});
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [missionToDelete, setMissionToDelete] = useState<number | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [missionToEdit, setMissionToEdit] = useState<Mission | null>(null);
  const [shouldShowHotspot, setShouldShowHotspot] = useState<boolean>(false);

  const navigate = useNavigate();
  const currentUser = authService.getCurrentUser();
  const pageName = usePageTitle();

  const getUserName = (userId: number | undefined): string => {
    if (!userId) return 'Não atribuído';
    return users[userId]?.name || 'Usuário não encontrado';
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const fetchedUsers = await userService.getUsers();
        const usersMap: {[key: number]: User} = {};
        fetchedUsers.forEach(user => {
            usersMap[user.id] = user;
        });
        setUsers(usersMap);
        
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

  useEffect(() => {
    if (currentUser && missions.length > 0) {
      const shouldShow = checkFirstMissionCreated(currentUser.id);
      setShouldShowHotspot(shouldShow);
    }
  }, [missions, currentUser]);

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  const handleHotspotClose = () => {
    if (currentUser) {
      markFirstMissionCreated(currentUser.id);
      setShouldShowHotspot(false);
    }
  };

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

  const openDeleteModal = (missionId: number) => {
    setMissionToDelete(missionId);
    setIsDeleteModalOpen(true);
  };

  const handleManageTasks = (mission: Mission) => {
    navigate(`/missions/${mission.id}/tasks`);
  };

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

  return {
    missions,
    users,
    isLoading,
    error,
    isModalOpen,
    setIsModalOpen,
    isDeleteModalOpen,
    setIsDeleteModalOpen,
    isEditModalOpen,
    setIsEditModalOpen,
    missionToEdit,
    shouldShowHotspot,
    currentUser,
    pageName,
    getUserName,
    handleLogout,
    handleHotspotClose,
    openEditModal,
    handleUpdate,
    handleDelete,
    openDeleteModal,
    handleManageTasks,
    handleCreateMission
  };
}