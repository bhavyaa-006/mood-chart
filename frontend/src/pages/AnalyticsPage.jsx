import React, { useState, useEffect } from 'react';
import { analyticsApi } from '../api/analytics';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import TrendChart from '../components/analytics/TrendChart';
import HeatmapCalendar from '../components/analytics/HeatmapCalendar';
import { useToast } from '../context/ToastContext';
import {
  LineChart,
  Activity,
  Smile,
  Zap,
  TrendingUp,
  Calendar,
  Filter,
  Info,
} from 'lucide-react';

const MOOD_LABELS = {
  1: 'Very Low',
  2: 'Low',
  3: 'Neutral',
  4: 'Good',
  5: 'Great',
};

export const AnalyticsPage = () => {
  const { showError } = useToast();
  const [rangeOption, setRangeOption] = useState('30'); // '7' | '14' | '30' | 'all'
  const [summary, setSummary] = useState(null);
  const [moodTrends, setMoodTrends] = useState([]);
  const [stressTrends, setStressTrends] = useState([]);
  const [calendarPoints, setCalendarPoints] = useState([]);
  const [correlations, setCorrelations] = useState(null);

  const calculateDates = (option) => {
    if (option === 'all') return { startDate: undefined, endDate: undefined };
    const days = parseInt(option, 10);
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - (days - 1));
    return {
      startDate: start.toISOString().split('T')[0],
      endDate: end.toISOString().split('T')[0],
    };
  };

  const loadAnalytics = async () => {
    const { startDate, endDate } = calculateDates(rangeOption);

    try {
      const [sumRes, moodRes, stressRes, calRes, corrRes] = await Promise.all([
        analyticsApi.getSummary(startDate, endDate),
        analyticsApi.getMoodTrends(startDate, endDate),
        analyticsApi.getStressTrends(startDate, endDate),
        analyticsApi.getCalendar(startDate, endDate),
        analyticsApi.getCorrelations(startDate, endDate),
      ]);

      setSummary(sumRes);
      setMoodTrends(moodRes || []);
      setStressTrends(stressRes || []);
      setCalendarPoints(calRes || []);
      setCorrelations(corrRes);
    } catch (err) {
      showError(err.message || 'Failed to load analytics data.');
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, [rangeOption]);

  const formatCorrelation = (val, type) => {
    if (val === null || val === undefined) return 'Insufficient data for correlation';
    const num = Math.round(val * 100);
    if (type === 'mood_energy') {
      if (val > 0.3) return `Positive (+${num}%): Higher energy directly accompanies improved mood.`;
      if (val < -0.3) return `Negative (${num}%): Mood tends to dip despite higher energy.`;
      return `Neutral (${num}%): Mood and energy fluctuate independently.`;
    }
    if (type === 'mood_stress') {
      if (val < -0.3) return `Inverse (${num}%): Elevated stress consistently depresses overall mood.`;
      if (val > 0.3) return `Unusual (+${num}%): Mood remains resilient under pressure.`;
      return `Moderate (${num}%): Stress does not solely dictate daily mood.`;
    }
    if (type === 'stress_energy') {
      if (val < -0.3) return `Depleting (${num}%): High stress drains your physical stamina.`;
      if (val > 0.3) return `Agitated (+${num}%): Stress coincides with restless physical energy.`;
      return `Balanced (${num}%): Energy levels stay stable under varying stress.`;
    }
    return `${num}% correlation coefficient`;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Header & Filter Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--ocean-deep)', margin: 0 }}>
            Visual Analytics & Trends
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Empirical insights into your psychological rhythms and long-term well-being.
          </p>
        </div>

        {/* Range Buttons */}
        <div
          style={{
            display: 'flex',
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '3px',
          }}
        >
          {[
            { id: '7', label: '7 Days' },
            { id: '14', label: '14 Days' },
            { id: '30', label: '30 Days' },
            { id: 'all', label: 'All Time' },
          ].map((r) => (
            <button
              key={r.id}
              type="button"
              onClick={() => setRangeOption(r.id)}
              style={{
                border: 'none',
                backgroundColor: rangeOption === r.id ? 'var(--primary-600)' : 'transparent',
                color: rangeOption === r.id ? '#ffffff' : 'var(--text-muted)',
                padding: '0.375rem 0.875rem',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.8125rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Stat Grid */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Average Mood</span>
          <div style={{ fontSize: '1.625rem', fontWeight: 700, color: 'var(--primary-700)', marginTop: '0.25rem' }}>
            {summary?.averages?.mood ? `${summary.averages.mood.toFixed(1)} / 5` : '—'}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-light)', marginTop: '0.375rem' }}>
            {summary?.averages?.mood ? (summary.averages.mood >= 3.5 ? 'Flowing positively' : 'Balanced rhythm') : 'No check-ins'}
          </div>
        </Card>

        <Card>
          <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Average Stress</span>
          <div style={{ fontSize: '1.625rem', fontWeight: 700, color: 'var(--coral-500)', marginTop: '0.25rem' }}>
            {summary?.averages?.stress_level ? `${summary.averages.stress_level.toFixed(1)} / 5` : '—'}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-light)', marginTop: '0.375rem' }}>
            {summary?.averages?.stress_level ? (summary.averages.stress_level <= 2.5 ? 'Calm baseline' : 'Moderate strain') : 'No check-ins'}
          </div>
        </Card>

        <Card>
          <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Average Energy</span>
          <div style={{ fontSize: '1.625rem', fontWeight: 700, color: '#d97706', marginTop: '0.25rem' }}>
            {summary?.averages?.energy_level ? `${summary.averages.energy_level.toFixed(1)} / 5` : '—'}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-light)', marginTop: '0.375rem' }}>
            Physical stamina index
          </div>
        </Card>

        <Card>
          <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Check-in Consistency</span>
          <div style={{ fontSize: '1.625rem', fontWeight: 700, color: 'var(--seafoam-700)', marginTop: '0.25rem' }}>
            {summary?.logging_consistency ?? 0}%
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-light)', marginTop: '0.375rem' }}>
            {summary?.entry_count ?? 0} total records
          </div>
        </Card>
      </div>

      {/* Main Charts: Mood & Stress Trends */}
      <div className="grid grid-cols-2 gap-6">
        <Card title="Mood Trajectory" subtitle="Daily mood values across period" icon={<Smile size={18} />}>
          <TrendChart
            data={moodTrends}
            label="Mood"
            color="var(--primary-600)"
            fillColor="rgba(14, 165, 233, 0.12)"
            height={210}
          />
        </Card>

        <Card title="Stress Curve" subtitle="Daily stress values across period" icon={<Activity size={18} color="#e11d48" />}>
          <TrendChart
            data={stressTrends}
            label="Stress"
            color="var(--coral-500)"
            fillColor="rgba(244, 63, 94, 0.12)"
            height={210}
          />
        </Card>
      </div>

      {/* Mood Distribution & Correlation Insights */}
      <div className="grid grid-cols-2 gap-6">
        {/* Mood Distribution Histogram */}
        <Card title="Mood Distribution" subtitle="Frequency of each rating score">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.5rem' }}>
            {[5, 4, 3, 2, 1].map((level) => {
              const count = summary?.mood_distribution?.[String(level)] ?? 0;
              const total = summary?.entry_count || 1;
              const percent = Math.round((count / total) * 100);

              return (
                <div key={level} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ width: '70px', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                    Level {level}
                  </span>
                  <div
                    style={{
                      flex: 1,
                      height: '18px',
                      backgroundColor: 'var(--bg-subtle)',
                      borderRadius: 'var(--radius-sm)',
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        height: '100%',
                        width: `${percent}%`,
                        backgroundColor:
                          level >= 4
                            ? 'var(--primary-500)'
                            : level === 3
                            ? 'var(--seafoam-500)'
                            : 'var(--coral-400)',
                        borderRadius: 'var(--radius-sm)',
                        transition: 'width 0.5s ease',
                      }}
                    />
                  </div>
                  <span style={{ width: '45px', textAlign: 'right', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-main)' }}>
                    {count} ({percent}%)
                  </span>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Empirical Statistical Correlations */}
        <Card title="Correlations & Dynamics" subtitle="Observed relationships between tracked dimensions">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div
              style={{
                padding: '0.875rem 1rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--bg-subtle)',
                border: '1px solid var(--border-subtle)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                <strong style={{ fontSize: '0.875rem', color: 'var(--text-main)' }}>Mood & Stress</strong>
                <Badge variant={correlations?.mood_stress < -0.3 ? 'warning' : 'neutral'}>
                  {correlations?.mood_stress !== null ? `${Math.round(correlations?.mood_stress * 100)}%` : 'N/A'}
                </Badge>
              </div>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', margin: 0 }}>
                {formatCorrelation(correlations?.mood_stress, 'mood_stress')}
              </p>
            </div>

            <div
              style={{
                padding: '0.875rem 1rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--bg-subtle)',
                border: '1px solid var(--border-subtle)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                <strong style={{ fontSize: '0.875rem', color: 'var(--text-main)' }}>Mood & Energy</strong>
                <Badge variant={correlations?.mood_energy > 0.3 ? 'success' : 'neutral'}>
                  {correlations?.mood_energy !== null ? `${Math.round(correlations?.mood_energy * 100)}%` : 'N/A'}
                </Badge>
              </div>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', margin: 0 }}>
                {formatCorrelation(correlations?.mood_energy, 'mood_energy')}
              </p>
            </div>

            <div
              style={{
                padding: '0.875rem 1rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--bg-subtle)',
                border: '1px solid var(--border-subtle)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                <strong style={{ fontSize: '0.875rem', color: 'var(--text-main)' }}>Stress & Energy</strong>
                <Badge variant="neutral">
                  {correlations?.stress_energy !== null ? `${Math.round(correlations?.stress_energy * 100)}%` : 'N/A'}
                </Badge>
              </div>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', margin: 0 }}>
                {formatCorrelation(correlations?.stress_energy, 'stress_energy')}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Heatmap Calendar */}
      {calendarPoints.length > 0 && (
        <Card title="Calendar Activity Matrix" subtitle="Day-by-day emotional density over recent weeks">
          <HeatmapCalendar data={calendarPoints} />
        </Card>
      )}

      {/* Weekly & Monthly Averages Tables */}
      {summary?.weekly_averages?.length > 0 && (
        <Card title="Weekly Aggregates" subtitle="Pacing over recent calendar weeks">
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-strong)', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '0.5rem 0' }}>Period</th>
                  <th style={{ padding: '0.5rem 0' }}>Avg Mood</th>
                  <th style={{ padding: '0.5rem 0' }}>Avg Stress</th>
                  <th style={{ padding: '0.5rem 0' }}>Avg Energy</th>
                </tr>
              </thead>
              <tbody>
                {summary.weekly_averages.map((w, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '0.75rem 0', fontWeight: 600 }}>{w.period}</td>
                    <td style={{ padding: '0.75rem 0', color: 'var(--primary-700)', fontWeight: 600 }}>
                      {w.mood.toFixed(1)} / 5
                    </td>
                    <td style={{ padding: '0.75rem 0', color: 'var(--coral-600)' }}>
                      {w.stress_level.toFixed(1)} / 5
                    </td>
                    <td style={{ padding: '0.75rem 0', color: '#d97706' }}>
                      {w.energy_level.toFixed(1)} / 5
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
};

export default AnalyticsPage;
