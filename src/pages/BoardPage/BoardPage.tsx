import React, { useState, useEffect } from 'react';
import './BoardPage.css';
import InfractionForm from '../../components/InfractionForm/InfractionForm';
import Modal from '../../components/Modal/Modal';
import { behaviorService } from '../../services/behaviorService';
import { authService } from '../../services/authService';
import { userService } from '../../services/userService';
import { BehaviorState, InfractionCategory } from '../../types';
import BehaviorBar from '../../components/BehaviorBar/BehaviorBar';
import BehaviorHistory from '../../components/BehaviorHistory/BehaviorHistory';
import Header from '../../components/Header/Header';
import { formatDate } from '../../utils/dateUtils';
import { useUser } from '../../context/UserContext';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar/Sidebar';
import { usePageTitle } from '../../hooks/usePageTitle';

const BoardPage: React.FC = () => {
  const { user, setUser } = useUser();
  const currentUser = authService.getCurrentUser();
  const navigate = useNavigate();
  const pageName = usePageTitle();

  // Verificar se o usuário atual é um administrador
  const isAdmin = currentUser?.role === 'ADMIN';

  const [behaviorState, setBehaviorState] = useState<BehaviorState>({
    currentPoints: 100,
    maxPoints: 100,
    infractions: [],
    lastReset: new Date(),
  });
  const [categories, setCategories] = useState<InfractionCategory[]>([]);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  // Adicionar estado para controlar o carregamento inicial
  const [isDataLoaded, setIsDataLoaded] = useState<boolean>(false);

  // Função de logout
  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  useEffect(() => {
    // Se os dados já foram carregados ou não há usuário, não execute novamente
    if (isDataLoaded || !user) {
      return;
    }

    const loadData = async () => {
      try {
        // Carregar dados do usuário
        const updatedUser = await userService.getUserById(user.id);
        if (updatedUser) {
          setUser(updatedUser);
        }

        // Carregar estado de comportamento
        const infractions = await behaviorService.getBehaviorRecordsByUserId(user.id);
        const activeInfractions = infractions.filter((inf) => inf.ativo);
        const currentPoints = activeInfractions.reduce((acc, inf) => acc + inf.points, 100);
        setBehaviorState({
          currentPoints: Math.max(0, currentPoints),
          maxPoints: 100,
          infractions: activeInfractions,
          lastReset: new Date(),
        });

        // Carregar categorias
        const fetchedCategories = await behaviorService.getInfractionCategories();
        setCategories(fetchedCategories);

        // Marcar os dados como carregados
        setIsDataLoaded(true);
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
      }
    };

    loadData();
  }, [user, setUser, isDataLoaded]);

  // Efeito separado para atualizações de dados quando ações ocorrem
  const reloadUserData = async () => {
    if (!user) return;
    
    try {
      const updatedUser = await userService.getUserById(user.id);
      if (updatedUser) {
        setUser(updatedUser);
      }
    } catch (error) {
      console.error('Erro ao recarregar dados do usuário:', error);
    }
  };

  const handleAddInfraction = async (
    description: string,
    points: number,
    saveAsPredefined: boolean,
    behaviorTypeId: number | null
  ) => {
    try {
      if (!user) {
        console.error('Usuário não encontrado no contexto.');
        return;
      }

      const payload = {
        behaviorTypeId,
        customDescription: behaviorTypeId === null ? description : undefined,
        points,
        saveAsPredefined,
        userId: user.id,
      };

      console.log('Payload enviado:', payload);

      await behaviorService.registerBehavior(
        payload.customDescription,
        payload.points,
        payload.saveAsPredefined,
        payload.behaviorTypeId,
        payload.userId
      );

      const infractions = await behaviorService.getBehaviorRecordsByUserId(user.id);
      const activeInfractions = infractions.filter((inf) => inf.ativo);

      setBehaviorState((prevState) => ({
        ...prevState,
        currentPoints: Math.max(0, prevState.currentPoints + points),
        infractions: activeInfractions,
      }));
      
      // Recarregar dados do usuário após adicionar infração
      reloadUserData();
    } catch (error) {
      console.error('Erro ao registrar o comportamento:', error);
    }
  };

  const confirmReset = async () => {
    try {
      if (!user || !user.id) {
        console.error('Usuário não encontrado no contexto.');
        return;
      }

      await behaviorService.resetBehaviorRecords(user.id);

      const infractions = await behaviorService.getBehaviorRecordsByUserId(user.id);
      const activeInfractions = infractions.filter((inf) => inf.ativo);

      setBehaviorState({
        currentPoints: 100,
        maxPoints: 100,
        infractions: activeInfractions,
        lastReset: new Date(),
      });
      
      // Recarregar dados do usuário após resetar
      reloadUserData();

      setIsModalOpen(false);
    } catch (error) {
      console.error('Erro ao resetar o histórico:', error);
    }
  };

  return (
    <div className="BoardPage">
      <Header
        projectName="Behavior Bar"
        userName={currentUser?.name || 'Usuário'}
        onLogout={handleLogout}
        pageName={pageName}
        rewardPoints={!isAdmin && user ? user.rewardPoints : undefined}
        userRole={currentUser?.role}
      />
      <div className="page-content">
        <Sidebar />
        <main className="main-content">
          <div className="board-container">
            <div className="behavior-section">
              <BehaviorBar behaviorState={behaviorState} userName={user?.name || 'Usuário'} />

              {/* Seção de reset visível apenas para administradores */}
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

            {/* Formulário de registro de comportamento visível apenas para administradores */}
            {isAdmin && (
              <div className="form-section">
                <InfractionForm categories={categories} onAddInfraction={handleAddInfraction} />
              </div>
            )}

            {/* Histórico de comportamento visível para todos */}
            <div className="history-section">
              <BehaviorHistory infractions={behaviorState.infractions} formatDate={formatDate} isAdmin={isAdmin} />
            </div>
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