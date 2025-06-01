import React, { useEffect, useState } from 'react';
import Confetti from 'react-confetti';

interface RewardRedemptionSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  rewardName: string;
  rewardImage?: string | null;
  pointsBefore: number;
  pointsAfter: number;
}

const ANIMATION_DURATION = 1500; // ms
const FRAME_RATE = 30; // ms

const RewardRedemptionSuccessModal: React.FC<RewardRedemptionSuccessModalProps> = ({
  isOpen,
  onClose,
  rewardName,
  rewardImage,
  pointsBefore,
  pointsAfter
}) => {
  const [displayedPoints, setDisplayedPoints] = useState(pointsBefore);
  const [showCelebration, setShowCelebration] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setDisplayedPoints(pointsBefore);
      setShowCelebration(false);
      return;
    }
    let start = pointsBefore;
    const totalFrames = Math.ceil(ANIMATION_DURATION / FRAME_RATE);
    const decrement = (pointsBefore - pointsAfter) / totalFrames;
    let frame = 0;
    const interval = setInterval(() => {
      frame++;
      start -= decrement;
      if (frame >= totalFrames) {
        setDisplayedPoints(pointsAfter);
        setShowCelebration(true);
        clearInterval(interval);
      } else {
        setDisplayedPoints(Math.round(start));
      }
    }, FRAME_RATE);
    return () => clearInterval(interval);
  }, [isOpen, pointsBefore, pointsAfter]);

  // Toca o som ao mostrar a celebração
  useEffect(() => {
    if (showCelebration) {
      const audio = new Audio('/sounds/win.mp3');
      audio.play();
    }
  }, [showCelebration]);

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
      {showCelebration && (
        <Confetti width={window.innerWidth} height={window.innerHeight} numberOfPieces={180} recycle={false} />
      )}
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
        <div style={{ fontSize: 22, color: '#666', marginBottom: 8 }}>Seu novo saldo:</div>
        <div style={{ fontSize: 48, fontWeight: 700, color: '#1976d2', marginBottom: 24 }}>
          {displayedPoints} pontos
        </div>
        {showCelebration && (
          <>
            <div style={{ fontSize: 48, marginBottom: 8 }}>🎉</div>
            <h2 style={{ fontSize: 32, margin: '0 0 12px 0', color: '#2e7d32' }}>Recompensa Resgatada!</h2>
            <div style={{ fontSize: 22, fontWeight: 600, marginBottom: 12 }}>{rewardName}</div>
            {rewardImage && (
              <img src={rewardImage} alt={rewardName} style={{ width: 120, height: 120, objectFit: 'cover', borderRadius: 12, marginBottom: 16 }} />
            )}
            <div style={{ fontSize: 18, color: '#555', marginBottom: 24 }}>
              Aproveite sua conquista!
            </div>
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
              Legal!
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default RewardRedemptionSuccessModal; 