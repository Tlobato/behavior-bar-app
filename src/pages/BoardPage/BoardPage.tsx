import React, { useState, useEffect } from 'react';
import './BoardPage.css';
import InfractionForm from '../../components/InfractionForm/InfractionForm';
import Modal from '../../components/Modal/Modal';
import { behaviorService } from '../../services/behaviorService';
import { authService } from '../../services/authService';
import { userService } from '../../services/userService';
import { BehaviorState, InfractionCategory, User } from '../../types';
import BehaviorBar from '../../components/BehaviorBar/BehaviorBar';
import BehaviorHistory from '../../components/BehaviorHistory/BehaviorHistory';
import Header from '../../components/Header/Header';
import { formatDate } from '../../utils/dateUtils';
import { useNavigate, useParams } from 'react-router-dom';
import Sidebar from '../../components/Sidebar/Sidebar';
import { usePageTitle } from '../../hooks/usePageTitle';
import UserMissionsList from '../../components/UserMissionsList/UserMissionsList';

// Constante para valor inicial da pontuação
const DEFAULT_POINTS = 50;

const BoardPage: React.FC = () => {
  const currentUser = authService.getCurrentUser(); // Usuário logado
  const navigate = useNavigate();
  const { id: userIdFromUrl } = useParams<{ id: string }>(); // Captura o ID do usuário clicado na URL
  const pageName = usePageTitle();

  // Verificar se o usuário atual é um administrador
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

  // Carregar os dados do usuário do Board
  useEffect(() => {
    const loadBoardUser = async () => {
      setIsLoadingBoardUser(true); // Inicia o estado de carregamento
      try {
        const userIdToLoad = isAdmin && userIdFromUrl ? parseInt(userIdFromUrl, 10) : currentUser?.id;

        // Evita sobrescrever o estado se o usuário já estiver carregado
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

  // Carregar os dados de comportamento e categorias
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
  
      // Registrar comportamento no backend
      await behaviorService.registerBehavior(
        payload.customDescription,
        payload.points,
        payload.saveAsPredefined,
        payload.behaviorTypeId,
        payload.userId
      );
  
      // Recarregar dados do usuário para obter a pontuação atualizada
      const updatedUser = await userService.getUserById(boardUser.id);
  
      if (!updatedUser) {
        console.error('Erro ao recarregar dados do usuário: Usuário não encontrado.');
        return; // Interrompe a execução caso o usuário não seja encontrado
      }
  
      setBoardUser(updatedUser); // Atualiza o estado do usuário
  
      // Recarregar infrações com base na nova pontuação
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
            
            {/* Adicionamos a lista de missões como uma seção similar ao histórico */}
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