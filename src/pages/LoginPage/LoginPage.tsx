import React, { useState } from 'react';
import { useUser } from '../../contexts/UserContext';
import './LoginPage.css';

interface LoginProps {
  onLoginSuccess: () => void;
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [keepLogged, setKeepLogged] = useState(true);
  const { login } = useUser();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await login(email, password, keepLogged);
      onLoginSuccess();
    } catch (err) {
      setError('Erro ao fazer login. Por favor, tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-bg">
      <div className="login-card-new">
        <h1 className="login-title">Behavior Bar</h1>
        <p className="login-subtitle">Acesse sua conta</p>
        {error && <div className="login-error">{error}</div>}
        <form className="login-form" onSubmit={handleSubmit} autoComplete="on">
          <div className="login-field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
              placeholder="Digite seu email"
            />
          </div>
          <div className="login-field">
            <label htmlFor="password">Senha</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
              placeholder="Digite sua senha"
            />
          </div>
          <div className="login-options">
            <label className="login-checkbox-label">
              <input
                type="checkbox"
                checked={keepLogged}
                onChange={() => setKeepLogged((v) => !v)}
              />
              Manter-me logado
            </label>
          </div>
          <button type="submit" className="login-btn" disabled={isLoading}>
            {isLoading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;