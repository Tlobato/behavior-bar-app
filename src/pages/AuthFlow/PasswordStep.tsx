import React, { useState, useEffect } from 'react';

interface PasswordStepProps {
  email: string;
  onBack: () => void;
  onLogin: (password: string, keepLoggedIn: boolean) => void;
  loading?: boolean;
}

const PasswordStep: React.FC<PasswordStepProps> = ({ email, onBack, onLogin, loading }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [keepLoggedIn, setKeepLoggedIn] = useState(false);

  useEffect(() => {
    if (!loading) setError('');
  }, [loading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!password) {
      setError('Digite a senha.');
      return;
    }
    onLogin(password, keepLoggedIn);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-group">
        <label htmlFor="email">E-mail</label>
        <input
          id="email"
          type="email"
          value={email}
          disabled
          className="disabled-input"
          style={{ background: '#f5f5f5', color: '#888', fontWeight: 'bold' }}
        />
      </div>
      {error && <div className="error-message">{error}</div>}
      <div className="form-group">
        <label htmlFor="password">Senha</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoFocus
          autoComplete="current-password"
          required
          disabled={loading}
        />
        <div style={{ width: '100%', display: 'flex', justifyContent: 'flex-end', marginTop: 4 }}>
          <div style={{ display: 'flex', alignItems: 'center', whiteSpace: 'nowrap' }}>
            <input
              id="keepLoggedIn"
              type="checkbox"
              checked={keepLoggedIn}
              onChange={e => setKeepLoggedIn(e.target.checked)}
              disabled={loading}
              style={{ marginRight: 6 }}
            />
            <label htmlFor="keepLoggedIn" style={{ fontSize: 14, color: '#555', cursor: 'pointer', userSelect: 'none', marginBottom: 0, marginRight: 0 }}>
              Lembrar-me
            </label>
          </div>
        </div>
      </div>
      <button type="submit" className="login-button" disabled={loading}>
        {loading ? 'Entrando...' : 'Entrar'}
      </button>
      <button type="button" className="login-button" style={{ marginTop: 10, background: '#eee', color: '#333' }} onClick={onBack} disabled={loading}>
        Voltar
      </button>
    </form>
  );
};

export default PasswordStep; 