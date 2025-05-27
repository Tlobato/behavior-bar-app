import React, { useState, useEffect } from 'react';

interface EmailStepProps {
  onSubmit: (email: string) => void;
  loading?: boolean;
}

const EmailStep: React.FC<EmailStepProps> = ({ onSubmit, loading }) => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!loading) setError('');
  }, [loading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email || !email.includes('@')) {
      setError('Digite um e-mail válido.');
      return;
    }
    onSubmit(email);
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && <div className="error-message">{error}</div>}
      <div className="form-group">
        <label htmlFor="email">E-mail</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoFocus
          autoComplete="email"
          required
          disabled={loading}
        />
      </div>
      <button type="submit" className="login-button" disabled={loading}>
        {loading ? 'Verificando...' : 'Continuar'}
      </button>
    </form>
  );
};

export default EmailStep; 