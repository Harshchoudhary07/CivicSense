import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { subscribeToNotifications, markAsRead, markAllAsRead } from '../services/notificationService';
import { getCurrentUser } from '../services/authService';
import { formatRelativeTime } from '../utils/helpers';

const NotificationCenter = () => {
    const [notifications, setNotifications] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const user = getCurrentUser();
        if (!user) return;

        setLoading(true);
        const unsubscribe = subscribeToNotifications(user.uid, (notifs) => {
            setNotifications(notifs);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const unreadCount = notifications.filter(n => !n.read).length;

    const handleNotificationClick = async (notification) => {
        if (!notification.read) {
            await markAsRead(notification.id);
        }

        if (notification.data?.link) {
            navigate(notification.data.link);
        }

        setIsOpen(false);
    };

    const handleMarkAllAsRead = async () => {
        const user = getCurrentUser();
        if (user) {
            await markAllAsRead(user.uid);
        }
    };

    const getNotificationIcon = (type) => {
        const icons = {
            'complaint_submitted': '📝',
            'complaint_assigned': '👮',
            'status_update': '🔄',
            'complaint_resolved': '✅',
            'feedback_request': '⭐',
            'system': 'ℹ️'
        };
        return icons[type] || '🔔';
    };

    return (
        <div style={{ position: 'relative' }}>
            {/* Bell Icon */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    position: 'relative',
                    padding: 'var(--spacing-sm)',
                    fontSize: '1.5rem'
                }}
            >
                🔔
                {unreadCount > 0 && (
                    <span
                        style={{
                            position: 'absolute',
                            top: '0',
                            right: '0',
                            background: 'var(--danger)',
                            color: 'white',
                            borderRadius: '50%',
                            width: '20px',
                            height: '20px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.75rem',
                            fontWeight: '700'
                        }}
                    >
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown Panel */}
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <div
                        onClick={() => setIsOpen(false)}
                        style={{
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            zIndex: 998
                        }}
                    />

                    {/* Panel */}
                    <div
                        style={{
                            position: 'absolute',
                            top: '100%',
                            right: 0,
                            marginTop: 'var(--spacing-sm)',
                            width: '380px',
                            maxHeight: '500px',
                            background: 'white',
                            borderRadius: 'var(--radius-lg)',
                            boxShadow: 'var(--shadow-xl)',
                            zIndex: 999,
                            overflow: 'hidden',
                            display: 'flex',
                            flexDirection: 'column'
                        }}
                    >
                        {/* Header */}
                        <div style={{
                            padding: 'var(--spacing-md) var(--spacing-lg)',
                            borderBottom: '1px solid var(--gray-200)',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}>
                            <h4 style={{ margin: 0 }}>Notifications</h4>
                            {unreadCount > 0 && (
                                <button
                                    onClick={handleMarkAllAsRead}
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        color: 'var(--primary)',
                                        cursor: 'pointer',
                                        fontSize: '0.875rem',
                                        fontWeight: '600'
                                    }}
                                >
                                    Mark all read
                                </button>
                            )}
                        </div>

                        {/* Notifications List */}
                        <div style={{ overflowY: 'auto', flex: 1 }}>
                            {loading ? (
                                <div style={{ padding: 'var(--spacing-xl)', textAlign: 'center' }}>
                                    <div className="spinner" style={{ margin: '0 auto' }}></div>
                                </div>
                            ) : notifications.length === 0 ? (
                                <div style={{
                                    padding: 'var(--spacing-3xl)',
                                    textAlign: 'center',
                                    color: 'var(--gray-500)'
                                }}>
                                    <div style={{ fontSize: '3rem', marginBottom: 'var(--spacing-md)' }}>🔔</div>
                                    <p>No notifications yet</p>
                                </div>
                            ) : (
                                notifications.map((notification) => (
                                    <div
                                        key={notification.id}
                                        onClick={() => handleNotificationClick(notification)}
                                        style={{
                                            padding: 'var(--spacing-md) var(--spacing-lg)',
                                            borderBottom: '1px solid var(--gray-100)',
                                            cursor: 'pointer',
                                            background: notification.read ? 'white' : 'var(--gray-50)',
                                            transition: 'background var(--transition-base)'
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.background = 'var(--gray-100)'}
                                        onMouseLeave={(e) => e.currentTarget.style.background = notification.read ? 'white' : 'var(--gray-50)'}
                                    >
                                        <div style={{ display: 'flex', gap: 'var(--spacing-md)' }}>
                                            <span style={{ fontSize: '1.5rem' }}>
                                                {getNotificationIcon(notification.type)}
                                            </span>
                                            <div style={{ flex: 1 }}>
                                                <p style={{
                                                    margin: 0,
                                                    marginBottom: 'var(--spacing-xs)',
                                                    fontWeight: notification.read ? '400' : '600',
                                                    color: 'var(--gray-800)'
                                                }}>
                                                    {notification.message}
                                                </p>
                                                <p style={{
                                                    margin: 0,
                                                    fontSize: '0.75rem',
                                                    color: 'var(--gray-500)'
                                                }}>
                                                    {notification.createdAt && formatRelativeTime(notification.createdAt)}
                                                </p>
                                            </div>
                                            {!notification.read && (
                                                <div style={{
                                                    width: '8px',
                                                    height: '8px',
                                                    borderRadius: '50%',
                                                    background: 'var(--primary)',
                                                    flexShrink: 0,
                                                    marginTop: 'var(--spacing-xs)'
                                                }} />
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default NotificationCenter;
