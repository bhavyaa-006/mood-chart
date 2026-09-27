import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { profileApi, PRACTICE_CATEGORIES } from '../api/profile';
import { notificationsApi } from '../api/notifications';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Badge from '../components/common/Badge';
import { useToast } from '../context/ToastContext';
import {
  User,
  Bell,
  Target,
  Clock,
  Globe,
  Plus,
  Trash2,
  Check,
  Save,
  Shield,
} from 'lucide-react';

export const SettingsPage = () => {
  const { user, profile, refreshProfile } = useAuth();
  const { showSuccess, showError } = useToast();

  // Profile fields
  const [displayName, setDisplayName] = useState('');
  const [timezone, setTimezone] = useState('');
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Practice Goals
  const [goals, setGoals] = useState([]);
  const [newGoalCategory, setNewGoalCategory] = useState('');
  const [isAddingGoal, setIsAddingGoal] = useState(false);

  // Notifications
  const [reminderEnabled, setReminderEnabled] = useState(true);
  const [reminderTime, setReminderTime] = useState('20:00');
  const [isSavingNotifications, setIsSavingNotifications] = useState(false);

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name || '');
      setTimezone(profile.timezone || 'UTC');
      setGoals(profile.goals || []);
    }
  }, [profile]);

  useEffect(() => {
    const loadNotificationPrefs = async () => {
      try {
        const prefs = await notificationsApi.getPreferences();
        if (prefs) {
          setReminderEnabled(prefs.enabled ?? true);
          if (prefs.reminder_time) {
            // "20:00:00" -> "20:00"
            setReminderTime(prefs.reminder_time.slice(0, 5));
          }
        }
      } catch {
        // Ignored if unable to load preferences
      }
    };
    loadNotificationPrefs();
  }, []);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setIsSavingProfile(true);
    try {
      await profileApi.updateProfile({
        display_name: displayName.trim() || undefined,
        timezone: timezone.trim() || undefined,
      });
      await refreshProfile();
      showSuccess('Profile details updated successfully.');
    } catch (err) {
      showError(err.message || 'Failed to update profile.');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleAddGoal = async () => {
    if (!newGoalCategory) return;
    setIsAddingGoal(true);
    try {
      const added = await profileApi.addGoal(newGoalCategory);
      setGoals((prev) => [...prev, added]);
      setNewGoalCategory('');
      await refreshProfile();
      showSuccess('Practice goal added.');
    } catch (err) {
      showError(err.message || 'Failed to add practice goal.');
    } finally {
      setIsAddingGoal(false);
    }
  };

  const handleDeleteGoal = async (goalId) => {
    try {
      await profileApi.deleteGoal(goalId);
      setGoals((prev) => prev.filter((g) => g.id !== goalId));
      await refreshProfile();
      showSuccess('Practice goal removed.');
    } catch (err) {
      showError(err.message || 'Failed to remove practice goal.');
    }
  };

  const handleSaveNotifications = async (e) => {
    e.preventDefault();
    setIsSavingNotifications(true);
    try {
      await notificationsApi.updatePreferences({
        enabled: reminderEnabled,
        reminder_time: `${reminderTime}:00`,
        timezone: timezone || undefined,
      });
      showSuccess('Reminder preferences saved.');
    } catch (err) {
      showError(err.message || 'Failed to save reminder preferences.');
    } finally {
      setIsSavingNotifications(false);
    }
  };

  // Available categories to add (not already selected)
  const existingCategoryValues = new Set(goals.map((g) => g.category));
  const availableCategories = PRACTICE_CATEGORIES.filter(
    (c) => !existingCategoryValues.has(c.id)
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem', maxWidth: '800px' }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--ocean-deep)', margin: 0 }}>
          Settings & Preferences
        </h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
          Personalize your account, practice areas, and reminder schedule.
        </p>
      </div>

      {/* Profile & Identity Card */}
      <Card title="Personal Profile" subtitle="Your public identity in Mood Cockpit" icon={<User size={18} />}>
        <form onSubmit={handleSaveProfile}>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Display Name"
              type="text"
              name="displayName"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="e.g. Jordan"
            />

            <div className="form-group">
              <label className="form-label" htmlFor="settings_timezone">
                Timezone
              </label>
              <input
                id="settings_timezone"
                type="text"
                className="form-input"
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                placeholder="e.g. America/New_York, UTC"
                required
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
            <Button
              type="submit"
              variant="primary"
              icon={<Save size={16} />}
              isLoading={isSavingProfile}
            >
              Save Profile Changes
            </Button>
          </div>
        </form>
      </Card>

      {/* Practice Goals Management */}
      <Card
        title={`Your Practice Goals (${goals.length})`}
        subtitle="Categories that influence tailored activity recommendations and insights"
        icon={<Target size={18} />}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
          {goals.map((goal) => {
            const cat = PRACTICE_CATEGORIES.find((c) => c.id === goal.category);
            return (
              <div
                key={goal.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--bg-subtle)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <div>
                  <strong style={{ fontSize: '0.875rem', color: 'var(--text-main)' }}>
                    {cat?.label || goal.category}
                  </strong>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>
                    {cat?.description}
                  </span>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  icon={<Trash2 size={15} color="#dc2626" />}
                  onClick={() => handleDeleteGoal(goal.id)}
                  title="Remove Practice Goal"
                >
                  Remove
                </Button>
              </div>
            );
          })}
        </div>

        {/* Add Goal Form */}
        {availableCategories.length > 0 && (
          <div
            style={{
              display: 'flex',
              gap: '0.75rem',
              alignItems: 'flex-end',
              padding: '1rem',
              backgroundColor: 'var(--primary-50)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--primary-200)',
            }}
          >
            <div style={{ flex: 1 }}>
              <label className="form-label" htmlFor="newGoal">
                Add Practice Focus Area
              </label>
              <select
                id="newGoal"
                className="form-select"
                value={newGoalCategory}
                onChange={(e) => setNewGoalCategory(e.target.value)}
              >
                <option value="">Select an area to cultivate...</option>
                {availableCategories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
            <Button
              variant="primary"
              icon={<Plus size={16} />}
              onClick={handleAddGoal}
              disabled={!newGoalCategory}
              isLoading={isAddingGoal}
            >
              Add Goal
            </Button>
          </div>
        )}
      </Card>

      {/* Daily Reminder Notifications */}
      <Card
        title="Check-In Reminders"
        subtitle="Configure daily reminders to protect your self-reflection streak"
        icon={<Bell size={18} />}
      >
        <form onSubmit={handleSaveNotifications}>
          <div style={{ marginBottom: '1.25rem' }}>
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
              <span>Enable daily check-in reminders</span>
            </label>
          </div>

          {reminderEnabled && (
            <div style={{ maxWidth: '240px', marginBottom: '1.25rem' }}>
              <label className="form-label" htmlFor="notif_time">
                Daily Reminder Time
              </label>
              <input
                id="notif_time"
                type="time"
                className="form-input"
                value={reminderTime}
                onChange={(e) => setReminderTime(e.target.value)}
                required
              />
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              type="submit"
              variant="primary"
              icon={<Save size={16} />}
              isLoading={isSavingNotifications}
            >
              Save Notification Schedule
            </Button>
          </div>
        </form>
      </Card>

      {/* Account Info Security */}
      <Card title="Account Security & Identity" icon={<Shield size={18} />}>
        <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
          <div>
            <strong>Email:</strong> {user?.email}
          </div>
          <div>
            <strong>Member Since:</strong> {user?.created_at ? new Date(user.created_at).toLocaleDateString() : '—'}
          </div>
          <div>
            <strong>Account Status:</strong> <Badge variant="success">Active</Badge>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default SettingsPage;
