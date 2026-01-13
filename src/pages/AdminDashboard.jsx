import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAllComplaints } from '../services/complaintService';
import { STATUSES, PRIORITIES, CATEGORIES, DEPARTMENTS } from '../utils/constants';

const AdminDashboard = () => {
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadComplaints();
    }, []);

    const loadComplaints = async () => {
        try {
            const data = await getAllComplaints();
            setComplaints(data || []);
        } catch (error) {
            console.error('Error loading complaints:', error);
            // Set empty array on error so page still renders
            setComplaints([]);
        } finally {
            setLoading(false);
        }
    };

    const stats = {
        total: complaints.length,
        pending: complaints.filter(c => c.status !== STATUSES.RESOLVED).length,
        resolved: complaints.filter(c => c.status === STATUSES.RESOLVED).length,
        escalated: complaints.filter(c => c.status === STATUSES.ESCALATED).length,
        critical: complaints.filter(c => c.priority === PRIORITIES.CRITICAL).length
    };

    const departmentStats = DEPARTMENTS.map(dept => ({
        ...dept,
        total: complaints.filter(c => dept.categories.includes(c.category)).length,
        resolved: complaints.filter(c => dept.categories.includes(c.category) && c.status === STATUSES.RESOLVED).length
    }));

    const categoryStats = CATEGORIES.map(cat => ({
        ...cat,
        count: complaints.filter(c => c.category === cat.id).length
    }));

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
                    <ul className="navbar-menu">
                        <li><Link to="/admin/departments" className="navbar-link">Departments</Link></li>
                        <li><Link to="/admin/analytics" className="navbar-link">Analytics</Link></li>
                        <li><Link to="/officer/login" className="btn btn-secondary btn-sm">Logout</Link></li>
                    </ul>
                </div>
            </nav>

            <div className="container mt-xl">
                <div className="flex-between mb-xl">
                    <div>
                        <h1>Admin Dashboard</h1>
                        <p style={{ color: 'var(--gray-600)' }}>System overview and management</p>
                    </div>
                    <div className="flex gap-md">
                        <Link to="/admin/departments" className="btn btn-secondary">
                            Manage Departments
                        </Link>
                        <Link to="/admin/analytics" className="btn btn-primary">
                            View Analytics
                        </Link>
                    </div>
                </div>

                {/* Main Stats */}
                <div className="stats mb-xl">
                    <div className="stat-card">
                        <div className="stat-value">{stats.total}</div>
                        <div className="stat-label">Total Complaints</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-value">{stats.pending}</div>
                        <div className="stat-label">Pending</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-value">{stats.resolved}</div>
                        <div className="stat-label">Resolved</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-value">{stats.escalated}</div>
                        <div className="stat-label">Escalated</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-value">{stats.critical}</div>
                        <div className="stat-label">Critical Priority</div>
                    </div>
                </div>

                {/* Department Performance */}
                <div className="mb-xl">
                    <h2 className="mb-lg">Department Performance</h2>
                    <div className="grid grid-2 gap-lg">
                        {departmentStats.map((dept) => (
                            <div key={dept.id} className="card">
                                <h3 className="mb-md">{dept.name}</h3>
                                <div className="flex-between mb-md">
                                    <span style={{ color: 'var(--gray-600)' }}>Total Complaints</span>
                                    <span style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--primary)' }}>
                                        {dept.total}
                                    </span>
                                </div>
                                <div className="flex-between mb-md">
                                    <span style={{ color: 'var(--gray-600)' }}>Resolved</span>
                                    <span style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--success)' }}>
                                        {dept.resolved}
                                    </span>
                                </div>
                                <div style={{ background: 'var(--gray-200)', height: '8px', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                                    <div
                                        style={{
                                            width: `${dept.total > 0 ? (dept.resolved / dept.total) * 100 : 0}%`,
                                            height: '100%',
                                            background: 'var(--gradient-success)',
                                            transition: 'width var(--transition-base)'
                                        }}
                                    />
                                </div>
                                <p style={{ fontSize: '0.875rem', color: 'var(--gray-600)', marginTop: 'var(--spacing-sm)' }}>
                                    {dept.total > 0 ? Math.round((dept.resolved / dept.total) * 100) : 0}% Resolution Rate
                                </p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Category Breakdown */}
                <div className="mb-xl">
                    <h2 className="mb-lg">Category Breakdown</h2>
                    <div className="grid grid-4 gap-lg">
                        {categoryStats.map((cat) => (
                            <div key={cat.id} className="card text-center">
                                <div className={`category-icon ${cat.color}`} style={{ margin: '0 auto' }}>
                                    {cat.icon}
                                </div>
                                <h4>{cat.name}</h4>
                                <p style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--primary)', margin: 'var(--spacing-md) 0' }}>
                                    {cat.count}
                                </p>
                                <p style={{ fontSize: '0.875rem', color: 'var(--gray-600)' }}>
                                    complaints
                                </p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Recent Activity */}
                <div>
                    <h2 className="mb-lg">Recent Complaints</h2>
                    <div className="card">
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ borderBottom: '2px solid var(--gray-200)', textAlign: 'left' }}>
                                        <th style={{ padding: 'var(--spacing-md)', color: 'var(--gray-600)', fontWeight: '600' }}>ID</th>
                                        <th style={{ padding: 'var(--spacing-md)', color: 'var(--gray-600)', fontWeight: '600' }}>Category</th>
                                        <th style={{ padding: 'var(--spacing-md)', color: 'var(--gray-600)', fontWeight: '600' }}>Status</th>
                                        <th style={{ padding: 'var(--spacing-md)', color: 'var(--gray-600)', fontWeight: '600' }}>Priority</th>
                                        <th style={{ padding: 'var(--spacing-md)', color: 'var(--gray-600)', fontWeight: '600' }}>Department</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {complaints.slice(0, 10).map((complaint) => (
                                        <tr key={complaint.id} style={{ borderBottom: '1px solid var(--gray-200)' }}>
                                            <td style={{ padding: 'var(--spacing-md)', fontSize: '0.875rem' }}>
                                                {complaint.complaintId}
                                            </td>
                                            <td style={{ padding: 'var(--spacing-md)' }}>
                                                {CATEGORIES.find(c => c.id === complaint.category)?.icon}{' '}
                                                {complaint.category}
                                            </td>
                                            <td style={{ padding: 'var(--spacing-md)' }}>
                                                <span className={`badge ${complaint.status === STATUSES.RESOLVED ? 'badge-resolved' : 'badge-progress'}`}>
                                                    {complaint.status}
                                                </span>
                                            </td>
                                            <td style={{ padding: 'var(--spacing-md)' }}>
                                                <span className={`badge ${complaint.priority === PRIORITIES.CRITICAL ? 'badge-critical' : 'badge-normal'}`}>
                                                    {complaint.priority}
                                                </span>
                                            </td>
                                            <td style={{ padding: 'var(--spacing-md)', fontSize: '0.875rem' }}>
                                                {complaint.departmentName || 'Unassigned'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
