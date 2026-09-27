import React from 'react';

export const Card = ({
  children,
  title,
  subtitle,
  action,
  icon,
  className = '',
  style = {},
  interactive = false,
  onClick,
}) => {
  return (
    <div
      className={`card ${interactive ? 'card-interactive' : ''} ${className}`}
      style={style}
      onClick={onClick}
    >
      {(title || action || icon) && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '1rem',
            paddingBottom: subtitle ? '0.25rem' : '0.5rem',
            borderBottom: '1px solid var(--border-subtle)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            {icon && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '32px',
                  height: '32px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--primary-50)',
                  color: 'var(--primary-700)',
                }}
              >
                {icon}
              </div>
            )}
            <div>
              {title && (
                <h3
                  style={{
                    fontSize: '1.0625rem',
                    fontWeight: 600,
                    color: 'var(--text-main)',
                    margin: 0,
                  }}
                >
                  {title}
                </h3>
              )}
              {subtitle && (
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', margin: 0 }}>
                  {subtitle}
                </p>
              )}
            </div>
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      {children}
    </div>
  );
};

export default Card;
