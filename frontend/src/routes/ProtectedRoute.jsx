import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Waves, Loader2 } from 'lucide-react';

export const ProtectedRoute = ({ children, requireOnboarded = true }) => {
  const { isAuthenticated, isOnboarded, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'var(--bg-page)',
        }}
      >
        <div
          style={{
            width: '48px',
            height: '48px',
            borderRadius: 'var(--radius-lg)',
            background: 'linear-gradient(135deg, var(--primary-500) 0%, var(--primary-700) 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            marginBottom: '1rem',
            animation: 'pulseGently 2s infinite',
          }}
        >
          <Waves size={28} />
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9375rem', fontWeight: 500 }}>
          Calibrating Mood Cockpit...
        </p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If user is authenticated but hasn't completed onboarding yet
  if (requireOnboarded && !isOnboarded && location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />;
  }

  return children;
};

export default ProtectedRoute;
