import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthProvider';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const validate = () => {
    if (!email.trim()) return 'Email is required.';
    if (!password) return 'Password is required.';
    return '';
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const v = validate();
    if (v) {
      setError(v);
      return;
    }
    setError('');
    setLoading(true);
    try {
      await login({ email, password, rememberMe });
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="container">
        <div className="glass-panel" style={{ width: '100%', maxWidth: '520px', margin: '48px auto', padding: '24px' }}>
          <h1 className="text-heading-sm" style={{ marginBottom: '8px' }}>Login</h1>
          <p className="color-graphite" style={{ marginBottom: '24px' }}>Welcome back. Let’s continue your emotional journey.</p>

          {error ? <div className="alert-message alert-error">{error}</div> : null}

          <form onSubmit={onSubmit}>
            <div className="input-group">
              <label className="input-label">Email</label>
              <input
                className="input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
              />
            </div>

            <div className="input-group">
              <label className="input-label">Password</label>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <input
                  className="input"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Your password"
                  required
                  style={{ flex: 1 }}
                />
                <button
                  type="button"
                  className="ghost-button"
                  onClick={() => setShowPassword((s) => !s)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: 'var(--color-graphite)' }}>
                <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} />
                Remember me
              </label>

              <Link to="/forgot" className="ghost-link" style={{ color: 'var(--color-iris)', textDecoration: 'underline' }}>
                Forgot password?
              </Link>
            </div>

            <button className="cta-button" style={{ width: '100%', justifyContent: 'center' }} disabled={loading}>
              {loading ? 'Signing in...' : 'Login'}
            </button>

            <div style={{ marginTop: '16px', textAlign: 'center' }}>
              <span className="color-graphite" style={{ marginRight: '8px' }}>New here?</span>
              <Link to="/signup" style={{ color: 'var(--color-iris)', fontWeight: 600, textDecoration: 'underline' }}>
                Create an account
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
