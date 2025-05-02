// src/services/behaviorService.ts
import { BehaviorState, Infraction, InfractionCategory } from '../types';

// Categorias padrão de infrações
const DEFAULT_CATEGORIES: InfractionCategory[] = [
  { 
    id: 'chores', 
    name: 'Não Lavar a Louça', 
    description: 'Não lavou a louça.',
    pointsDeduction: 3
  },
  {
    id: 'dishonesty',
    name: 'Desonestidade',
    description: 'Mentiu ou foi desonesta.',
    pointsDeduction: 10
  },
  {
    id: 'disobedience',
    name: 'Desobediência',
    description: 'Não seguiu as regras ou instruções.',
    pointsDeduction: 10
  },
  {
    id: 'respect',
    name: 'Falta de respeito',
    description: 'Comportamento desrespeitoso.',
    pointsDeduction: 10
  },
  {
    id: 'make the bed',
    name: 'Não Arrumar a cama',
    description: 'Não arrumou a cama.',
    pointsDeduction: 10
  }
];

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
    id: Date.now().toString(),
    description,
    points,
    timestamp: new Date()
  };
  
  // Calcular novos pontos (não permitindo valores negativos)
  const newPoints = Math.max(0, state.currentPoints - points);
  
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

// Obter categorias de infrações
const getInfractionCategories = (): InfractionCategory[] => {
  return DEFAULT_CATEGORIES;
};

export const behaviorService = {
  getCurrentState,
  addInfraction,
  resetPoints,
  getInfractionCategories
};