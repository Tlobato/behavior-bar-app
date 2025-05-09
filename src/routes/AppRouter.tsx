import React, { JSX } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import { authService } from '../services/authService';
import Login from '../components/Login/Login';
import UserManagement from '../components/UserManagement/UserManagement';
import BoardPage from '../pages/BoardPage/BoardPage'; // Ajuste para importar o BoardPage

// Componente para proteger rotas privadas
const PrivateRoute: React.FC<{ children: JSX.Element; requiredRole?: 'ADMIN' | 'USER' }> = ({ children, requiredRole }) => {
  const isAuthenticated = authService.isAuthenticated();
  const currentUser = authService.getCurrentUser();

  console.log('isAuthenticated:', isAuthenticated); // Log do estado de autenticação
  console.log('currentUser:', currentUser); // Log do usuário atual

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
    <Router>
      <Routes>
        {/* Rota de Login */}
        <Route path="/login" element={<Login onLoginSuccess={() => window.location.href = '/users'} />} />

        {/* Rota de Gerenciamento de Usuários (Apenas Admins) */}
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

        {/* Rota Padrão */}
        <Route path="/" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
};

export default AppRouter;