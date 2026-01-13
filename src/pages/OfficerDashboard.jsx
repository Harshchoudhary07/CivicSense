import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getOfficerComplaints, updateComplaintStatus } from '../services/complaintService';
import { formatDate, formatRelativeTime, getStatusClass, getPriorityClass } from '../utils/helpers';
import { STATUS_LABELS, PRIORITY_LABELS, STATUSES, CATEGORIES } from '../utils/constants';

const OfficerDashboard = () => {
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [selectedComplaint, setSelectedComplaint] = useState(null);
    const [updateForm, setUpdateForm] = useState({
        status: '',
        note: '',
        resolutionPhoto: null
    });
    const [updating, setUpdating] = useState(false);

    // Mock officer ID - in production, get from auth context
    const officerId = 'officer123';

    useEffect(() => {
        loadComplaints();
    }, []);

    const loadComplaints = async () => {
        try {
            const data = await getOfficerComplaints(officerId);
            setComplaints(data);
        } catch (error) {
            console.error('Error loading complaints:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (e) => {
        e.preventDefault();
        setUpdating(true);

        try {
            await updateComplaintStatus(
                selectedComplaint.id,
                updateForm.status,
                updateForm.note,
                updateForm.resolutionPhoto
            );

            alert('Complaint updated successfully!');
            setSelectedComplaint(null);
            setUpdateForm({ status: '', note: '', resolutionPhoto: null });
            loadComplaints();
        } catch (error) {
            alert('Failed to update complaint');
            console.error(error);
        } finally {
            setUpdating(false);
        }
    };

    const filteredComplaints = filter === 'all'
        ? complaints
        : complaints.filter(c => c.status === filter);

    const stats = {
        total: complaints.length,
        assigned: complaints.filter(c => c.status === STATUSES.ASSIGNED).length,
        inProgress: complaints.filter(c => c.status === STATUSES.IN_PROGRESS).length,
        resolved: complaints.filter(c => c.status === STATUSES.RESOLVED).length
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
                    <div className="flex gap-md">
                        <span style={{ color: 'var(--gray-700)' }}>👮 Officer Dashboard</span>
                        <Link to="/officer/login" className="btn btn-secondary btn-sm">Logout</Link>
                    </div>
                </div>
            </nav>

            <div className="container mt-xl">
                <h1 className="mb-md">Officer Dashboard</h1>
                <p style={{ color: 'var(--gray-600)', marginBottom: 'var(--spacing-xl)' }}>
                    Manage your assigned complaints
                </p>

                {/* Stats */}
                <div className="stats mb-xl">
                    <div className="stat-card">
                        <div className="stat-value">{stats.total}</div>
                        <div className="stat-label">Total Assigned</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-value">{stats.assigned}</div>
                        <div className="stat-label">New</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-value">{stats.inProgress}</div>
                        <div className="stat-label">In Progress</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-value">{stats.resolved}</div>
                        <div className="stat-label">Resolved</div>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex gap-md mb-xl" style={{ flexWrap: 'wrap' }}>
                    <button
                        className={`btn ${filter === 'all' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
                        onClick={() => setFilter('all')}
                    >
                        All
                    </button>
                    <button
                        className={`btn ${filter === STATUSES.ASSIGNED ? 'btn-primary' : 'btn-secondary'} btn-sm`}
                        onClick={() => setFilter(STATUSES.ASSIGNED)}
                    >
                        Assigned
                    </button>
                    <button
                        className={`btn ${filter === STATUSES.IN_PROGRESS ? 'btn-primary' : 'btn-secondary'} btn-sm`}
                        onClick={() => setFilter(STATUSES.IN_PROGRESS)}
                    >
                        In Progress
                    </button>
                    <button
                        className={`btn ${filter === STATUSES.RESOLVED ? 'btn-primary' : 'btn-secondary'} btn-sm`}
                        onClick={() => setFilter(STATUSES.RESOLVED)}
                    >
                        Resolved
                    </button>
                </div>

                {/* Complaints List */}
                {filteredComplaints.length === 0 ? (
                    <div className="card text-center" style={{ padding: 'var(--spacing-3xl)' }}>
                        <div style={{ fontSize: '4rem', marginBottom: 'var(--spacing-lg)' }}>📋</div>
                        <h3>No Complaints</h3>
                        <p style={{ color: 'var(--gray-600)' }}>
                            No complaints match the selected filter
                        </p>
                    </div>
                ) : (
                    <div className="grid gap-lg">
                        {filteredComplaints.map((complaint) => (
                            <div key={complaint.id} className="card">
                                <div className="flex-between mb-md">
                                    <div>
                                        <h3 style={{ marginBottom: 'var(--spacing-sm)' }}>
                                            {CATEGORIES.find(c => c.id === complaint.category)?.icon}{' '}
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

                                <div style={{ fontSize: '0.875rem', color: 'var(--gray-600)', marginBottom: 'var(--spacing-md)' }}>
                                    <p>📍 {complaint.address}</p>
                                    <p>🕒 Reported {formatRelativeTime(complaint.createdAt)}</p>
                                    <p>👤 {complaint.userName}</p>
                                </div>

                                <button
                                    className="btn btn-primary w-full"
                                    onClick={() => {
                                        setSelectedComplaint(complaint);
                                        setUpdateForm({
                                            status: complaint.status === STATUSES.ASSIGNED ? STATUSES.IN_PROGRESS : STATUSES.RESOLVED,
                                            note: '',
                                            resolutionPhoto: null
                                        });
                                    }}
                                >
                                    Update Status
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Update Modal */}
            {selectedComplaint && (
                <div
                    style={{
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
                        padding: 'var(--spacing-lg)',
                        overflowY: 'auto'
                    }}
                >
                    <div className="card" style={{ maxWidth: '600px', width: '100%' }}>
                        <h3 className="mb-lg">Update Complaint Status</h3>

                        <div className="mb-lg" style={{ background: 'var(--gray-100)', padding: 'var(--spacing-md)', borderRadius: 'var(--radius-md)' }}>
                            <p style={{ fontSize: '0.875rem', color: 'var(--gray-600)' }}>
                                Complaint ID: {selectedComplaint.complaintId}
                            </p>
                            <p style={{ fontSize: '0.875rem', color: 'var(--gray-600)' }}>
                                Category: {selectedComplaint.category}
                            </p>
                        </div>

                        <form onSubmit={handleUpdateStatus}>
                            <div className="form-group">
                                <label className="form-label">New Status</label>
                                <select
                                    className="form-select"
                                    value={updateForm.status}
                                    onChange={(e) => setUpdateForm({ ...updateForm, status: e.target.value })}
                                    required
                                >
                                    <option value="">Select status...</option>
                                    <option value={STATUSES.IN_PROGRESS}>In Progress</option>
                                    <option value={STATUSES.RESOLVED}>Resolved</option>
                                    <option value={STATUSES.ESCALATED}>Escalate</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Remarks</label>
                                <textarea
                                    className="form-textarea"
                                    placeholder="Add notes about the update..."
                                    value={updateForm.note}
                                    onChange={(e) => setUpdateForm({ ...updateForm, note: e.target.value })}
                                    required
                                    rows="4"
                                />
                            </div>

                            {updateForm.status === STATUSES.RESOLVED && (
                                <div className="form-group">
                                    <label className="form-label">Resolution Photo</label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => setUpdateForm({ ...updateForm, resolutionPhoto: e.target.files[0] })}
                                        className="form-input"
                                    />
                                </div>
                            )}

                            <div className="flex gap-md">
                                <button
                                    type="button"
                                    className="btn btn-secondary w-full"
                                    onClick={() => setSelectedComplaint(null)}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="btn btn-primary w-full"
                                    disabled={updating}
                                >
                                    {updating ? 'Updating...' : 'Update'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OfficerDashboard;
