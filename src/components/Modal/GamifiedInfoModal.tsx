import React, { useEffect } from 'react';

interface GamifiedInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  emoji?: string;
}

const GamifiedInfoModal: React.FC<GamifiedInfoModalProps> = ({ isOpen, onClose, title, message, emoji }) => {
  useEffect(() => {
    if (isOpen) {
      const audio = new Audio('/sounds/positive.mp3');
      audio.play();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      background: 'rgba(0,0,0,0.5)',
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <div style={{
        background: '#fff',
        borderRadius: 24,
        padding: '40px 32px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
        textAlign: 'center',
        minWidth: 320,
        maxWidth: '90vw',
        position: 'relative',
      }}>
        <div style={{ fontSize: 48, marginBottom: 8 }}>{emoji || '✨'}</div>
        <h2 style={{ fontSize: 32, margin: '0 0 12px 0', color: '#2e7d32' }}>{title}</h2>
        <p style={{ fontSize: 20, margin: '0 0 24px 0', color: '#333' }}>{message}</p>
        <button
          onClick={onClose}
          style={{
            background: '#4CAF50',
            color: '#fff',
            border: 'none',
            borderRadius: 8,
            padding: '12px 32px',
            fontSize: 20,
            fontWeight: 600,
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(76, 175, 80, 0.15)',
            transition: 'background 0.2s',
            margin: '0 auto',
            display: 'block',
          }}
        >
          Tudo bem!
        </button>
      </div>
    </div>
  );
};

export default GamifiedInfoModal; 