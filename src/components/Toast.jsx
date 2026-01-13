import React, { useEffect } from 'react';

const Toast = ({ message, type = 'info', onClose, duration = 4000 }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, duration);

        return () => clearTimeout(timer);
    }, [duration, onClose]);

    const icons = {
        success: '✅',
        error: '❌',
        warning: '⚠️',
        info: 'ℹ️'
    };

    const colors = {
        success: 'var(--success)',
        error: 'var(--danger)',
        warning: '#f59e0b',
        info: 'var(--primary)'
    };

    return (
        <div
            className="toast"
            style={{
                position: 'fixed',
                top: '20px',
                right: '20px',
                background: 'white',
                padding: 'var(--spacing-md) var(--spacing-lg)',
                borderRadius: 'var(--radius-lg)',
                boxShadow: 'var(--shadow-xl)',
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--spacing-md)',
                maxWidth: '400px',
                zIndex: 9999,
                animation: 'slideInRight 0.3s ease-out',
                borderLeft: `4px solid ${colors[type]}`
            }}
        >
            <span style={{ fontSize: '1.5rem' }}>{icons[type]}</span>
            <p style={{ margin: 0, flex: 1, color: 'var(--gray-800)' }}>{message}</p>
            <button
                onClick={onClose}
                style={{
                    background: 'none',
                    border: 'none',
                    fontSize: '1.25rem',
                    cursor: 'pointer',
                    color: 'var(--gray-500)',
                    padding: '0',
                    lineHeight: 1
                }}
            >
                ✕
            </button>
        </div>
    );
};

export default Toast;
