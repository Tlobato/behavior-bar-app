import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { authService } from '../services/authService';
import { behaviorService } from '../services/behaviorService';
import { userService } from '../services/userService';
import { BehaviorState, InfractionCategory, User } from '../types';
import { usePageTitle } from './usePageTitle';
import { useUser } from '../contexts/UserContext';

const DEFAULT_POINTS = 50;

export function useBoardData() {
    const { user: currentUser } = useUser(); // Usando o contexto do usuário ao invés do authService
    const navigate = useNavigate();
    const { id: userIdFromUrl } = useParams<{ id: string }>(); // Captura o ID do usuário clicado na URL
    const pageName = usePageTitle();

    const isAdminOrTutor = currentUser?.role === 'ADMIN' || currentUser?.role === 'TUTOR';

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
                const userIdToLoad = isAdminOrTutor && userIdFromUrl ? parseInt(userIdFromUrl, 10) : currentUser?.id;

                if (!userIdToLoad) {
                    throw new Error('ID do usuário não encontrado.');
                }

                if (!boardUser || boardUser.id !== userIdToLoad) {
                    const userData = await userService.getUserById(userIdToLoad);
                    if (!userData) {
                        throw new Error('Usuário não encontrado.');
                    }
                    setBoardUser({
                        ...userData,
                        name: userData.nome ?? userData.name,
                    });
                }
            } catch (error) {
                console.error('Erro ao carregar usuário do BoardPage:', error);
                if (isAdminOrTutor) {
                    navigate('/users');
                } else {
                    navigate('/login');
                }
            } finally {
                setIsLoadingBoardUser(false); // Finaliza o estado de carregamento
            }
        };

        loadBoardUser();
    }, [userIdFromUrl, currentUser?.id, isAdminOrTutor, navigate, boardUser]);

    useEffect(() => {
        if (!boardUser) return;

        const loadData = async () => {
            try {
                const infractions = await behaviorService.getBehaviorRecordsByUserId(boardUser.id);
                const activeInfractions = infractions.filter((inf) => inf.ativo);

                setBehaviorState({
                    currentPoints: Math.max(0, boardUser.userScore?.pontuacaoAtual ?? DEFAULT_POINTS),
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

            setBoardUser({
                ...updatedUser,
                name: updatedUser.nome ?? updatedUser.name
            }); // Atualiza o estado do usuário garantindo o campo name

            const infractions = await behaviorService.getBehaviorRecordsByUserId(boardUser.id);
            const activeInfractions = infractions.filter((inf) => inf.ativo);

            setBehaviorState({
                currentPoints: Math.max(0, updatedUser.userScore?.pontuacaoAtual ?? DEFAULT_POINTS),
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
        isModalOpen,
        isAdminOrTutor,
        pageName,
        setIsModalOpen,
        handleAddInfraction,
        handleLogout,
        confirmReset,
        formatDate: (date: Date) => {
            return new Date(date).toLocaleDateString('pt-BR');
        }
    };
}