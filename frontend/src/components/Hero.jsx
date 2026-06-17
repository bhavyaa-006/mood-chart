import React, { useState, useEffect } from 'react';
import { getMoodScale, getTodayMood, createOrUpdateMood } from '../api';

export default function Hero({ onMoodLogged, accessToken }) {
  const [scale, setScale] = useState([]);
  const [selectedMood, setSelectedMood] = useState(null);
  const [note, setNote] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    async function loadData() {
      const s = await getMoodScale(accessToken);
      setScale(s);
      const today = await getTodayMood(accessToken);
      if (today) {
        setSelectedMood(today.mood);
        setNote(today.note || '');
      }
    }
    loadData();
  }, []);

  const handleSave = async () => {
    if (!selectedMood) return;
    setIsSaving(true);
    await createOrUpdateMood({ mood: selectedMood, note }, accessToken);
    setIsSaving(false);
    if (onMoodLogged) onMoodLogged();
  };

  return (
    <section className="hero-section" id="logger">
      <div className="hero-content">
        <h1 className="text-display" style={{ marginBottom: '8px', color: 'var(--color-bone)' }}>
          Superpowers, everywhere you work
        </h1>
        <p className="text-subheading font-w460" style={{ color: 'rgba(255,255,255,0.9)', marginBottom: '32px' }}>
          Reflect on your day, track your emotions, and build a healthier mind.
        </p>

        <div className="glass-panel" style={{ width: '100%', maxWidth: '600px' }}>
          <h2 className="text-heading-sm" style={{ marginBottom: '24px' }}>How are you feeling today?</h2>
          
          <div className="mood-selector" style={{ marginBottom: '24px' }}>
            {scale.map((item) => (
              <div 
                key={item.value} 
                className={`mood-option ${selectedMood === item.value ? 'selected' : ''}`}
                onClick={() => setSelectedMood(item.value)}
              >
                <div className="mood-emoji">{item.emoji}</div>
                <div className="mood-label">{item.label}</div>
              </div>
            ))}
          </div>

          <div className="input-group">
            <label className="input-label">Notes (Optional)</label>
            <textarea 
              className="textarea" 
              placeholder="What made you feel this way?"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>

          <button 
            className="cta-button" 
            onClick={handleSave}
            disabled={!selectedMood || isSaving}
            style={{ width: '100%', justifyContent: 'center' }}
          >
            {isSaving ? 'Saving...' : 'Save Today\'s Entry'}
          </button>
        </div>
      </div>
    </section>
  );
}
