import React, { useState, useEffect } from 'react';
import './App.css';
import BehaviorBar from './components/BehaviorBar';
import InfractionForm from './components/InfractionForm';
import Login from './components/Login';
import { behaviorService } from './services/behaviorService';
import { authService } from './services/authService';
import { BehaviorState, Infraction, InfractionCategory } from './types';

function App() {
  const [behaviorState, setBehaviorState] = useState<BehaviorState>({
    currentPoints: 100,
    maxPoints: 100,
    infractions: [],
    lastReset: new Date(),
  }); // Estado inicial
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [categories, setCategories] = useState<InfractionCategory[]>([]); // Estado para armazenar as categorias

  // Verificar autenticação
  useEffect(() => {
    const checkAuth = () => {
      const authenticated = authService.isAuthenticated();
      setIsAuthenticated(authenticated);
      setIsAdmin(authService.isAdmin());
    };

    checkAuth();
  }, []);

  // Carregar histórico de comportamentos e estado inicial
  useEffect(() => {
    const loadBehaviorState = async () => {
      try {
        const infractions = await behaviorService.getBehaviorRecords(); // Busca o histórico do backend
        const currentPoints = infractions.reduce((acc, inf) => acc + inf.points, 100); // Calcula os pontos atuais
        setBehaviorState({
          currentPoints: Math.max(0, currentPoints), // Não permite valores negativos
          maxPoints: 100,
          infractions,
          lastReset: new Date(), // Pode ser ajustado para vir do backend no futuro
        });
      } catch (error) {
        console.error('Erro ao carregar o estado do comportamento:', error);
      }
    };

    loadBehaviorState();
  }, []);

  // Carregar as categorias de infrações
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const fetchedCategories = await behaviorService.getInfractionCategories(); // Busca as categorias do backend
        setCategories(fetchedCategories); // Atualiza o estado com as categorias
      } catch (error) {
        console.error('Erro ao carregar categorias:', error);
      }
    };

    loadCategories();
  }, []);

  // Adicionar uma nova infração
  const handleAddInfraction = async (
    description: string,
    points: number,
    saveAsPredefined: boolean,
    behaviorTypeId: number | null
  ) => {
    try {
      // Chama o backend para registrar o comportamento
      await behaviorService.registerBehavior(description, points, saveAsPredefined, behaviorTypeId);
  
      // Localiza o nome do comportamento pré-definido, se behaviorTypeId for fornecido
      const behaviorTypeName = behaviorTypeId
        ? categories.find((category) => category.id === behaviorTypeId)?.name || "Sem descrição disponível"
        : null;
  
      // Atualiza o histórico localmente após o registro
      const newInfraction: Infraction = {
        id: Date.now(),
        description: behaviorTypeId ? '' : description, // Deixa vazio se for pré-definido
        behaviorTypeName, // Nome do comportamento pré-definido (se aplicável)
        customDescription: behaviorTypeId ? null : description, // Preenche apenas para personalizados
        points,
        timestamp: new Date(),
      };
  
      setBehaviorState((prevState) => ({
        ...prevState,
        currentPoints: Math.max(0, prevState.currentPoints + points), // Atualiza os pontos
        infractions: [newInfraction, ...prevState.infractions], // Adiciona ao histórico
      }));
    } catch (error) {
      console.error('Erro ao registrar o comportamento:', error);
    }
  };

  // Resetar pontos
  const handleReset = () => {
    const newState = behaviorService.resetPoints();
    setBehaviorState(newState);
  };

  // Formatar data para exibição
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString();
  };

  // Função para lidar com o logout
  const handleLogout = () => {
    authService.logout();
    setIsAuthenticated(false);
    setIsAdmin(false);
  };

  // Função para lidar com o login bem-sucedido
  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
    setIsAdmin(authService.isAdmin());
  };

  // Mostrar tela de login se não estiver autenticado
  if (!isAuthenticated) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="App">
      <header className="App-header">
        <div className="header-content">
          <div className="header-title-container">
            <h1>Behavior Bar</h1>
            <p className="app-description">
              Um sistema para acompanhar e melhorar o comportamento.
            </p>
          </div>
          <button className="logout-button" onClick={handleLogout}>Sair</button>
        </div>
      </header>

      <main className="app-container">
        <div className="behavior-section">
          <BehaviorBar behaviorState={behaviorState} />

          {isAdmin && (
            <div className="reset-section">
              <button onClick={handleReset} className="reset-button">
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
            <InfractionForm
              categories={categories} // Agora passa as categorias do estado
              onAddInfraction={handleAddInfraction} // Atualizado para usar o método do backend
            />
          </div>
        )}

        <div className={`history-section ${!isAdmin ? 'centered-history' : ''}`}>
          <h3>Histórico de Comportamentos</h3>
          {behaviorState.infractions.length === 0 ? (
            <p>Sem comportamentos registrados. Ótimo trabalho!</p>
          ) : (
            <div className="infraction-list-container">
              <ul className="infraction-list">
                {behaviorState.infractions.map((infraction: Infraction) => (
                  <li key={infraction.id}>
                    {/* Ajuste para exibir o nome correto do comportamento */}
                    <strong>
                      {infraction.customDescription || infraction.behaviorTypeName || "Sem descrição disponível"}
                    </strong>
                    <div>
                      <span>{infraction.points} pontos</span>
                      <span style={{ float: 'right' }}>{formatDate(infraction.timestamp)}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;