import React, { useEffect, useState } from 'react';
import './TaskPage.css';
import { useParams, useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';
import { missionService } from '../../services/missionService';
import { userService } from '../../services/userService';
import { taskService } from '../../services/taskService';
import Header from '../../components/Header/Header';
import Sidebar from '../../components/Sidebar/Sidebar';
import NewRegistrationComponent from '../../components/NewRegistrationComponent/NewRegistrationComponent';
import Modal from '../../components/Modal/Modal';
import TaskCreateModal from '../../components/TaskCreateModal/TaskCreateModal';
import TaskList from '../../components/TaskList/TaskList';
import { usePageTitle } from '../../hooks/usePageTitle';
import { Mission, MissionTask, MissionTaskRequest, MissionTaskStatus, User } from '../../types';

const TaskPage: React.FC = () => {
  const { missionId } = useParams<{ missionId: string }>();
  const [tasks, setTasks] = useState<MissionTask[]>([]);
  const [mission, setMission] = useState<Mission | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [taskToDelete, setTaskToDelete] = useState<number | null>(null);

  // Estado para o modal de ação de tarefa
  const [isActionModalOpen, setIsActionModalOpen] = useState<boolean>(false);
  const [currentTaskId, setCurrentTaskId] = useState<number | null>(null);
  const [actionModalTitle, setActionModalTitle] = useState<string>('');
  const [actionModalMessage, setActionModalMessage] = useState<string>('');
  const [currentAction, setCurrentAction] = useState<'complete' | 'approve' | 'reject'>('complete');

  const navigate = useNavigate();
  const currentUser = authService.getCurrentUser();
  const pageName = usePageTitle();

  // Verificar se o usuário atual é um administrador
  const isAdmin = currentUser?.role === 'ADMIN';

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  // Carregar missão, usuário e tarefas
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        if (!missionId) {
          throw new Error('ID da missão não fornecido');
        }

        const missionIdNumber = parseInt(missionId);

        // Buscar detalhes da missão
        const fetchedMission = await missionService.getMissionById(missionIdNumber);
        if (!fetchedMission) {
          throw new Error('Missão não encontrada');
        }
        setMission(fetchedMission);

        // Buscar detalhes do usuário responsável pela missão
        if (fetchedMission.userId) {
          const fetchedUser = await userService.getUserById(fetchedMission.userId);
          setUser(fetchedUser);
        }

        // Buscar tarefas relacionadas à missão
        const missionTasks = await taskService.getTasksByMissionId(missionIdNumber);
        setTasks(missionTasks);

      } catch (err) {
        console.error('Erro ao buscar dados:', err);
        setError('Não foi possível carregar os dados.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [missionId]);

  const handleCreateTask = async (newTaskData: Partial<MissionTask>) => {
    if (mission && currentUser) {
      try {
        const taskRequest: MissionTaskRequest = {
          name: newTaskData.name || '',
          status: newTaskData.status || MissionTaskStatus.AVAILABLE,
          missionId: mission.id,
          userId: currentUser.id,
          observation: newTaskData.observation
        };

        if (!taskRequest.name) {
          console.error("Nome da tarefa é obrigatório");
          return;
        }

        const newTask = await taskService.createTask(taskRequest);

        if (newTask) {
          setTasks(prevTasks => [...prevTasks, newTask]);
        }
      } catch (error) {
        console.error("Erro ao criar tarefa:", error);
      }
    }
    setIsCreateModalOpen(false);
  };

  const handleEditTask = async (taskId: number) => {
    console.log(`Editar tarefa ${taskId}`);
    const taskToUpdate = tasks.find(task => task.id === taskId);
    if (taskToUpdate) {
      const success = await taskService.updateTask(taskId, {
        name: "Nome atualizado", // Valor que viria do formulário
        status: taskToUpdate.status
      });
      if (success) {
        setTasks(prevTasks =>
          prevTasks.map(task => task.id === taskId
            ? { ...task, name: "Nome atualizado" }
            : task
          )
        );
      }
    }
  };

  const openDeleteModal = (taskId: number) => {
    setTaskToDelete(taskId);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (taskToDelete !== null) {
      const success = await taskService.deleteTask(taskToDelete);
      if (success) {
        setTasks(tasks.filter(task => task.id !== taskToDelete));
        setIsDeleteModalOpen(false);
      }
    }
  };

  // Função para marcar uma tarefa como concluída (para usuário)
  const handleTaskCheckClick = (taskId: number) => {
    setCurrentTaskId(taskId);
    setCurrentAction('complete');
    setActionModalTitle("Concluir Tarefa");
    setActionModalMessage("Tem certeza que deseja marcar esta tarefa como concluída?");
    setIsActionModalOpen(true);
  };

  // Função para aprovar tarefa (para admin)
  const handleAcceptTask = (taskId: number) => {
    setCurrentTaskId(taskId);
    setCurrentAction('approve');
    setActionModalTitle("Aprovar Tarefa");
    setActionModalMessage("Tem certeza que deseja aprovar esta tarefa?");
    setIsActionModalOpen(true);
  };

  // Função para rejeitar tarefa (para admin)
  const handleRejectTask = (taskId: number) => {
    setCurrentTaskId(taskId);
    setCurrentAction('reject');
    setActionModalTitle("Rejeitar Tarefa");
    setActionModalMessage("Tem certeza que deseja rejeitar esta tarefa?");
    setIsActionModalOpen(true);
  };

  // Função para processar a confirmação da ação
  const handleActionConfirm = async () => {
    if (currentTaskId === null) return;
    
    let newStatus: MissionTaskStatus;
    
    // Definir o status dependendo da ação
    switch (currentAction) {
      case 'complete':
        newStatus = MissionTaskStatus.PENDING;
        break;
      case 'approve':
        newStatus = MissionTaskStatus.APPROVED;
        break;
      case 'reject':
        newStatus = MissionTaskStatus.DENIED;
        break;
      default:
        return; // Sai da função se a ação não for reconhecida
    }
    
    // Usar o novo método updateTaskStatus para atualizar apenas o status
    const updatedTask = await taskService.updateTaskStatus(currentTaskId, newStatus);
    
    if (updatedTask) {
      // Atualizar a lista de tarefas com o objeto tarefa atualizado
      setTasks(prevTasks =>
        prevTasks.map(task => task.id === currentTaskId ? updatedTask : task)
      );
    }
    
    // Resetar estados
    setIsActionModalOpen(false);
    setCurrentTaskId(null);
  };

  return (
    <div className="task-page">
      <Header
        projectName="Behavior Bar"
        userName={currentUser?.name || 'Usuário'}
        onLogout={handleLogout}
        pageName={pageName}
      />

      <div className="page-content">
        <Sidebar />

        <main className="main-content">
          <div className="task-container">
            {mission && user && (
              <div className="mission-info-container">
                <h2>Missão: {mission.name}</h2>
                <p>Responsável: {user.name}</p>
              </div>
            )}

            {/* Só renderiza o componente de Nova Tarefa se o usuário for admin */}
            {isAdmin && (
              <NewRegistrationComponent
                title="Nova Tarefa"
                buttonText="Criar"
                onButtonClick={() => setIsCreateModalOpen(true)}
              />
            )}

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
          </div>
        </main>
      </div>

      {/* Modal de criação de tarefas */}
      <TaskCreateModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreate={handleCreateTask}
        missionId={mission?.id || 0}
      />

      {/* Modal de exclusão */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Excluir Tarefa"
        message="Tem certeza que deseja excluir esta tarefa? Esta ação não pode ser desfeita."
      />

      {/* Modal para ações de tarefa (completar, aprovar, rejeitar) */}
      <Modal
        isOpen={isActionModalOpen}
        onClose={() => {
          setIsActionModalOpen(false);
          setCurrentTaskId(null);
        }}
        onConfirm={handleActionConfirm}
        title={actionModalTitle}
        message={actionModalMessage}
      />
    </div>
  );
};

export default TaskPage;