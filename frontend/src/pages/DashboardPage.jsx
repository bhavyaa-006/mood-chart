import React, { useState, useEffect } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { moodApi } from '../api/moods';
import { journalApi } from '../api/journal';
import { analyticsApi } from '../api/analytics';
import { streaksApi } from '../api/streaks';
import { activitiesApi } from '../api/activities';
import { aiInsightsApi } from '../api/aiInsights';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import TrendChart from '../components/analytics/TrendChart';
import {
  Smile,
  Flame,
  Zap,
  TrendingUp,
  Sparkles,
  BookOpen,
  Gamepad2,
  Calendar,
  CheckCircle2,
  Plus,
  ArrowRight,
} from 'lucide-react';

const MOOD_EMOJIS = {
  1: '😞',
  2: '🙁',
  3: '😐',
  4: '🙂',
  5: '🌊',
};

export const DashboardPage = () => {
  const { user, profile } = useAuth();
  const { openMoodModal } = useOutletContext();

  const [todayMood, setTodayMood] = useState(null);
  const [streak, setStreak] = useState({ current_streak: 0, longest_streak: 0, xp: 0 });
  const [analyticsSummary, setAnalyticsSummary] = useState(null);
  const [moodTrends, setMoodTrends] = useState([]);
  const [recentJournals, setRecentJournals] = useState([]);
  const [recommendedActivities, setRecommendedActivities] = useState([]);
  const [latestInsight, setLatestInsight] = useState(null);

  const todayStr = new Date().toISOString().split('T')[0];

  const loadDashboardData = async () => {
    try {
      const [moodsRes, streakRes, summaryRes, trendsRes, journalsRes, activitiesRes, insightsRes] =
        await Promise.allSettled([
          moodApi.listMoods(),
          streaksApi.getStreaks(),
          analyticsApi.getSummary(),
          analyticsApi.getMoodTrends(),
          journalApi.listJournal(),
          activitiesApi.listActivities(),
          aiInsightsApi.listInsights(1, 0),
        ]);

      if (moodsRes.status === 'fulfilled' && moodsRes.value) {
        const foundToday = moodsRes.value.find((m) => m.entry_date === todayStr);
        setTodayMood(foundToday || null);
      }

      if (streakRes.status === 'fulfilled' && streakRes.value) {
        setStreak(streakRes.value);
      }

      if (summaryRes.status === 'fulfilled' && summaryRes.value) {
        setAnalyticsSummary(summaryRes.value);
      }

      if (trendsRes.status === 'fulfilled' && trendsRes.value) {
        setMoodTrends(trendsRes.value.slice(-7)); // last 7 days
      }

      if (journalsRes.status === 'fulfilled' && journalsRes.value) {
        setRecentJournals(journalsRes.value.slice(0, 3));
      }

      if (activitiesRes.status === 'fulfilled' && activitiesRes.value) {
        setRecommendedActivities(activitiesRes.value.slice(0, 4));
      }

      if (insightsRes.status === 'fulfilled' && insightsRes.value?.items?.length > 0) {
        setLatestInsight(insightsRes.value.items[0]);
      }
    } catch {
      // Handled gracefully
    }
  };

  useEffect(() => {
    loadDashboardData();
    const handleMoodLogged = () => loadDashboardData();
    window.addEventListener('mood:logged', handleMoodLogged);
    window.addEventListener('journal:saved', handleMoodLogged);
    return () => {
      window.removeEventListener('mood:logged', handleMoodLogged);
      window.removeEventListener('journal:saved', handleMoodLogged);
    };
  }, []);

  const level = Math.floor(streak.xp / 50) + 1;
  const greetingName = profile?.display_name || user?.full_name || 'Friend';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Header Banner */}
      <div
        className="card gradient-ocean"
        style={{
          padding: '2rem 1.75rem',
          position: 'relative',
          overflow: 'hidden',
          borderRadius: 'var(--radius-xl)',
        }}
      >
        <div style={{ maxWidth: '640px', position: 'relative', zIndex: 2 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <Calendar size={16} color="#bae6fd" />
            <span style={{ fontSize: '0.8125rem', color: '#bae6fd', fontWeight: 500 }}>
              {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
            </span>
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: 700, margin: '0 0 0.5rem 0', color: '#ffffff' }}>
            Good day, {greetingName}
          </h1>
          <p style={{ color: '#e0f2fe', fontSize: '0.9375rem', lineHeight: 1.5, margin: 0 }}>
            {todayMood
              ? `You recorded a mood score of ${todayMood.mood}/5 today. Keep flowing with the gentle tide.`
              : 'Take a brief pause in your day to log how your mind and body are feeling.'}
          </p>
        </div>

        <div
          style={{
            position: 'absolute',
            right: '2rem',
            top: '50%',
            transform: 'translateY(-50%)',
            zIndex: 2,
          }}
          className="hidden-mobile"
        >
          {todayMood ? (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                backgroundColor: 'rgba(255, 255, 255, 0.15)',
                backdropFilter: 'blur(8px)',
                padding: '0.75rem 1.25rem',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid rgba(255, 255, 255, 0.25)',
              }}
            >
              <span style={{ fontSize: '2.5rem' }}>{MOOD_EMOJIS[todayMood.mood]}</span>
              <div>
                <span style={{ fontSize: '0.75rem', color: '#bae6fd', display: 'block' }}>Today's Check-In</span>
                <span style={{ fontSize: '1.125rem', fontWeight: 700, color: '#ffffff' }}>Recorded</span>
              </div>
            </div>
          ) : (
            <Button
              variant="secondary"
              size="lg"
              icon={<Plus size={18} />}
              onClick={openMoodModal}
              style={{ backgroundColor: '#ffffff', color: 'var(--primary-800)', border: 'none' }}
            >
              Check In Now
            </Button>
          )}
        </div>
      </div>

      {/* 4 Metric Pill Cards */}
      <div className="grid grid-cols-4 gap-4">
        {/* Metric 1: Today's Mood */}
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Today's Mood</span>
              <div style={{ fontSize: '1.625rem', fontWeight: 700, marginTop: '0.25rem', color: 'var(--text-main)' }}>
                {todayMood ? `${todayMood.mood}/5` : 'Pending'}
              </div>
            </div>
            <div
              style={{
                padding: '0.5rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: todayMood ? 'var(--primary-50)' : 'var(--bg-subtle)',
                fontSize: '1.5rem',
              }}
            >
              {todayMood ? MOOD_EMOJIS[todayMood.mood] : '⏳'}
            </div>
          </div>
          <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            {todayMood ? `Stress ${todayMood.stress_level}/5 · Energy ${todayMood.energy_level}/5` : 'Click to check in'}
          </div>
        </Card>

        {/* Metric 2: Streak */}
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Current Streak</span>
              <div style={{ fontSize: '1.625rem', fontWeight: 700, marginTop: '0.25rem', color: 'var(--coral-500)' }}>
                {streak.current_streak} days
              </div>
            </div>
            <div
              style={{
                padding: '0.5rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: '#fff1f2',
                color: 'var(--coral-500)',
              }}
            >
              <Flame size={24} />
            </div>
          </div>
          <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Longest record: {streak.longest_streak} days
          </div>
        </Card>

        {/* Metric 3: Gamification XP & Level */}
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Gamification</span>
              <div style={{ fontSize: '1.625rem', fontWeight: 700, marginTop: '0.25rem', color: '#2563eb' }}>
                Level {level}
              </div>
            </div>
            <div
              style={{
                padding: '0.5rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: '#eff6ff',
                color: '#2563eb',
              }}
            >
              <Zap size={24} />
            </div>
          </div>
          <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            {streak.xp} Total XP earned
          </div>
        </Card>

        {/* Metric 4: Logging Consistency */}
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Consistency</span>
              <div style={{ fontSize: '1.625rem', fontWeight: 700, marginTop: '0.25rem', color: 'var(--seafoam-700)' }}>
                {analyticsSummary?.logging_consistency ?? 0}%
              </div>
            </div>
            <div
              style={{
                padding: '0.5rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--seafoam-100)',
                color: 'var(--seafoam-700)',
              }}
            >
              <TrendingUp size={24} />
            </div>
          </div>
          <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            {analyticsSummary?.entry_count ?? 0} total logs logged
          </div>
        </Card>
      </div>

      {/* Main Grid: Trend Chart & AI Insights Snippet */}
      <div className="grid grid-cols-3 gap-6">
        {/* Trend Chart (2 cols) */}
        <div style={{ gridColumn: 'span 2' }}>
          <Card
            title="Recent Mood Rhythm"
            subtitle="7-day mood trajectory"
            action={
              <Link to="/analytics" style={{ textDecoration: 'none' }}>
                <Button size="sm" variant="ghost" icon={<ArrowRight size={14} />}>
                  Full Analytics
                </Button>
              </Link>
            }
          >
            <TrendChart
              data={moodTrends}
              label="Mood"
              color="var(--primary-600)"
              fillColor="rgba(14, 165, 233, 0.12)"
              height={190}
            />
          </Card>
        </div>

        {/* AI Insight Spotlight (1 col) */}
        <div>
          <Card
            title="AI Wellness Reflection"
            subtitle="Synthesized from check-ins"
            icon={<Sparkles size={16} />}
            action={
              <Link to="/insights" style={{ textDecoration: 'none' }}>
                <Button size="sm" variant="ghost">
                  View All
                </Button>
              </Link>
            }
          >
            {latestInsight ? (
              <div>
                <h4 style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--primary-900)', marginBottom: '0.375rem' }}>
                  {latestInsight.title}
                </h4>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '0.75rem' }}>
                  {latestInsight.summary}
                </p>
                {latestInsight.recommendations?.length > 0 && (
                  <div
                    style={{
                      padding: '0.5rem 0.75rem',
                      backgroundColor: 'var(--primary-50)',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.75rem',
                      color: 'var(--primary-800)',
                    }}
                  >
                    💡 {latestInsight.recommendations[0]}
                  </div>
                )}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                <Sparkles size={28} color="var(--primary-300)" style={{ margin: '0 auto 0.5rem' }} />
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                  No reflection generated yet.
                </p>
                <Link to="/insights" style={{ textDecoration: 'none' }}>
                  <Button size="sm" variant="outline">
                    Generate Insight
                  </Button>
                </Link>
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Recommended Mind Activities & Recent Journal */}
      <div className="grid grid-cols-2 gap-6">
        {/* Recommended Activities */}
        <Card
          title="Recommended Activities"
          subtitle="Mind games and resets tailored to your practice goals"
          icon={<Gamepad2 size={16} />}
          action={
            <Link to="/activities" style={{ textDecoration: 'none' }}>
              <Button size="sm" variant="ghost" icon={<ArrowRight size={14} />}>
                All Activities
              </Button>
            </Link>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {recommendedActivities.map((act) => (
              <Link
                key={act.id}
                to="/activities"
                style={{ textDecoration: 'none', color: 'inherit' }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.75rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-subtle)',
                    backgroundColor: 'var(--bg-surface)',
                    transition: 'all 0.15s ease',
                  }}
                  className="card-interactive"
                >
                  <div>
                    <h5 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)', margin: 0 }}>
                      {act.name}
                    </h5>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
                      {act.description}
                    </p>
                  </div>
                  <Badge variant="primary">{act.category}</Badge>
                </div>
              </Link>
            ))}
          </div>
        </Card>

        {/* Recent Journal Reflections */}
        <Card
          title="Recent Reflections"
          subtitle="Your written thoughts"
          icon={<BookOpen size={16} />}
          action={
            <Link to="/journal" style={{ textDecoration: 'none' }}>
              <Button size="sm" variant="ghost" icon={<ArrowRight size={14} />}>
                Open Journal
              </Button>
            </Link>
          }
        >
          {recentJournals.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {recentJournals.map((j) => (
                <div
                  key={j.id}
                  style={{
                    padding: '0.75rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-subtle)',
                    backgroundColor: 'var(--bg-surface)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--primary-700)' }}>
                      {j.entry_date}
                    </span>
                  </div>
                  <p
                    style={{
                      fontSize: '0.8125rem',
                      color: 'var(--text-main)',
                      lineHeight: 1.4,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      margin: 0,
                    }}
                  >
                    {j.content}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
              <BookOpen size={28} color="var(--border-strong)" style={{ margin: '0 auto 0.5rem' }} />
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                No journal reflections written yet.
              </p>
              <Link to="/journal" style={{ textDecoration: 'none' }}>
                <Button size="sm" variant="outline">
                  Write First Entry
                </Button>
              </Link>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default DashboardPage;
