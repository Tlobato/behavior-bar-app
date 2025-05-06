import React, { JSX } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import { authService } from '../services/authService';
import Login from '../components/Login/Login';
import UserManagement from '../components/UserManagement/UserManagement';
import BoardPage from '../pages/BoardPage/BoardPage'; // Ajuste para importar o BoardPage

// Componente para proteger rotas privadas
const PrivateRoute: React.FC<{ children: JSX.Element; requiredRole?: 'admin' | 'user' }> = ({ children, requiredRole }) => {
  const isAuthenticated = authService.isAuthenticated();
  const currentUser = authService.getCurrentUser();

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (requiredRole && currentUser?.role !== requiredRole) {
    return <Navigate to="/" />;
  }

  return children;
};

const AppRouter: React.FC = () => {
  return (
    <Router>
      <Routes>
        {/* Rota de Login */}
        <Route path="/login" element={<Login onLoginSuccess={() => window.location.href = '/users'} />} />

        {/* Rota de Gerenciamento de Usuários (Apenas Admins) */}
        <Route
          path="/users"
          element={
            <PrivateRoute requiredRole="admin">
              <UserManagement />
            </PrivateRoute>
          }
        />

        {/* Rota de Board (Barra de Pontuação) */}
        <Route
          path="/user/:id/board"
          element={
            <PrivateRoute requiredRole="user">
              <BoardPage />
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