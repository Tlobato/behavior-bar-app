// src/types/index.ts

// Tipo para uma infração individual
export interface Infraction {
    id: string;
    description: string;  // Ex: "Não arrumou a cama"
    points: number;       // Quantos pontos são deduzidos (ex: 5)
    timestamp: Date;      // Quando ocorreu
  }
  
  // Tipo para a configuração/estado de comportamento
  export interface BehaviorState {
    currentPoints: number;     // Pontos atuais (0-100)
    maxPoints: number;         // Máximo de pontos (default: 100)
    infractions: Infraction[]; // Histórico de infrações
    lastReset: Date;           // Última vez que foi resetado
  }
  
  // Tipo para as categorias de infrações pré-definidas
  export interface InfractionCategory {
    id: string;
    name: string;        // Ex: "Tarefas domésticas"
    description: string; // Ex: "Não cumpriu com obrigações da casa"
    pointsDeduction: number; // Quantos pontos são deduzidos
  }

  export interface User {
    id: string;
    username: string;
    role: 'admin' | 'user';
    name: string;
  }

  