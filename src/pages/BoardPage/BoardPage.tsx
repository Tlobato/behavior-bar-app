import React, { useState, useEffect } from 'react';
import './BoardPage.css';
import InfractionForm from '../../components/InfractionForm/InfractionForm';
import Modal from '../../components/Modal/Modal';
import { behaviorService } from '../../services/behaviorService';
import { authService } from '../../services/authService';
import { BehaviorState, Infraction, InfractionCategory } from '../../types';
import BehaviorBar from '../../components/BehaviorBar/BehaviorBar';
import BehaviorHistory from '../../components/BehaviorHistory/BehaviorHistory';
import Header from '../../components/Header/Header';
import { formatDate } from '../../utils/dateUtils';
import { useUser } from '../../context/UserContext'; // Importa o contexto do usuário

const BoardPage: React.FC = () => {
  const { user } = useUser(); // Obtém o usuário clicado na lista pelo contexto
  const currentUser = authService.getCurrentUser(); // Obtém o usuário logado (ADMIN)

  const [behaviorState, setBehaviorState] = useState<BehaviorState>({
    currentPoints: 100,
    maxPoints: 100,
    infractions: [],
    lastReset: new Date(),
  });
  const [categories, setCategories] = useState<InfractionCategory[]>([]);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  useEffect(() => {
    if (!user) {
      console.error('Usuário não encontrado no contexto.');
      return;
    }

    const loadBehaviorState = async () => {
      try {
        const infractions = await behaviorService.getBehaviorRecordsByUserId(user.id); // Usa o ID do usuário clicado
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
      await behaviorService.registerBehavior(description, points, saveAsPredefined, behaviorTypeId);

      const newInfraction: Infraction = {
        id: Date.now(),
        description,
        points,
        timestamp: new Date(),
        ativo: true,
      };

      setBehaviorState((prevState) => ({
        ...prevState,
        currentPoints: Math.max(0, prevState.currentPoints + points),
        infractions: [newInfraction, ...prevState.infractions],
      }));
    } catch (error) {
      console.error('Erro ao registrar o comportamento:', error);
    }
  };

  const confirmReset = async () => {
    try {
      await behaviorService.resetBehaviorRecords();
      setBehaviorState({
        currentPoints: 100,
        maxPoints: 100,
        infractions: [],
        lastReset: new Date(),
      });
      setIsModalOpen(false);
    } catch (error) {
      console.error('Erro ao resetar o histórico:', error);
    }
  };

  return (
    <div className="BoardPage">
      {/* Header exibe o nome do usuário logado */}
      <Header projectName="Behavior Bar" userName={currentUser?.name || 'Usuário'} onLogout={authService.logout} />

      <main className="board-container">
        <div className="behavior-section">
          {/* BehaviorBar exibe o nome do usuário clicado */}
          <BehaviorBar behaviorState={behaviorState} userName={user?.name || 'Usuário'} />

          <div className="reset-section">
            <button onClick={() => setIsModalOpen(true)} className="reset-button">
              Resetar Pontuação
            </button>
            <p className="reset-info">
              Última vez resetado: {formatDate(behaviorState.lastReset)}
            </p>
          </div>
        </div>

        <div className="form-section">
          <InfractionForm categories={categories} onAddInfraction={handleAddInfraction} />
        </div>

        <BehaviorHistory infractions={behaviorState.infractions} formatDate={formatDate} isAdmin={authService.isAdmin()} />
      </main>

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