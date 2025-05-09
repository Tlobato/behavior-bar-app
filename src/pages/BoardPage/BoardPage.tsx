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
import { useParams } from 'react-router-dom'; // Importa o hook useParams

const BoardPage: React.FC = () => {
  const { id } = useParams<{ id: string }>(); // Captura o ID do usuário da URL
  const [behaviorState, setBehaviorState] = useState<BehaviorState>({
    currentPoints: 100,
    maxPoints: 100,
    infractions: [],
    lastReset: new Date(),
  });
  const [categories, setCategories] = useState<InfractionCategory[]>([]);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  // Carregar histórico de comportamentos e categorias ao montar o componente
  useEffect(() => {
    const loadBehaviorState = async () => {
      if (!id) {
        console.error('Nenhum ID de usuário fornecido na URL.');
        return;
      }

      try {
        const infractions = await behaviorService.getBehaviorRecordsByUserId(Number(id)); // Chama o serviço com o ID do usuário
        const activeInfractions = infractions.filter((inf) => inf.ativo);
        const currentPoints = activeInfractions.reduce((acc, inf) => acc + inf.points, 100);
        setBehaviorState({
          currentPoints: Math.max(0, currentPoints),
          maxPoints: 100,
          infractions: activeInfractions,
          lastReset: new Date(),
        });
      } catch (error) {
        console.error(`Erro ao carregar o estado do comportamento para o usuário ${id}:`, error);
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
  }, [id]); // Recarrega os dados se o ID do usuário mudar

  // Adicionar uma nova infração
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

  // Resetar o histórico e a barra
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
      <Header projectName="Behavior Bar" userName="João Silva" onLogout={authService.logout} />

      <main className="board-container">
        <div className="behavior-section">
          <BehaviorBar behaviorState={behaviorState} />

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