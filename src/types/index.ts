// Tipo para uma infração individual
export interface Infraction {
  id: number;
  description: string; // Mantém para compatibilidade com o estado local
  points: number;
  timestamp: Date;
  customDescription?: string | null; // Permite string ou null
  behaviorTypeName?: string | null; // Permite string ou null
  ativo: boolean; // Indica se o registro está ativo ou inativo
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
  id: number;
  name: string;        // Ex: "Tarefas domésticas"
  description: string; // Ex: "Não cumpriu com obrigações da casa"
  pointsDeduction: number; // Quantos pontos são deduzidos
}

export interface User {
  id: number;
  name: string;
  role: 'ADMIN' | 'USER';
  email: string;
  password?: string;
}

export interface RewardCardProps {
  title: string; // Título do prêmio
  imageUrl: string | null; // URL da imagem
  points: number; // Pontos necessários para resgatar
  isAvailable?: boolean; // Indica se o botão está funcional ou é um placeholder
  onClick?: () => void; // Função chamada ao clicar no botão
}