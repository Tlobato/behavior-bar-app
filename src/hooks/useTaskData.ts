import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { missionService } from '../services/missionService';
import { userService } from '../services/userService';
import { taskService } from '../services/taskService';
import { usePageTitle } from './usePageTitle';
import { Mission, MissionStatus, MissionTask, MissionTaskRequest, MissionTaskStatus, User } from '../types';

export const useTaskData = () => {
    const { missionId } = useParams<{ missionId: string }>();
    const [tasks, setTasks] = useState<MissionTask[]>([]);
    const [mission, setMission] = useState<Mission | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
    const [taskToDelete, setTaskToDelete] = useState<number | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
    const [taskToEdit, setTaskToEdit] = useState<MissionTask | null>(null);
    const [missionProgress, setMissionProgress] = useState<number>(0);
    const [isMissionCompleted, setIsMissionCompleted] = useState<boolean>(false);

    const [isActionModalOpen, setIsActionModalOpen] = useState<boolean>(false);
    const [currentTaskId, setCurrentTaskId] = useState<number | null>(null);
    const [actionModalTitle, setActionModalTitle] = useState<string>('');
    const [actionModalMessage, setActionModalMessage] = useState<string>('');
    const [currentAction, setCurrentAction] = useState<'complete' | 'approve' | 'reject' | null>(null);

    const navigate = useNavigate();
    const currentUser = authService.getCurrentUser();
    const pageName = usePageTitle();

    const isAdmin = currentUser?.role === 'ADMIN' || currentUser?.role === 'TUTOR';

    const calculateMissionProgress = (tasksList: MissionTask[], currentMission: Mission | null) => {
        if (!tasksList.length || !currentMission) {
            setMissionProgress(0);
            setIsMissionCompleted(false);
            return;
        }

        const approvedTasks = tasksList.filter(task => task.status === MissionTaskStatus.APPROVED).length;
        const totalTasks = tasksList.length;

        const progressPercent = Math.round((approvedTasks / totalTasks) * 100);
        setMissionProgress(progressPercent);

        const allTasksApproved = approvedTasks === totalTasks;
        const isWithinDeadline = currentMission.deadline ? new Date() <= new Date(currentMission.deadline) : true;
        setIsMissionCompleted(allTasksApproved && isWithinDeadline);
    };

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            setError(null);
            try {
                if (!missionId) {
                    throw new Error('ID da missão não fornecido');
                }

                console.log('Iniciando busca de dados para missão:', missionId);
                const missionIdNumber = parseInt(missionId);

                // Buscar dados do usuário atual
                const token = localStorage.getItem('accessToken');
                console.log('Token encontrado:', !!token);
                if (!token) {
                    console.error('Token não encontrado');
                    navigate('/login');
                    return;
                }

                console.log('Token encontrado, buscando dados do usuário atual...');
                const currentUserData = authService.getCurrentUser();
                console.log('Usuário atual encontrado:', currentUserData);
                if (!currentUserData) {
                    console.error('Usuário atual não encontrado');
                    navigate('/login');
                    return;
                }
                setUser(currentUserData);

                console.log('Buscando missão:', missionIdNumber);
                const fetchedMission = await missionService.getMissionById(missionIdNumber);
                if (!fetchedMission) {
                    throw new Error('Missão não encontrada');
                }
                console.log('Missão encontrada:', fetchedMission);
                setMission(fetchedMission);

                if (fetchedMission.userId) {
                    console.log('Buscando usuário da missão:', fetchedMission.userId);
                    const fetchedUser = await userService.getUserById(fetchedMission.userId);
                    if (fetchedUser) {
                        console.log('Usuário da missão encontrado:', fetchedUser);
                        setUser({
                            ...fetchedUser,
                            name: fetchedUser.nome || fetchedUser.name
                        });
                    }
                }

                console.log('Buscando tarefas da missão:', missionIdNumber);
                const missionTasks = await taskService.getTasksByMissionId(missionIdNumber);
                console.log('Tarefas encontradas:', missionTasks);
                setTasks(missionTasks);

                calculateMissionProgress(missionTasks, fetchedMission);

            } catch (err) {
                console.error('Erro ao buscar dados:', err);
                setError('Não foi possível carregar os dados.');
                if (err instanceof Error && err.message.includes('não encontrado')) {
                    navigate('/board');
                }
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [missionId, navigate]);

    const handleLogout = () => {
        authService.logout();
        navigate('/login');
    };

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

                console.log('Criando nova tarefa:', taskRequest);
                const newTask = await taskService.createTask(taskRequest);

                if (newTask) {
                    console.log('Tarefa criada com sucesso:', newTask);
                    const updatedTasks = [...tasks, newTask];
                    setTasks(updatedTasks);
                    calculateMissionProgress(updatedTasks, mission);
                }
            } catch (error) {
                console.error('Erro ao criar tarefa:', error);
            }
        }
        setIsCreateModalOpen(false);
    };

    const handleEditTask = async (taskId: number) => {
        const taskToUpdate = tasks.find(task => task.id === taskId);
        if (taskToUpdate) {
            setTaskToEdit(taskToUpdate);
            setIsEditModalOpen(true);
        }
    };

    const handleUpdateTask = async (taskId: number, taskData: Partial<MissionTask>) => {
        const success = await taskService.updateTask(taskId, taskData);
        if (success) {
            const updatedTasks = tasks.map(task =>
                task.id === taskId ? { ...task, ...taskData } : task
            );
            setTasks(updatedTasks);
            calculateMissionProgress(updatedTasks, mission);
        }
    };

    const openDeleteModal = (taskId: number) => {
        setTaskToDelete(taskId);
        setIsDeleteModalOpen(true);
    };

    const handleDelete = async () => {
        if (taskToDelete !== null) {
            console.log('Excluindo tarefa:', taskToDelete);
            const success = await taskService.deleteTask(taskToDelete);
            if (success) {
                console.log('Tarefa excluída com sucesso');
                const updatedTasks = tasks.filter(task => task.id !== taskToDelete);
                setTasks(updatedTasks);
                calculateMissionProgress(updatedTasks, mission);
            } else {
                console.error('Erro ao excluir tarefa');
            }
            setIsDeleteModalOpen(false);
        }
    };

    const handleTaskCheckClick = (taskId: number) => {
        setCurrentTaskId(taskId);
        setCurrentAction('complete');
        setActionModalTitle("Concluir Tarefa");
        setActionModalMessage("Tem certeza que deseja marcar esta tarefa como concluída?");
        setIsActionModalOpen(true);
    };

    const handleAcceptTask = (taskId: number) => {
        setCurrentTaskId(taskId);
        setCurrentAction('approve');
        setActionModalTitle("Aprovar Tarefa");
        setActionModalMessage("Tem certeza que deseja aprovar esta tarefa?");
        setIsActionModalOpen(true);
    };

    const handleRejectTask = (taskId: number) => {
        setCurrentTaskId(taskId);
        setCurrentAction('reject');
        setActionModalTitle("Rejeitar Tarefa");
        setActionModalMessage("Tem certeza que deseja rejeitar esta tarefa?");
        setIsActionModalOpen(true);
    };

    const handleActionConfirm = async () => {
        if (currentTaskId === null) return;

        let newStatus: MissionTaskStatus;

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
                return;
        }

        console.log(`Atualizando status da tarefa ${currentTaskId} para ${newStatus}`);
        const updatedTask = await taskService.updateTaskStatus(currentTaskId, newStatus);

        if (updatedTask) {
            console.log('Tarefa atualizada com sucesso:', updatedTask);
            const updatedTasks = tasks.map(task =>
                task.id === currentTaskId ? updatedTask : task
            );
            setTasks(updatedTasks);

            calculateMissionProgress(updatedTasks, mission);

            if (currentAction === 'approve' && mission) {
                const allTasksApproved = updatedTasks.every(task => task.status === MissionTaskStatus.APPROVED);

                if (allTasksApproved) {
                    const isWithinDeadline = mission.deadline ? new Date() <= new Date(mission.deadline) : true;

                    if (isWithinDeadline) {
                        console.log('Todas as tarefas aprovadas, atualizando status da missão para COMPLETED');
                        await missionService.updateMissionStatus(mission.id, MissionStatus.COMPLETED);

                        setMission({
                            ...mission,
                            status: MissionStatus.COMPLETED
                        });
                    }
                }
            }
        }

        setIsActionModalOpen(false);
        setCurrentTaskId(null);
    };

    return {
        tasks,
        mission,
        user,
        isLoading,
        error,
        isCreateModalOpen,
        isDeleteModalOpen,
        isEditModalOpen,
        taskToDelete,
        taskToEdit,
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
        setIsEditModalOpen,
        setIsActionModalOpen,

        handleLogout,
        handleCreateTask,
        handleEditTask,
        handleUpdateTask,
        openDeleteModal,
        handleDelete,
        handleTaskCheckClick,
        handleAcceptTask,
        handleRejectTask,
        handleActionConfirm
    };
};