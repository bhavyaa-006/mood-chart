import React, { useState, useEffect } from 'react';
import { journalApi } from '../api/journal';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import ConfirmDialog from '../components/common/ConfirmDialog';
import JournalEditorModal from '../components/journal/JournalEditorModal';
import { useToast } from '../context/ToastContext';
import { Plus, Edit3, Trash2, BookOpen, Search, Calendar, ChevronDown, ChevronUp } from 'lucide-react';

export const JournalPage = () => {
  const { showSuccess, showError } = useToast();
  const [entries, setEntries] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedIds, setExpandedIds] = useState(new Set());

  // Modal states
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadEntries = async () => {
    try {
      const data = await journalApi.listJournal();
      setEntries(data || []);
    } catch (err) {
      showError(err.message || 'Failed to load journal entries.');
    }
  };

  useEffect(() => {
    loadEntries();
    const handleSaved = () => loadEntries();
    window.addEventListener('journal:saved', handleSaved);
    return () => window.removeEventListener('journal:saved', handleSaved);
  }, []);

  const handleDelete = async () => {
    if (!deletingId) return;
    setIsDeleting(true);
    try {
      await journalApi.deleteJournal(deletingId);
      showSuccess('Reflection deleted.');
      setDeletingId(null);
      await loadEntries();
    } catch (err) {
      showError(err.message || 'Failed to delete journal entry.');
    } finally {
      setIsDeleting(false);
    }
  };

  const toggleExpand = (id) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const filteredEntries = entries.filter((e) => {
    if (!searchTerm) return true;
    return (
      e.entry_date.includes(searchTerm) ||
      e.content.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--ocean-deep)', margin: 0 }}>
            Journal Reflections
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            A private, peaceful haven to organize thoughts and record life's unfolding story.
          </p>
        </div>
        <Button
          variant="primary"
          icon={<Plus size={16} />}
          onClick={() => {
            setEditingEntry(null);
            setIsEditorOpen(true);
          }}
        >
          New Reflection
        </Button>
      </div>

      {/* Main Journal Card */}
      <Card
        title={`Your Entries (${filteredEntries.length})`}
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
              placeholder="Search reflections..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        }
      >
        {filteredEntries.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {filteredEntries.map((entry) => {
              const isExpanded = expandedIds.has(entry.id);
              const isLong = entry.content.length > 250;

              return (
                <div
                  key={entry.id}
                  style={{
                    padding: '1.25rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-subtle)',
                    backgroundColor: 'var(--bg-surface)',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {/* Top Bar: Date & Controls */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '0.75rem',
                      paddingBottom: '0.5rem',
                      borderBottom: '1px solid var(--bg-subtle)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Calendar size={15} color="var(--primary-600)" />
                      <strong style={{ fontSize: '0.875rem', color: 'var(--primary-900)' }}>
                        {entry.entry_date}
                      </strong>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                      <Button
                        size="sm"
                        variant="ghost"
                        icon={<Edit3 size={14} />}
                        onClick={() => {
                          setEditingEntry(entry);
                          setIsEditorOpen(true);
                        }}
                      >
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        icon={<Trash2 size={14} color="#dc2626" />}
                        onClick={() => setDeletingId(entry.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>

                  {/* Body Content */}
                  <p
                    style={{
                      fontSize: '0.9375rem',
                      color: 'var(--text-main)',
                      lineHeight: 1.6,
                      whiteSpace: 'pre-wrap',
                      margin: 0,
                      display: !isExpanded && isLong ? '-webkit-box' : 'block',
                      WebkitLineClamp: !isExpanded && isLong ? 3 : 'unset',
                      WebkitBoxOrient: 'vertical',
                      overflow: !isExpanded && isLong ? 'hidden' : 'visible',
                    }}
                  >
                    {entry.content}
                  </p>

                  {/* Read More / Read Less toggle */}
                  {isLong && (
                    <button
                      type="button"
                      onClick={() => toggleExpand(entry.id)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--primary-600)',
                        cursor: 'pointer',
                        fontSize: '0.8125rem',
                        fontWeight: 600,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                        marginTop: '0.5rem',
                        padding: 0,
                      }}
                    >
                      {isExpanded ? (
                        <>
                          <span>Show Less</span>
                          <ChevronUp size={14} />
                        </>
                      ) : (
                        <>
                          <span>Read Full Reflection</span>
                          <ChevronDown size={14} />
                        </>
                      )}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
            <BookOpen size={40} color="var(--border-strong)" style={{ margin: '0 auto 0.75rem' }} />
            <h4 style={{ fontSize: '1.0625rem', fontWeight: 600, color: 'var(--text-main)' }}>
              No journal entries yet
            </h4>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.25rem', marginBottom: '1.25rem' }}>
              {searchTerm ? 'No entries match your search.' : 'Express your thoughts, feelings, and memorable moments.'}
            </p>
            <Button
              variant="primary"
              size="sm"
              icon={<Plus size={16} />}
              onClick={() => {
                setEditingEntry(null);
                setIsEditorOpen(true);
              }}
            >
              Write First Reflection
            </Button>
          </div>
        )}
      </Card>

      {/* Editor Modal */}
      <JournalEditorModal
        isOpen={isEditorOpen}
        initialData={editingEntry}
        onClose={() => {
          setIsEditorOpen(false);
          setEditingEntry(null);
        }}
        onSaved={loadEntries}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={handleDelete}
        title="Delete Reflection"
        message="Are you sure you want to permanently delete this journal entry?"
        isLoading={isDeleting}
      />
    </div>
  );
};

export default JournalPage;
