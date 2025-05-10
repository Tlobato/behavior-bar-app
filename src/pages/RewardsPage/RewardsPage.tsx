import React, { useState } from 'react';
import './RewardsPage.css';
import Header from '../../components/Header/Header';
import Sidebar from '../../components/Sidebar/Sidebar';
import RewardCard from '../../components/RewardCard/RewardCard'; // Importa o componente de Card
import Modal from '../../components/Modal/Modal'; // Importa o componente de Modal para o popup

const RewardsPage: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false); // Estado para controlar o modal
  const [selectedReward, setSelectedReward] = useState<string | null>(null); // Estado para armazenar o prêmio selecionado

  const rewards = [
    {
      title: 'Cartão digital Roblox',
      imageUrl: 'https://via.placeholder.com/250x150.png?text=Roblox',
      points: 6000,
    },
    {
      title: 'Cartão-presente digital Xbox',
      imageUrl: 'https://via.placeholder.com/250x150.png?text=Xbox',
      points: 1035,
    },
    {
      title: 'Cartão-presente Microsoft',
      imageUrl: 'https://via.placeholder.com/250x150.png?text=Microsoft',
      points: 1035,
    },
    {
      title: 'Associação ao Xbox Game Pass Core',
      imageUrl: 'https://via.placeholder.com/250x150.png?text=Game+Pass+Core',
      points: 2500,
    },
    {
      title: 'PC Game Pass',
      imageUrl: 'https://via.placeholder.com/250x150.png?text=PC+Game+Pass',
      points: 3500,
    },
    {
      title: 'Microsoft Solitaire Collection Premium Edition',
      imageUrl: 'https://via.placeholder.com/250x150.png?text=Solitaire+Collection',
      points: 500,
    },
  ];

  const handleRewardClick = (rewardTitle: string) => {
    setSelectedReward(rewardTitle);
    setIsModalOpen(true); // Abre o modal ao clicar no botão
  };

  return (
    <div className="RewardsPage">
      <Header projectName="Behavior Bar" userName="Stephanie Fakri" onLogout={() => console.log('Logout')} />
      <div className="page-content">
        <Sidebar />
        <main className="main-content">
          <h1 className="rewards-title">Recompensas Disponíveis</h1>
          <div className="rewards-grid">
            {rewards.map((reward, index) => (
              <RewardCard
                key={index}
                title={reward.title}
                imageUrl={reward.imageUrl}
                points={reward.points}
                isAvailable={true} // Agora os botões estão disponíveis
                onClick={() => handleRewardClick(reward.title)} // Função chamada ao clicar no botão
              />
            ))}
          </div>
        </main>
      </div>
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Funcionalidade indisponível"
        message={`A funcionalidade de resgatar o prêmio "${selectedReward}" ainda será implementada.`}
        onConfirm={function (): void {
          throw new Error('Function not implemented.');
        } }      />
    </div>
  );
};

export default RewardsPage;