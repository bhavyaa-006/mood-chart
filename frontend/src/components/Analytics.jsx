import React, { useState, useEffect } from 'react';
import { getAnalytics, getMoodScale } from '../api';

export default function Analytics({ refreshCounter }) {
  const [analytics, setAnalytics] = useState(null);
  const [scaleMap, setScaleMap] = useState({});

  useEffect(() => {
    async function load() {
      const scale = await getMoodScale();
      const map = {};
      scale.forEach(s => map[s.value] = s);
      setScaleMap(map);

      const a = await getAnalytics();
      setAnalytics(a);
    }
    load();
  }, [refreshCounter]);

  if (!analytics || analytics.total_entries === 0) {
    return (
      <div className="feature-card" style={{ textAlign: 'center', padding: '48px' }}>
        <p className="color-graphite">Not enough data for analytics. Start logging your mood!</p>
      </div>
    );
  }

  const commonMeta = scaleMap[analytics.most_common_mood] || { label: '-', emoji: '' };

  return (
    <div className="card-grid" id="analytics">
      <div className="feature-card">
        <div className="card-label">Consistency</div>
        <h3 className="text-heading-lg">{analytics.current_streak} <span style={{ fontSize: '24px' }}>days</span></h3>
        <p className="color-graphite" style={{ marginTop: '8px' }}>Current login streak</p>
      </div>
      <div className="feature-card">
        <div className="card-label">Overall Balance</div>
        <h3 className="text-heading-lg">{analytics.average_score} <span style={{ fontSize: '24px' }}>/ 5.0</span></h3>
        <p className="color-graphite" style={{ marginTop: '8px' }}>Average mood score</p>
      </div>
      <div className="feature-card">
        <div className="card-label">Most Frequent</div>
        <h3 className="text-heading-lg">
          {commonMeta.emoji} {commonMeta.label}
        </h3>
        <p className="color-graphite" style={{ marginTop: '8px' }}>Your most common mood</p>
      </div>
      <div className="feature-card">
        <div className="card-label">Total Entries</div>
        <h3 className="text-heading-lg">{analytics.total_entries}</h3>
        <p className="color-graphite" style={{ marginTop: '8px' }}>Days tracked</p>
      </div>
    </div>
  );
}
