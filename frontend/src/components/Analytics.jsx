import React, { useEffect, useState } from 'react';
import { getAiInsights, getAnalytics, getMoodScale } from '../api';

export default function Analytics({ refreshCounter, accessToken }) {
  const [analytics, setAnalytics] = useState(null);
  const [scaleMap, setScaleMap] = useState({});
  const [aiWeekly, setAiWeekly] = useState(null);
  const [aiMonthly, setAiMonthly] = useState(null);

  useEffect(() => {
    async function load() {
      const scale = await getMoodScale(accessToken);
      const map = {};
      scale.forEach((s) => (map[s.value] = s));
      setScaleMap(map);

      const a = await getAnalytics(accessToken);
      setAnalytics(a);

      const weekly = await getAiInsights('weekly', accessToken);
      const monthly = await getAiInsights('monthly', accessToken);
      setAiWeekly(weekly);
      setAiMonthly(monthly);
    }
    load();
  }, [refreshCounter, accessToken]);

  if (!analytics || analytics.total_entries === 0) {
    return (
      <div className="feature-card" style={{ textAlign: 'center', padding: '48px' }}>
        <p className="color-graphite">Not enough data for analytics. Start logging your mood!</p>
      </div>
    );
  }

  const commonMeta = scaleMap[analytics.most_common_mood] || { label: '-', emoji: '' };

  const emotionalBalance = aiMonthly?.emotional_balance_score ?? 0;
  const moodConsistency = aiMonthly?.mood_consistency_score ?? 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }} id="analytics">
      <div className="card-grid">
        <div className="feature-card">
          <div className="card-label">Consistency</div>
          <h3 className="text-heading-lg">
            {analytics.current_streak} <span style={{ fontSize: '24px' }}>days</span>
          </h3>
          <p className="color-graphite" style={{ marginTop: '8px' }}>
            Current login streak
          </p>
        </div>

        <div className="feature-card">
          <div className="card-label">Overall Balance</div>
          <h3 className="text-heading-lg">
            {analytics.average_score} <span style={{ fontSize: '24px' }}>/ 5.0</span>
          </h3>
          <p className="color-graphite" style={{ marginTop: '8px' }}>
            Average mood score
          </p>
        </div>

        <div className="feature-card">
          <div className="card-label">Most Frequent</div>
          <h3 className="text-heading-lg">
            {commonMeta.emoji} {commonMeta.label}
          </h3>
          <p className="color-graphite" style={{ marginTop: '8px' }}>
            Your most common mood
          </p>
        </div>

        <div className="feature-card">
          <div className="card-label">Total Entries</div>
          <h3 className="text-heading-lg">{analytics.total_entries}</h3>
          <p className="color-graphite" style={{ marginTop: '8px' }}>
            Days tracked
          </p>
        </div>
      </div>

      <div className="feature-card" style={{ padding: 20 }}>
        <div className="card-label">AI Wellness Insights</div>

        <div className="card-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', marginTop: 16 }}>
          <div className="feature-card">
            <div className="card-label">Emotional balance</div>
            <h3 className="text-heading-lg">
              {emotionalBalance} <span style={{ fontSize: '24px' }}>/ 100</span>
            </h3>
            <p className="color-graphite" style={{ marginTop: '8px' }}>
              How steady your moods feel this month
            </p>
          </div>

          <div className="feature-card">
            <div className="card-label">Mood consistency</div>
            <h3 className="text-heading-lg">
              {moodConsistency} <span style={{ fontSize: '24px' }}>/ 100</span>
            </h3>
            <p className="color-graphite" style={{ marginTop: '8px' }}>
              Volatility vs. steady emotional rhythms
            </p>
          </div>
        </div>

        <div style={{ marginTop: 20, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
          <div className="feature-card">
            <div className="card-label">Weekly insights</div>
            <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {(aiWeekly?.weekly || []).length ? (
                aiWeekly.weekly.map((t, idx) => (
                  <div key={`${t}-${idx}`} className="alert-message" style={{ background: 'rgba(113, 76, 182, 0.08)', border: '1px solid rgba(113, 76, 182, 0.18)' }}>
                    {t}
                  </div>
                ))
              ) : (
                <div className="color-graphite">Log a few moods to unlock weekly insights.</div>
              )}
            </div>
          </div>

          <div className="feature-card">
            <div className="card-label">Monthly insights</div>
            <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {(aiMonthly?.monthly || []).length ? (
                aiMonthly.monthly.map((t, idx) => (
                  <div key={`${t}-${idx}`} className="alert-message" style={{ background: 'rgba(113, 76, 182, 0.08)', border: '1px solid rgba(113, 76, 182, 0.18)' }}>
                    {t}
                  </div>
                ))
              ) : (
                <div className="color-graphite">Your monthly narrative appears as you track more data.</div>
              )}
            </div>
          </div>

          <div className="feature-card">
            <div className="card-label">Predictions</div>
            <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {(aiMonthly?.predictions || []).length ? (
                aiMonthly.predictions.slice(0, 3).map((p, idx) => (
                  <div key={`${p}-${idx}`} className="alert-message" style={{ background: 'rgba(107, 165, 232, 0.08)', border: '1px solid rgba(107, 165, 232, 0.18)' }}>
                    {p}
                  </div>
                ))
              ) : (
                <div className="color-graphite">Predictions will be ready once there’s enough history.</div>
              )}
            </div>

            <div style={{ marginTop: 14 }}>
              <div className="color-graphite" style={{ fontSize: 12 }}>
                Suggestions
              </div>
              <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 10 }}>
                {(aiMonthly?.suggestions || []).slice(0, 2).map((s, idx) => (
                  <div key={`${s}-${idx}`} className="empty-state" style={{ padding: 14, textAlign: 'left' }}>
                    {s}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
