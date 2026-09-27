import React, { useState } from 'react';
import Button from '../common/Button';
import { ChevronRight, Check } from 'lucide-react';

const ZONES = [
  { name: 'Forehead & Brow', cue: 'Unclench your jaw, soften your eyelids, and let tension melt from your temples.' },
  { name: 'Shoulders & Neck', cue: 'Lower your shoulders away from your ears. Release the invisible weight you are carrying.' },
  { name: 'Chest & Stomach', cue: 'Allow your abdomen to expand softly as you inhale. Let go of held breath.' },
  { name: 'Hands & Fingers', cue: 'Uncurl your fingers. Place palms facing upward in a restful, open posture.' },
  { name: 'Legs & Feet', cue: 'Feel the stability of the floor beneath you. Ground your entire lower body.' },
];

export const BodyScan = ({ onComplete, onCancel }) => {
  const [currentZoneIndex, setCurrentZoneIndex] = useState(0);

  const handleNext = () => {
    if (currentZoneIndex < ZONES.length - 1) {
      setCurrentZoneIndex((i) => i + 1);
    } else {
      onComplete({
        score: 100,
        metadata: { zones_completed: ZONES.length },
      });
    }
  };

  const zone = ZONES[currentZoneIndex];

  return (
    <div style={{ textAlign: 'center', padding: '1rem 0' }}>
      <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--primary-900)', marginBottom: '0.5rem' }}>
        Progressive Body Scan
      </h3>
      <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
        Step-by-step physical relaxation to release somatic tension.
      </p>

      {/* Progress dots */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
        {ZONES.map((_, idx) => (
          <div
            key={idx}
            style={{
              width: '10px',
              height: '10px',
              borderRadius: 'var(--radius-full)',
              backgroundColor:
                idx === currentZoneIndex
                  ? 'var(--primary-600)'
                  : idx < currentZoneIndex
                  ? 'var(--seafoam-500)'
                  : 'var(--border-strong)',
              transition: 'all 0.2s ease',
            }}
          />
        ))}
      </div>

      <div
        className="card"
        style={{
          padding: '2rem 1.5rem',
          backgroundColor: 'var(--primary-50)',
          borderColor: 'var(--primary-200)',
          marginBottom: '2rem',
        }}
      >
        <h4 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--primary-950)', marginBottom: '0.75rem' }}>
          {zone.name}
        </h4>
        <p style={{ fontSize: '1rem', color: 'var(--primary-800)', lineHeight: 1.6 }}>
          {zone.cue}
        </p>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem' }}>
        <Button variant="outline" onClick={onCancel}>
          Exit
        </Button>
        <Button
          variant="primary"
          icon={currentZoneIndex === ZONES.length - 1 ? <Check size={18} /> : <ChevronRight size={18} />}
          onClick={handleNext}
        >
          {currentZoneIndex === ZONES.length - 1 ? 'Finish Relaxation' : 'Next Body Zone'}
        </Button>
      </div>
    </div>
  );
};

export default BodyScan;
