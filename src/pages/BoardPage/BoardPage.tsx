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
    isModalOpen,
    setIsModalOpen,
    pageName,
    handleLogout,
    handleAddInfraction,
    confirmReset
  } = useBoardData();

  // Forçar isAdmin para ADMIN ou TUTOR
  const isAdminOrTutor = currentUser?.role === 'ADMIN' || currentUser?.role === 'TUTOR';

  return (
    <div className="BoardPage">
      <Header
        projectName="Behavior Bar"
        userName={currentUser?.nome || currentUser?.name || ''}
        onLogout={handleLogout}
        pageName={pageName}
        rewardPoints={isAdminOrTutor ? undefined : boardUser?.rewardPoints}
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

              {isAdminOrTutor && (
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

            {isAdminOrTutor && (
              <div className="form-section">
                <InfractionForm categories={categories} onAddInfraction={handleAddInfraction} />
              </div>
            )}

            <div className="history-section">
              <BehaviorHistory infractions={behaviorState.infractions} formatDate={formatDate} isAdmin={isAdminOrTutor} />
            </div>

            {!isAdminOrTutor && boardUser && (
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