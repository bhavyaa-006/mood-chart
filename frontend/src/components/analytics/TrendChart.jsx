import React, { useState } from 'react';

export const TrendChart = ({
  data = [], // [{ entry_date: '2026-09-20', value: 4 }]
  label = 'Mood Score',
  color = '#0284c7',
  fillColor = 'rgba(14, 165, 233, 0.12)',
  minVal = 1,
  maxVal = 5,
  height = 200,
}) => {
  const [hoveredPoint, setHoveredPoint] = useState(null);

  if (!data || data.length === 0) {
    return (
      <div
        style={{
          height: `${height}px`,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'var(--bg-subtle)',
          borderRadius: 'var(--radius-md)',
          color: 'var(--text-muted)',
          fontSize: '0.875rem',
          padding: '1rem',
          textAlign: 'center',
        }}
      >
        <span style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>🌊</span>
        <p>No trend data available for this date range.</p>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-light)', marginTop: '0.25rem' }}>
          Log daily check-ins to build your emotional trend line.
        </p>
      </div>
    );
  }

  // Chart coordinates
  const paddingX = 40;
  const paddingY = 25;
  const width = 600; // viewBox width

  const points = data.map((d, index) => {
    const x =
      data.length === 1
        ? width / 2
        : paddingX + (index / (data.length - 1)) * (width - 2 * paddingX);
    const y =
      height -
      paddingY -
      ((d.value - minVal) / (maxVal - minVal)) * (height - 2 * paddingY);
    return { ...d, x, y };
  });

  const pathD = points.reduce((acc, curr, index) => {
    return `${acc} ${index === 0 ? 'M' : 'L'} ${curr.x} ${curr.y}`;
  }, '');

  const areaD =
    points.length > 1
      ? `${pathD} L ${points[points.length - 1].x} ${height - paddingY} L ${points[0].x} ${height - paddingY} Z`
      : '';

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        style={{ width: '100%', height: `${height}px`, overflow: 'visible' }}
      >
        {/* Horizontal grid lines */}
        {[1, 2, 3, 4, 5].map((level) => {
          const y =
            height -
            paddingY -
            ((level - minVal) / (maxVal - minVal)) * (height - 2 * paddingY);
          return (
            <g key={level}>
              <line
                x1={paddingX}
                y1={y}
                x2={width - paddingX}
                y2={y}
                stroke="#e2e8f0"
                strokeDasharray="4 4"
                strokeWidth="1"
              />
              <text
                x={paddingX - 10}
                y={y + 4}
                textAnchor="end"
                fontSize="11"
                fill="#94a3b8"
                fontFamily="inherit"
              >
                {level}
              </text>
            </g>
          );
        })}

        {/* Gradient fill */}
        {areaD && <path d={areaD} fill={fillColor} />}

        {/* Line */}
        <path
          d={pathD}
          fill="none"
          stroke={color}
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Data points */}
        {points.map((p, idx) => (
          <circle
            key={idx}
            cx={p.x}
            cy={p.y}
            r={hoveredPoint === idx ? '6' : '4.5'}
            fill="#ffffff"
            stroke={color}
            strokeWidth="2.5"
            style={{ cursor: 'pointer', transition: 'r 0.15s ease' }}
            onMouseEnter={() => setHoveredPoint(idx)}
            onMouseLeave={() => setHoveredPoint(null)}
          />
        ))}
      </svg>

      {/* Tooltip on hover */}
      {hoveredPoint !== null && points[hoveredPoint] && (
        <div
          style={{
            position: 'absolute',
            left: `${(points[hoveredPoint].x / width) * 100}%`,
            top: `${points[hoveredPoint].y - 38}px`,
            transform: 'translateX(-50%)',
            backgroundColor: '#0f172a',
            color: '#ffffff',
            padding: '0.25rem 0.625rem',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.75rem',
            pointerEvents: 'none',
            whiteSpace: 'nowrap',
            boxShadow: 'var(--shadow-md)',
            zIndex: 10,
          }}
        >
          <strong>{points[hoveredPoint].entry_date}</strong>: {label} {points[hoveredPoint].value}/5
        </div>
      )}
    </div>
  );
};

export default TrendChart;
