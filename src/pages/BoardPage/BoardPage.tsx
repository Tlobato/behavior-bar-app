import React, { useState, useEffect } from 'react';
import './BoardPage.css';
import InfractionForm from '../../components/InfractionForm/InfractionForm';
import Modal from '../../components/Modal/Modal';
import { behaviorService } from '../../services/behaviorService';
import { authService } from '../../services/authService';
import { BehaviorState, InfractionCategory } from '../../types'; // Removemos 'Infraction' daqui
import BehaviorBar from '../../components/BehaviorBar/BehaviorBar';
import BehaviorHistory from '../../components/BehaviorHistory/BehaviorHistory';
import Header from '../../components/Header/Header';
import { formatDate } from '../../utils/dateUtils';
import { useUser } from '../../context/UserContext'; // Importa o contexto do usuário
import { useNavigate } from 'react-router-dom';

const BoardPage: React.FC = () => {
  const { user } = useUser(); // Obtém o usuário clicado na lista pelo contexto
  const currentUser = authService.getCurrentUser(); // Obtém o usuário logado (ADMIN)
  const navigate = useNavigate();

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
    authService.logout(); // Limpa o localStorage
    navigate('/login'); // Redireciona para a tela de login
  };

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
      if (!user) {
        console.error('Usuário não encontrado no contexto.');
        return;
      }

      const payload = {
        behaviorTypeId, // ID do comportamento pré-definido
        customDescription: behaviorTypeId === null ? description : undefined, // Usa undefined em vez de null
        points, // Pontuação associada
        saveAsPredefined, // Flag para salvar como pré-definido
        userId: user.id, // Inclui o ID do usuário clicado
      };

      console.log('Payload enviado:', payload);

      // Salva o comportamento no backend
      await behaviorService.registerBehavior(
        payload.customDescription,
        payload.points,
        payload.saveAsPredefined,
        payload.behaviorTypeId,
        payload.userId
      );

      // Busca o histórico atualizado do backend
      const updatedInfractions = await behaviorService.getBehaviorRecordsByUserId(user.id);

      // Atualiza o estado com os dados atualizados
      setBehaviorState((prevState) => ({
        ...prevState,
        currentPoints: Math.max(0, prevState.currentPoints + points),
        infractions: updatedInfractions, // Substitui o histórico pelo atualizado
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
      <Header projectName="Behavior Bar" userName={currentUser?.name || 'Usuário'} onLogout={handleLogout} />

      <main className="board-container">
        {/* Barra de Comportamento */}
        <div className="behavior-section">
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

        {/* Registrar Comportamento */}
        <div className="form-section">
          <InfractionForm categories={categories} onAddInfraction={handleAddInfraction} />
        </div>

        {/* Histórico de Comportamentos */}
        <div className="history-section">
          <BehaviorHistory infractions={behaviorState.infractions} formatDate={formatDate} isAdmin={authService.isAdmin()} />
        </div>
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