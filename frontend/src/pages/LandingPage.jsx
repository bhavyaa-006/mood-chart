import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Waves, Heart, Shield, Sparkles, Smile, LineChart, Award, ArrowRight } from 'lucide-react';
import Button from '../components/common/Button';

export const LandingPage = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-page)' }}>
      {/* Top Navigation */}
      <header
        style={{
          borderBottom: '1px solid var(--border-subtle)',
          backgroundColor: '#ffffff',
          position: 'sticky',
          top: 0,
          zIndex: 20,
        }}
      >
        <div
          className="app-container"
          style={{
            height: '70px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: 'var(--radius-md)',
                background: 'linear-gradient(135deg, var(--primary-500) 0%, var(--primary-700) 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
              }}
            >
              <Waves size={24} />
            </div>
            <span style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--primary-900)' }}>
              Mood Cockpit
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {isAuthenticated ? (
              <Link to="/dashboard">
                <Button variant="primary" icon={<ArrowRight size={16} />}>
                  Go to Dashboard
                </Button>
              </Link>
            ) : (
              <>
                <Link to="/login" style={{ textDecoration: 'none' }}>
                  <Button variant="ghost">Sign In</Button>
                </Link>
                <Link to="/register" style={{ textDecoration: 'none' }}>
                  <Button variant="primary">Get Started</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section
        style={{
          padding: '5rem 0 4rem',
          background: 'linear-gradient(180deg, #f0f9ff 0%, #ffffff 100%)',
          textAlign: 'center',
        }}
      >
        <div className="app-container" style={{ maxWidth: '800px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.375rem 0.875rem',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'var(--primary-100)',
              color: 'var(--primary-800)',
              fontSize: '0.8125rem',
              fontWeight: 600,
              marginBottom: '1.5rem',
            }}
          >
            <Sparkles size={15} />
            <span>Gentle Mental Wellness & Habit Tracking</span>
          </div>

          <h1
            style={{
              fontSize: '3.25rem',
              fontWeight: 800,
              color: 'var(--ocean-deep)',
              lineHeight: 1.15,
              letterSpacing: '-1px',
              marginBottom: '1.5rem',
            }}
          >
            Find Calm in Every Tide of Life
          </h1>

          <p
            style={{
              fontSize: '1.25rem',
              color: 'var(--text-muted)',
              lineHeight: 1.6,
              marginBottom: '2.5rem',
            }}
          >
            Track your daily emotional rhythms, practice soothing mind games, build healthy reflection streaks, and uncover meaningful personal insights.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <Link to={isAuthenticated ? '/dashboard' : '/register'} style={{ textDecoration: 'none' }}>
              <Button size="lg" variant="primary" icon={<ArrowRight size={18} />}>
                {isAuthenticated ? 'Open Your Cockpit' : 'Begin Your Journey'}
              </Button>
            </Link>
            {!isAuthenticated && (
              <Link to="/login" style={{ textDecoration: 'none' }}>
                <Button size="lg" variant="outline">
                  Existing Member Sign In
                </Button>
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Pillars / Feature Grid */}
      <section style={{ padding: '4rem 0 5rem' }}>
        <div className="app-container">
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <h2 style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--ocean-deep)' }}>
              Holistic Wellness Engineered for You
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.0625rem', marginTop: '0.5rem' }}>
              Designed around gentle daily practices without pressure or guilt.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-6">
            <div className="card">
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--primary-100)',
                  color: 'var(--primary-700)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1rem',
                }}
              >
                <Smile size={24} />
              </div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                Daily Mood & Energy Check-ins
              </h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                Record your mood, stress level, and stamina in under 30 seconds. Build a rich chronological emotional log.
              </p>
            </div>

            <div className="card">
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--seafoam-100)',
                  color: 'var(--seafoam-700)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1rem',
                }}
              >
                <LineChart size={24} />
              </div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                Visual Patterns & Correlations
              </h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                Discover how sleep, stress, and activities influence your mood with deterministic statistical correlations.
              </p>
            </div>

            <div className="card">
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: '#fee2e2',
                  color: 'var(--coral-600)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1rem',
                }}
              >
                <Award size={24} />
              </div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                Streaks, XP & Gamification
              </h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                Celebrate consistency. Earn XP, level up, and unlock achievements that encourage sustained wellness habits.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer
        style={{
          marginTop: 'auto',
          borderTop: '1px solid var(--border-subtle)',
          backgroundColor: '#ffffff',
          padding: '2rem 0',
          textAlign: 'center',
          fontSize: '0.8125rem',
          color: 'var(--text-muted)',
        }}
      >
        <div className="app-container">
          <p>© {new Date().getFullYear()} Mood Cockpit. Mental wellness and habit tracking companion.</p>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-light)', marginTop: '0.25rem' }}>
            Informational support tool. Not intended for medical diagnosis or clinical treatment.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
