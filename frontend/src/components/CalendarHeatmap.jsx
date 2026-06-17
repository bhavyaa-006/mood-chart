import React, { useEffect, useMemo, useState } from 'react';
import { getMoodCalendar } from '../api';

const LEGEND = [
  { key: 'Excellent', label: 'Excellent', color: 'rgba(113, 76, 182, 0.22)' },
  { key: 'Happy', label: 'Happy', color: 'rgba(107, 165, 232, 0.22)' },
  { key: 'Neutral', label: 'Neutral', color: 'rgba(211, 206, 189, 0.35)' },
  { key: 'Sad', label: 'Sad', color: 'rgba(176, 112, 192, 0.22)' },
  { key: 'Stressed', label: 'Stressed', color: 'rgba(66, 29, 36, 0.18)' },
];

function daysInMonth(year, monthIndex) {
  return new Date(year, monthIndex + 1, 0).getDate();
}

function getMonthStartWeekday(year, monthIndex) {
  // JS: 0=Sun..6=Sat. We'll start with Monday-like grid by shifting.
  // shift: Monday=0 ... Sunday=6
  const jsDay = new Date(year, monthIndex, 1).getDay();
  return (jsDay + 6) % 7;
}

export default function CalendarHeatmap({ year, month, accessToken }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const monthLabel = useMemo(() => {
    const d = new Date(year, month - 1, 1);
    return d.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
  }, [year, month]);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await getMoodCalendar(year, month, accessToken);
        setData(res);
      } finally {
        setLoading(false);
      }
    }
    if (accessToken) load();
  }, [year, month, accessToken]);

  if (loading && !data) {
    return (
      <div className="feature-card" style={{ padding: '48px', textAlign: 'center' }}>
        <div className="loading-spinner" style={{ margin: '0 auto' }} />
      </div>
    );
  }

  const gridStart = getMonthStartWeekday(year, month - 1);
  const totalDays = daysInMonth(year, month - 1);
  const cells = [];

  const byDate = new Map((data?.days || []).map((d) => [d.date, d]));

  for (let i = 0; i < gridStart; i++) cells.push(null);

  for (let day = 1; day <= totalDays; day++) {
    const iso = new Date(year, month - 1, day).toISOString().slice(0, 10);
    const entry = byDate.get(iso);
    cells.push({
      iso,
      day,
      category: entry?.category || 'Neutral',
      mood: entry?.mood || null,
      note: entry?.note || null,
      ai_insights: entry?.ai_insights || null,
    });
  }

  // fill to full weeks
  while (cells.length % 7 !== 0) cells.push(null);

  const getLegendColor = (category) => {
    const l = LEGEND.find((x) => x.key === category);
    return l?.color || 'rgba(211, 206, 189, 0.35)';
  };

  return (
    <div>
      <div className="feature-card" style={{ marginBottom: '24px' }}>
        <div className="card-label">Calendar Overview</div>
        <h3 className="text-heading-sm" style={{ marginTop: 8 }}>
          {monthLabel}
        </h3>

        <div style={{ marginTop: 16, display: 'flex', flexWrap: 'wrap', gap: 12 }}>
          {LEGEND.map((l) => (
            <div
              key={l.key}
              style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 8, borderRadius: 12, border: '1px solid var(--color-fog)' }}
            >
              <span style={{ width: 10, height: 10, borderRadius: 999, background: l.color, display: 'inline-block' }} />
              <span className="color-graphite" style={{ fontSize: 12, fontWeight: 500 }}>{l.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="feature-card" style={{ padding: 16 }}>
        <div className="suite-tabs" style={{ justifyContent: 'space-between', marginBottom: 12 }}>
          <div className="color-graphite" style={{ fontSize: 12, fontWeight: 500 }}>Mon</div>
          <div className="color-graphite" style={{ fontSize: 12, fontWeight: 500 }}>Tue</div>
          <div className="color-graphite" style={{ fontSize: 12, fontWeight: 500 }}>Wed</div>
          <div className="color-graphite" style={{ fontSize: 12, fontWeight: 500 }}>Thu</div>
          <div className="color-graphite" style={{ fontSize: 12, fontWeight: 500 }}>Fri</div>
          <div className="color-graphite" style={{ fontSize: 12, fontWeight: 500 }}>Sat</div>
          <div className="color-graphite" style={{ fontSize: 12, fontWeight: 500 }}>Sun</div>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            gap: 8,
          }}
        >
          {cells.map((c, idx) => {
            if (!c) {
              return (
                <div
                  key={`empty-${idx}`}
                  style={{ height: 44, borderRadius: 12, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
                />
              );
            }

            return (
              <div
                key={c.iso}
                title={
                  `${c.mood ? `Mood: ${c.mood}\n` : ''}` +
                  `${c.note ? `Notes: ${c.note}\n` : ''}` +
                  `${c.ai_insights ? `AI: ${c.ai_insights}` : ''}`
                }
                style={{
                  height: 44,
                  borderRadius: 12,
                  border: '1px solid rgba(255,255,255,0.12)',
                  background: `linear-gradient(to bottom right, ${getLegendColor(c.category)}, rgba(255,255,255,0.02))`,
                  boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.04)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'default',
                  position: 'relative',
                }}
              >
                <span className="color-graphite" style={{ fontSize: 12, fontWeight: 600, opacity: 0.95 }}>
                  {c.day}
                </span>
                {c.mood ? (
                  <span
                    aria-hidden="true"
                    style={{
                      position: 'absolute',
                      bottom: 6,
                      right: 8,
                      fontSize: 12,
                      opacity: 0.9,
                    }}
                  >
                    ●
                  </span>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
