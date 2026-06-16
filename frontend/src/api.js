const API_BASE = 'http://localhost:8000/moods';

export const getMoodScale = async () => {
  const res = await fetch(`${API_BASE}/scale`);
  return res.json();
};

export const getTodayMood = async () => {
  const res = await fetch(`${API_BASE}/today`);
  return res.json();
};

export const createOrUpdateMood = async (payload) => {
  const res = await fetch(`${API_BASE}/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return res.json();
};

export const getMoodHistory = async () => {
  const res = await fetch(`${API_BASE}/history`);
  return res.json();
};

export const getAnalytics = async () => {
  const res = await fetch(`${API_BASE}/analytics`);
  return res.json();
};
