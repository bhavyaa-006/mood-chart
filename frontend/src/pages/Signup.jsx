import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthProvider';

export default function Signup() {
  const navigate = useNavigate();
  const { signup } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const validate = () => {
    if (!name.trim()) return 'Name is required.';
    if (!email.trim()) return 'Email is required.';
    if (!password) return 'Password is required.';
    if (password.length < 6) return 'Password must be at least 6 characters.';
    if (!confirmPassword) return 'Confirm password is required.';
    if (password !== confirmPassword) return 'Passwords do not match.';
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
      await signup({ name, email, password, confirmPassword });
      navigate('/login', { replace: true });
    } catch (err) {
      setError(err.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="container">
        <div className="glass-panel" style={{ width: '100%', maxWidth: '560px', margin: '48px auto', padding: '24px' }}>
          <h1 className="text-heading-sm" style={{ marginBottom: '8px' }}>Sign up</h1>
          <p className="color-graphite" style={{ marginBottom: '24px' }}>
            Create your account to track moods and visualize your wellness journey.
          </p>

          {error ? <div className="alert-message alert-error">{error}</div> : null}

          <form onSubmit={onSubmit}>
            <div className="input-group">
              <label className="input-label">Name</label>
              <input
                className="input"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                required
              />
            </div>

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
                  placeholder="Create a password"
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

            <div className="input-group">
              <label className="input-label">Confirm Password</label>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <input
                  className="input"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter your password"
                  required
                  style={{ flex: 1 }}
                />
                <button
                  type="button"
                  className="ghost-button"
                  onClick={() => setShowConfirmPassword((s) => !s)}
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            <button className="cta-button" style={{ width: '100%', justifyContent: 'center' }} disabled={loading}>
              {loading ? 'Creating...' : 'Create Account'}
            </button>

            <div style={{ marginTop: '16px', textAlign: 'center' }}>
              <span className="color-graphite" style={{ marginRight: '8px' }}>Already have an account?</span>
              <Link to="/login" style={{ color: 'var(--color-iris)', fontWeight: 600, textDecoration: 'underline' }}>
                Login
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
