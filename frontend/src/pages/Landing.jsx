import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

export default function Landing() {
  const todayKey = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const [stats, setStats] = useState({
    total_entries: null,
    current_streak: null,
    average_score: null,
  });
  const [quote, setQuote] = useState('');

  useEffect(() => {
    const quotes = [
      'Your emotions are data—listen, learn, and respond kindly.',
      'Small reflections today create stronger habits tomorrow.',
      'Progress isn’t loud; it’s consistent.',
      'Breathe. Notice. Name what you feel—then choose your next step.',
      'You’re building awareness, one day at a time.',
    ];
    // deterministic daily quote
    let seed = 0;
    for (let i = 0; i < todayKey.length; i++) seed = (seed * 31 + todayKey.charCodeAt(i)) >>> 0;
    const q = quotes[seed % quotes.length];
    setQuote(q);
  }, [todayKey]);

  // Stats are preview-only until auth is enabled end-to-end.
  useEffect(() => {
    setStats({
      total_entries: 128,
      current_streak: 5,
      average_score: 4.0,
    });
  }, []);

  return (
    <div className="hero-section">
      <div className="hero-gradient-overlay" />
      <div className="hero-content">
        <h1 className="text-display">Understand your emotions, build healthier habits, and visualize your happiness journey.</h1>
        <p className="text-subheading font-w460" style={{ color: 'rgba(255,255,255,0.9)' }}>
          Build emotional awareness with daily reflection, gentle insights, and a calmer view of your patterns.
        </p>

        <div className="floating-panels">
          <div className="glass-panel">
            <div className="label">Total mood entries</div>
            <div className="value">
              <span style={{ fontSize: '28px' }}>{stats.total_entries}</span>
            </div>
          </div>
          <div className="glass-panel">
            <div className="label">Current streak</div>
            <div className="value">
              <span style={{ fontSize: '28px' }}>{stats.current_streak} days</span>
            </div>
          </div>
          <div className="glass-panel">
            <div className="label">Average mood score</div>
            <div className="value">
              <span style={{ fontSize: '28px' }}>{stats.average_score} / 5.0</span>
            </div>
          </div>
        </div>

        <div className="glass-panel" style={{ width: '100%', maxWidth: '720px', textAlign: 'center' }}>
          <div className="label" style={{ marginBottom: '12px' }}>Daily Motivation</div>
          <div className="value" style={{ justifyContent: 'center', fontSize: '18px' }}>
            {quote}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center', marginTop: '8px' }}>
          <div className="cta-button-wrapper">
            <button className="hero-cta">
              <Link to="/signup" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                Get Started <span aria-hidden="true">→</span>
              </Link>
            </button>
          </div>

          <div className="cta-button-wrapper" style={{ animationPlayState: 'paused' }}>
            <button className="hero-cta" style={{ backgroundColor: 'transparent', border: '1px solid rgba(255,255,255,0.35)', color: 'var(--color-bone)' }}>
              <Link to="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                Login <span aria-hidden="true">→</span>
              </Link>
            </button>
          </div>
        </div>
      </div>

      <div className="spotlight spotlight-violet" />
      <div className="spotlight spotlight-pink" />
      <div className="spotlight spotlight-blue" />
      <div className="spotlight spotlight-cyan" />
    </div>
  );
}
