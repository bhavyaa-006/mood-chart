import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { authApi } from '../api/auth';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import { Waves, Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';

export const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await authApi.forgotPassword(email);
      setIsSubmitted(true);
    } catch (err) {
      setError(err.message || 'Unable to process reset request.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'var(--bg-page)',
        padding: '1.5rem',
      }}
    >
      <div
        className="card"
        style={{
          maxWidth: '420px',
          width: '100%',
          padding: '2.5rem 2rem',
          boxShadow: 'var(--shadow-ocean)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: 'var(--radius-lg)',
              background: 'linear-gradient(135deg, var(--primary-500) 0%, var(--primary-700) 100%)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              marginBottom: '1rem',
            }}
          >
            <Waves size={28} />
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--ocean-deep)' }}>
            Reset Password
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            We will send you instructions to regain access.
          </p>
        </div>

        {isSubmitted ? (
          <div style={{ textAlign: 'center', padding: '1rem 0' }}>
            <div
              style={{
                width: '54px',
                height: '54px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'var(--seafoam-100)',
                color: 'var(--seafoam-700)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1rem',
              }}
            >
              <CheckCircle2 size={32} />
            </div>
            <p style={{ fontSize: '0.9375rem', color: 'var(--text-main)', lineHeight: 1.5, marginBottom: '1.5rem' }}>
              If an account with <strong>{email}</strong> exists, password reset instructions have been dispatched.
            </p>
            <Link to="/reset-password" style={{ textDecoration: 'none' }}>
              <Button variant="primary" style={{ width: '100%', marginBottom: '0.75rem' }}>
                Have a Reset Token? Click Here
              </Button>
            </Link>
            <Link to="/login" style={{ textDecoration: 'none' }}>
              <Button variant="outline" style={{ width: '100%' }}>
                Back to Sign In
              </Button>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {error && (
              <div
                style={{
                  padding: '0.75rem 1rem',
                  backgroundColor: '#fee2e2',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid #fecaca',
                  color: '#991b1b',
                  fontSize: '0.875rem',
                  marginBottom: '1.25rem',
                }}
              >
                {error}
              </div>
            )}

            <Input
              label="Account Email Address"
              type="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              icon={<Mail size={16} />}
              required
            />

            <Button
              type="submit"
              variant="primary"
              style={{ width: '100%', marginTop: '0.5rem' }}
              isLoading={isLoading}
            >
              Send Reset Instructions
            </Button>

            <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
              <Link
                to="/login"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.375rem',
                  fontSize: '0.875rem',
                  color: 'var(--text-muted)',
                  textDecoration: 'none',
                }}
              >
                <ArrowLeft size={16} />
                <span>Return to Sign In</span>
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
