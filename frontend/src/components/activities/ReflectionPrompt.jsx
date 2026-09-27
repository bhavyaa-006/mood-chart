import React, { useState } from 'react';
import Button from '../common/Button';

const PROMPTS = [
  "What is one gentle boundary you can set today to protect your energy?",
  "What small moment made you feel safe or appreciated recently?",
  "If your mind was an ocean right now, would it be calm, choppy, or deep?",
  "What is one expectation you can release to give yourself more grace?",
];

export const ReflectionPrompt = ({ onComplete, onCancel }) => {
  const [prompt] = useState(() => PROMPTS[Math.floor(Math.random() * PROMPTS.length)]);
  const [reflection, setReflection] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!reflection.trim()) return;
    onComplete({
      score: 100,
      metadata: { prompt, response_length: reflection.trim().length, text_snippet: reflection.slice(0, 100) },
    });
  };

  return (
    <div style={{ textAlign: 'center', padding: '1rem 0' }}>
      <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--primary-900)', marginBottom: '0.5rem' }}>
        Reflection Prompt
      </h3>
      <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
        Guided introspection. Take a moment to think deeply about this gentle question.
      </p>

      <div
        className="card"
        style={{
          padding: '1.25rem',
          backgroundColor: 'var(--primary-50)',
          borderColor: 'var(--primary-200)',
          marginBottom: '1.5rem',
          fontStyle: 'italic',
          fontSize: '1.0625rem',
          color: 'var(--primary-900)',
          lineHeight: 1.5,
        }}
      >
        "{prompt}"
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <textarea
            className="form-textarea"
            rows={4}
            placeholder="Type your reflection here..."
            value={reflection}
            onChange={(e) => setReflection(e.target.value)}
            required
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', marginTop: '1rem' }}>
          <Button variant="outline" onClick={onCancel}>
            Exit
          </Button>
          <Button type="submit" variant="primary" disabled={!reflection.trim()}>
            Complete Reflection
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ReflectionPrompt;
