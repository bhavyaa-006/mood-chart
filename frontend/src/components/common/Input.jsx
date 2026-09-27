import React from 'react';

export const Input = ({
  label,
  type = 'text',
  name,
  value,
  onChange,
  placeholder,
  error,
  helpText,
  required = false,
  disabled = false,
  icon = null,
  min,
  max,
  step,
  className = '',
  style = {},
  ...props
}) => {
  return (
    <div className={`form-group ${className}`} style={style}>
      {label && (
        <label className="form-label" htmlFor={name}>
          {label} {required && <span style={{ color: 'var(--coral-500)' }}>*</span>}
        </label>
      )}
      <div style={{ position: 'relative' }}>
        {icon && (
          <div
            style={{
              position: 'absolute',
              left: '0.75rem',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-light)',
              display: 'flex',
              alignItems: 'center',
              pointerEvents: 'none',
            }}
          >
            {icon}
          </div>
        )}
        <input
          id={name}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          min={min}
          max={max}
          step={step}
          className="form-input"
          style={{
            paddingLeft: icon ? '2.5rem' : '0.875rem',
            borderColor: error ? '#f43f5e' : undefined,
          }}
          {...props}
        />
      </div>
      {error && <p className="form-error">{error}</p>}
      {helpText && !error && <p className="form-help">{helpText}</p>}
    </div>
  );
};

export default Input;
