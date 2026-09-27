import React, { useState, useEffect } from 'react';
import Button from '../common/Button';
import { Play, Pause, AlertCircle, CheckCircle2 } from 'lucide-react';

export const FocusSprint = ({ onComplete, onCancel }) => {
  const [durationSeconds] = useState(120); // 2 minute focus sprint
  const [secondsLeft, setSecondsLeft] = useState(120);
  const [isActive, setIsActive] = useState(false);
  const [distractions, setDistractions] = useState(0);

  useEffect(() => {
    let timer = null;
    if (isActive && secondsLeft > 0) {
      timer = setInterval(() => {
        setSecondsLeft((prev) => prev - 1);
      }, 1000);
    } else if (secondsLeft === 0) {
      setIsActive(false);
      const calculatedScore = Math.max(20, 100 - distractions * 15);
      onComplete({
        score: calculatedScore,
        metadata: { duration: 120, distractions },
      });
    }
    return () => clearInterval(timer);
  }, [isActive, secondsLeft, distractions, onComplete]);

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const formattedTime = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

  return (
    <div style={{ textAlign: 'center', padding: '1rem 0' }}>
      <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--primary-900)', marginBottom: '0.5rem' }}>
        Focus Sprint
      </h3>
      <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
        A high-clarity 2-minute immersion interval. Commit to a single task with zero multitasking.
      </p>

      {/* Big Timer Display */}
      <div
        style={{
          width: '180px',
          height: '180px',
          borderRadius: 'var(--radius-full)',
          border: '4px solid var(--primary-500)',
          margin: '0 auto 1.5rem',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'var(--primary-50)',
        }}
      >
        <span style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--primary-900)' }}>
          {formattedTime}
        </span>
        <span style={{ fontSize: '0.75rem', color: 'var(--primary-700)', fontWeight: 500 }}>
          {isActive ? 'FLOW IN PROGRESS' : 'READY TO SPRINT'}
        </span>
      </div>

      {/* Distraction logging button */}
      {isActive && (
        <div style={{ marginBottom: '1.5rem' }}>
          <Button
            size="sm"
            variant="outline"
            icon={<AlertCircle size={15} color="#e11d48" />}
            onClick={() => setDistractions((d) => d + 1)}
          >
            I caught my mind wandering ({distractions})
          </Button>
        </div>
      )}

      {/* Controls */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem' }}>
        {!isActive ? (
          <Button
            variant="primary"
            icon={<Play size={18} />}
            onClick={() => setIsActive(true)}
          >
            {secondsLeft < durationSeconds ? 'Resume Sprint' : 'Start 2-Min Sprint'}
          </Button>
        ) : (
          <Button
            variant="secondary"
            icon={<Pause size={18} />}
            onClick={() => setIsActive(false)}
          >
            Pause
          </Button>
        )}
        <Button variant="outline" onClick={onCancel}>
          Exit
        </Button>
      </div>
    </div>
  );
};

export default FocusSprint;
