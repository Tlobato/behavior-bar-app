/**
 * Verifica se o usuário já viu a dica de criação de tarefas para missões
 * @param userId - ID do usuário logado
 * @returns boolean - true se é a primeira vez que o usuário cria uma missão
 */
export const checkFirstMissionCreated = (userId: number): boolean => {
    const key = `mission_task_hint_${userId}`;
    return localStorage.getItem(key) !== 'true';
  };
  
  /**
   * Marca que o usuário já viu a dica de criação de tarefas para missões
   * @param userId - ID do usuário logado
   */
  export const markFirstMissionCreated = (userId: number): void => {
    const key = `mission_task_hint_${userId}`;
    localStorage.setItem(key, 'true');
  };