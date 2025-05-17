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


      // Função para traduzir o status da missão
      export const translateMissionStatus = (status: string): string => {
          switch (status) {
              case 'IN_PROGRESS':
                  return 'Em progresso';
              case 'COMPLETED':
                  return 'Finalizada';
              case 'FAIL':
                  return 'Não concluída';
              default:
                  return status;
          }
      };