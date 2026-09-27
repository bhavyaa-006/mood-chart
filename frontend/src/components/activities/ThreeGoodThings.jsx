import React, { useState } from 'react';
import Button from '../common/Button';
import { Heart } from 'lucide-react';

export const ThreeGoodThings = ({ onComplete, onCancel }) => {
  const [thing1, setThing1] = useState('');
  const [thing2, setThing2] = useState('');
  const [thing3, setThing3] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!thing1.trim() || !thing2.trim() || !thing3.trim()) return;

    onComplete({
      score: 100,
      metadata: {
        good_things: [thing1.trim(), thing2.trim(), thing3.trim()],
      },
    });
  };

  return (
    <div style={{ textAlign: 'center', padding: '1rem 0' }}>
      <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--primary-900)', marginBottom: '0.5rem' }}>
        Three Good Things
      </h3>
      <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
        A clinically proven gratitude practice. Train your attention to recognize moments of light.
      </p>

      <form onSubmit={handleSubmit} style={{ textAlign: 'left' }}>
        <div className="form-group">
          <label className="form-label" htmlFor="thing1">
            1. Something pleasant or comforting from today:
          </label>
          <input
            id="thing1"
            type="text"
            className="form-input"
            placeholder="e.g., A warm cup of tea, a cozy blanket, morning sunlight..."
            value={thing1}
            onChange={(e) => setThing1(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="thing2">
            2. A moment of kindness or connection:
          </label>
          <input
            id="thing2"
            type="text"
            className="form-input"
            placeholder="e.g., A friendly message from a friend, a gentle smile from a neighbor..."
            value={thing2}
            onChange={(e) => setThing2(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="thing3">
            3. Something you appreciate about yourself or your efforts:
          </label>
          <input
            id="thing3"
            type="text"
            className="form-input"
            placeholder="e.g., I showed up for myself, I was patient during a busy afternoon..."
            value={thing3}
            onChange={(e) => setThing3(e.target.value)}
            required
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', marginTop: '1.5rem' }}>
          <Button variant="outline" onClick={onCancel}>
            Exit
          </Button>
          <Button
            type="submit"
            variant="primary"
            icon={<Heart size={16} />}
            disabled={!thing1.trim() || !thing2.trim() || !thing3.trim()}
          >
            Save Gratitude Session
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ThreeGoodThings;
