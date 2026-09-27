import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { journalApi } from '../../api/journal';
import { useToast } from '../../context/ToastContext';
import { BookOpen } from 'lucide-react';

export const JournalEditorModal = ({
  isOpen,
  onClose,
  initialData = null,
  onSaved,
}) => {
  const { showSuccess, showError } = useToast();
  const [content, setContent] = useState('');
  const [entryDate, setEntryDate] = useState(new Date().toISOString().split('T')[0]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setContent(initialData.content || '');
      setEntryDate(initialData.entry_date || new Date().toISOString().split('T')[0]);
    } else {
      setContent('');
      setEntryDate(new Date().toISOString().split('T')[0]);
    }
  }, [initialData, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) {
      showError('Please write some reflection before saving.');
      return;
    }

    setIsLoading(true);
    const payload = {
      content: content.trim(),
      entry_date: entryDate,
    };

    try {
      if (initialData?.id) {
        await journalApi.updateJournal(initialData.id, payload);
        showSuccess('Journal entry updated.');
      } else {
        await journalApi.createJournal(payload);
        showSuccess('Journal entry saved.');
      }

      window.dispatchEvent(new CustomEvent('journal:saved'));
      if (onSaved) onSaved();
      onClose();
    } catch (err) {
      showError(err.message || 'Failed to save journal entry.');
    } finally {
      setIsLoading(false);
    }
  };

  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData?.id ? 'Edit Journal Entry' : 'New Journal Reflection'}
      maxWidth="680px"
    >
      <form onSubmit={handleSubmit}>
        <div className="form-group" style={{ marginBottom: '1rem' }}>
          <label className="form-label" htmlFor="journal_entry_date">
            Entry Date
          </label>
          <input
            id="journal_entry_date"
            type="date"
            className="form-input"
            value={entryDate}
            onChange={(e) => setEntryDate(e.target.value)}
            required
            max={new Date().toISOString().split('T')[0]}
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="journal_content">
            Your Reflection
          </label>
          <textarea
            id="journal_content"
            className="form-textarea"
            rows={10}
            placeholder="Let your thoughts flow freely. What happened today? What are you grateful for, wrestling with, or learning?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            maxLength={10000}
            required
            style={{ lineHeight: 1.6, fontSize: '0.9375rem' }}
          />
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: '0.375rem',
              fontSize: '0.75rem',
              color: 'var(--text-light)',
            }}
          >
            <span>{wordCount} words</span>
            <span>{content.length}/10,000 characters</span>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={isLoading} icon={<BookOpen size={16} />}>
            {initialData?.id ? 'Update Reflection' : 'Save Reflection'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default JournalEditorModal;
