import React from 'react';

export default function Banner({ streak }) {
  if (streak === undefined || streak === null) return null;

  return (
    <div className="announcement-banner">
      <span>{streak > 0 ? `You're on a ${streak}-day streak! Keep it up.` : `Log your mood today to start your streak!`}</span>
      <a href="#logger">Log Today's Entry &rarr;</a>
    </div>
  );
}
