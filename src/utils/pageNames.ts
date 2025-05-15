// src/utils/pageNames.ts

type RouteMapping = {
  [key: string]: string;
};

// Mapeamento de rotas para nomes de páginas
const pageNames: RouteMapping = {
  '/users': 'Gerenciamento de Usuários',
  '/rewards': 'Recompensas',
  '/board': 'Board',
  '/missions': 'Missões'  // Adicionado mapeamento para a página de missões
};

/**
 * Retorna o nome da página com base no caminho da URL
 * @param path - O caminho da URL atual
 * @returns O nome da página correspondente ou undefined
 */
export const getPageNameFromPath = (path: string): string | undefined => {
  // Verificação direta do caminho
  if (pageNames[path]) {
    return pageNames[path];
  }
  
  // Verificação específica para a rota do Board com parâmetro dinâmico
  if (path.match(/\/user\/\d+\/board/)) {
    return 'Board';
  }
  
  // Verificação para a rota de tarefas de missões específicas
  if (path.match(/\/missions\/\d+\/tasks/)) {
    return 'Tarefas da Missão';
  }
  
  // Verificação de caminhos parciais
  for (const route in pageNames) {
    if (path.startsWith(route)) {
      return pageNames[route];
    }
  }
  
  return undefined;
};