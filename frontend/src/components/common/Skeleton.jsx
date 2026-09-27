import React from 'react';

export const Skeleton = ({
  width = '100%',
  height = '1rem',
  borderRadius = 'var(--radius-md)',
  style = {},
  className = '',
}) => {
  return (
    <div
      className={`skeleton ${className}`}
      style={{
        width,
        height,
        borderRadius,
        backgroundColor: 'var(--border-subtle)',
        animation: 'pulseGently 1.5s ease-in-out infinite',
        ...style,
      }}
    />
  );
};

export default Skeleton;
