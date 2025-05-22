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
  role: 'ADMIN' | 'USER' | 'TUTOR';
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
  onUpdate: (userId: number, userData: { name: string; email: string; role: 'USER' | 'ADMIN' | 'TUTOR' }) => void;
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
    imageFile?: File | null;
    active?: boolean;
  }) => void;
}

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

export interface Mission {
  id: number; // ID da missão
  name: string; // Nome da missão
  description?: string; // Descrição da missão (opcional)
  rewardPoints: number; // Pontos atribuídos à missão
  status: 'IN_PROGRESS' | 'COMPLETED' | 'FAIL'; // Status da missão
  createdAt: string; // Data de criação da missão (ISO string)
  deadline?: string; // Prazo para completar a missão (ISO string, opcional)
  userId: number; // ID do usuário associado à missão
  adminId?: number; // ID do administrador que criou a missão (opcional)
  tasks: MissionTask[]; // Lista de tarefas associadas à missão
}

export enum MissionStatus {
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  FAIL = 'FAIL',
}

export interface MissionTask {
  id: number; // ID da tarefa
  name: string; // Nome da tarefa
  description?: string; // Campo opcional de descrição
  status: MissionTaskStatus; // Status da tarefa
  observation?: string; // Observação do ADMIN (opcional)
  createdAt: string; // Data de criação da tarefa (ISO string)
  missionId: number; // ID da missão associada
  userId: number; // ID do usuário associado à tarefa
}

export interface MissionEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (missionId: number, missionData: {
    name: string;
    description: string;
    rewardPoints: number;
    deadline: string;
    userId: number;
  }) => void;
  mission: {
    id: number;
    name: string;
    description?: string;
    rewardPoints: number;
    deadline?: string;
    userId: number;
  } | null;
}

export interface MissionCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (missionData: {
    name: string;
    description: string;
    rewardPoints: number;
    deadline: string;
    userId: number;
  }) => void;
}

// Enum para status das tarefas de missão, correspondendo ao backend
export enum MissionTaskStatus {
  AVAILABLE = 'AVAILABLE',
  PENDING = 'PENDING',
  DENIED = 'DENIED',
  APPROVED = 'APPROVED'
}

// Interface para criação de uma nova tarefa (request)
export interface MissionTaskRequest {
  name: string;
  status: MissionTaskStatus;
  observation?: string;
  missionId: number;
  userId: number;
}

export interface MissionTaskUpdateRequest {
  name?: string;
  status?: MissionTaskStatus;
  observation?: string;
}

export interface TaskListProps {
  tasks: MissionTask[];
  mission: Mission | null;
  isAdmin: boolean;
  isLoading: boolean;
  error: string;
  onCompleteTask: (taskId: number) => void;
  onAcceptTask: (taskId: number) => void;
  onRejectTask: (taskId: number) => void;
  onEditTask: (taskId: number) => void;
  onDeleteTask: (taskId: number) => void;
}

export interface BehaviorBarProps {
  behaviorState: BehaviorState;
  userName: string;
  rewardPoints?: number;
}

export interface BehaviorHistoryProps {
  infractions: Infraction[];
  formatDate: (date: Date) => string;
  isAdmin: boolean;
}

export interface HotspotProps {
  message: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  onClose?: () => void;
}

export interface InfractionFormProps {
  categories: InfractionCategory[];
  onAddInfraction: (
    description: string,
    points: number,
    saveAsPredefined: boolean,
    behaviorTypeId: number | null
  ) => void;
}

export interface MissionHeaderProps {
  mission: Mission | null;
  user: User | null;
  tasks: MissionTask[];
  missionProgress: number;
  isMissionCompleted: boolean;
}

export interface MissionListProps {
  missions: Mission[];
  isLoading: boolean;
  error: string;
  shouldShowHotspot: boolean;
  getUserName: (userId: number | undefined) => string;
  handleManageTasks: (mission: Mission) => void;
  openEditModal: (mission: Mission) => void;
  openDeleteModal: (missionId: number) => void;
  handleHotspotClose: () => void;
}

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
}

export interface NewRegistrationComponentProps {
  title: string;
  buttonText: string;
  onButtonClick: () => void;
  width?: string; // Nova propriedade opcional
}

export interface RewardEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (editedReward: EditRewardData) => void;
  reward: Reward | null;
}

export interface EditRewardData {
  id: number;
  title: string;
  description: string;
  points: number;
  imageFile?: File | null;
  active?: boolean;
}

export interface TaskCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (task: Partial<MissionTask>) => void;
  missionId: number;
}

export interface UserCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (userData: { name: string; email: string; password: string; role: 'USER' | 'ADMIN' | 'TUTOR' }) => void;
}

export interface UserListProps {
  users: User[];
  isLoading: boolean;
  error: string;
  onAccessBoard: (user: User) => void;
  onEditUser: (user: User) => void;
  onDeleteUser: (userId: number) => void;
}

export interface UserMissionsListProps {
  userId: number;
}