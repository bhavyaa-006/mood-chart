import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { profileApi, PRACTICE_CATEGORIES } from '../api/profile';
import { notificationsApi } from '../api/notifications';
import { useToast } from '../context/ToastContext';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import { Waves, Check, Sparkles, Clock, Globe, ArrowRight, ArrowLeft } from 'lucide-react';

export const OnboardingPage = () => {
  const { user, profile, refreshProfile } = useAuth();
  const { showSuccess, showError } = useToast();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [displayName, setDisplayName] = useState(
    profile?.display_name || user?.full_name || ''
  );
  const [timezone, setTimezone] = useState(() => {
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
    } catch {
      return 'UTC';
    }
  });
  const [selectedGoals, setSelectedGoals] = useState(['mindfulness', 'breathing']);
  const [reminderEnabled, setReminderEnabled] = useState(true);
  const [reminderTime, setReminderTime] = useState('20:00'); // 8 PM default
  const [isLoading, setIsLoading] = useState(false);

  const toggleGoal = (catId) => {
    setSelectedGoals((prev) => {
      if (prev.includes(catId)) {
        if (prev.length === 1) {
          showError('Please keep at least one practice area selected.');
          return prev;
        }
        return prev.filter((id) => id !== catId);
      } else {
        return [...prev, catId];
      }
    });
  };

  const handleComplete = async () => {
    if (selectedGoals.length === 0) {
      showError('Please select at least one practice area.');
      return;
    }

    setIsLoading(true);
    try {
      // 1. Complete onboarding
      await profileApi.completeOnboarding({
        display_name: displayName.trim() || undefined,
        timezone,
        goals: selectedGoals,
      });

      // 2. Set reminder preferences
      try {
        await notificationsApi.updatePreferences({
          enabled: reminderEnabled,
          reminder_time: `${reminderTime}:00`,
          timezone,
        });
      } catch {
        // Notification settings fail gracefully if unsupported
      }

      await refreshProfile();
      showSuccess('Onboarding complete! Welcome to your personal cockpit.');
      navigate('/dashboard', { replace: true });
    } catch (err) {
      showError(err.message || 'Failed to complete onboarding.');
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
        padding: '2rem 1rem',
      }}
    >
      <div
        className="card"
        style={{
          maxWidth: '680px',
          width: '100%',
          padding: '2.5rem 2rem',
          boxShadow: 'var(--shadow-ocean)',
        }}
      >
        {/* Progress Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: 'var(--radius-lg)',
              background: 'linear-gradient(135deg, var(--primary-500) 0%, var(--primary-700) 100%)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              marginBottom: '0.75rem',
            }}
          >
            <Waves size={24} />
          </div>
          <h2 style={{ fontSize: '1.625rem', fontWeight: 700, color: 'var(--ocean-deep)' }}>
            Welcome to Mood Cockpit
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Let us calibrate your space for gentle daily reflection.
          </p>

          {/* Stepper Dots */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', marginTop: '1.25rem' }}>
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.375rem',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  color: s === step ? 'var(--primary-700)' : s < step ? 'var(--seafoam-700)' : 'var(--text-light)',
                }}
              >
                <div
                  style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: 'var(--radius-full)',
                    backgroundColor:
                      s === step
                        ? 'var(--primary-100)'
                        : s < step
                        ? 'var(--seafoam-100)'
                        : 'var(--border-subtle)',
                    border: `1px solid ${
                      s === step
                        ? 'var(--primary-500)'
                        : s < step
                        ? 'var(--seafoam-500)'
                        : 'transparent'
                    }`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {s < step ? <Check size={14} color="#0f766e" /> : s}
                </div>
                <span>{s === 1 ? 'Profile' : s === 2 ? 'Goals' : 'Reminders'}</span>
              </div>
            ))}
          </div>
        </div>

        {/* STEP 1: Profile & Timezone */}
        {step === 1 && (
          <div className="animate-fade-in">
            <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem', color: 'var(--text-main)' }}>
              Step 1: How should we address you?
            </h3>
            <Input
              label="Display Name or Preferred Nickname"
              type="text"
              name="displayName"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="e.g. Maya, Jordan, Captain"
              helpText="This is shown in your daily check-in greetings."
            />

            <div className="form-group">
              <label className="form-label" htmlFor="timezone">
                Your Timezone
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  id="timezone"
                  type="text"
                  className="form-input"
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  placeholder="e.g. UTC, America/New_York, Asia/Kolkata"
                  required
                />
              </div>
              <p className="form-help">
                Auto-detected from your browser. Ensures check-ins and streaks align with your local day.
              </p>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '2rem' }}>
              <Button
                variant="primary"
                icon={<ArrowRight size={16} />}
                onClick={() => setStep(2)}
              >
                Continue to Practice Areas
              </Button>
            </div>
          </div>
        )}

        {/* STEP 2: Practice Categories */}
        {step === 2 && (
          <div className="animate-fade-in">
            <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '0.25rem', color: 'var(--text-main)' }}>
              Step 2: What would you like to cultivate?
            </h3>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
              Select 1 to 9 practice areas to tailor recommended activities and AI reflections.
            </p>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                gap: '0.75rem',
                maxHeight: '320px',
                overflowY: 'auto',
                padding: '2px',
                marginBottom: '1.5rem',
              }}
            >
              {PRACTICE_CATEGORIES.map((cat) => {
                const isSelected = selectedGoals.includes(cat.id);
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => toggleGoal(cat.id)}
                    style={{
                      padding: '0.875rem',
                      borderRadius: 'var(--radius-md)',
                      border: `2px solid ${isSelected ? 'var(--primary-500)' : 'var(--border-subtle)'}`,
                      backgroundColor: isSelected ? 'var(--primary-50)' : 'var(--bg-surface)',
                      textAlign: 'left',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      gap: '0.5rem',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span
                        style={{
                          fontSize: '0.875rem',
                          fontWeight: 600,
                          color: isSelected ? 'var(--primary-900)' : 'var(--text-main)',
                        }}
                      >
                        {cat.label}
                      </span>
                      {isSelected && <Check size={16} color="var(--primary-600)" />}
                    </div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.3 }}>
                      {cat.description}
                    </span>
                  </button>
                );
              })}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Button variant="outline" icon={<ArrowLeft size={16} />} onClick={() => setStep(1)}>
                Back
              </Button>
              <Button
                variant="primary"
                icon={<ArrowRight size={16} />}
                onClick={() => setStep(3)}
                disabled={selectedGoals.length === 0}
              >
                Continue to Reminders ({selectedGoals.length} selected)
              </Button>
            </div>
          </div>
        )}

        {/* STEP 3: Reminder Notification Preferences */}
        {step === 3 && (
          <div className="animate-fade-in">
            <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '0.25rem', color: 'var(--text-main)' }}>
              Step 3: Gentle Daily Reminders
            </h3>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
              Build consistent habits with a supportive daily nudge.
            </p>

            <div
              className="card"
              style={{
                backgroundColor: 'var(--bg-subtle)',
                marginBottom: '1.5rem',
                padding: '1.25rem',
              }}
            >
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '0.9375rem',
                }}
              >
                <input
                  type="checkbox"
                  checked={reminderEnabled}
                  onChange={(e) => setReminderEnabled(e.target.checked)}
                  style={{ width: '18px', height: '18px', accentColor: 'var(--primary-600)' }}
                />
                <span>Enable daily check-in reminder</span>
              </label>

              {reminderEnabled && (
                <div style={{ marginTop: '1.25rem', paddingLeft: '2rem' }}>
                  <label className="form-label" htmlFor="reminder_time">
                    Preferred Reminder Time
                  </label>
                  <input
                    id="reminder_time"
                    type="time"
                    className="form-input"
                    style={{ maxWidth: '180px' }}
                    value={reminderTime}
                    onChange={(e) => setReminderTime(e.target.value)}
                  />
                  <p className="form-help">Evening check-ins (e.g. 20:00) allow reviewing your whole day.</p>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Button variant="outline" icon={<ArrowLeft size={16} />} onClick={() => setStep(2)}>
                Back
              </Button>
              <Button
                variant="primary"
                icon={<Sparkles size={16} />}
                onClick={handleComplete}
                isLoading={isLoading}
              >
                Complete Calibration
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OnboardingPage;
