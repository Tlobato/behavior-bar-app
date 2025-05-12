import React, { useState, useEffect } from 'react';
import './BoardPage.css';
import InfractionForm from '../../components/InfractionForm/InfractionForm';
import Modal from '../../components/Modal/Modal';
import { behaviorService } from '../../services/behaviorService';
import { authService } from '../../services/authService';
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
  const { user } = useUser();
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

  // Função de logout
  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  useEffect(() => {
    if (!user) {
      console.error('Usuário não encontrado no contexto.');
      return;
    }

    const loadBehaviorState = async () => {
      try {
        const infractions = await behaviorService.getBehaviorRecordsByUserId(user.id);
        const activeInfractions = infractions.filter((inf) => inf.ativo);
        const currentPoints = activeInfractions.reduce((acc, inf) => acc + inf.points, 100);
        setBehaviorState({
          currentPoints: Math.max(0, currentPoints),
          maxPoints: 100,
          infractions: activeInfractions,
          lastReset: new Date(),
        });
      } catch (error) {
        console.error('Erro ao carregar o estado do comportamento:', error);
      }
    };

    const loadCategories = async () => {
      try {
        const fetchedCategories = await behaviorService.getInfractionCategories();
        setCategories(fetchedCategories);
      } catch (error) {
        console.error('Erro ao carregar categorias:', error);
      }
    };

    loadBehaviorState();
    loadCategories();
  }, [user]);

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