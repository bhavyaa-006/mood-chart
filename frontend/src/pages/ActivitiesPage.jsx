import React, { useState, useEffect } from 'react';
import { activitiesApi } from '../api/activities';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import Modal from '../components/common/Modal';
import { useToast } from '../context/ToastContext';
import {
  Gamepad2,
  Play,
  CheckCircle2,
  Clock,
  Sparkles,
  Award,
  Filter,
} from 'lucide-react';

// Activity interactive engines
import BoxBreathing from '../components/activities/BoxBreathing';
import MindfulMinute from '../components/activities/MindfulMinute';
import FocusSprint from '../components/activities/FocusSprint';
import MemoryMatch from '../components/activities/MemoryMatch';
import ReactionReset from '../components/activities/ReactionReset';
import ReflectionPrompt from '../components/activities/ReflectionPrompt';
import BodyScan from '../components/activities/BodyScan';
import ThreeGoodThings from '../components/activities/ThreeGoodThings';

export const ActivitiesPage = () => {
  const { showSuccess, showError } = useToast();
  const [activities, setActivities] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Active Session state
  const [activeActivity, setActiveActivity] = useState(null);
  const [currentSession, setCurrentSession] = useState(null);
  const [isSessionCompleted, setIsSessionCompleted] = useState(false);
  const [completionResult, setCompletionResult] = useState(null);
  const [isStarting, setIsStarting] = useState(false);

  const loadData = async () => {
    try {
      const [actList, sessList] = await Promise.all([
        activitiesApi.listActivities(),
        activitiesApi.listSessions(),
      ]);
      setActivities(actList || []);
      setSessions(sessList || []);
    } catch (err) {
      showError(err.message || 'Failed to load activities.');
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleStartActivity = async (activity) => {
    setIsStarting(true);
    try {
      const session = await activitiesApi.startSession(activity.id, {
        started_at: new Date().toISOString(),
      });
      setCurrentSession(session);
      setActiveActivity(activity);
      setIsSessionCompleted(false);
      setCompletionResult(null);
    } catch (err) {
      showError(err.message || 'Unable to launch activity session.');
    } finally {
      setIsStarting(false);
    }
  };

  const handleFinishActivity = async (result) => {
    if (!currentSession?.id) return;
    try {
      const completed = await activitiesApi.completeSession(currentSession.id, {
        score: result.score || 100,
        metadata: result.metadata || {},
      });
      setCompletionResult(completed);
      setIsSessionCompleted(true);
      showSuccess(`Activity completed! Score: ${result.score || 100}`);
      await loadData();
    } catch (err) {
      showError(err.message || 'Failed to record session completion.');
    }
  };

  const handleCloseModal = () => {
    setActiveActivity(null);
    setCurrentSession(null);
    setIsSessionCompleted(false);
    setCompletionResult(null);
  };

  const renderActivityEngine = () => {
    if (!activeActivity) return null;

    if (isSessionCompleted) {
      return (
        <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'var(--seafoam-100)',
              color: 'var(--seafoam-700)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1rem',
            }}
          >
            <CheckCircle2 size={38} />
          </div>
          <h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--ocean-deep)', marginBottom: '0.25rem' }}>
            Session Complete!
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9375rem', marginBottom: '1.25rem' }}>
            Well done taking time out of your day for mental restoration.
          </p>

          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.5rem 1.25rem',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'var(--primary-50)',
              color: 'var(--primary-800)',
              fontWeight: 700,
              fontSize: '1.125rem',
              marginBottom: '2rem',
              border: '1px solid var(--primary-200)',
            }}
          >
            <Award size={20} color="var(--primary-600)" />
            <span>Score: {completionResult?.score ?? 100}/100</span>
          </div>

          <div>
            <Button variant="primary" onClick={handleCloseModal}>
              Return to Activities
            </Button>
          </div>
        </div>
      );
    }

    const name = activeActivity.name.toLowerCase();

    if (name.includes('breathing')) {
      return <BoxBreathing onComplete={handleFinishActivity} onCancel={handleCloseModal} />;
    }
    if (name.includes('mindful minute') || name.includes('minute')) {
      return <MindfulMinute onComplete={handleFinishActivity} onCancel={handleCloseModal} />;
    }
    if (name.includes('focus')) {
      return <FocusSprint onComplete={handleFinishActivity} onCancel={handleCloseModal} />;
    }
    if (name.includes('memory')) {
      return <MemoryMatch onComplete={handleFinishActivity} onCancel={handleCloseModal} />;
    }
    if (name.includes('reaction')) {
      return <ReactionReset onComplete={handleFinishActivity} onCancel={handleCloseModal} />;
    }
    if (name.includes('prompt') || name.includes('reflection prompt')) {
      return <ReflectionPrompt onComplete={handleFinishActivity} onCancel={handleCloseModal} />;
    }
    if (name.includes('scan') || name.includes('body')) {
      return <BodyScan onComplete={handleFinishActivity} onCancel={handleCloseModal} />;
    }
    if (name.includes('three') || name.includes('gratitude') || name.includes('things')) {
      return <ThreeGoodThings onComplete={handleFinishActivity} onCancel={handleCloseModal} />;
    }

    return (
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <p>Guided exercise ready.</p>
        <Button variant="primary" onClick={() => handleFinishActivity({ score: 100 })}>
          Complete Session
        </Button>
      </div>
    );
  };

  const categories = ['all', ...new Set(activities.map((a) => a.category))];
  const filteredActivities = activities.filter((a) => {
    if (selectedCategory === 'all') return true;
    return a.category === selectedCategory;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--ocean-deep)', margin: 0 }}>
            Mind Games & Wellness Activities
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Interactive guided exercises to reset your nervous system and sharpen attention.
          </p>
        </div>

        {/* Category Pills */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              style={{
                backgroundColor: selectedCategory === cat ? 'var(--primary-600)' : 'var(--bg-surface)',
                color: selectedCategory === cat ? '#ffffff' : 'var(--text-muted)',
                padding: '0.375rem 0.875rem',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.8125rem',
                fontWeight: 600,
                cursor: 'pointer',
                border: `1px solid ${selectedCategory === cat ? 'var(--primary-600)' : 'var(--border-subtle)'}`,
                textTransform: 'capitalize',
                transition: 'all 0.15s ease',
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Activities Grid */}
      <div className="grid grid-cols-4 gap-6">
        {filteredActivities.map((act) => (
          <div
            key={act.id}
            className="card card-interactive"
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              padding: '1.5rem',
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <Badge variant="primary">{act.category}</Badge>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-light)', textTransform: 'capitalize' }}>
                  {act.difficulty}
                </span>
              </div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.375rem' }}>
                {act.name}
              </h3>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                {act.description}
              </p>
            </div>

            <div style={{ marginTop: '1.5rem' }}>
              <Button
                variant="primary"
                size="sm"
                icon={<Play size={14} />}
                style={{ width: '100%' }}
                onClick={() => handleStartActivity(act)}
                isLoading={isStarting && activeActivity?.id === act.id}
              >
                Start Practice
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Session History Log */}
      <Card title={`Completed Sessions (${sessions.length})`} subtitle="Your participation records and activity scores">
        {sessions.length > 0 ? (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-strong)', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '0.625rem 0' }}>Activity</th>
                  <th style={{ padding: '0.625rem 0' }}>Date & Time</th>
                  <th style={{ padding: '0.625rem 0' }}>Score</th>
                  <th style={{ padding: '0.625rem 0' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {sessions.map((sess) => {
                  const act = activities.find((a) => a.id === sess.activity_id);
                  const isDone = !!sess.completed_at;
                  return (
                    <tr key={sess.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      <td style={{ padding: '0.75rem 0', fontWeight: 600 }}>
                        {act?.name || 'Mindfulness Exercise'}
                      </td>
                      <td style={{ padding: '0.75rem 0', color: 'var(--text-muted)' }}>
                        {new Date(sess.started_at).toLocaleDateString()} at{' '}
                        {new Date(sess.started_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td style={{ padding: '0.75rem 0', fontWeight: 600, color: 'var(--primary-700)' }}>
                        {sess.score !== null ? `${sess.score}/100` : '—'}
                      </td>
                      <td style={{ padding: '0.75rem 0' }}>
                        <Badge variant={isDone ? 'success' : 'warning'}>
                          {isDone ? 'Completed' : 'In Progress'}
                        </Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
            <Gamepad2 size={36} color="var(--border-strong)" style={{ margin: '0 auto 0.5rem' }} />
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              No completed activity sessions yet. Pick an activity above to get started!
            </p>
          </div>
        )}
      </Card>

      {/* Interactive Modal for Active Session */}
      <Modal
        isOpen={!!activeActivity}
        onClose={handleCloseModal}
        title={activeActivity?.name || 'Interactive Practice'}
        maxWidth="620px"
      >
        {renderActivityEngine()}
      </Modal>
    </div>
  );
};

export default ActivitiesPage;
