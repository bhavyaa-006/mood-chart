import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthProvider';
import CalendarHeatmap from '../components/CalendarHeatmap';

export default function Calendar() {
  const { accessToken } = useAuth();
  const navigate = useNavigate();

  const today = useMemo(() => new Date(), []);
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth() + 1); // 1-12

  const canRender = !!accessToken;

  const goPrev = () => {
    if (month === 1) {
      setMonth(12);
      setYear((y) => y - 1);
    } else {
      setMonth((m) => m - 1);
    }
  };

  const goNext = () => {
    if (month === 12) {
      setMonth(1);
      setYear((y) => y + 1);
    } else {
      setMonth((m) => m + 1);
    }
  };

  if (!canRender) {
    navigate('/login', { replace: true });
    return null;
  }

  const monthLabel = new Date(year, month - 1, 1).toLocaleDateString(undefined, {
    month: 'long',
    year: 'numeric',
  });

  return (
    <main className="content-canvas">
      <div className="container" style={{ paddingTop: 24 }}>
        <div className="feature-card" style={{ padding: 20, marginTop: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <div>
              <div className="card-label">Your emotional calendar</div>
              <h3 className="text-heading-sm" style={{ marginTop: 8 }}>{monthLabel}</h3>
            </div>

            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <button className="ghost-button" type="button" onClick={goPrev}>
                ← Prev
              </button>
              <button
                className="ghost-button"
                type="button"
                onClick={() => {
                  setYear(today.getFullYear());
                  setMonth(today.getMonth() + 1);
                }}
              >
                Today
              </button>
              <button className="ghost-button" type="button" onClick={goNext}>
                Next →
              </button>
            </div>
          </div>
        </div>

        <div style={{ marginTop: 24 }}>
          <CalendarHeatmap year={year} month={month} accessToken={accessToken} />
        </div>
      </div>
    </main>
  );
}
