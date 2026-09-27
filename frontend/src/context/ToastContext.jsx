import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const addToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newToast = { id, message, type };

    setToasts((prev) => [...prev, newToast]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
    return id;
  }, [removeToast]);

  const showSuccess = useCallback((msg, dur) => addToast(msg, 'success', dur), [addToast]);
  const showError = useCallback((msg, dur) => addToast(msg, 'error', dur), [addToast]);
  const showWarning = useCallback((msg, dur) => addToast(msg, 'warning', dur), [addToast]);
  const showInfo = useCallback((msg, dur) => addToast(msg, 'info', dur), [addToast]);

  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 size={18} color="#059669" />;
      case 'error':
        return <AlertCircle size={18} color="#dc2626" />;
      case 'warning':
        return <AlertTriangle size={18} color="#d97706" />;
      default:
        return <Info size={18} color="#0284c7" />;
    }
  };

  const getBorderColor = (type) => {
    switch (type) {
      case 'success':
        return '#a7f3d0';
      case 'error':
        return '#fecaca';
      case 'warning':
        return '#fde68a';
      default:
        return '#bae6fd';
    }
  };

  return (
    <ToastContext.Provider
      value={{ addToast, removeToast, showSuccess, showError, showWarning, showInfo }}
    >
      {children}
      <div
        style={{
          position: 'fixed',
          bottom: '1.5rem',
          right: '1.5rem',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem',
          maxWidth: '400px',
          width: 'calc(100% - 3rem)',
          pointerEvents: 'none',
        }}
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="animate-fade-in"
            style={{
              pointerEvents: 'auto',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '0.75rem',
              padding: '0.875rem 1rem',
              backgroundColor: '#ffffff',
              borderRadius: 'var(--radius-md)',
              border: `1px solid ${getBorderColor(toast.type)}`,
              boxShadow: 'var(--shadow-lg)',
              color: 'var(--text-main)',
              fontSize: '0.875rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
              {getIcon(toast.type)}
              <span>{toast.message}</span>
            </div>
            <button
              type="button"
              onClick={() => removeToast(toast.id)}
              style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--text-light)',
                display: 'flex',
                alignItems: 'center',
                padding: '2px',
              }}
              aria-label="Dismiss toast"
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export default ToastContext;
