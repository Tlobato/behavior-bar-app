import React, { useState, useEffect } from 'react';
import './RewardsPage.css';
import Header from '../../components/Header/Header';
import Sidebar from '../../components/Sidebar/Sidebar';
import RewardCard from '../../components/RewardCard/RewardCard';
import Modal from '../../components/Modal/Modal';
import NewRegistrationComponent from '../../components/NewRegistrationComponent/NewRegistrationComponent';
import RewardCreateModal from '../../components/RewardCreateModal/RewardCreateModal';
import RewardEditModal from '../../components/RewardEditModal/RewardEditModal';
import { usePageTitle } from '../../hooks/usePageTitle';
import { authService } from '../../services/authService';
import { rewardService } from '../../services/rewardService';
import { userService } from '../../services/userService';
import { Reward } from '../../types';
import { useNavigate } from 'react-router-dom';
import { FaGift } from 'react-icons/fa';
import { EditRewardData } from '../../components/RewardEditModal/RewardEditModal';
import { useUser } from '../../context/UserContext';

const RewardsPage: React.FC = () => {
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

  const { user, setUser } = useUser();
  const pageName = usePageTitle();
  const navigate = useNavigate();

  // Obtendo o usuário atual do authService
  const currentUser = authService.getCurrentUser();
  const isAdmin = authService.isAdmin();

  // Buscar recompensas e dados do usuário ao carregar a página
  useEffect(() => {
    // Se os dados já foram carregados ou não há usuário, não execute novamente
    if (isDataLoaded || !user) {
      return;
    }

    const loadData = async () => {
      setIsLoading(true);
      try {
        // Carregar dados do usuário
        const updatedUser = await userService.getUserById(user.id);
        if (updatedUser) {
          setUser(updatedUser);
        }

        // Carregar recompensas
        const rewardsData = await rewardService.getAllRewards();
        setRewards(rewardsData);
        
        // Marcar os dados como carregados
        setIsDataLoaded(true);
      } catch (err) {
        console.error('Erro ao carregar dados:', err);
        setError('Não foi possível carregar os dados. Por favor, tente novamente mais tarde.');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [user, setUser, isDataLoaded]);

  // Função de logout
  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  const handleOpenCreateRewardModal = () => {
    setIsCreateModalOpen(true);
  };

  // Função para criar uma nova recompensa usando o serviço
  const handleCreateReward = async (rewardData: {
    title: string;
    description: string;
    points: number;
    imageFile?: File | null;
    active?: boolean;
  }) => {
    try {
      setIsLoading(true);

      // Verificação de segurança para o arquivo
      if (!rewardData.imageFile) {
        setError('Uma imagem é necessária para criar uma recompensa');
        setIsLoading(false);
        return;
      }

      const createdReward = await rewardService.createReward(rewardData);

      if (createdReward) {
        // Atualiza a lista de recompensas
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

  // Função para abrir modal de resgate de recompensa
  const handleRewardClick = (rewardTitle: string) => {
    setSelectedReward(rewardTitle);
    setModalType('redeem');
    setIsModalOpen(true);
  };

  // Função para abrir modal de edição de recompensa
  const handleEditReward = (rewardId: number) => {
    // Encontrar a recompensa a ser editada
    const rewardToEdit = rewards.find(reward => reward.id === rewardId);
    if (rewardToEdit) {
      setRewardToEdit(rewardToEdit);
      setIsEditModalOpen(true);
    } else {
      setError('Recompensa não encontrada para edição.');
    }
  };

  // Função para salvar a edição da recompensa
  const handleSaveEditedReward = async (editedRewardData: EditRewardData) => {
    try {
      setIsLoading(true);

      // Chamar o serviço para atualizar a recompensa
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
        // Atualizar a lista local de recompensas
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

  // Função para abrir modal de exclusão de recompensa
  const handleDeleteReward = (rewardTitle: string, rewardId: number) => {
    setSelectedReward(rewardTitle);
    setSelectedRewardId(rewardId);
    setModalType('delete');
    setIsModalOpen(true);
  };

  // Função para confirmar a exclusão da recompensa
  const confirmDeleteReward = async () => {
    if (selectedRewardId === null) {
      setError('ID da recompensa não encontrado.');
      return;
    }

    try {
      setIsLoading(true);
      const success = await rewardService.deleteReward(selectedRewardId);

      if (success) {
        // Remover a recompensa da lista local
        setRewards(rewards.filter(reward => reward.id !== selectedRewardId));
        setIsModalOpen(false);
      } else {
        setError('Não foi possível excluir a recompensa. Por favor, tente novamente.');
      }
    } catch (err) {
      console.error('Erro ao excluir recompensa:', err);
      setError('Erro ao excluir recompensa. Por favor, tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  // Função para obter a mensagem e título do modal com base no tipo
  const getModalContent = () => {
    switch (modalType) {
      case 'redeem':
        return {
          title: "Funcionalidade indisponível",
          message: `A funcionalidade de resgatar o prêmio "${selectedReward}" ainda será implementada.`
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

  // Obtém o conteúdo do modal
  const modalContent = getModalContent();

  // Componente para exibir quando não há recompensas
  const EmptyRewardsState = () => (
    <div className="empty-rewards-container">
      <div className="empty-rewards-icon-container">
        <FaGift size={64} />
      </div>
      <h3>Nenhuma recompensa cadastrada</h3>
      <p>Crie sua primeira recompensa clicando no botão "Criar" acima!</p>
    </div>
  );

  return (
    <div className="RewardsPage">
      <Header
        projectName="Behavior Bar"
        userName={currentUser?.name || 'Usuário'}
        onLogout={handleLogout}
        pageName={pageName}
        rewardPoints={!isAdmin && user ? user.rewardPoints : undefined}
        userRole={currentUser?.role}
      />
      <div className="page-content">
        <Sidebar />
        <main className="main-content">
          <div className="rewards-container">
            {isAdmin && (
              <div className="reward-registration-wrapper">
                <NewRegistrationComponent
                  title="Nova Recompensa"
                  buttonText="Criar"
                  onButtonClick={handleOpenCreateRewardModal}
                />
              </div>
            )}

            {isLoading && (
              <div className="loading-container">
                <p>Carregando recompensas...</p>
              </div>
            )}

            {error && (
              <div className="error-container">
                <p className="error-message">{error}</p>
              </div>
            )}

            {!isLoading && !error && rewards.length === 0 && <EmptyRewardsState />}

            {!isLoading && !error && rewards.length > 0 && (
              <div className="rewards-grid">
                {rewards.map((reward) => (
                  <RewardCard
                    key={reward.id || `reward-${Math.random()}`}
                    title={reward.title}
                    description={reward.description}
                    imageUrl={reward.imageUrl || null}
                    points={reward.points}
                    isAvailable={reward.active !== false}
                    onClick={() => handleRewardClick(reward.title)}
                    onEdit={() => handleEditReward(reward.id || 0)}
                    onDelete={() => handleDeleteReward(reward.title, reward.id || 0)}
                  />
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Modal para ações relacionadas às recompensas */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={modalContent.title}
        message={modalContent.message}
        onConfirm={modalType === 'delete' ? confirmDeleteReward : () => setIsModalOpen(false)}
      />

      {/* Modal para criar recompensa */}
      <RewardCreateModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreate={handleCreateReward}
      />

      {/* Modal para editar recompensa */}
      <RewardEditModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleSaveEditedReward}
        reward={rewardToEdit}
      />
    </div>
  );
};

export default RewardsPage;