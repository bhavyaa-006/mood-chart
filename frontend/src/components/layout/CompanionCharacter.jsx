import React, { useState } from 'react';
import { Sparkles, MessageCircle, X } from 'lucide-react';

export const CompanionCharacter = ({ moodLevel = null, hasCheckedInToday = false, streakCount = 0 }) => {
  const [isOpen, setIsOpen] = useState(true);
  const [bubbleTextIndex, setBubbleTextIndex] = useState(0);

  // Calming, encouraging companion messages
  const getMessages = () => {
    if (!hasCheckedInToday) {
      return [
        "Hi there! How is your sea of thoughts today?",
        "Don't forget to take a mindful breath and log your mood.",
        "A gentle check-in keeps your inner tide balanced.",
      ];
    }
    if (moodLevel >= 4) {
      return [
        "Wonderful to see your calm, positive tide today!",
        "Riding the high waves with you today!",
        `${streakCount > 1 ? `${streakCount}-day streak! Keep flowing!` : 'Great job taking time for yourself!'}`
      ];
    }
    if (moodLevel === 3) {
      return [
        "Even steady waters bring depth and peace.",
        "Taking it one wave at a time.",
        "Remember to stay hydrated and give yourself a break.",
      ];
    }
    return [
      "Rough seas make the strongest navigators. Be kind to yourself.",
      "It is okay to not feel okay. Take some slow, deep breaths.",
      "Try a quick Box Breathing session to help soothe the storm.",
    ];
  };

  const messages = getMessages();

  const handleNextMessage = () => {
    setBubbleTextIndex((prev) => (prev + 1) % messages.length);
  };

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '1.5rem',
        left: '1.5rem',
        zIndex: 40,
        display: 'flex',
        alignItems: 'flex-end',
        gap: '0.75rem',
      }}
    >
      {/* Speech bubble */}
      {isOpen && (
        <div
          className="animate-fade-in card glass-panel"
          style={{
            maxWidth: '260px',
            padding: '0.875rem 1rem',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-ocean)',
            border: '1px solid var(--primary-200)',
            position: 'relative',
            cursor: 'pointer',
          }}
          onClick={handleNextMessage}
        >
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(false);
            }}
            style={{
              position: 'absolute',
              top: '6px',
              right: '6px',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-light)',
            }}
            aria-label="Dismiss message"
          >
            <X size={12} />
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', marginBottom: '0.25rem' }}>
            <Sparkles size={13} color="#0284c7" />
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary-700)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Coral Companion
            </span>
          </div>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-main)', lineHeight: 1.4, margin: 0 }}>
            {messages[bubbleTextIndex % messages.length]}
          </p>
          <span style={{ fontSize: '0.6875rem', color: 'var(--text-light)', marginTop: '0.375rem', display: 'block' }}>
            Tap for more wisdom
          </span>
        </div>
      )}

      {/* Mascot Avatar */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="animate-float"
        style={{
          width: '56px',
          height: '56px',
          borderRadius: 'var(--radius-full)',
          background: 'linear-gradient(135deg, #38bdf8 0%, #0284c7 100%)',
          border: '3px solid #ffffff',
          boxShadow: 'var(--shadow-lg)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          flexShrink: 0,
          transition: 'transform 0.2s ease',
          padding: 0,
        }}
        aria-label="Toggle Coral Companion"
        title="Coral the Companion"
      >
        <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Calming Sea Otter/Seal inspired mascot face */}
          <circle cx="18" cy="18" r="16" fill="#7dd3fc" />
          {/* Cheeks */}
          <circle cx="10" cy="21" r="3" fill="#fda4af" opacity="0.7" />
          <circle cx="26" cy="21" r="3" fill="#fda4af" opacity="0.7" />
          {/* Eyes */}
          <circle cx="13" cy="16" r="2.2" fill="#0f172a" />
          <circle cx="23" cy="16" r="2.2" fill="#0f172a" />
          <circle cx="13.7" cy="15.3" r="0.8" fill="#ffffff" />
          <circle cx="23.7" cy="15.3" r="0.8" fill="#ffffff" />
          {/* Cute Nose and Smile */}
          <ellipse cx="18" cy="19" rx="2" ry="1.4" fill="#0f172a" />
          <path d="M16 21C16.8 22.5 19.2 22.5 20 21" stroke="#0f172a" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  );
};

export default CompanionCharacter;
