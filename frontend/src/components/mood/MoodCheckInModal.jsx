import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { moodApi } from '../../api/moods';
import { useToast } from '../../context/ToastContext';
import { Smile, Zap, Activity } from 'lucide-react';

const MOOD_OPTIONS = [
  { value: 1, label: 'Very Low', emoji: '😞', desc: 'Down, heavy' },
  { value: 2, label: 'Low', emoji: '🙁', desc: 'Mildly down' },
  { value: 3, label: 'Neutral', emoji: '😐', desc: 'Balanced, steady' },
  { value: 4, label: 'Good', emoji: '🙂', desc: 'Pleasant, calm' },
  { value: 5, label: 'Great', emoji: '🌊', desc: 'Flowing, joyful' },
];

const STRESS_OPTIONS = [
  { value: 1, label: 'Minimal', emoji: '🌿', desc: 'Completely at ease' },
  { value: 2, label: 'Mild', emoji: '☁️', desc: 'Easily manageable' },
  { value: 3, label: 'Moderate', emoji: '⚡', desc: 'Noticeable tension' },
  { value: 4, label: 'High', emoji: '🌋', desc: 'Feeling strained' },
  { value: 5, label: 'Severe', emoji: '🔥', desc: 'Overwhelmed' },
];

const ENERGY_OPTIONS = [
  { value: 1, label: 'Drained', emoji: '🪫', desc: 'Exhausted' },
  { value: 2, label: 'Sluggish', emoji: '🐢', desc: 'Low stamina' },
  { value: 3, label: 'Steady', emoji: '⚖️', desc: 'Normal pacing' },
  { value: 4, label: 'Active', emoji: '🏃', desc: 'Brisk & ready' },
  { value: 5, label: 'Energized', emoji: '⚡', desc: 'Vibrant' },
];

export const MoodCheckInModal = ({
  isOpen,
  onClose,
  initialData = null,
  onSaved,
}) => {
  const { showSuccess, showError } = useToast();
  const [mood, setMood] = useState(3);
  const [stressLevel, setStressLevel] = useState(2);
  const [energyLevel, setEnergyLevel] = useState(3);
  const [entryDate, setEntryDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setMood(initialData.mood || 3);
      setStressLevel(initialData.stress_level || 2);
      setEnergyLevel(initialData.energy_level || 3);
      setEntryDate(initialData.entry_date || new Date().toISOString().split('T')[0]);
      setNotes(initialData.notes || '');
    } else {
      setMood(3);
      setStressLevel(2);
      setEnergyLevel(3);
      setEntryDate(new Date().toISOString().split('T')[0]);
      setNotes('');
    }
  }, [initialData, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const payload = {
      mood: Number(mood),
      stress_level: Number(stressLevel),
      energy_level: Number(energyLevel),
      entry_date: entryDate,
      notes: notes.trim() || null,
    };

    try {
      if (initialData?.id) {
        await moodApi.updateMood(initialData.id, payload);
        showSuccess('Mood check-in updated successfully.');
      } else {
        await moodApi.createMood(payload);
        showSuccess('Mood check-in recorded! Streak updated.');
      }

      window.dispatchEvent(new CustomEvent('mood:logged'));
      if (onSaved) onSaved();
      onClose();
    } catch (err) {
      showError(err.message || 'Failed to save mood entry.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderScale = (title, icon, options, selectedValue, onSelect) => (
    <div style={{ marginBottom: '1.25rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
        {icon}
        <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)' }}>
          {title} ({selectedValue}/5)
        </span>
      </div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(5, 1fr)',
          gap: '0.5rem',
        }}
      >
        {options.map((opt) => {
          const isSelected = selectedValue === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onSelect(opt.value)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                padding: '0.625rem 0.25rem',
                borderRadius: 'var(--radius-md)',
                border: `2px solid ${isSelected ? 'var(--primary-500)' : 'var(--border-subtle)'}`,
                backgroundColor: isSelected ? 'var(--primary-50)' : 'var(--bg-surface)',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <span style={{ fontSize: '1.5rem', lineHeight: 1 }}>{opt.emoji}</span>
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: isSelected ? 600 : 500,
                  color: isSelected ? 'var(--primary-800)' : 'var(--text-muted)',
                  marginTop: '0.25rem',
                }}
              >
                {opt.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData?.id ? 'Edit Mood Check-In' : 'Daily Mood Check-In'}
      maxWidth="580px"
    >
      <form onSubmit={handleSubmit}>
        {/* Date Selector */}
        <div className="form-group" style={{ marginBottom: '1rem' }}>
          <label className="form-label" htmlFor="entry_date">
            Check-In Date
          </label>
          <input
            id="entry_date"
            type="date"
            className="form-input"
            value={entryDate}
            onChange={(e) => setEntryDate(e.target.value)}
            required
            max={new Date().toISOString().split('T')[0]}
          />
        </div>

        {/* 1. Overall Mood */}
        {renderScale(
          'Overall Mood',
          <Smile size={18} color="var(--primary-600)" />,
          MOOD_OPTIONS,
          mood,
          setMood
        )}

        {/* 2. Stress Level */}
        {renderScale(
          'Stress Level',
          <Activity size={18} color="var(--coral-500)" />,
          STRESS_OPTIONS,
          stressLevel,
          setStressLevel
        )}

        {/* 3. Energy Level */}
        {renderScale(
          'Energy Level',
          <Zap size={18} color="#d97706" />,
          ENERGY_OPTIONS,
          energyLevel,
          setEnergyLevel
        )}

        {/* Optional Notes */}
        <div className="form-group">
          <label className="form-label" htmlFor="notes">
            Reflection or Context (Optional)
          </label>
          <textarea
            id="notes"
            className="form-textarea"
            rows={3}
            placeholder="What contributed to how you feel today? Any notable events, thoughts, or observations?"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            maxLength={2000}
          />
          <span style={{ fontSize: '0.75rem', color: 'var(--text-light)', display: 'block', textAlign: 'right' }}>
            {notes.length}/2000
          </span>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={isLoading}>
            {initialData?.id ? 'Update Entry' : 'Save Check-In'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default MoodCheckInModal;
