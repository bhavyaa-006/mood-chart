import React, { useState, useEffect } from 'react';
import { aiInsightsApi } from '../api/aiInsights';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import ConfirmDialog from '../components/common/ConfirmDialog';
import { useToast } from '../context/ToastContext';
import {
  Sparkles,
  RefreshCw,
  Trash2,
  Calendar,
  AlertCircle,
  Lightbulb,
  CheckCircle2,
  Clock,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

export const InsightsPage = () => {
  const { showSuccess, showError, showWarning } = useToast();
  const [insights, setInsights] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const limit = 5;

  const [days, setDays] = useState(14);
  const [insightType, setInsightType] = useState('mood_summary');
  const [isGenerating, setIsGenerating] = useState(false);
  const [cooldownSeconds, setCooldownSeconds] = useState(0);

  // Deletion
  const [deletingId, setDeletingId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Cooldown interval timer
  useEffect(() => {
    let timer = null;
    if (cooldownSeconds > 0) {
      timer = setInterval(() => {
        setCooldownSeconds((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [cooldownSeconds]);

  const loadInsights = async () => {
    try {
      const res = await aiInsightsApi.listInsights(limit, page * limit);
      setInsights(res.items || []);
      setTotal(res.total || 0);
    } catch (err) {
      showError(err.message || 'Failed to load past insights.');
    }
  };

  useEffect(() => {
    loadInsights();
  }, [page]);

  const handleGenerate = async () => {
    if (cooldownSeconds > 0) {
      showWarning(`Please wait ${cooldownSeconds}s before generating a new reflection.`);
      return;
    }

    setIsGenerating(true);
    try {
      await aiInsightsApi.generateInsight({ days, insight_type: insightType });
      showSuccess('New wellness reflection synthesized!');
      setCooldownSeconds(60);
      setPage(0);
      await loadInsights();
    } catch (err) {
      if (err.status === 429) {
        setCooldownSeconds(60);
        showWarning('Insight generation is rate-limited. Cooldown of 60s active.');
      } else {
        showError(err.message || 'Failed to generate reflection.');
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    setIsDeleting(true);
    try {
      await aiInsightsApi.deleteInsight(deletingId);
      showSuccess('Insight removed from archive.');
      setDeletingId(null);
      await loadInsights();
    } catch (err) {
      showError(err.message || 'Failed to delete insight.');
    } finally {
      setIsDeleting(false);
    }
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Page Header */}
      <div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--ocean-deep)', margin: 0 }}>
          AI Insights & Pattern Reflections
        </h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
          Personalized reflections derived from your logged moods, stress patterns, and journal themes.
        </p>
      </div>

      {/* Generator Control Card */}
      <Card
        title="Synthesize New Wellness Reflection"
        subtitle="Generates gentle observations and recommendations based on your check-in history"
        icon={<Sparkles size={18} color="var(--primary-600)" />}
      >
        <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap', alignItems: 'flex-end', marginTop: '0.5rem' }}>
          <div style={{ flex: '1', minWidth: '200px' }}>
            <label className="form-label" htmlFor="days">
              Historical Window
            </label>
            <select
              id="days"
              className="form-select"
              value={days}
              onChange={(e) => setDays(Number(e.target.value))}
            >
              <option value={7}>Last 7 Days (Short Horizon)</option>
              <option value={14}>Last 14 Days (Balanced Default)</option>
              <option value={30}>Last 30 Days (Deep Pattern Analysis)</option>
            </select>
          </div>

          <div style={{ flex: '1', minWidth: '200px' }}>
            <label className="form-label" htmlFor="insightType">
              Reflection Focus
            </label>
            <select
              id="insightType"
              className="form-select"
              value={insightType}
              onChange={(e) => setInsightType(e.target.value)}
            >
              <option value="mood_summary">Overall Mood Rhythm</option>
              <option value="stress_management">Stress & Recovery Analysis</option>
              <option value="energy_flow">Stamina & Vitality Observation</option>
            </select>
          </div>

          <div>
            <Button
              variant="primary"
              icon={<Sparkles size={16} />}
              onClick={handleGenerate}
              isLoading={isGenerating}
              disabled={cooldownSeconds > 0}
            >
              {cooldownSeconds > 0 ? `Cooldown (${cooldownSeconds}s)` : 'Generate Reflection'}
            </Button>
          </div>
        </div>

        <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: 'var(--text-light)' }}>
          <AlertCircle size={14} />
          <span>
            Reflections are informational wellness aids and do not constitute clinical or medical diagnosis.
          </span>
        </div>
      </Card>

      {/* Latest & Past Insights List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--text-main)', margin: 0 }}>
          Reflection Archive ({total})
        </h3>

        {insights.length > 0 ? (
          insights.map((item, idx) => (
            <Card key={item.id} style={{ position: 'relative' }}>
              {/* Header: Title, Model Badge, Delete */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: '1rem',
                  paddingBottom: '0.75rem',
                  borderBottom: '1px solid var(--border-subtle)',
                  flexWrap: 'wrap',
                  gap: '0.5rem',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--ocean-deep)', margin: 0 }}>
                      {item.title}
                    </h3>
                    {idx === 0 && page === 0 && <Badge variant="primary">Latest</Badge>}
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem', display: 'block' }}>
                    Generated on {new Date(item.created_at).toLocaleDateString()} at{' '}
                    {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} · Model: {item.model_name}
                  </span>
                </div>

                <Button
                  size="sm"
                  variant="ghost"
                  icon={<Trash2 size={15} color="#dc2626" />}
                  onClick={() => setDeletingId(item.id)}
                >
                  Delete
                </Button>
              </div>

              {/* Summary */}
              <p style={{ fontSize: '0.9375rem', color: 'var(--text-main)', lineHeight: 1.6, marginBottom: '1.25rem' }}>
                {item.summary}
              </p>

              {/* Actionable Recommendations */}
              {item.recommendations?.length > 0 && (
                <div
                  style={{
                    backgroundColor: 'var(--primary-50)',
                    borderRadius: 'var(--radius-md)',
                    padding: '1rem 1.25rem',
                    border: '1px solid var(--primary-200)',
                    marginBottom: '1.25rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', marginBottom: '0.5rem' }}>
                    <Lightbulb size={16} color="var(--primary-700)" />
                    <strong style={{ fontSize: '0.875rem', color: 'var(--primary-900)' }}>
                      Gentle Guidance & Suggestions:
                    </strong>
                  </div>
                  <ul style={{ paddingLeft: '1.25rem', margin: 0, fontSize: '0.875rem', color: 'var(--primary-800)', lineHeight: 1.5 }}>
                    {item.recommendations.map((rec, i) => (
                      <li key={i} style={{ marginBottom: '0.25rem' }}>
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Supporting Metrics Pills */}
              {item.supporting_metrics && Object.keys(item.supporting_metrics).length > 0 && (
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>Supporting Data:</span>
                  {item.supporting_metrics.entry_count !== undefined && (
                    <Badge variant="neutral">
                      {item.supporting_metrics.entry_count} entries analyzed
                    </Badge>
                  )}
                  {item.supporting_metrics.average_mood !== undefined && item.supporting_metrics.average_mood !== null && (
                    <Badge variant="primary">
                      Avg Mood {item.supporting_metrics.average_mood}/5
                    </Badge>
                  )}
                  {item.supporting_metrics.average_stress !== undefined && item.supporting_metrics.average_stress !== null && (
                    <Badge variant="warning">
                      Avg Stress {item.supporting_metrics.average_stress}/5
                    </Badge>
                  )}
                  {item.supporting_metrics.logging_consistency !== undefined && (
                    <Badge variant="success">
                      {item.supporting_metrics.logging_consistency}% consistency
                    </Badge>
                  )}
                </div>
              )}
            </Card>
          ))
        ) : (
          <Card>
            <div style={{ textAlign: 'center', padding: '2.5rem 1rem' }}>
              <Sparkles size={36} color="var(--primary-300)" style={{ margin: '0 auto 0.75rem' }} />
              <h4 style={{ fontSize: '1.0625rem', fontWeight: 600, color: 'var(--text-main)' }}>
                No insights generated yet
              </h4>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.25rem', marginBottom: '1.25rem' }}>
                Use the generator above to synthesize your first personal wellness reflection.
              </p>
              <Button
                variant="primary"
                size="sm"
                icon={<Sparkles size={16} />}
                onClick={handleGenerate}
                isLoading={isGenerating}
                disabled={cooldownSeconds > 0}
              >
                Synthesize Now
              </Button>
            </div>
          </Card>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', marginTop: '1rem' }}>
            <Button
              variant="outline"
              size="sm"
              icon={<ChevronLeft size={16} />}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
            >
              Previous
            </Button>
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
              Page {page + 1} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              icon={<ChevronRight size={16} />}
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
            >
              Next
            </Button>
          </div>
        )}
      </div>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={handleDelete}
        title="Delete Insight"
        message="Are you sure you want to permanently delete this AI insight from your history?"
        isLoading={isDeleting}
      />
    </div>
  );
};

export default InsightsPage;
