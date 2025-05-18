import React from 'react';
import './BoardPage.css';
import InfractionForm from '../../components/InfractionForm/InfractionForm';
import Modal from '../../components/Modal/Modal';
import BehaviorHistory from '../../components/BehaviorHistory/BehaviorHistory';
import Header from '../../components/Header/Header';
import { formatDate } from '../../utils/dateUtils';
import Sidebar from '../../components/Sidebar/Sidebar';
import UserMissionsList from '../../components/UserMissionsList/UserMissionsList';
import { useBoardData } from '../../hooks/useBoardData';
import BehaviorBar from '../../components/BehaviorBar/BehaviorBar';

const BoardPage: React.FC = () => {
  const {
    currentUser,
    boardUser,
    isLoadingBoardUser,
    behaviorState,
    categories,
    isAdmin,
    isModalOpen,
    setIsModalOpen,
    pageName,
    handleLogout,
    handleAddInfraction,
    confirmReset
  } = useBoardData();

  return (
    <div className="BoardPage">
      <Header
        projectName="Behavior Bar"
        userName={currentUser?.name || ''}
        onLogout={handleLogout}
        pageName={pageName}
        rewardPoints={isAdmin ? undefined : boardUser?.rewardPoints}
        userRole={currentUser?.role}
      />
      <div className="page-content">
        <Sidebar />
        <main className="main-content">
          <div className="board-container">
            <div className="behavior-section">
              {isLoadingBoardUser ? (
                <p>Carregando...</p>
              ) : (
                <BehaviorBar
                  behaviorState={behaviorState}
                  userName={boardUser?.name || ''}
                  rewardPoints={boardUser?.rewardPoints}
                />
              )}

              {isAdmin && (
                <div className="reset-section">
                  <button onClick={() => setIsModalOpen(true)} className="reset-button">
                    Resetar Pontuação
                  </button>
                  <p className="reset-info">
                    Última vez resetado: {formatDate(behaviorState.lastReset)}
                  </p>
                </div>
              )}
            </div>

            {isAdmin && (
              <div className="form-section">
                <InfractionForm categories={categories} onAddInfraction={handleAddInfraction} />
              </div>
            )}

            <div className="history-section">
              <BehaviorHistory infractions={behaviorState.infractions} formatDate={formatDate} isAdmin={isAdmin} />
            </div>

            {!isAdmin && boardUser && (
              <div className="missions-section">
                <UserMissionsList userId={boardUser.id} />
              </div>
            )}
          </div>
        </main>
      </div>
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={confirmReset}
        title="Resetar Pontuação"
        message="Tem certeza que deseja resetar a pontuação?"
      />
    </div>
  );
};

export default BoardPage;