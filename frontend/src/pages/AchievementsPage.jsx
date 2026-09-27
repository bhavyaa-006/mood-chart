import React, { useState, useEffect } from 'react';
import { streaksApi } from '../api/streaks';
import { achievementsApi } from '../api/achievements';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import { useToast } from '../context/ToastContext';
import { Award, Flame, Zap, CheckCircle2, Lock, Star, Trophy } from 'lucide-react';

export const AchievementsPage = () => {
  const { showError } = useToast();
  const [streak, setStreak] = useState({ current_streak: 0, longest_streak: 0, total_logs: 0, xp: 0 });
  const [achievements, setAchievements] = useState([]);
  const [unlockedOnly, setUnlockedOnly] = useState(false);

  const loadData = async () => {
    try {
      const [streakRes, achRes] = await Promise.all([
        streaksApi.getStreaks(),
        unlockedOnly ? achievementsApi.listUnlocked() : achievementsApi.listAchievements(),
      ]);
      setStreak(streakRes || { current_streak: 0, longest_streak: 0, total_logs: 0, xp: 0 });
      setAchievements(achRes || []);
    } catch (err) {
      showError(err.message || 'Failed to load achievements.');
    }
  };

  useEffect(() => {
    loadData();
  }, [unlockedOnly]);

  const level = Math.floor(streak.xp / 50) + 1;
  const progressInLevel = (streak.xp % 50);
  const progressPercent = (progressInLevel / 50) * 100;
  const unlockedCount = achievements.filter((a) => !!a.unlocked_at).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Page Header */}
      <div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--ocean-deep)', margin: 0 }}>
          Achievements & Milestones
        </h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
          Rewarding your daily commitment to emotional presence and self-care.
        </p>
      </div>

      {/* Gamification Level & XP Progress Card */}
      <Card
        className="gradient-ocean"
        style={{
          padding: '2rem 1.75rem',
          borderRadius: 'var(--radius-xl)',
          color: '#ffffff',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
              <Trophy size={20} color="#fde047" />
              <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#bae6fd', textTransform: 'uppercase' }}>
                Wellness Progression
              </span>
            </div>
            <h2 style={{ fontSize: '2.25rem', fontWeight: 800, margin: 0, color: '#ffffff' }}>
              Level {level} Explorer
            </h2>
            <p style={{ fontSize: '0.9375rem', color: '#e0f2fe', marginTop: '0.25rem' }}>
              {streak.xp} Total XP accumulated through check-ins & practices.
            </p>
          </div>

          <div
            style={{
              textAlign: 'right',
              backgroundColor: 'rgba(255, 255, 255, 0.15)',
              padding: '0.75rem 1.25rem',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
            }}
          >
            <span style={{ fontSize: '0.8125rem', color: '#bae6fd', display: 'block' }}>Next Level in</span>
            <span style={{ fontSize: '1.5rem', fontWeight: 700 }}>
              {50 - progressInLevel} XP
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div style={{ marginTop: '1.5rem' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '0.75rem',
              color: '#bae6fd',
              marginBottom: '0.375rem',
            }}
          >
            <span>Level {level}</span>
            <span>{progressInLevel} / 50 XP</span>
            <span>Level {level + 1}</span>
          </div>
          <div
            style={{
              width: '100%',
              height: '10px',
              backgroundColor: 'rgba(0, 0, 0, 0.25)',
              borderRadius: 'var(--radius-full)',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                height: '100%',
                width: `${progressPercent}%`,
                backgroundColor: '#38bdf8',
                borderRadius: 'var(--radius-full)',
                transition: 'width 0.6s ease',
              }}
            />
          </div>
        </div>
      </Card>

      {/* Streak Details Grid */}
      <div className="grid grid-cols-3 gap-6">
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div
              style={{
                padding: '0.75rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: '#fff1f2',
                color: 'var(--coral-500)',
              }}
            >
              <Flame size={28} />
            </div>
            <div>
              <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Active Streak</span>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-main)' }}>
                {streak.current_streak} Consecutive Days
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div
              style={{
                padding: '0.75rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: '#eff6ff',
                color: '#2563eb',
              }}
            >
              <Star size={28} />
            </div>
            <div>
              <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Longest Streak</span>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-main)' }}>
                {streak.longest_streak} Days Record
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div
              style={{
                padding: '0.75rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--seafoam-100)',
                color: 'var(--seafoam-700)',
              }}
            >
              <CheckCircle2 size={28} />
            </div>
            <div>
              <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Total Check-Ins</span>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-main)' }}>
                {streak.total_logs} Lifetime Entries
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Badges Gallery */}
      <Card
        title={`Badges & Milestones (${unlockedCount} / ${achievements.length} Unlocked)`}
        subtitle="Earned by building consistent self-care patterns"
        action={
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <Button
              size="sm"
              variant={!unlockedOnly ? 'primary' : 'outline'}
              onClick={() => setUnlockedOnly(false)}
            >
              All Badges
            </Button>
            <Button
              size="sm"
              variant={unlockedOnly ? 'primary' : 'outline'}
              onClick={() => setUnlockedOnly(true)}
            >
              Unlocked Only
            </Button>
          </div>
        }
      >
        <div className="grid grid-cols-3 gap-6" style={{ marginTop: '0.5rem' }}>
          {achievements.map((item) => {
            const isUnlocked = !!item.unlocked_at;
            return (
              <div
                key={item.id}
                style={{
                  padding: '1.25rem',
                  borderRadius: 'var(--radius-lg)',
                  border: `1.5px solid ${isUnlocked ? 'var(--primary-300)' : 'var(--border-subtle)'}`,
                  backgroundColor: isUnlocked ? 'var(--primary-50)' : 'var(--bg-subtle)',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '1rem',
                  opacity: isUnlocked ? 1 : 0.65,
                  transition: 'all 0.2s ease',
                }}
              >
                <div
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: isUnlocked ? '#ffffff' : 'var(--border-strong)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: isUnlocked ? 'var(--primary-600)' : 'var(--text-muted)',
                    boxShadow: isUnlocked ? 'var(--shadow-sm)' : 'none',
                    flexShrink: 0,
                  }}
                >
                  {isUnlocked ? <Award size={24} /> : <Lock size={20} />}
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h4 style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-main)', margin: 0 }}>
                      {item.name}
                    </h4>
                    {isUnlocked && <Badge variant="success">Unlocked</Badge>}
                  </div>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', margin: '0.25rem 0 0.5rem 0', lineHeight: 1.4 }}>
                    {item.description}
                  </p>
                  <span style={{ fontSize: '0.6875rem', color: 'var(--text-light)', display: 'block' }}>
                    {isUnlocked
                      ? `Unlocked on ${new Date(item.unlocked_at).toLocaleDateString()}`
                      : `Requirement: ${item.requirement_value} daily entries`}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
};

export default AchievementsPage;
