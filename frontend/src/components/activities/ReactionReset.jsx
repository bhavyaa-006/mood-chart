import React, { useState, useEffect, useRef } from 'react';
import Button from '../common/Button';

export const ReactionReset = ({ onComplete, onCancel }) => {
  // states: 'idle', 'waiting', 'ready', 'clicked', 'completed'
  const [gameState, setGameState] = useState('idle');
  const [times, setTimes] = useState([]);
  const [currentRound, setCurrentRound] = useState(1);
  const totalRounds = 3;
  const startTimeRef = useRef(null);
  const timeoutRef = useRef(null);

  const startRound = () => {
    setGameState('waiting');
    const delay = Math.random() * 2000 + 1500; // 1.5 to 3.5s delay
    timeoutRef.current = setTimeout(() => {
      setGameState('ready');
      startTimeRef.current = Date.now();
    }, delay);
  };

  const handleClickArea = () => {
    if (gameState === 'waiting') {
      clearTimeout(timeoutRef.current);
      setGameState('idle');
      alert('Too early! Wait for the visual flash before clicking.');
    } else if (gameState === 'ready') {
      const reactionMs = Date.now() - startTimeRef.current;
      const nextTimes = [...times, reactionMs];
      setTimes(nextTimes);
      setGameState('clicked');

      if (currentRound >= totalRounds) {
        const avg = Math.round(nextTimes.reduce((a, b) => a + b, 0) / nextTimes.length);
        const score = Math.max(40, Math.min(100, Math.round(100 - (avg - 250) * 0.15)));
        setTimeout(() => {
          onComplete({
            score,
            metadata: { average_reaction_ms: avg, rounds: totalRounds, all_times: nextTimes },
          });
        }, 1200);
      } else {
        setTimeout(() => {
          setCurrentRound((r) => r + 1);
          setGameState('idle');
        }, 1000);
      }
    }
  };

  useEffect(() => {
    return () => clearTimeout(timeoutRef.current);
  }, []);

  return (
    <div style={{ textAlign: 'center', padding: '1rem 0' }}>
      <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--primary-900)', marginBottom: '0.5rem' }}>
        Reaction Reset
      </h3>
      <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
        A gentle stimulus-response drill. Focus your attention and tap as soon as the screen flashes ocean blue.
      </p>

      <div style={{ marginBottom: '1rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
        Round {currentRound} of {totalRounds}
      </div>

      {/* Interactive Click Area */}
      <div
        onClick={handleClickArea}
        style={{
          width: '100%',
          height: '200px',
          borderRadius: 'var(--radius-lg)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: gameState === 'waiting' || gameState === 'ready' ? 'pointer' : 'default',
          backgroundColor:
            gameState === 'ready'
              ? 'var(--primary-500)'
              : gameState === 'waiting'
              ? '#f59e0b'
              : 'var(--bg-subtle)',
          color: gameState === 'ready' || gameState === 'waiting' ? '#ffffff' : 'var(--text-main)',
          transition: 'background-color 0.1s ease',
          marginBottom: '1.5rem',
          userSelect: 'none',
        }}
      >
        {gameState === 'idle' && (
          <Button variant="primary" onClick={startRound}>
            Start Round {currentRound}
          </Button>
        )}
        {gameState === 'waiting' && (
          <span style={{ fontSize: '1.25rem', fontWeight: 600 }}>
            Wait for Blue...
          </span>
        )}
        {gameState === 'ready' && (
          <span style={{ fontSize: '1.75rem', fontWeight: 800 }}>
            CLICK NOW! 🌊
          </span>
        )}
        {gameState === 'clicked' && (
          <span style={{ fontSize: '1.25rem', fontWeight: 600 }}>
            {times[times.length - 1]} ms!
          </span>
        )}
      </div>

      <Button variant="outline" onClick={onCancel}>
        Exit
      </Button>
    </div>
  );
};

export default ReactionReset;
