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
  rewardPoints?: number;
}

export interface RewardCardProps {
  title: string;
  description?: string; // Adicionando descrição
  imageUrl: string | null;
  points: number;
  isAvailable?: boolean;
  onClick?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

export interface UserEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (userId: number, userData: { name: string; email: string; role: 'USER' | 'ADMIN' }) => void;
  user: User | null;
}

// Interface para representar uma recompensa
export interface Reward {
  id?: number;
  title: string;
  description: string;
  points: number;
  imageUrl?: string | null;
  active?: boolean;
}

export interface RewardCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (rewardData: {
    title: string;
    description: string;
    points: number;
    imageFile?: File | null; // Modificado para File em vez de imageUrl
    active?: boolean;
  }) => void;
}

// Definir interface para o tipo de resposta do backend
export interface BackendReward {
  id: number;
  title: string;
  description: string;
  pointsRequired: number;
  imageUrl: string | null;
  active: boolean;
}

export interface HeaderProps {
  projectName: string;
  userName: string;
  onLogout: () => void;
  pageName?: string;
  rewardPoints?: number; // Nova prop para pontos de recompensa
  userRole?: string; // Adicionamos o tipo de usuário
}