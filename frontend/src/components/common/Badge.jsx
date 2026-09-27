import React from 'react';

export const Badge = ({
  children,
  variant = 'primary', // 'primary' | 'success' | 'warning' | 'danger' | 'neutral'
  icon = null,
  className = '',
  style = {},
}) => {
  return (
    <span className={`badge badge-${variant} ${className}`} style={style}>
      {icon && <span>{icon}</span>}
      {children}
    </span>
  );
};

export default Badge;
