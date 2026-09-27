import React, { useState, useEffect } from 'react';
import Button from '../common/Button';
import { Play, Pause, RotateCcw, CheckCircle2 } from 'lucide-react';

const PHASES = [
  { name: 'Inhale', duration: 4, instruction: 'Breathe in slowly through your nose', scale: 1.4 },
  { name: 'Hold', duration: 4, instruction: 'Gently hold your breath', scale: 1.4 },
  { name: 'Exhale', duration: 4, instruction: 'Release smoothly through your mouth', scale: 1.0 },
  { name: 'Hold', duration: 4, instruction: 'Rest in the stillness', scale: 1.0 },
];

export const BoxBreathing = ({ onComplete, onCancel }) => {
  const [isActive, setIsActive] = useState(false);
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(PHASES[0].duration);
  const [completedCycles, setCompletedCycles] = useState(0);
  const targetCycles = 3;

  useEffect(() => {
    let timer = null;
    if (isActive) {
      timer = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            // Next phase
            setPhaseIndex((currPhase) => {
              const nextPhase = (currPhase + 1) % PHASES.length;
              if (nextPhase === 0) {
                setCompletedCycles((c) => {
                  const newCycleCount = c + 1;
                  if (newCycleCount >= targetCycles) {
                    setIsActive(false);
                    setTimeout(() => {
                      onComplete({
                        score: 100,
                        metadata: { cycles: newCycleCount, target: targetCycles },
                      });
                    }, 500);
                  }
                  return newCycleCount;
                });
              }
              return nextPhase;
            });
            return PHASES[(phaseIndex + 1) % PHASES.length].duration;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isActive, phaseIndex, onComplete]);

  const currentPhase = PHASES[phaseIndex];

  return (
    <div style={{ textAlign: 'center', padding: '1rem 0' }}>
      <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--primary-900)', marginBottom: '0.5rem' }}>
        Box Breathing
      </h3>
      <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
        4-4-4-4 rhythm to soothe the nervous system and steady heart rate.
      </p>

      {/* Visual Breathing Bubble */}
      <div
        style={{
          height: '240px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
        }}
      >
        <div
          style={{
            width: '130px',
            height: '130px',
            borderRadius: 'var(--radius-full)',
            background: 'linear-gradient(135deg, #7dd3fc 0%, #0284c7 100%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            boxShadow: 'var(--shadow-ocean)',
            transform: `scale(${isActive ? currentPhase.scale : 1})`,
            transition: 'transform 4s ease-in-out',
          }}
        >
          <span style={{ fontSize: '1.25rem', fontWeight: 700 }}>
            {isActive ? currentPhase.name : 'Ready'}
          </span>
          {isActive && (
            <span style={{ fontSize: '1.5rem', fontWeight: 800, marginTop: '2px' }}>
              {secondsLeft}s
            </span>
          )}
        </div>
      </div>

      <p style={{ fontSize: '1rem', fontWeight: 500, color: 'var(--primary-800)', minHeight: '1.75rem', margin: '0.5rem 0' }}>
        {isActive ? currentPhase.instruction : 'Press Begin when you are comfortable.'}
      </p>

      <p style={{ fontSize: '0.8125rem', color: 'var(--text-light)', marginBottom: '1.5rem' }}>
        Cycle {Math.min(completedCycles + 1, targetCycles)} of {targetCycles}
      </p>

      {/* Controls */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem' }}>
        {!isActive ? (
          <Button
            variant="primary"
            icon={<Play size={18} />}
            onClick={() => setIsActive(true)}
          >
            {completedCycles > 0 ? 'Resume Breathing' : 'Begin Breathing'}
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

export default BoxBreathing;
