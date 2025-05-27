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
    const [error, setError] = useState<string>('');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
    const [taskToDelete, setTaskToDelete] = useState<number | null>(null);
    const [missionProgress, setMissionProgress] = useState<number>(0);
    const [isMissionCompleted, setIsMissionCompleted] = useState<boolean>(false);

    const [isActionModalOpen, setIsActionModalOpen] = useState<boolean>(false);
    const [currentTaskId, setCurrentTaskId] = useState<number | null>(null);
    const [actionModalTitle, setActionModalTitle] = useState<string>('');
    const [actionModalMessage, setActionModalMessage] = useState<string>('');
    const [currentAction, setCurrentAction] = useState<'complete' | 'approve' | 'reject'>('complete');

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
            try {
                if (!missionId) {
                    throw new Error('ID da missão não fornecido');
                }

                const missionIdNumber = parseInt(missionId);

                const fetchedMission = await missionService.getMissionById(missionIdNumber);
                if (!fetchedMission) {
                    throw new Error('Missão não encontrada');
                }
                setMission(fetchedMission);

                if (fetchedMission.userId) {
                    const fetchedUser = await userService.getUserById(fetchedMission.userId);
                    setUser(fetchedUser);
                }

                const missionTasks = await taskService.getTasksByMissionId(missionIdNumber);
                setTasks(missionTasks);

                calculateMissionProgress(missionTasks, fetchedMission);

            } catch (err) {
                console.error('Erro ao buscar dados:', err);
                setError('Não foi possível carregar os dados.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [missionId]);

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

                const newTask = await taskService.createTask(taskRequest);

                if (newTask) {
                    const updatedTasks = [...tasks, newTask];
                    setTasks(updatedTasks);
                    calculateMissionProgress(updatedTasks, mission);
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
                const updatedTasks = tasks.map(task =>
                    task.id === taskId ? { ...task, name: "Nome atualizado" } : task
                );
                setTasks(updatedTasks);
                calculateMissionProgress(updatedTasks, mission);
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
                const updatedTasks = tasks.filter(task => task.id !== taskToDelete);
                setTasks(updatedTasks);
                calculateMissionProgress(updatedTasks, mission);
                setIsDeleteModalOpen(false);
            }
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
                return; // Sai da função se a ação não for reconhecida
        }

        const updatedTask = await taskService.updateTaskStatus(currentTaskId, newStatus);

        if (updatedTask) {
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

    // Função para resgatar pontos da missão
    const handleRedeemMissionPoints = async () => {
        if (!mission || !user) return;
        // Evita resgate duplo
        if (mission.status !== 'COMPLETED') return;
        try {
            const pontosAtuais = user.rewardPoints || 0;
            const pontosMissao = mission.rewardPoints || 0;
            const novosPontos = pontosAtuais + pontosMissao;
            // Atualiza pontos do usuário
            await userService.updateUserRewardPoints(user.id, novosPontos);
            // Atualiza status da missão para 'FAIL' (ou outro status que indique resgatada, se houver)
            // Aqui apenas um exemplo, pode ser necessário um campo extra no backend para 'resgatada'
            // await missionService.updateMissionStatus(mission.id, 'REDEEMED');
            // Atualiza usuário localmente
            setUser({ ...user, rewardPoints: novosPontos });
        } catch (error) {
            console.error('Erro ao resgatar pontos da missão:', error);
        }
    };

    return {
        tasks,
        mission,
        user,
        isLoading,
        error,
        isCreateModalOpen,
        isDeleteModalOpen,
        taskToDelete,
        missionProgress,
        isMissionCompleted,
        isActionModalOpen,
        currentTaskId,
        actionModalTitle,
        actionModalMessage,
        currentAction,
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
        handleRedeemMissionPoints
    };
};