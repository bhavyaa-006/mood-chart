const API_BASE = 'http://localhost:8000';
const MOODS_BASE = `${API_BASE}/moods`;
const AUTH_BASE = `${API_BASE}/auth`;
const WELLNESS_BASE = `${API_BASE}/wellness`;

function withAuthHeaders(token) {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export const authLogin = async ({ email, password, rememberMe = false }) => {
  const res = await fetch(`${AUTH_BASE}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, remember_me: rememberMe }),
  });
  if (!res.ok) throw new Error((await res.json()).detail || 'Login failed');
  return res.json();
};

export const authSignup = async ({ name, email, password, confirmPassword }) => {
  const res = await fetch(`${AUTH_BASE}/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password, confirm_password: confirmPassword }),
  });
  if (!res.ok) throw new Error((await res.json()).detail || 'Signup failed');
  return res.json();
};

export const authLogout = async (token) => {
  await fetch(`${AUTH_BASE}/logout`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...withAuthHeaders(token) },
  });
};

export const authMe = async (token) => {
  const res = await fetch(`${AUTH_BASE}/me`, {
    headers: { 'Content-Type': 'application/json', ...withAuthHeaders(token) },
  });
  if (!res.ok) throw new Error((await res.json()).detail || 'Failed to load profile');
  return res.json();
};

export const authForgotPassword = async ({ email }) => {
  const res = await fetch(`${AUTH_BASE}/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  if (!res.ok) throw new Error((await res.json()).detail || 'Request failed');
  return res.json().catch(() => ({}));
};

export const authResetPassword = async ({ email, token, newPassword }) => {
  const res = await fetch(`${AUTH_BASE}/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, token, new_password: newPassword }),
  });
  if (!res.ok) throw new Error((await res.json()).detail || 'Reset failed');
  return res.json().catch(() => ({}));
};

// ---- Mood APIs (protected) ----
export const getMoodScale = async (token) => {
  const res = await fetch(`${MOODS_BASE}/scale`, {
    headers: { 'Content-Type': 'application/json', ...withAuthHeaders(token) },
  });
  return res.json();
};

export const getTodayMood = async (token) => {
  const res = await fetch(`${MOODS_BASE}/today`, {
    headers: { 'Content-Type': 'application/json', ...withAuthHeaders(token) },
  });
  return res.json();
};

export const createOrUpdateMood = async (payload, token) => {
  const res = await fetch(`${MOODS_BASE}/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...withAuthHeaders(token) },
    body: JSON.stringify(payload),
  });
  return res.json();
};

export const getMoodHistory = async (token) => {
  const res = await fetch(`${MOODS_BASE}/history`, {
    headers: { 'Content-Type': 'application/json', ...withAuthHeaders(token) },
  });
  return res.json();
};

export const getAnalytics = async (token) => {
  const res = await fetch(`${MOODS_BASE}/analytics`, {
    headers: { 'Content-Type': 'application/json', ...withAuthHeaders(token) },
  });
  return res.json();
};

export const getWellnessPoints = async (token) => {
  const res = await fetch(`${WELLNESS_BASE}/points`, {
    headers: { 'Content-Type': 'application/json', ...withAuthHeaders(token) },
  });
  return res.json();
};

export const getAiInsights = async (range, token) => {
  const qs = range ? `?range=${encodeURIComponent(range)}` : '';
  const res = await fetch(`${WELLNESS_BASE}/ai/insights${qs}`, {
    headers: { 'Content-Type': 'application/json', ...withAuthHeaders(token) },
  });
  return res.json();
};

export const getMoodCalendar = async (year, month, token) => {
  const y = encodeURIComponent(year);
  const m = encodeURIComponent(month);
  const res = await fetch(`${MOODS_BASE}/calendar?year=${y}&month=${m}`, {
    headers: { 'Content-Type': 'application/json', ...withAuthHeaders(token) },
  });
  return res.json();
};

// ---- Backwards-compatible exports used by current components ----
export const login = authLogin;
export const signup = authSignup;
export const logout = authLogout;
export const me = authMe;
