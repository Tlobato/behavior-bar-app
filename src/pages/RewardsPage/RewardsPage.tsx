import React from 'react';
import './RewardsPage.css';
import Header from '../../components/Header/Header';
import Sidebar from '../../components/Sidebar/Sidebar';
import RewardCard from '../../components/RewardCard/RewardCard';
import Modal from '../../components/Modal/Modal';
import NewRegistrationComponent from '../../components/NewRegistrationComponent/NewRegistrationComponent';
import RewardCreateModal from '../../components/RewardCreateModal/RewardCreateModal';
import RewardEditModal from '../../components/RewardEditModal/RewardEditModal';
import { FaGift } from 'react-icons/fa';
import { useRewardsData } from '../../hooks/useRewardsData';

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
    </div>
  );
};

export default RewardsPage;