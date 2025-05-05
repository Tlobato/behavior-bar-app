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

// Adicionar uma nova infração (local)
const addInfraction = (description: string, points: number): BehaviorState => {
  const state = loadData();
  const newInfraction: Infraction = {
    id: Date.now(),
    description,
    points, // Valor já com o sinal correto (positivo ou negativo)
    timestamp: new Date(),
    ativo: true, // Novas infrações locais são sempre ativas
  };

  // Corrige o cálculo de pontos na barra, somando diretamente
  const newPoints = Math.max(0, state.currentPoints + points);

  const newState: BehaviorState = {
    ...state,
    currentPoints: newPoints,
    infractions: [newInfraction, ...state.infractions],
  };

  saveData(newState);
  return newState;
};

// Resetar histórico no backend
const resetBehaviorRecords = async (): Promise<void> => {
  try {
    await axios.put('/api/behavior-records/reset'); // Faz a chamada PUT para o backend
    console.log('Histórico resetado com sucesso.');
  } catch (error) {
    console.error('Erro ao resetar o histórico:', error);
    throw error; // Lança o erro para ser tratado no frontend
  }
};

// Buscar categorias de infrações do backend
export const getInfractionCategories = async (): Promise<InfractionCategory[]> => {
  try {
    const response = await axios.get('/api/behavior-types'); // Exemplo de rota
    return response.data; // Assumindo que o backend retorna um array de categorias
  } catch (error) {
    console.error('Erro ao buscar categorias de infrações:', error);
    return []; // Retorna um array vazio em caso de erro
  }
};

// Registrar um comportamento no backend
const registerBehavior = async (description: string, points: number, saveAsPredefined: boolean, behaviorTypeId: number | null): Promise<void> => {
  try {
    const payload = {
      behaviorTypeId, // ID do comportamento pré-definido
      customDescription: behaviorTypeId === null ? description : null, // Apenas para comportamentos personalizados
      points, // Pontuação associada
      saveAsPredefined, // Flag para salvar como pré-definido
    };

    console.log('Payload enviado:', payload); // Log para verificar o que está sendo enviado

    await axios.post('/api/behavior-records', payload); // Faz a chamada POST para o backend
  } catch (error) {
    console.error('Erro ao registrar comportamento:', error);
    throw error; // Lança o erro para ser tratado no frontend
  }
};

// Listar o histórico de comportamentos do backend
const getBehaviorRecords = async (): Promise<Infraction[]> => {
  try {
    const response = await axios.get('/api/behavior-records'); // Faz a chamada GET para o backend

    // Log para inspecionar os dados retornados pelo backend
    console.log('Histórico retornado pelo backend:', response.data);

    return response.data; // Retorna a lista de registros
  } catch (error) {
    console.error('Erro ao buscar histórico de comportamentos:', error);
    return []; // Retorna um array vazio em caso de erro
  }
};

export const behaviorService = {
  getCurrentState,
  addInfraction,
  resetBehaviorRecords, // Novo método para resetar histórico no backend
  getInfractionCategories,
  registerBehavior, // Novo método para registrar comportamento no backend
  getBehaviorRecords, // Novo método para listar o histórico de comportamentos
};