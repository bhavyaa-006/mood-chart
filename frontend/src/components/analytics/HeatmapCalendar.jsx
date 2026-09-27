import React, { useState } from 'react';

const MOOD_COLORS = {
  1: '#f87171', // Red / very low
  2: '#fb923c', // Orange / low
  3: '#fde047', // Yellow / neutral
  4: '#86efac', // Light green / good
  5: '#38bdf8', // Blue / great
};

export const HeatmapCalendar = ({ data = [], onSelectDate }) => {
  const [selectedPoint, setSelectedPoint] = useState(null);

  // Map dates to points for O(1) lookup
  const pointsMap = new Map();
  data.forEach((p) => {
    pointsMap.set(p.entry_date, p);
  });

  // Generate last 35 days (5 weeks)
  const days = [];
  const today = new Date();
  for (let i = 34; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const point = pointsMap.get(dateStr) || null;
    days.push({
      dateStr,
      dayNumber: d.getDate(),
      monthStr: d.toLocaleDateString('default', { month: 'short' }),
      point,
    });
  }

  return (
    <div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gap: '0.375rem',
          maxWidth: '100%',
        }}
      >
        {days.map((item, idx) => {
          const hasData = !!item.point;
          const bg = hasData ? MOOD_COLORS[item.point.mood] || '#38bdf8' : 'var(--bg-subtle)';
          return (
            <button
              key={idx}
              type="button"
              onClick={() => {
                if (hasData) {
                  setSelectedPoint(item.point);
                  if (onSelectDate) onSelectDate(item.point);
                }
              }}
              style={{
                aspectRatio: '1',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: bg,
                border: selectedPoint?.entry_date === item.dateStr ? '2px solid #0f172a' : '1px solid var(--border-subtle)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: hasData ? 'pointer' : 'default',
                padding: '2px',
                transition: 'transform 0.15s ease',
              }}
              title={`${item.dateStr}: ${hasData ? `Mood ${item.point.mood}/5` : 'No check-in'}`}
            >
              <span style={{ fontSize: '0.6875rem', fontWeight: 600, color: hasData ? '#0f172a' : 'var(--text-light)' }}>
                {item.dayNumber}
              </span>
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginTop: '1rem',
          fontSize: '0.75rem',
          color: 'var(--text-muted)',
          flexWrap: 'wrap',
          gap: '0.5rem',
        }}
      >
        <span>Last 35 days</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
          <span>Low</span>
          {[1, 2, 3, 4, 5].map((lvl) => (
            <div
              key={lvl}
              style={{
                width: '12px',
                height: '12px',
                borderRadius: '2px',
                backgroundColor: MOOD_COLORS[lvl],
              }}
            />
          ))}
          <span>Great</span>
        </div>
      </div>

      {/* Selected day summary details */}
      {selectedPoint && (
        <div
          className="animate-fade-in"
          style={{
            marginTop: '1rem',
            padding: '0.75rem 1rem',
            backgroundColor: 'var(--primary-50)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--primary-200)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div>
            <strong style={{ fontSize: '0.875rem', color: 'var(--primary-900)' }}>
              {selectedPoint.entry_date}
            </strong>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '0.25rem', fontSize: '0.8125rem' }}>
              <span>Mood: <strong>{selectedPoint.mood}/5</strong></span>
              <span>Stress: <strong>{selectedPoint.stress_level}/5</strong></span>
              <span>Energy: <strong>{selectedPoint.energy_level}/5</strong></span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setSelectedPoint(null)}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              fontSize: '0.75rem',
              color: 'var(--primary-700)',
            }}
          >
            Dismiss
          </button>
        </div>
      )}
    </div>
  );
};

export default HeatmapCalendar;
