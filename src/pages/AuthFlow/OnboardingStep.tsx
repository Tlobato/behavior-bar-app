import React, { useState, useEffect } from 'react';

interface OnboardingStepProps {
  email: string;
  onBack: () => void;
  onOnboarding: (name: string, password: string) => void;
  loading?: boolean;
}

const OnboardingStep: React.FC<OnboardingStepProps> = ({ email, onBack, onOnboarding, loading }) => {
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    if (!loading) setError('');
  }, [loading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!name) {
      setError('Digite o nome.');
      return;
    }
    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres.');
      return;
    }
    if (password !== confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }
    onOnboarding(name, password);
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
        <label htmlFor="name">Nome</label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoFocus
          required
          disabled={loading}
        />
      </div>
      <div className="form-group">
        <label htmlFor="password">Senha</label>
        <div style={{ position: 'relative' }}>
          <input
            id="password"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
            style={{ paddingRight: 36 }}
          />
          <span
            onClick={() => setShowPassword((v) => !v)}
            style={{
              position: 'absolute',
              right: 10,
              top: '50%',
              transform: 'translateY(-50%)',
              cursor: 'pointer',
              color: '#888',
              width: 22,
              height: 22
            }}
            tabIndex={-1}
          >
            {showPassword ? (
              // Olho aberto
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z"/><circle cx="12" cy="12" r="3"/></svg>
            ) : (
              // Olho fechado
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.94 10.94 0 0 1 12 19c-7 0-11-7-11-7a21.81 21.81 0 0 1 5.06-6.06"/><path d="M1 1l22 22"/><path d="M9.53 9.53A3 3 0 0 0 12 15a3 3 0 0 0 2.47-5.47"/></svg>
            )}
          </span>
        </div>
      </div>
      <div className="form-group">
        <label htmlFor="confirmPassword">Confirmar Senha</label>
        <div style={{ position: 'relative' }}>
          <input
            id="confirmPassword"
            type={showConfirmPassword ? 'text' : 'password'}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            disabled={loading}
            style={{ paddingRight: 36 }}
          />
          <span
            onClick={() => setShowConfirmPassword((v) => !v)}
            style={{
              position: 'absolute',
              right: 10,
              top: '50%',
              transform: 'translateY(-50%)',
              cursor: 'pointer',
              color: '#888',
              width: 22,
              height: 22
            }}
            tabIndex={-1}
          >
            {showConfirmPassword ? (
              // Olho aberto
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z"/><circle cx="12" cy="12" r="3"/></svg>
            ) : (
              // Olho fechado
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.94 10.94 0 0 1 12 19c-7 0-11-7-11-7a21.81 21.81 0 0 1 5.06-6.06"/><path d="M1 1l22 22"/><path d="M9.53 9.53A3 3 0 0 0 12 15a3 3 0 0 0 2.47-5.47"/></svg>
            )}
          </span>
        </div>
      </div>
      <button type="submit" className="login-button" disabled={loading}>
        {loading ? 'Criando...' : 'Criar conta'}
      </button>
      <button type="button" className="login-button" style={{ marginTop: 10, background: '#eee', color: '#333' }} onClick={onBack} disabled={loading}>
        Voltar
      </button>
    </form>
  );
};

export default OnboardingStep; 