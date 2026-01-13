import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getUserComplaints, submitFeedback } from '../services/complaintService';
import { getCurrentUser } from '../services/authService';
import { formatDate, formatRelativeTime, getStatusClass, getPriorityClass } from '../utils/helpers';
import { STATUS_LABELS, PRIORITY_LABELS } from '../utils/constants';
import { useToast } from '../context/ToastContext';
import NotificationCenter from '../components/NotificationCenter';

const MyComplaints = () => {
    const navigate = useNavigate();
    const { showToast } = useToast();
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedComplaint, setSelectedComplaint] = useState(null);
    const [showFeedback, setShowFeedback] = useState(false);
    const [rating, setRating] = useState(0);
    const [feedbackComment, setFeedbackComment] = useState('');

    useEffect(() => {
        const user = getCurrentUser();
        if (!user) {
            navigate('/login');
            return;
        }

        loadComplaints(user.uid);
    }, [navigate]);

    const loadComplaints = async (userId) => {
        try {
            const data = await getUserComplaints(userId);
            setComplaints(data);
        } catch (error) {
            console.error('Error loading complaints:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmitFeedback = async (e) => {
        e.preventDefault();
        try {
            await submitFeedback(selectedComplaint.id, rating, feedbackComment);
            showToast('Thank you for your feedback!', 'success');
            setShowFeedback(false);
            setRating(0);
            setFeedbackComment('');
            loadComplaints(getCurrentUser().uid);
        } catch (error) {
            showToast('Failed to submit feedback. Please try again.', 'error');
        }
    };

    if (loading) {
        return (
            <div className="flex-center" style={{ minHeight: '100vh' }}>
                <div className="spinner"></div>
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-secondary)', paddingBottom: 'var(--spacing-3xl)' }}>
            {/* Navbar */}
            <nav className="navbar">
                <div className="container navbar-content">
                    <Link to="/" className="navbar-logo">🏛️ CivicSense</Link>
                    <ul className="navbar-menu" style={{ display: 'flex', alignItems: 'center' }}>
                        <li><Link to="/report" className="navbar-link">Report Issue</Link></li>
                        <li><Link to="/nearby" className="navbar-link">Nearby Issues</Link></li>
                        <li><NotificationCenter /></li>
                    </ul>
                </div>
            </nav>

            <div className="container mt-xl">
                <div className="flex-between mb-xl">
                    <div>
                        <h1>My Complaints</h1>
                        <p style={{ color: 'var(--gray-600)' }}>Track all your reported issues</p>
                    </div>
                    <Link to="/report" className="btn btn-primary">
                        + New Complaint
                    </Link>
                </div>

                {complaints.length === 0 ? (
                    <div className="card text-center" style={{ padding: 'var(--spacing-3xl)' }}>
                        <div style={{ fontSize: '4rem', marginBottom: 'var(--spacing-lg)' }}>📝</div>
                        <h3>No Complaints Yet</h3>
                        <p style={{ color: 'var(--gray-600)', marginBottom: 'var(--spacing-xl)' }}>
                            You haven't reported any issues yet
                        </p>
                        <Link to="/report" className="btn btn-primary">
                            Report Your First Issue
                        </Link>
                    </div>
                ) : (
                    <div className="grid gap-lg">
                        {complaints.map((complaint) => (
                            <div key={complaint.id} className="card">
                                <div className="flex-between mb-md">
                                    <div>
                                        <h3 style={{ marginBottom: 'var(--spacing-sm)' }}>
                                            {complaint.category.charAt(0).toUpperCase() + complaint.category.slice(1)} Issue
                                        </h3>
                                        <p style={{ fontSize: '0.875rem', color: 'var(--gray-600)' }}>
                                            ID: {complaint.complaintId}
                                        </p>
                                    </div>
                                    <div className="flex gap-sm">
                                        <span className={`badge ${getStatusClass(complaint.status)}`}>
                                            {STATUS_LABELS[complaint.status]}
                                        </span>
                                        <span className={`badge ${getPriorityClass(complaint.priority)}`}>
                                            {PRIORITY_LABELS[complaint.priority]}
                                        </span>
                                    </div>
                                </div>

                                <p style={{ marginBottom: 'var(--spacing-md)', color: 'var(--gray-700)' }}>
                                    {complaint.description}
                                </p>

                                {complaint.photoURL && (
                                    <img
                                        src={complaint.photoURL}
                                        alt="Issue"
                                        style={{ width: '100%', maxHeight: '300px', objectFit: 'cover', borderRadius: 'var(--radius-lg)', marginBottom: 'var(--spacing-md)' }}
                                    />
                                )}

                                <div className="flex-between" style={{ fontSize: '0.875rem', color: 'var(--gray-600)', marginBottom: 'var(--spacing-lg)' }}>
                                    <span>📍 {complaint.address}</span>
                                    <span>🕒 {formatRelativeTime(complaint.createdAt)}</span>
                                </div>

                                {/* Timeline */}
                                <div style={{ background: 'var(--gray-50)', padding: 'var(--spacing-lg)', borderRadius: 'var(--radius-lg)' }}>
                                    <h4 style={{ marginBottom: 'var(--spacing-md)', fontSize: '1rem' }}>Timeline</h4>
                                    <div className="timeline">
                                        {complaint.timeline?.map((item, index) => (
                                            <div key={index} className={`timeline-item ${index === complaint.timeline.length - 1 ? 'active' : ''}`}>
                                                <p style={{ fontWeight: '600', marginBottom: 'var(--spacing-xs)' }}>
                                                    {STATUS_LABELS[item.status]}
                                                </p>
                                                <p style={{ fontSize: '0.875rem', color: 'var(--gray-600)', marginBottom: 'var(--spacing-xs)' }}>
                                                    {item.note}
                                                </p>
                                                <p style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>
                                                    {formatDate(item.timestamp)}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Resolution Photo */}
                                {complaint.resolutionPhotoURL && (
                                    <div className="mt-lg">
                                        <h4 style={{ marginBottom: 'var(--spacing-md)', fontSize: '1rem' }}>Resolution Photo</h4>
                                        <img
                                            src={complaint.resolutionPhotoURL}
                                            alt="Resolution"
                                            style={{ width: '100%', maxHeight: '300px', objectFit: 'cover', borderRadius: 'var(--radius-lg)' }}
                                        />
                                    </div>
                                )}

                                {/* Feedback Button */}
                                {complaint.status === 'resolved' && !complaint.hasFeedback && (
                                    <button
                                        className="btn btn-primary w-full mt-lg"
                                        onClick={() => {
                                            setSelectedComplaint(complaint);
                                            setShowFeedback(true);
                                        }}
                                    >
                                        ⭐ Rate Service
                                    </button>
                                )}

                                {complaint.hasFeedback && (
                                    <div className="mt-lg text-center" style={{ color: 'var(--success)' }}>
                                        ✅ Feedback submitted - Rating: {complaint.feedbackRating}/5
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Feedback Modal */}
            {showFeedback && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'var(--bg-overlay)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000,
                    padding: 'var(--spacing-lg)'
                }}>
                    <div className="card" style={{ maxWidth: '500px', width: '100%' }}>
                        <h3 className="mb-lg">Rate Your Experience</h3>
                        <form onSubmit={handleSubmitFeedback}>
                            <div className="form-group">
                                <label className="form-label">Rating</label>
                                <div className="flex-center gap-md" style={{ fontSize: '2rem' }}>
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <span
                                            key={star}
                                            onClick={() => setRating(star)}
                                            style={{
                                                cursor: 'pointer',
                                                color: star <= rating ? '#f59e0b' : '#d1d5db'
                                            }}
                                        >
                                            ⭐
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Comments (Optional)</label>
                                <textarea
                                    className="form-textarea"
                                    placeholder="Share your experience..."
                                    value={feedbackComment}
                                    onChange={(e) => setFeedbackComment(e.target.value)}
                                    rows="4"
                                />
                            </div>

                            <div className="flex gap-md">
                                <button
                                    type="button"
                                    className="btn btn-secondary w-full"
                                    onClick={() => setShowFeedback(false)}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="btn btn-primary w-full"
                                    disabled={rating === 0}
                                >
                                    Submit Feedback
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MyComplaints;
