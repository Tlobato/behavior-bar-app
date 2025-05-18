import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { authService } from '../services/authService';
import { behaviorService } from '../services/behaviorService';
import { userService } from '../services/userService';
import { BehaviorState, InfractionCategory, User } from '../types';
import { usePageTitle } from './usePageTitle';

const DEFAULT_POINTS = 50;

export function useBoardData() {
    const currentUser = authService.getCurrentUser(); // Usuário logado
    const navigate = useNavigate();
    const { id: userIdFromUrl } = useParams<{ id: string }>(); // Captura o ID do usuário clicado na URL
    const pageName = usePageTitle();

    const isAdmin = currentUser?.role === 'ADMIN';

    const [boardUser, setBoardUser] = useState<User | null>(null); // Estado local para o usuário do BoardPage
    const [isLoadingBoardUser, setIsLoadingBoardUser] = useState<boolean>(true); // Estado de carregamento
    const [behaviorState, setBehaviorState] = useState<BehaviorState>({
        currentPoints: DEFAULT_POINTS,
        maxPoints: 100,
        infractions: [],
        lastReset: new Date(),
    });
    const [categories, setCategories] = useState<InfractionCategory[]>([]);
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

    useEffect(() => {
        const loadBoardUser = async () => {
            setIsLoadingBoardUser(true); // Inicia o estado de carregamento
            try {
                const userIdToLoad = isAdmin && userIdFromUrl ? parseInt(userIdFromUrl, 10) : currentUser?.id;

                if (userIdToLoad && (!boardUser || boardUser.id !== userIdToLoad)) {
                    const userData = await userService.getUserById(userIdToLoad);
                    if (!userData) {
                        throw new Error('Usuário não encontrado.');
                    }
                    setBoardUser(userData);
                } else if (!userIdToLoad) {
                    throw new Error('ID do usuário não encontrado.');
                }
            } catch (error) {
                console.error('Erro ao carregar usuário do BoardPage:', error);
                // Redireciona para UserManagement se ocorrer erro
                if (isAdmin) {
                    navigate('/users');
                } else {
                    navigate('/login');
                }
            } finally {
                setIsLoadingBoardUser(false); // Finaliza o estado de carregamento
            }
        };

        loadBoardUser();
    }, [userIdFromUrl, currentUser, isAdmin, navigate, boardUser]);

    useEffect(() => {
        if (!boardUser) return;

        const loadData = async () => {
            try {
                const infractions = await behaviorService.getBehaviorRecordsByUserId(boardUser.id);
                const activeInfractions = infractions.filter((inf) => inf.ativo);

                let currentPoints = DEFAULT_POINTS;
                if (activeInfractions.length > 0) {
                    currentPoints = activeInfractions.reduce((acc, inf) => acc + inf.points, DEFAULT_POINTS);
                }

                setBehaviorState({
                    currentPoints: Math.max(0, currentPoints),
                    maxPoints: 100,
                    infractions: activeInfractions,
                    lastReset: new Date(),
                });

                const fetchedCategories = await behaviorService.getInfractionCategories();
                setCategories(fetchedCategories);
            } catch (error) {
                console.error('Erro ao carregar dados de comportamento:', error);
            }
        };

        loadData();
    }, [boardUser]);

    const handleLogout = () => {
        authService.logout();
        navigate('/login');
    };

    const handleAddInfraction = async (
        description: string,
        points: number,
        saveAsPredefined: boolean,
        behaviorTypeId: number | null
    ) => {
        try {
            if (!boardUser) {
                console.error('Usuário não encontrado no contexto.');
                return;
            }

            const payload = {
                behaviorTypeId,
                customDescription: behaviorTypeId === null ? description : undefined,
                points,
                saveAsPredefined,
                userId: boardUser.id,
            };

            console.log('Payload enviado:', payload);

            await behaviorService.registerBehavior(
                payload.customDescription,
                payload.points,
                payload.saveAsPredefined,
                payload.behaviorTypeId,
                payload.userId
            );

            const updatedUser = await userService.getUserById(boardUser.id);

            if (!updatedUser) {
                console.error('Erro ao recarregar dados do usuário: Usuário não encontrado.');
                return; // Interrompe a execução caso o usuário não seja encontrado
            }

            setBoardUser(updatedUser); // Atualiza o estado do usuário

            const infractions = await behaviorService.getBehaviorRecordsByUserId(boardUser.id);
            const activeInfractions = infractions.filter((inf) => inf.ativo);

            setBehaviorState({
                currentPoints: Math.max(0, updatedUser.rewardPoints ?? 0), // Usa 0 como fallback caso rewardPoints seja undefined
                maxPoints: 100,
                infractions: activeInfractions,
                lastReset: behaviorState.lastReset,
            });
        } catch (error) {
            console.error('Erro ao registrar o comportamento:', error);
        }
    };

    const confirmReset = async () => {
        try {
            if (!boardUser) return;

            await behaviorService.resetBehaviorRecords(boardUser.id);

            const infractions = await behaviorService.getBehaviorRecordsByUserId(boardUser.id);
            const activeInfractions = infractions.filter((inf) => inf.ativo);

            setBehaviorState({
                currentPoints: DEFAULT_POINTS,
                maxPoints: 100,
                infractions: activeInfractions,
                lastReset: new Date(),
            });

            setIsModalOpen(false);
        } catch (error) {
            console.error('Erro ao resetar histórico:', error);
        }
    };

    return {
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
    };
}