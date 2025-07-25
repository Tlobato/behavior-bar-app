import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { EditRewardData, Reward } from '../types';
import { authService } from '../services/authService';
import { rewardService } from '../services/rewardService';
import { userService } from '../services/userService';
import { usePageTitle } from './usePageTitle';
import { useUser } from '../context/UserContext';

export const useRewardsData = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedReward, setSelectedReward] = useState<string | null>(null);
  const [selectedRewardId, setSelectedRewardId] = useState<number | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [rewardToEdit, setRewardToEdit] = useState<Reward | null>(null);
  const [modalType, setModalType] = useState<'redeem' | 'edit' | 'delete'>('redeem');
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDataLoaded, setIsDataLoaded] = useState<boolean>(false);
  const [redeemedRewardIds, setRedeemedRewardIds] = useState<number[]>([]);

  const { user, setUser } = useUser();
  const pageName = usePageTitle();
  const navigate = useNavigate();

  const currentUser = authService.getCurrentUser();
  const isAdmin = currentUser?.role === 'ADMIN' || currentUser?.role === 'TUTOR';

  useEffect(() => {
    if (isDataLoaded || !user) {
      return;
    }

    const loadData = async () => {
      setIsLoading(true);
      try {
        const updatedUser = await userService.getUserById(user.id);
        if (updatedUser) {
          setUser(updatedUser);
        }

        let rewardsData: Reward[] = [];
        if (isAdmin) {
          rewardsData = await rewardService.getAllRewardsAdmin();
        } else {
          rewardsData = await rewardService.getAllRewards();
        }
        setRewards(rewardsData);

        // Buscar histórico de resgates do usuário
        try {
          const redemptions = await rewardService.getUserRedemptions();
          setRedeemedRewardIds(redemptions.map((r: any) => r.rewardId));
        } catch (e) {
          setRedeemedRewardIds([]); // Se não houver histórico, apenas zera
        }

        setIsDataLoaded(true);
      } catch (err) {
        console.error('Erro ao carregar dados:', err);
        setError('Não foi possível carregar os dados. Por favor, tente novamente mais tarde.');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [user, setUser, isDataLoaded, isAdmin]);

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  const handleOpenCreateRewardModal = () => {
    setIsCreateModalOpen(true);
  };

  const handleCreateReward = async (rewardData: {
    title: string;
    description: string;
    points: number;
    imageFile?: File | null;
    active?: boolean;
  }) => {
    try {
      setIsLoading(true);

      if (!rewardData.imageFile) {
        setError('Uma imagem é necessária para criar uma recompensa');
        setIsLoading(false);
        return;
      }

      const createdReward = await rewardService.createReward(rewardData);

      if (createdReward) {
        const updatedRewards = await rewardService.getAllRewards();
        setRewards(updatedRewards);
        setIsCreateModalOpen(false);
      }
    } catch (err) {
      console.error('Erro ao criar recompensa:', err);
      setError('Não foi possível criar a recompensa. Por favor, tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRewardClick = async (rewardTitle: string) => {
    const reward = rewards.find(r => r.title === rewardTitle);
    if (!reward || !user || !reward.id) return;
    try {
      setIsLoading(true);
      // Chamar endpoint de resgate
      await rewardService.redeemReward({ rewardId: reward.id });
      // Atualizar histórico de resgates
      const redemptions = await rewardService.getUserRedemptions();
      setRedeemedRewardIds(redemptions.map((r: any) => r.rewardId));
      // Atualizar pontos do usuário
      const updatedUser = await userService.getUserById(user.id);
      if (updatedUser) setUser(updatedUser);
      // Aqui você pode exibir um modal de sucesso, animação, etc.
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Erro ao resgatar recompensa.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditReward = (rewardId: number) => {
    const rewardToEdit = rewards.find(reward => reward.id === rewardId);
    if (rewardToEdit) {
      setRewardToEdit(rewardToEdit);
      setIsEditModalOpen(true);
    } else {
      setError('Recompensa não encontrada para edição.');
    }
  };

  const handleSaveEditedReward = async (editedRewardData: EditRewardData) => {
    try {
      setIsLoading(true);

      const updatedReward = await rewardService.updateReward(
        editedRewardData.id,
        {
          title: editedRewardData.title,
          description: editedRewardData.description,
          points: editedRewardData.points,
          imageFile: editedRewardData.imageFile,
          active: editedRewardData.active
        }
      );

      if (updatedReward) {
        const updatedRewards = await rewardService.getAllRewards();
        setRewards(updatedRewards);
        setIsEditModalOpen(false);
        setRewardToEdit(null);
      } else {
        setError('Não foi possível atualizar a recompensa. Por favor, tente novamente.');
      }
    } catch (err) {
      console.error('Erro ao atualizar recompensa:', err);
      setError('Erro ao atualizar recompensa. Por favor, tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteReward = (rewardTitle: string, rewardId: number) => {
    setSelectedReward(rewardTitle);
    setSelectedRewardId(rewardId);
    setModalType('delete');
    setIsModalOpen(true);
  };

  const confirmDeleteReward = async () => {
    if (selectedRewardId === null) {
      setError('ID da recompensa não encontrado.');
      return;
    }

    try {
      setIsLoading(true);
      const success = await rewardService.deactivateReward(selectedRewardId);

      if (success) {
        setRewards(rewards.filter(reward => reward.id !== selectedRewardId));
        setIsModalOpen(false);
      } else {
        setError('Não foi possível desativar a recompensa. Por favor, tente novamente.');
      }
    } catch (err) {
      console.error('Erro ao desativar recompensa:', err);
      setError('Erro ao desativar recompensa. Por favor, tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const getModalContent = () => {
    switch (modalType) {
      case 'redeem':
        return {
          title: "Resgate de Recompensa",
          message: selectedReward ? `Você está resgatando o prêmio "${selectedReward}".` : ''
        };
      case 'edit':
        return {
          title: "Editar Recompensa",
          message: `A funcionalidade para editar a recompensa "${selectedReward}" ainda será implementada.`
        };
      case 'delete':
        return {
          title: "Excluir Recompensa",
          message: `Tem certeza que deseja excluir a recompensa "${selectedReward}"? Esta ação não poderá ser desfeita.`
        };
      default:
        return {
          title: "Funcionalidade indisponível",
          message: "Operação não reconhecida."
        };
    }
  };

  return {
    isModalOpen,
    isCreateModalOpen,
    isEditModalOpen,
    selectedReward,
    modalType,
    rewards,
    isLoading,
    error,
    rewardToEdit,
    currentUser,
    isAdmin,
    user,
    pageName,
    redeemedRewardIds,
    
    setIsModalOpen,
    setIsCreateModalOpen,
    setIsEditModalOpen,
    handleLogout,
    handleOpenCreateRewardModal,
    handleCreateReward,
    handleRewardClick,
    handleEditReward,
    handleSaveEditedReward,
    handleDeleteReward,
    confirmDeleteReward,
    getModalContent
  };
};