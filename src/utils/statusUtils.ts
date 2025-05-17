import { MissionTaskStatus } from "../types";

  // Função para traduzir o status da tarefa
  export const translateStatus = (status: MissionTaskStatus): string => {
    switch (status) {
      case MissionTaskStatus.AVAILABLE:
        return 'Disponível';
      case MissionTaskStatus.PENDING:
        return 'Aguardando Avaliação';
      case MissionTaskStatus.APPROVED:
        return 'Aprovada';
      case MissionTaskStatus.DENIED:
        return 'Negada';
      default:
        return status;
    }
  };