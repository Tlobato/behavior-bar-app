import React, { useState } from 'react';
import './RewardsPage.css';
import Header from '../../components/Header/Header';
import Sidebar from '../../components/Sidebar/Sidebar';
import RewardCard from '../../components/RewardCard/RewardCard';
import Modal from '../../components/Modal/Modal';
import NewRegistrationComponent from '../../components/NewRegistrationComponent/NewRegistrationComponent';
import { usePageTitle } from '../../hooks/usePageTitle'; // Importação do hook

const RewardsPage: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedReward, setSelectedReward] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const pageName = usePageTitle(); // Uso do hook para obter o nome da página

  const handleOpenCreateRewardModal = () => {
    setIsCreateModalOpen(true);
  };

  const rewards = [
    {
      title: 'Cartão digital Roblox',
      imageUrl: null,
      points: 6000,
    },
    {
      title: 'Cartão-presente digital Xbox',
      imageUrl: null,
      points: 1035,
    },
    {
      title: 'Cartão-presente Microsoft',
      imageUrl: null,
      points: 1035,
    },
    {
      title: 'Associação ao Xbox Game Pass Core',
      imageUrl: null,
      points: 2500,
    },
    {
      title: 'PC Game Pass',
      imageUrl: null,
      points: 3500,
    },
    {
      title: 'Microsoft Solitaire Collection Premium Edition',
      imageUrl: null,
      points: 500,
    },
    {
      title: 'Microsoft Solitaire Collection Premium Edition',
      imageUrl: null,
      points: 500,
    },
    {
      title: 'Microsoft Solitaire Collection Premium Edition',
      imageUrl: null,
      points: 500,
    },
    {
      title: 'Microsoft Solitaire Collection Premium Edition',
      imageUrl: null,
      points: 500,
    },
  ];

  const handleRewardClick = (rewardTitle: string) => {
    setSelectedReward(rewardTitle);
    setIsModalOpen(true);
  };

  return (
    <div className="RewardsPage">
      <Header 
        projectName="Behavior Bar" 
        userName="Stephanie Fakri" 
        onLogout={() => console.log('Logout')} 
        pageName={pageName} // Passando o nome da página como prop
      />
      <div className="page-content">
        <Sidebar />
        <main className="main-content">
          <div className="rewards-container">
            <div className="reward-registration-wrapper">
              <NewRegistrationComponent
                title="Nova Recompensa"
                buttonText="Criar"
                onButtonClick={handleOpenCreateRewardModal}
                width='960px' // Definimos que ocupe 100% da largura do container
              />
            </div>

            <div className="rewards-grid">
              {rewards.map((reward, index) => (
                <RewardCard
                  key={index}
                  title={reward.title}
                  imageUrl={reward.imageUrl}
                  points={reward.points}
                  isAvailable={true}
                  onClick={() => handleRewardClick(reward.title)}
                />
              ))}
            </div>
          </div>
        </main>
      </div>

      {/* Modal para funcionalidade de resgate de prêmio */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Funcionalidade indisponível"
        message={`A funcionalidade de resgatar o prêmio "${selectedReward}" ainda será implementada.`}
        onConfirm={() => setIsModalOpen(false)}
      />

      {/* Modal para criar nova recompensa */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Criar Recompensa"
        message="A funcionalidade para criar novas recompensas ainda será implementada."
        onConfirm={() => setIsCreateModalOpen(false)}
      />
    </div>
  );
};

export default RewardsPage;