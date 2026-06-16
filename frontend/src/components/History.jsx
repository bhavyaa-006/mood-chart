import React, { useState, useEffect } from 'react';
import { getMoodHistory, getMoodScale } from '../api';

export default function History({ refreshCounter }) {
  const [history, setHistory] = useState([]);
  const [scaleMap, setScaleMap] = useState({});

  useEffect(() => {
    async function load() {
      const scale = await getMoodScale();
      const map = {};
      scale.forEach(s => map[s.value] = s);
      setScaleMap(map);

      const h = await getMoodHistory();
      setHistory(h);
    }
    load();
  }, [refreshCounter]);

  if (history.length === 0) {
    return (
      <div className="feature-card" style={{ textAlign: 'center', padding: '48px' }}>
        <p className="color-graphite">No journal entries yet. Start logging your mood above!</p>
      </div>
    );
  }

  return (
    <div className="card-grid" id="history">
      {history.map((entry) => {
        const meta = scaleMap[entry.mood] || { label: entry.mood, emoji: '?' };
        return (
          <div key={entry.id} className="feature-card">
            <div className="card-label">
              <span>{new Date(entry.entry_date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </div>
            <h3 className="text-heading" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <span>{meta.emoji}</span> {meta.label}
            </h3>
            {entry.note ? (
              <p className="text-body color-graphite">{entry.note}</p>
            ) : (
              <p className="text-body color-graphite" style={{ fontStyle: 'italic', opacity: 0.5 }}>No note provided.</p>
            )}
          </div>
        );
      })}
    </div>
  );
}
