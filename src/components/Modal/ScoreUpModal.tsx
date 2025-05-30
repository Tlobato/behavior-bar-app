import React, { useEffect, useState } from 'react';
import Confetti from 'react-confetti';
import { FaTrophy } from 'react-icons/fa';

interface ScoreUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  points: number;
}

const ANIMATION_DURATION = 1500; // ms
const FRAME_RATE = 30; // ms

const ScoreUpModal: React.FC<ScoreUpModalProps> = ({ isOpen, onClose, points }) => {
  const [displayedPoints, setDisplayedPoints] = useState(0);

  useEffect(() => {
    if (!isOpen) {
      setDisplayedPoints(0);
      return;
    }
    let start = 0;
    const totalFrames = Math.ceil(ANIMATION_DURATION / FRAME_RATE);
    const increment = points / totalFrames;
    let frame = 0;
    const interval = setInterval(() => {
      frame++;
      start += increment;
      if (frame >= totalFrames) {
        setDisplayedPoints(points);
        clearInterval(interval);
      } else {
        setDisplayedPoints(Math.round(start));
      }
    }, FRAME_RATE);
    return () => clearInterval(interval);
  }, [isOpen, points]);

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
      <Confetti width={window.innerWidth} height={window.innerHeight} numberOfPieces={250} recycle={false} />
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
        <FaTrophy size={64} color="#FFD700" style={{ marginBottom: 16 }} />
        <h2 style={{ fontSize: 32, margin: '0 0 12px 0', color: '#2e7d32' }}>Parabéns!</h2>
        <p style={{ fontSize: 20, margin: '0 0 24px 0', color: '#333' }}>
          Você ganhou
        </p>
        <div style={{ fontSize: 48, fontWeight: 700, color: '#1976d2', marginBottom: 24 }}>
          {displayedPoints} pontos!
        </div>
        <button
          onClick={onClose}
          style={{
            background: '#1976d2',
            color: '#fff',
            border: 'none',
            borderRadius: 8,
            padding: '12px 32px',
            fontSize: 20,
            fontWeight: 600,
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(25, 118, 210, 0.15)',
            transition: 'background 0.2s',
          }}
        >
          Legal!
        </button>
      </div>
    </div>
  );
};

export default ScoreUpModal; 