import React, { useState } from 'react';
import { authService } from '../../services/authService';
import './Login.css';

interface LoginProps {
  onLoginSuccess: () => void;
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState(''); // Inicializa o campo vazio
  const [password, setPassword] = useState(''); // Inicializa o campo vazio
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const user = await authService.login(username, password);

      if (user) {
        onLoginSuccess();
      } else {
        setError('Nome de usuário ou senha incorretos');
      }
    } catch (err) {
      setError('Erro ao fazer login. Por favor, tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>Behavior Bar</h2>
        <p>Digite suas credenciais para acessar</p>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">Nome de Usuário</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="off" /* Desativa o autocompletar */
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Senha</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password" /* Valor recomendado para senhas */
              required
            />
          </div>

          <button type="submit" disabled={isLoading} className="login-button">
            {isLoading ? 'Carregando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;