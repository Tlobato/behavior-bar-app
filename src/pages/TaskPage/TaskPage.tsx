import React, { useState } from 'react';
import './TaskPage.css';
import Header from '../../components/Header/Header';
import Sidebar from '../../components/Sidebar/Sidebar';
import NewRegistrationComponent from '../../components/NewRegistrationComponent/NewRegistrationComponent';
import Modal from '../../components/Modal/Modal';
import TaskCreateModal from '../../components/TaskCreateModal/TaskCreateModal';
import TaskList from '../../components/TaskList/TaskList';
import MissionHeader from '../../components/MissionHeader/MissionHeader';
import { MissionStatus } from '../../types';
import { FaTasks, FaCheckCircle } from 'react-icons/fa';
import { useTaskData } from '../../hooks/useTaskData';
import ScoreUpModal from '../../components/Modal/ScoreUpModal';
import TaskEditModal from '../../components/TaskEditModal/TaskEditModal';

const TaskPage: React.FC = () => {
  const {
    tasks,
    mission,
    user,
    isLoading,
    error,
    isCreateModalOpen,
    isDeleteModalOpen,
    missionProgress,
    isMissionCompleted,
    isActionModalOpen,
    actionModalTitle,
    actionModalMessage,
    currentUser,
    isAdmin,
    pageName,

    setIsCreateModalOpen,
    setIsDeleteModalOpen,
    setIsActionModalOpen,

    handleLogout,
    handleCreateTask,
    handleEditTask,
    openDeleteModal,
    handleDelete,
    handleTaskCheckClick,
    handleAcceptTask,
    handleRejectTask,
    handleActionConfirm,
    handleRedeemMissionPoints,
    hasRedeemed,
    isEditModalOpen,
    setIsEditModalOpen,
    taskToEdit,
    handleUpdateTask
  } = useTaskData();

  const [isScoreUpModalOpen, setIsScoreUpModalOpen] = useState(false);

  const renderEmptyState = () => {
    return (
      <div className="empty-state">
        <div className="empty-icon">
          <FaTasks size={50} color="#cccccc" />
        </div>
        <h2>Nenhuma tarefa cadastrada</h2>
        {isAdmin ? (
          <p>Crie sua primeira tarefa clicando no botão "Criar" acima!</p>
        ) : (
          <p>Não há tarefas disponíveis para esta missão no momento.</p>
        )}
      </div>
    );
  };

  const handleRedeemMissionPointsWithModal = async () => {
    await handleRedeemMissionPoints();
    setIsScoreUpModalOpen(true);
  };

  return (
    <div className="task-page">
      <Header
        projectName="Behavior Bar"
        userName={currentUser?.name || 'Usuário'}
        onLogout={handleLogout}
        pageName={pageName}
        rewardPoints={user?.rewardPoints}
        userRole={currentUser?.role}
      />

      <div className="page-content">
        <Sidebar />

        <main className="main-content">
          <div className="task-container">
            {mission && user && (
              <MissionHeader
                mission={mission}
                user={user}
                tasks={tasks}
                missionProgress={missionProgress}
                isMissionCompleted={isMissionCompleted}
              />
            )}

            {isAdmin && (
              mission?.status === MissionStatus.COMPLETED ? (
                <div className="mission-completed-info">
                  <FaCheckCircle color="#4CAF50" size={18} />
                  <span>Missão concluída. Não é possível adicionar novas tarefas.</span>
                </div>
              ) : (
                <NewRegistrationComponent
                  title="Nova Tarefa"
                  buttonText="Criar"
                  onButtonClick={() => setIsCreateModalOpen(true)}
                />
              )
            )}

            {!isLoading && !error && tasks.length === 0 && renderEmptyState()}

            {!isLoading && !error && tasks.length > 0 && (
              <>
                <TaskList
                  tasks={tasks}
                  mission={mission}
                  isAdmin={isAdmin}
                  isLoading={isLoading}
                  error={error}
                  onCompleteTask={handleTaskCheckClick}
                  onAcceptTask={handleAcceptTask}
                  onRejectTask={handleRejectTask}
                  onEditTask={handleEditTask}
                  onDeleteTask={openDeleteModal}
                />
                {/* Botão de resgatar pontos fora do card */}
                {(!isAdmin && user?.role === 'USER' && isMissionCompleted && mission?.status === 'COMPLETED') && (
                  <button
                    className={`redeem-mission-btn${hasRedeemed ? ' redeemed' : ''}`}
                    onClick={hasRedeemed ? undefined : handleRedeemMissionPointsWithModal}
                    style={{
                      margin: '30px auto 0 auto',
                      display: 'block',
                      background: hasRedeemed ? '#ccc' : undefined,
                      color: hasRedeemed ? '#666' : undefined,
                      cursor: hasRedeemed ? 'not-allowed' : 'pointer'
                    }}
                    disabled={hasRedeemed}
                  >
                    {hasRedeemed ? <><FaCheckCircle color="#43a047" style={{ marginRight: 8 }} /> Pontuação Resgatada!</> : <><FaTasks style={{ marginRight: 8 }} /> Resgatar Pontos da Missão</>}
                  </button>
                )}
              </>
            )}

            {isLoading && <p className="loading-message">Carregando tarefas...</p>}

            {error && <p className="error-message">{error}</p>}
          </div>
        </main>
      </div>

      <TaskCreateModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreate={handleCreateTask}
        missionId={mission?.id || 0}
      />

      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Excluir Tarefa"
        message="Tem certeza que deseja excluir esta tarefa? Esta ação não pode ser desfeita."
      />

      <Modal
        isOpen={isActionModalOpen}
        onClose={() => {
          setIsActionModalOpen(false);
        }}
        onConfirm={handleActionConfirm}
        title={actionModalTitle}
        message={actionModalMessage}
      />

      <ScoreUpModal
        isOpen={isScoreUpModalOpen}
        onClose={() => setIsScoreUpModalOpen(false)}
        points={mission?.rewardPoints || 0}
      />

      <TaskEditModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onUpdate={handleUpdateTask}
        task={taskToEdit}
      />
    </div>
  );
};

export default TaskPage;