import { BehaviorState, Infraction, InfractionCategory } from '../types';
import axios from 'axios'; // Usaremos Axios para realizar as requisições HTTP

// Estado inicial do comportamento
const INITIAL_STATE: BehaviorState = {
  currentPoints: 100,
  maxPoints: 100,
  infractions: [],
  lastReset: new Date()
};

// Chave para armazenamento local
const STORAGE_KEY = 'behavior-bar-data';

// Carregar dados do localStorage
const loadData = (): BehaviorState => {
  const savedData = localStorage.getItem(STORAGE_KEY);
  if (!savedData) {
    return INITIAL_STATE;
  }
  
  try {
    const parsedData = JSON.parse(savedData);
    // Converte strings de data de volta para objetos Date
    return {
      ...parsedData,
      lastReset: new Date(parsedData.lastReset),
      infractions: parsedData.infractions.map((inf: any) => ({
        ...inf,
        timestamp: new Date(inf.timestamp)
      }))
    };
  } catch (error) {
    console.error('Erro ao carregar dados:', error);
    return INITIAL_STATE;
  }
};

// Salvar dados no localStorage
const saveData = (state: BehaviorState): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
};

// Obter o estado atual
const getCurrentState = (): BehaviorState => {
  return loadData();
};

// Adicionar uma nova infração
const addInfraction = (description: string, points: number): BehaviorState => {
  const state = loadData();
  const newInfraction: Infraction = {
    id: Date.now(),
    description,
    points, // Valor já com o sinal correto (positivo ou negativo)
    timestamp: new Date()
  };

  // Corrige o cálculo de pontos na barra, somando diretamente
  const newPoints = Math.max(0, state.currentPoints + points);

  const newState: BehaviorState = {
    ...state,
    currentPoints: newPoints,
    infractions: [newInfraction, ...state.infractions]
  };

  saveData(newState);
  return newState;
};

// Resetar pontuação para o máximo
const resetPoints = (): BehaviorState => {
  const state = loadData();
  const newState: BehaviorState = {
    ...state,
    currentPoints: state.maxPoints,
    lastReset: new Date()
  };
  
  saveData(newState);
  return newState;
};

// Buscar categorias de infrações do backend
const getInfractionCategories = async (): Promise<InfractionCategory[]> => {
  try {
    const response = await axios.get('/api/behavior-types'); // Exemplo de rota
    return response.data; // Assumindo que o backend retorna um array de categorias
  } catch (error) {
    console.error('Erro ao buscar categorias de infrações:', error);
    return []; // Retorna um array vazio em caso de erro
  }
};

export const behaviorService = {
  getCurrentState,
  addInfraction,
  resetPoints,
  getInfractionCategories
};