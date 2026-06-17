import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authForgotPassword } from '../api';

export default function ForgotPassword() {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await authForgotPassword({ email });
      setSent(true);
    } catch (err) {
      setError(err.message || 'Request failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="container">
        <div className="glass-panel" style={{ width: '100%', maxWidth: '520px', margin: '48px auto', padding: '24px' }}>
          <h1 className="text-heading-sm" style={{ marginBottom: '8px' }}>Forgot password</h1>
          <p className="color-graphite" style={{ marginBottom: '24px' }}>
            Enter your email and we’ll send you password reset instructions.
          </p>

          {error ? <div className="alert-message alert-error">{error}</div> : null}

          {sent ? (
            <div className="feature-card" style={{ padding: '24px' }}>
              <p className="color-graphite" style={{ marginBottom: '16px' }}>
                If an account exists, you’ll receive an email shortly.
              </p>
              <button className="cta-button" style={{ width: '100%', justifyContent: 'center' }} onClick={() => navigate('/login')}>
                Back to Login
              </button>
              <div style={{ marginTop: '16px', textAlign: 'center' }}>
                <Link to="/signup" style={{ color: 'var(--color-iris)', fontWeight: 600, textDecoration: 'underline' }}>
                  Create an account
                </Link>
              </div>
            </div>
          ) : (
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

              <button className="cta-button" style={{ width: '100%', justifyContent: 'center' }} disabled={loading}>
                {loading ? 'Sending...' : 'Send reset link'}
              </button>

              <div style={{ marginTop: '16px', textAlign: 'center' }}>
                <Link to="/login" style={{ color: 'var(--color-iris)', fontWeight: 600, textDecoration: 'underline' }}>
                  Back to Login
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
