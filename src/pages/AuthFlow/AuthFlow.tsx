import React, { useState } from 'react';
import EmailStep from './EmailStep';
import PasswordStep from './PasswordStep';
import OnboardingStep from './OnboardingStep';
import '../LoginPage/LoginPage.css';
import { authService } from '../../services/authService';

export type AuthStep = 'email' | 'password' | 'onboarding';

const AuthFlow: React.FC = () => {
  const [step, setStep] = useState<AuthStep>('email');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Verifica se o e-mail existe no backend
  const handleEmailSubmit = async (inputEmail: string) => {
    setEmail(inputEmail);
    setError('');
    setLoading(true);
    try {
      // Chama o backend para verificar se o e-mail existe
      const exists = await authService.checkEmailExists(inputEmail);
      setStep(exists ? 'password' : 'onboarding');
    } catch (err) {
      setError('Erro ao verificar e-mail. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  // Login
  const handleLogin = async (password: string) => {
    setError('');
    setLoading(true);
    try {
      const user = await authService.login(email, password);
      if (user) {
        // Redireciona conforme o papel
        if (user.role === 'ADMIN' || user.role === 'TUTOR') {
          window.location.href = '/users';
        } else {
          window.location.href = `/user/${user.id}/board`;
        }
      } else {
        setError('Senha incorreta.');
      }
    } catch (err) {
      setError('Senha incorreta.');
    } finally {
      setLoading(false);
    }
  };

  // Onboarding
  const handleOnboarding = async (name: string, password: string) => {
    setError('');
    setLoading(true);
    try {
      const user = await authService.onboarding(email, name, password);
      if (user) {
        window.location.href = '/users';
      } else {
        setError('Erro ao criar conta.');
      }
    } catch (err) {
      setError('Erro ao criar conta.');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    setStep('email');
    setEmail('');
    setError('');
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>Behavior Bar</h2>
        {step === 'email' && <p>Bem-vindo! Informe seu e-mail para continuar.</p>}
        {step === 'onboarding' && <p>Bem-vindo! Informe seus dados para criar sua conta.</p>}
        {step === 'password' && <p>Bem-vindo! Informe sua senha para acessar.</p>}
        {error && <div className="error-message">{error}</div>}
        {step === 'email' && (
          <EmailStep onSubmit={handleEmailSubmit} loading={loading} />
        )}
        {step === 'password' && (
          <PasswordStep email={email} onBack={handleBack} onLogin={handleLogin} loading={loading} />
        )}
        {step === 'onboarding' && (
          <OnboardingStep email={email} onBack={handleBack} onOnboarding={handleOnboarding} loading={loading} />
        )}
      </div>
    </div>
  );
};

export default AuthFlow; 