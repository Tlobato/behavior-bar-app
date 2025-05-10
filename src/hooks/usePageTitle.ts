// src/hooks/usePageTitle.ts

import { useLocation } from 'react-router-dom';
import { getPageNameFromPath } from '../utils/pageNames';

/**
 * Hook personalizado que retorna o título da página atual
 * baseado no caminho da URL
 * 
 * @returns O nome da página atual ou undefined
 */
export const usePageTitle = (): string | undefined => {
  const location = useLocation();
  return getPageNameFromPath(location.pathname);
};