import React, { useState, useEffect } from 'react';
import Button from '../common/Button';
import { RotateCcw } from 'lucide-react';

const SYMBOLS = ['🌊', '☀️', '🐚', '🌿'];

export const MemoryMatch = ({ onComplete, onCancel }) => {
  const [cards, setCards] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState([]);
  const [moves, setMoves] = useState(0);

  const initGame = () => {
    const deck = [...SYMBOLS, ...SYMBOLS]
      .sort(() => Math.random() - 0.5)
      .map((sym, index) => ({ id: index, sym }));
    setCards(deck);
    setFlipped([]);
    setMatched([]);
    setMoves(0);
  };

  useEffect(() => {
    initGame();
  }, []);

  const handleCardClick = (id) => {
    if (flipped.length === 2 || flipped.includes(id) || matched.includes(id)) {
      return;
    }

    const nextFlipped = [...flipped, id];
    setFlipped(nextFlipped);

    if (nextFlipped.length === 2) {
      setMoves((m) => m + 1);
      const [firstId, secondId] = nextFlipped;
      const firstCard = cards.find((c) => c.id === firstId);
      const secondCard = cards.find((c) => c.id === secondId);

      if (firstCard.sym === secondCard.sym) {
        const nextMatched = [...matched, firstId, secondId];
        setMatched(nextMatched);
        setFlipped([]);

        if (nextMatched.length === cards.length) {
          // Completed
          const score = Math.max(30, 100 - (moves - 3) * 10);
          setTimeout(() => {
            onComplete({
              score,
              metadata: { moves: moves + 1, pairs: SYMBOLS.length },
            });
          }, 800);
        }
      } else {
        setTimeout(() => {
          setFlipped([]);
        }, 900);
      }
    }
  };

  return (
    <div style={{ textAlign: 'center', padding: '1rem 0' }}>
      <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--primary-900)', marginBottom: '0.5rem' }}>
        Memory Match
      </h3>
      <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
        Gentle cognitive exercise. Match the 4 pairs of calming nature symbols.
      </p>

      <div style={{ marginBottom: '1rem', fontSize: '0.875rem', color: 'var(--primary-800)', fontWeight: 600 }}>
        Moves: {moves} | Matched: {matched.length / 2} / {SYMBOLS.length}
      </div>

      {/* Grid of 8 cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '0.75rem',
          maxWidth: '360px',
          margin: '0 auto 1.5rem',
        }}
      >
        {cards.map((card) => {
          const isRevealed = flipped.includes(card.id) || matched.includes(card.id);
          const isMatched = matched.includes(card.id);

          return (
            <button
              key={card.id}
              type="button"
              onClick={() => handleCardClick(card.id)}
              style={{
                aspectRatio: '1',
                borderRadius: 'var(--radius-md)',
                backgroundColor: isMatched
                  ? 'var(--seafoam-100)'
                  : isRevealed
                  ? 'var(--primary-50)'
                  : 'var(--ocean-navy)',
                border: isMatched
                  ? '2px solid var(--seafoam-500)'
                  : isRevealed
                  ? '2px solid var(--primary-400)'
                  : '1px solid var(--ocean-dark)',
                color: isRevealed ? 'inherit' : '#ffffff',
                fontSize: '2rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: isRevealed ? 'default' : 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              {isRevealed ? card.sym : '🫧'}
            </button>
          );
        })}
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem' }}>
        <Button variant="outline" size="sm" icon={<RotateCcw size={15} />} onClick={initGame}>
          Reset
        </Button>
        <Button variant="ghost" size="sm" onClick={onCancel}>
          Exit
        </Button>
      </div>
    </div>
  );
};

export default MemoryMatch;
