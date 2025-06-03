import React, { useState } from 'react';
import './RewardsPage.css';
import Header from '../../components/Header/Header';
import Sidebar from '../../components/Sidebar/Sidebar';
import RewardCard from '../../components/RewardCard/RewardCard';
import Modal from '../../components/Modal/Modal';
import NewRegistrationComponent from '../../components/NewRegistrationComponent/NewRegistrationComponent';
import RewardCreateModal from '../../components/RewardCreateModal/RewardCreateModal';
import RewardEditModal from '../../components/RewardEditModal/RewardEditModal';
import { FaGift, FaFilter } from 'react-icons/fa';
import { useRewardsData } from '../../hooks/useRewardsData';
import GamifiedInfoModal from '../../components/Modal/GamifiedInfoModal';
import RewardRedemptionSuccessModal from '../../components/Modal/RewardRedemptionSuccessModal';
import { Reward } from '../../types';

const RewardsPage: React.FC = () => {
  const {
    isModalOpen,
    isCreateModalOpen,
    isEditModalOpen,
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
  } = useRewardsData();

  // Modal para pontos insuficientes
  const [isInsufficientPointsModalOpen, setIsInsufficientPointsModalOpen] = useState(false);
  const [showOnlyActive, setShowOnlyActive] = useState(true);

  // Estado para modal de sucesso do resgate
  const [isRedemptionSuccessModalOpen, setIsRedemptionSuccessModalOpen] = useState(false);
  const [redemptionReward, setRedemptionReward] = useState<Reward | null>(null);
  const [pointsBeforeRedemption, setPointsBeforeRedemption] = useState<number>(0);
  const [pointsAfterRedemption, setPointsAfterRedemption] = useState<number>(0);

  const handleInsufficientPoints = () => {
    setIsInsufficientPointsModalOpen(true);
  };

  // Função para lidar com resgate de recompensa
  const handleRewardClickWithModal = async (rewardTitle: string) => {
    const reward = rewards.find(r => r.title === rewardTitle);
    if (!reward || !user || !reward.id) return;
    // Salva pontos antes do resgate
    setPointsBeforeRedemption(user.rewardPoints ?? 0);
    try {
      await handleRewardClick(rewardTitle); // Chama lógica já existente
      // Busca usuário atualizado para pegar pontos após resgate
      const updatedPoints = (user.rewardPoints ?? 0) - reward.points;
      setPointsAfterRedemption(updatedPoints);
      setRedemptionReward(reward);
      setIsRedemptionSuccessModalOpen(true);
    } catch (err) {
      // Erro já tratado no hook
    }
  };

  const modalContent = getModalContent();

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
                  width='1112px'
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

            {!isLoading && !error && rewards.length === 0 && (
              <div className="empty-rewards-container">
                <div className="empty-rewards-icon-container">
                  <FaGift size={64} />
                </div>
                <h3>Nenhuma recompensa cadastrada</h3>
                {isAdmin && <p>Crie sua primeira recompensa clicando no botão "Criar" acima!</p>}
              </div>
            )}

            {isAdmin && rewards.length > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16, gap: 8 }}>
                <button
                  style={{
                    background: showOnlyActive ? '#4CAF50' : '#bdbdbd',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 6,
                    padding: '8px 16px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    fontWeight: 600
                  }}
                  onClick={() => setShowOnlyActive((prev) => !prev)}
                  title={showOnlyActive ? 'Exibindo apenas recompensas ativas' : 'Exibindo todas as recompensas'}
                >
                  <FaFilter /> {showOnlyActive ? 'Apenas Ativas' : 'Todas'}
                </button>
              </div>
            )}

            {!isLoading && !error && rewards.length > 0 && (
              <div className="rewards-grid">
                {rewards
                  .filter(reward => isAdmin ? (!showOnlyActive || reward.active) : reward.active)
                  .map((reward) => (
                    <RewardCard
                      key={reward.id || `reward-${Math.random()}`}
                      title={reward.title}
                      description={reward.description}
                      imageUrl={reward.imageUrl || null}
                      points={reward.points}
                      isAvailable={
                        reward.active !== false &&
                        !!user &&
                        (user.rewardPoints ?? 0) >= reward.points &&
                        !redeemedRewardIds.includes(reward.id || 0)
                      }
                      isRedeemed={redeemedRewardIds.includes(reward.id || 0)}
                      onClick={() => handleRewardClickWithModal(reward.title)}
                      onEdit={() => handleEditReward(reward.id || 0)}
                      onDelete={() => handleDeleteReward(reward.title, reward.id || 0)}
                      onInsufficientPoints={handleInsufficientPoints}
                    />
                  ))}
              </div>
            )}
          </div>
        </main>
      </div>

      <GamifiedInfoModal
        isOpen={isInsufficientPointsModalOpen}
        onClose={() => setIsInsufficientPointsModalOpen(false)}
        title="Quase lá!"
        message="Junte mais pontos para resgatar essa recompensa.✨"
        emoji="🎯"
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={modalContent.title}
        message={modalContent.message}
        onConfirm={modalContent.title === "Excluir Recompensa" ? confirmDeleteReward : () => setIsModalOpen(false)}
      />

      <RewardCreateModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreate={handleCreateReward}
      />

      <RewardEditModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleSaveEditedReward}
        reward={rewardToEdit}
      />

      <RewardRedemptionSuccessModal
        isOpen={isRedemptionSuccessModalOpen}
        onClose={() => setIsRedemptionSuccessModalOpen(false)}
        rewardName={redemptionReward?.title || ''}
        rewardImage={redemptionReward?.imageUrl || null}
        pointsBefore={pointsBeforeRedemption}
        pointsAfter={pointsAfterRedemption}
      />
    </div>
  );
};

export default RewardsPage;