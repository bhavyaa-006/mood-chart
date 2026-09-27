import React, { useState, useEffect } from 'react';
import Button from '../common/Button';
import { Play, Pause, CheckCircle2 } from 'lucide-react';

const CUES = [
  { start: 0, end: 15, text: 'Look around and notice 3 subtle details in your surroundings.', emoji: '👁️' },
  { start: 15, end: 30, text: 'Notice 2 tactile sensations (e.g. feet on the ground, clothes on skin).', emoji: '🖐️' },
  { start: 30, end: 45, text: 'Close your eyes and listen for 1 distant or gentle sound.', emoji: '👂' },
  { start: 45, end: 60, text: 'Take a full, grounding breath and appreciate this quiet moment.', emoji: '✨' },
];

export const MindfulMinute = ({ onComplete, onCancel }) => {
  const [elapsed, setElapsed] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const totalDuration = 60;

  useEffect(() => {
    let interval = null;
    if (isActive) {
      interval = setInterval(() => {
        setElapsed((prev) => {
          if (prev >= totalDuration - 1) {
            setIsActive(false);
            setTimeout(() => {
              onComplete({
                score: 100,
                metadata: { duration_seconds: totalDuration, exercise: 'sensory_grounding' },
              });
            }, 600);
            return totalDuration;
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isActive, onComplete]);

  const currentCue = CUES.find((c) => elapsed >= c.start && elapsed < c.end) || CUES[CUES.length - 1];
  const progressPercent = (elapsed / totalDuration) * 100;

  return (
    <div style={{ textAlign: 'center', padding: '1rem 0' }}>
      <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--primary-900)', marginBottom: '0.5rem' }}>
        Mindful Minute
      </h3>
      <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
        One single minute of grounded sensory awareness.
      </p>

      {/* Progress Bar */}
      <div
        style={{
          width: '100%',
          height: '8px',
          backgroundColor: 'var(--border-subtle)',
          borderRadius: 'var(--radius-full)',
          overflow: 'hidden',
          marginBottom: '2rem',
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${progressPercent}%`,
            backgroundColor: 'var(--seafoam-500)',
            transition: 'width 1s linear',
          }}
        />
      </div>

      {/* Active Cue Card */}
      <div
        className="card"
        style={{
          padding: '2rem 1.5rem',
          backgroundColor: 'var(--seafoam-50)',
          borderColor: 'var(--seafoam-300)',
          marginBottom: '2rem',
          minHeight: '140px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <span style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>
          {isActive ? currentCue.emoji : '🧘'}
        </span>
        <p style={{ fontSize: '1.0625rem', fontWeight: 500, color: 'var(--seafoam-700)', lineHeight: 1.5 }}>
          {isActive ? currentCue.text : 'Click Begin to start your 60-second sensory grounding practice.'}
        </p>
      </div>

      <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '1.5rem' }}>
        {totalDuration - elapsed}s
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem' }}>
        {!isActive ? (
          <Button
            variant="primary"
            icon={<Play size={18} />}
            onClick={() => setIsActive(true)}
          >
            {elapsed > 0 ? 'Resume' : 'Begin Minute'}
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

export default MindfulMinute;
