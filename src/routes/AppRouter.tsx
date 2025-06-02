import React, { JSX } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import { authService } from '../services/authService';
import BoardPage from '../pages/BoardPage/BoardPage';
import UserManagement from '../pages/UserManagementPage/UserManagementPage';
import RewardsPage from '../pages/RewardsPage/RewardsPage';
import MissionPage from '../pages/MissionPage/MissionPage';
import TaskPage from '../pages/TaskPage/TaskPage'; // Importação da TaskPage
import AuthFlow from '../pages/AuthFlow';
import RewardRedemptionsPage from '../pages/RewardRedemptionsPage/RewardRedemptionsPage';

// Componente para proteger rotas privadas
const PrivateRoute: React.FC<{ children: JSX.Element; requiredRole?: 'ADMIN' | 'USER' | 'TUTOR' }> = ({ children, requiredRole }) => {
  const isAuthenticated = authService.isAuthenticated();
  const currentUser = authService.getCurrentUser();

  console.log('isAuthenticated:', isAuthenticated); 
  console.log('currentUser:', currentUser);

  // Se o usuário não está autenticado, redireciona para login
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  // Permite ADMIN acessar qualquer rota
  if (requiredRole === 'ADMIN' && currentUser?.role !== 'ADMIN') {
    return <Navigate to="/" />;
  }
  if (requiredRole && requiredRole !== 'ADMIN' && currentUser?.role !== requiredRole && currentUser?.role !== 'ADMIN' && currentUser?.role !== 'TUTOR') {
    return <Navigate to="/" />;
  }

  return children;
};

const AppRouter: React.FC = () => {
  return (
    <Router>
      <Routes>
        {/* Rota de Login */}
        <Route
          path="/login"
          element={
            <AuthFlow />
          }
        />

        {/* Rota de Gerenciamento de Usuários (Admins e Tutores) */}
        <Route
          path="/users"
          element={
            <PrivateRoute requiredRole="TUTOR">
              <UserManagement />
            </PrivateRoute>
          }
        />

        {/* Rota de Board (Barra de Pontuação) */}
        <Route
          path="/user/:id/board"
          element={
            <PrivateRoute requiredRole="USER">
              <BoardPage />
            </PrivateRoute>
          }
        />

        {/* Rota de Recompensas */}
        <Route
          path="/rewards"
          element={
            <PrivateRoute requiredRole="USER">
              <RewardsPage />
            </PrivateRoute>
          }
        />

        {/* Rota de Missões (Admins e Tutores) */}
        <Route
          path="/missions"
          element={
            <PrivateRoute requiredRole="TUTOR">
              <MissionPage />
            </PrivateRoute>
          }
        />

        {/* Rota de Tarefas da Missão (Admins, Tutores e Usuários) */}
        <Route
          path="/missions/:missionId/tasks"
          element={
            <PrivateRoute requiredRole="USER">
              <TaskPage />
            </PrivateRoute>
          }
        />

        {/* Rota de Histórico de Resgates (Admins e Tutores) */}
        <Route
          path="/reward-redemptions"
          element={
            <PrivateRoute requiredRole="TUTOR">
              <RewardRedemptionsPage />
            </PrivateRoute>
          }
        />

        {/* Rota Padrão */}
        <Route path="/" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
};

export default AppRouter;