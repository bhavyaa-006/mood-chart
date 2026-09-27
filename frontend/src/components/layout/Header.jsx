import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { streaksApi } from '../../api/streaks';
import { Flame, Zap, LogOut, Plus, User } from 'lucide-react';
import Button from '../common/Button';

export const Header = ({ onOpenMoodModal }) => {
  const { user, profile, logout } = useAuth();
  const [streakData, setStreakData] = useState({ current_streak: 0, xp: 0 });

  useEffect(() => {
    let isMounted = true;
    const loadStreak = async () => {
      try {
        const res = await streaksApi.getStreaks();
        if (isMounted && res) {
          setStreakData(res);
        }
      } catch {
        // Silently handle error
      }
    };
    loadStreak();
    // Refresh streak when custom event fires after logging
    const handleUpdate = () => loadStreak();
    window.addEventListener('mood:logged', handleUpdate);
    return () => {
      isMounted = false;
      window.removeEventListener('mood:logged', handleUpdate);
    };
  }, []);

  const displayName = profile?.display_name || user?.full_name || user?.email?.split('@')[0] || 'Friend';

  return (
    <header
      style={{
        height: '64px',
        backgroundColor: '#ffffff',
        borderBottom: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 1.5rem',
        position: 'sticky',
        top: 0,
        zIndex: 30,
      }}
    >
      {/* Left: Greeting */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <div>
          <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Welcome,
          </span>{' '}
          <strong style={{ fontSize: '0.9375rem', color: 'var(--text-main)' }}>
            {displayName}
          </strong>
        </div>
      </div>

      {/* Right: Gamification Badges & Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        {/* Streak Pill */}
        <div
          title={`${streakData.current_streak} days active streak`}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.375rem',
            padding: '0.3125rem 0.625rem',
            borderRadius: 'var(--radius-full)',
            backgroundColor: streakData.current_streak > 0 ? '#fff1f2' : 'var(--bg-subtle)',
            color: streakData.current_streak > 0 ? 'var(--coral-600)' : 'var(--text-muted)',
            fontSize: '0.8125rem',
            fontWeight: 600,
            border: `1px solid ${streakData.current_streak > 0 ? '#fecdd3' : 'var(--border-subtle)'}`,
          }}
        >
          <Flame size={15} color={streakData.current_streak > 0 ? '#e11d48' : '#94a3b8'} />
          <span>{streakData.current_streak}d streak</span>
        </div>

        {/* XP Pill */}
        <div
          title={`${streakData.xp} total XP earned`}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.375rem',
            padding: '0.3125rem 0.625rem',
            borderRadius: 'var(--radius-full)',
            backgroundColor: '#eff6ff',
            color: '#1d4ed8',
            fontSize: '0.8125rem',
            fontWeight: 600,
            border: '1px solid #bfdbfe',
          }}
        >
          <Zap size={15} color="#2563eb" />
          <span>{streakData.xp} XP</span>
        </div>

        {/* Quick Check-in Button */}
        <Button
          size="sm"
          variant="primary"
          icon={<Plus size={16} />}
          onClick={onOpenMoodModal}
        >
          Log Mood
        </Button>

        {/* Logout */}
        <button
          type="button"
          onClick={logout}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            padding: '6px',
            borderRadius: 'var(--radius-sm)',
            display: 'flex',
            alignItems: 'center',
          }}
          title="Sign Out"
          aria-label="Sign Out"
        >
          <LogOut size={18} />
        </button>
      </div>
    </header>
  );
};

export default Header;
