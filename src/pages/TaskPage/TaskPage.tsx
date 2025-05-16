import React, { useEffect, useState } from 'react';
import './TaskPage.css';
import { useParams, useNavigate } from 'react-router-dom';
import { FaTrash, FaEdit, FaCheck, FaTimes } from 'react-icons/fa';
import { authService } from '../../services/authService';
import { missionService } from '../../services/missionService';
import { userService } from '../../services/userService';
import { taskService } from '../../services/taskService';
import Header from '../../components/Header/Header';
import Sidebar from '../../components/Sidebar/Sidebar';
import NewRegistrationComponent from '../../components/NewRegistrationComponent/NewRegistrationComponent';
import Modal from '../../components/Modal/Modal';
import TaskCreateModal from '../../components/TaskCreateModal/TaskCreateModal';
import { usePageTitle } from '../../hooks/usePageTitle';
import { formatDateTime } from '../../utils/dateUtils';
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
  
  const navigate = useNavigate();
  const currentUser = authService.getCurrentUser();
  const pageName = usePageTitle();

  // Função para traduzir o status da tarefa
  const translateStatus = (status: MissionTaskStatus): string => {
    switch (status) {
      case MissionTaskStatus.AVAILABLE:
        return 'Disponível';
      case MissionTaskStatus.PENDING:
        return 'Pendente';
      case MissionTaskStatus.APPROVED:
        return 'Aprovada';
      case MissionTaskStatus.DENIED:
        return 'Negada';
      default:
        return status;
    }
  };

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

        // Buscar tarefas relacionadas à missão usando o serviço que criamos
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
        // Cria um objeto que corresponde ao tipo MissionTaskRequest
        const taskRequest: MissionTaskRequest = {
          name: newTaskData.name || '',  // Converte undefined para string vazia
          status: newTaskData.status || MissionTaskStatus.AVAILABLE,
          missionId: mission.id,
          userId: currentUser.id,
          observation: newTaskData.observation
        };
        
        // Validação adicional antes de enviar
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
    // Esta função abriria um modal para edição e depois chamaria updateTask
    console.log(`Editar tarefa ${taskId}`);
    const taskToUpdate = tasks.find(task => task.id === taskId);
    if (taskToUpdate) {
      const success = await taskService.updateTask(taskId, {
        name: "Nome atualizado", // Valor que viria do formulário
        status: taskToUpdate.status
      });
      if (success) {
        // Atualizar a lista de tarefas
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
        // Atualizar o estado removendo a tarefa excluída
        setTasks(tasks.filter(task => task.id !== taskToDelete));
        setIsDeleteModalOpen(false);
      }
    }
  };

  const handleAcceptTask = async (taskId: number) => {
    const success = await taskService.updateTask(taskId, {
      status: MissionTaskStatus.APPROVED
    });
    
    if (success) {
      // Atualizar a lista de tarefas com o novo status
      setTasks(prevTasks => 
        prevTasks.map(task => task.id === taskId 
          ? { ...task, status: MissionTaskStatus.APPROVED } 
          : task
        )
      );
    }
  };

  const handleRejectTask = async (taskId: number) => {
    const success = await taskService.updateTask(taskId, {
      status: MissionTaskStatus.DENIED
    });
    
    if (success) {
      // Atualizar a lista de tarefas com o novo status
      setTasks(prevTasks => 
        prevTasks.map(task => task.id === taskId 
          ? { ...task, status: MissionTaskStatus.DENIED } 
          : task
        )
      );
    }
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

            <NewRegistrationComponent
              title="Nova Tarefa"
              buttonText="Criar"
              onButtonClick={() => setIsCreateModalOpen(true)}
            />

            {isLoading && <p className="loading-message">Carregando tarefas...</p>}
            {error && <p className="error-message">{error}</p>}

            {!isLoading && !error && (
              <div className="table-container">
                <table className="task-table">
                  <thead>
                    <tr>
                      <th>Tarefa</th>
                      <th>Status</th>
                      <th>Prazo</th>
                      <th>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tasks.map(task => (
                      <tr key={task.id}>
                        <td>{task.name}</td>
                        <td>{translateStatus(task.status)}</td>
                        <td>{mission?.deadline ? formatDateTime(mission.deadline) : 'Sem prazo'}</td>
                        <td className="action-icons">
                          <div
                            className="action-icon accept-icon"
                            title="Aceitar"
                            onClick={() => handleAcceptTask(task.id)}
                          >
                            <FaCheck />
                          </div>
                          <div
                            className="action-icon reject-icon"
                            title="Rejeitar"
                            onClick={() => handleRejectTask(task.id)}
                          >
                            <FaTimes />
                          </div>
                          <div
                            className="action-icon"
                            title="Editar"
                            onClick={() => handleEditTask(task.id)}
                          >
                            <FaEdit />
                          </div>
                          <div
                            className="action-icon delete-icon"
                            title="Excluir"
                            onClick={() => openDeleteModal(task.id)}
                          >
                            <FaTrash />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
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
    </div>
  );
};

export default TaskPage;