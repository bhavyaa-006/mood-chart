import React, { useState, useEffect } from 'react';
import { moodApi } from '../api/moods';
import { analyticsApi } from '../api/analytics';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import ConfirmDialog from '../components/common/ConfirmDialog';
import MoodCheckInModal from '../components/mood/MoodCheckInModal';
import HeatmapCalendar from '../components/analytics/HeatmapCalendar';
import { useToast } from '../context/ToastContext';
import { Plus, Edit3, Trash2, Calendar, Smile, Search } from 'lucide-react';

const MOOD_EMOJIS = {
  1: '😞',
  2: '🙁',
  3: '😐',
  4: '🙂',
  5: '🌊',
};

export const MoodsPage = () => {
  const { showSuccess, showError } = useToast();
  const [moods, setMoods] = useState([]);
  const [calendarPoints, setCalendarPoints] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadData = async () => {
    try {
      const [listRes, calRes] = await Promise.all([
        moodApi.listMoods(),
        analyticsApi.getCalendar(),
      ]);
      setMoods(listRes || []);
      setCalendarPoints(calRes || []);
    } catch (err) {
      showError(err.message || 'Failed to load mood records.');
    }
  };

  useEffect(() => {
    loadData();
    const handleUpdate = () => loadData();
    window.addEventListener('mood:logged', handleUpdate);
    return () => window.removeEventListener('mood:logged', handleUpdate);
  }, []);

  const handleDelete = async () => {
    if (!deletingId) return;
    setIsDeleting(true);
    try {
      await moodApi.deleteMood(deletingId);
      showSuccess('Mood entry removed.');
      setDeletingId(null);
      await loadData();
    } catch (err) {
      showError(err.message || 'Failed to delete entry.');
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredMoods = moods.filter((m) => {
    if (!searchTerm) return true;
    return (
      m.entry_date.includes(searchTerm) ||
      (m.notes && m.notes.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--ocean-deep)', margin: 0 }}>
            Mood Tracker & History
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Review emotional trends and record your daily state.
          </p>
        </div>
        <Button
          variant="primary"
          icon={<Plus size={16} />}
          onClick={() => {
            setEditingEntry(null);
            setIsModalOpen(true);
          }}
        >
          New Check-In
        </Button>
      </div>

      {/* Heatmap Overview */}
      <Card title="Monthly Mood Heatmap" subtitle="Overview of your check-in consistency and mood scores">
        <HeatmapCalendar data={calendarPoints} />
      </Card>

      {/* History List */}
      <Card
        title={`Check-In Log (${filteredMoods.length})`}
        subtitle="Chronological log of your mental wellness records"
        action={
          <div style={{ position: 'relative', width: '220px' }}>
            <Search
              size={15}
              style={{
                position: 'absolute',
                left: '0.625rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-light)',
              }}
            />
            <input
              type="text"
              className="form-input"
              style={{ paddingLeft: '2rem', fontSize: '0.8125rem', height: '34px' }}
              placeholder="Search date or note..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        }
      >
        {filteredMoods.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            {filteredMoods.map((entry) => (
              <div
                key={entry.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '1rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)',
                  backgroundColor: 'var(--bg-surface)',
                  flexWrap: 'wrap',
                  gap: '1rem',
                }}
              >
                {/* Left: Emoji & Details */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div
                    style={{
                      width: '46px',
                      height: '46px',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'var(--primary-50)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.75rem',
                      flexShrink: 0,
                    }}
                  >
                    {MOOD_EMOJIS[entry.mood] || '😐'}
                  </div>

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                      <strong style={{ fontSize: '0.9375rem', color: 'var(--text-main)' }}>
                        {entry.entry_date}
                      </strong>
                      <Badge variant="primary">Mood {entry.mood}/5</Badge>
                      <Badge variant={entry.stress_level >= 4 ? 'danger' : entry.stress_level >= 3 ? 'warning' : 'success'}>
                        Stress {entry.stress_level}/5
                      </Badge>
                      <Badge variant="neutral">
                        Energy {entry.energy_level}/5
                      </Badge>
                    </div>

                    {entry.notes && (
                      <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '0.375rem', lineHeight: 1.4 }}>
                        {entry.notes}
                      </p>
                    )}
                  </div>
                </div>

                {/* Right: Actions */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Button
                    size="sm"
                    variant="ghost"
                    icon={<Edit3 size={15} />}
                    onClick={() => {
                      setEditingEntry(entry);
                      setIsModalOpen(true);
                    }}
                  >
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    icon={<Trash2 size={15} color="#dc2626" />}
                    onClick={() => setDeletingId(entry.id)}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '2.5rem 1rem' }}>
            <Smile size={36} color="var(--border-strong)" style={{ margin: '0 auto 0.75rem' }} />
            <h4 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-main)' }}>
              No check-in entries found
            </h4>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '0.25rem', marginBottom: '1rem' }}>
              {searchTerm ? 'No results matched your search.' : 'Begin building your personal emotional history today.'}
            </p>
            <Button
              variant="primary"
              size="sm"
              icon={<Plus size={16} />}
              onClick={() => {
                setEditingEntry(null);
                setIsModalOpen(true);
              }}
            >
              Log First Mood
            </Button>
          </div>
        )}
      </Card>

      {/* Edit / Create Modal */}
      <MoodCheckInModal
        isOpen={isModalOpen}
        initialData={editingEntry}
        onClose={() => {
          setIsModalOpen(false);
          setEditingEntry(null);
        }}
        onSaved={loadData}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={handleDelete}
        title="Delete Mood Check-In"
        message="Are you sure you want to permanently delete this mood entry? This will update your streak records accordingly."
        isLoading={isDeleting}
      />
    </div>
  );
};

export default MoodsPage;
