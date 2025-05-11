import React, { useState, useEffect } from 'react';
import './RewardsPage.css';
import Header from '../../components/Header/Header';
import Sidebar from '../../components/Sidebar/Sidebar';
import RewardCard from '../../components/RewardCard/RewardCard';
import Modal from '../../components/Modal/Modal';
import NewRegistrationComponent from '../../components/NewRegistrationComponent/NewRegistrationComponent';
import RewardCreateModal from '../../components/RewardCreateModal/RewardCreateModal';
import { usePageTitle } from '../../hooks/usePageTitle';
import { authService } from '../../services/authService';
import { rewardService } from '../../services/rewardService';
import { Reward } from '../../types';
import { useNavigate } from 'react-router-dom';
import { FaGift } from 'react-icons/fa'; // Importe um ícone de presente para indicar recompensas

const RewardsPage: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedReward, setSelectedReward] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'redeem' | 'edit' | 'delete'>('redeem');
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const pageName = usePageTitle();
  const navigate = useNavigate();

  // Obtendo o usuário atual do authService
  const currentUser = authService.getCurrentUser();
  const isAdmin = authService.isAdmin();

  // Buscar recompensas do backend ao carregar a página
  useEffect(() => {
    const fetchRewards = async () => {
      setIsLoading(true);
      try {
        const rewardsData = await rewardService.getAllRewards();
        setRewards(rewardsData);
      } catch (err) {
        console.error('Erro ao buscar recompensas:', err);
        setError('Não foi possível carregar as recompensas. Por favor, tente novamente mais tarde.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchRewards();
  }, []);

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
  imageFile?: File | null;  // Alterado de imageUrl para imageFile
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
  const handleEditReward = (rewardTitle: string) => {
    setSelectedReward(rewardTitle);
    setModalType('edit');
    setIsModalOpen(true);
  };

  // Função para abrir modal de exclusão de recompensa
  const handleDeleteReward = (rewardTitle: string) => {
    setSelectedReward(rewardTitle);
    setModalType('delete');
    setIsModalOpen(true);
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
          message: `A funcionalidade para excluir a recompensa "${selectedReward}" ainda será implementada.`
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
                  width='960px'
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
                    imageUrl={reward.imageUrl || null}
                    points={reward.points}
                    isAvailable={reward.active !== false}
                    onClick={() => handleRewardClick(reward.title)}
                    onEdit={() => handleEditReward(reward.title)}
                    onDelete={() => handleDeleteReward(reward.title)}
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
        onConfirm={() => setIsModalOpen(false)}
      />

      {/* Modal para criar recompensa */}
      <RewardCreateModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreate={handleCreateReward}
      />
    </div>
  );
};

export default RewardsPage;