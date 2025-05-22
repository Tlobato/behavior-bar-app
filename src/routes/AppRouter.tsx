import React, { JSX } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import { authService } from '../services/authService';
import BoardPage from '../pages/BoardPage/BoardPage';
import UserManagement from '../pages/UserManagementPage/UserManagementPage';
import RewardsPage from '../pages/RewardsPage/RewardsPage';
import Login from '../pages/LoginPage/LoginPage';
import MissionPage from '../pages/MissionPage/MissionPage';
import TaskPage from '../pages/TaskPage/TaskPage'; // Importação da TaskPage

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
  if (requiredRole && currentUser?.role !== requiredRole && currentUser?.role !== 'ADMIN') {
    return <Navigate to="/" />;
  }

  return children;
};

const AppRouter: React.FC = () => {
  return (
    <Routes>
      {/* Rota de Login */}
      <Route
        path="/login"
        element={
          <Login
            onLoginSuccess={() => {
              const user = authService.getCurrentUser();
              if (user?.role === 'ADMIN' || user?.role === 'TUTOR') {
                window.location.href = '/users';
              } else {
                // Redirecionar usuários USER para o board
                window.location.href = `/user/${user?.id}/board`;
              }
            }}
          />
        }
      />

      {/* Rota de Gerenciamento de Usuários (Apenas Admins e Tutores) */}
      <Route
        path="/users"
        element={
          <PrivateRoute requiredRole="ADMIN">
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

      {/* Rota de Missões (Apenas Admins) */}
      <Route
        path="/missions"
        element={
          <PrivateRoute requiredRole="ADMIN">
            <MissionPage />
          </PrivateRoute>
        }
      />

      {/* Rota de Tarefas da Missão */}
      <Route
        path="/missions/:missionId/tasks"
        element={
          <PrivateRoute>
            <TaskPage />
          </PrivateRoute>
        }
      />

      {/* Rota Padrão */}
      <Route path="/" element={<Navigate to="/login" />} />
    </Routes>
  );
};

export default AppRouter;