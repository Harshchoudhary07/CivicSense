import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAllComplaints } from '../services/complaintService';
import { exportToCSV } from '../utils/helpers';
import { STATUSES, CATEGORIES } from '../utils/constants';

const Analytics = () => {
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [timeRange, setTimeRange] = useState('all');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const data = await getAllComplaints();
            setComplaints(data);
        } catch (error) {
            console.error('Error loading data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleExport = () => {
        const exportData = complaints.map(c => ({
            ID: c.complaintId,
            Category: c.category,
            Status: c.status,
            Priority: c.priority,
            Department: c.departmentName || 'Unassigned',
            Created: c.createdAt?.toDate?.()?.toLocaleDateString() || 'N/A',
            Resolved: c.resolvedAt?.toDate?.()?.toLocaleDateString() || 'N/A'
        }));
        exportToCSV(exportData, 'complaints_report.csv');
    };

    const stats = {
        totalComplaints: complaints.length,
        resolvedComplaints: complaints.filter(c => c.status === STATUSES.RESOLVED).length,
        avgResolutionTime: '2.5 days', // Simplified
        satisfactionRate: '4.2/5'
    };

    const monthlyData = [
        { month: 'Jan', complaints: 45, resolved: 38 },
        { month: 'Feb', complaints: 52, resolved: 45 },
        { month: 'Mar', complaints: 48, resolved: 42 },
        { month: 'Apr', complaints: 61, resolved: 55 },
        { month: 'May', complaints: 58, resolved: 50 },
        { month: 'Jun', complaints: 65, resolved: 58 }
    ];

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
                        <li><Link to="/admin/dashboard" className="navbar-link">Dashboard</Link></li>
                        <li><Link to="/admin/departments" className="navbar-link">Departments</Link></li>
                    </ul>
                </div>
            </nav>

            <div className="container mt-xl">
                <div className="flex-between mb-xl">
                    <div>
                        <h1>Analytics & Reports</h1>
                        <p style={{ color: 'var(--gray-600)' }}>Insights and performance metrics</p>
                    </div>
                    <button className="btn btn-primary" onClick={handleExport}>
                        📊 Export Report (CSV)
                    </button>
                </div>

                {/* Key Metrics */}
                <div className="stats mb-xl">
                    <div className="stat-card">
                        <div className="stat-value">{stats.totalComplaints}</div>
                        <div className="stat-label">Total Complaints</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-value">{stats.resolvedComplaints}</div>
                        <div className="stat-label">Resolved</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-value">{stats.avgResolutionTime}</div>
                        <div className="stat-label">Avg Resolution Time</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-value">{stats.satisfactionRate}</div>
                        <div className="stat-label">Satisfaction Rate</div>
                    </div>
                </div>

                {/* Monthly Trend */}
                <div className="card mb-xl">
                    <h3 className="mb-lg">Monthly Trend</h3>
                    <div style={{ height: '300px', display: 'flex', alignItems: 'flex-end', gap: 'var(--spacing-md)', justifyContent: 'space-between' }}>
                        {monthlyData.map((data) => (
                            <div key={data.month} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                                <div style={{ width: '100%', display: 'flex', gap: '4px', alignItems: 'flex-end', height: '250px' }}>
                                    <div
                                        style={{
                                            flex: 1,
                                            background: 'var(--gradient-civic)',
                                            borderRadius: 'var(--radius-sm)',
                                            height: `${(data.complaints / 70) * 100}%`,
                                            minHeight: '20px'
                                        }}
                                        title={`Complaints: ${data.complaints}`}
                                    />
                                    <div
                                        style={{
                                            flex: 1,
                                            background: 'var(--gradient-success)',
                                            borderRadius: 'var(--radius-sm)',
                                            height: `${(data.resolved / 70) * 100}%`,
                                            minHeight: '20px'
                                        }}
                                        title={`Resolved: ${data.resolved}`}
                                    />
                                </div>
                                <p style={{ fontSize: '0.875rem', fontWeight: '600', color: 'var(--gray-700)' }}>
                                    {data.month}
                                </p>
                            </div>
                        ))}
                    </div>
                    <div className="flex-center gap-lg mt-lg">
                        <div className="flex gap-sm" style={{ alignItems: 'center' }}>
                            <div style={{ width: '20px', height: '20px', background: 'var(--gradient-civic)', borderRadius: 'var(--radius-sm)' }} />
                            <span style={{ fontSize: '0.875rem', color: 'var(--gray-600)' }}>Complaints</span>
                        </div>
                        <div className="flex gap-sm" style={{ alignItems: 'center' }}>
                            <div style={{ width: '20px', height: '20px', background: 'var(--gradient-success)', borderRadius: 'var(--radius-sm)' }} />
                            <span style={{ fontSize: '0.875rem', color: 'var(--gray-600)' }}>Resolved</span>
                        </div>
                    </div>
                </div>

                {/* Heatmap Placeholder */}
                <div className="card mb-xl">
                    <h3 className="mb-lg">Complaint Heatmap</h3>
                    <div style={{ height: '400px', background: 'var(--gray-200)', borderRadius: 'var(--radius-lg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <div className="text-center">
                            <div style={{ fontSize: '3rem', marginBottom: 'var(--spacing-md)' }}>🗺️</div>
                            <p style={{ color: 'var(--gray-600)' }}>
                                Geographic heatmap showing complaint density
                            </p>
                            <p style={{ fontSize: '0.875rem', color: 'var(--gray-500)', marginTop: 'var(--spacing-sm)' }}>
                                (Requires Google Maps API integration)
                            </p>
                        </div>
                    </div>
                </div>

                {/* Category Performance */}
                <div className="card">
                    <h3 className="mb-lg">Category Performance</h3>
                    <div className="grid grid-2 gap-lg">
                        {CATEGORIES.map((cat) => {
                            const catComplaints = complaints.filter(c => c.category === cat.id);
                            const catResolved = catComplaints.filter(c => c.status === STATUSES.RESOLVED);
                            const resolutionRate = catComplaints.length > 0 ? (catResolved.length / catComplaints.length) * 100 : 0;

                            return (
                                <div key={cat.id} style={{ padding: 'var(--spacing-lg)', background: 'var(--gray-50)', borderRadius: 'var(--radius-lg)' }}>
                                    <div className="flex-between mb-md">
                                        <div className="flex gap-md" style={{ alignItems: 'center' }}>
                                            <div className={`category-icon ${cat.color}`} style={{ width: '2.5rem', height: '2.5rem', fontSize: '1.25rem' }}>
                                                {cat.icon}
                                            </div>
                                            <h4>{cat.name}</h4>
                                        </div>
                                        <span style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--primary)' }}>
                                            {catComplaints.length}
                                        </span>
                                    </div>
                                    <div style={{ background: 'var(--gray-200)', height: '8px', borderRadius: 'var(--radius-full)', overflow: 'hidden', marginBottom: 'var(--spacing-sm)' }}>
                                        <div
                                            style={{
                                                width: `${resolutionRate}%`,
                                                height: '100%',
                                                background: 'var(--gradient-success)',
                                                transition: 'width var(--transition-base)'
                                            }}
                                        />
                                    </div>
                                    <p style={{ fontSize: '0.875rem', color: 'var(--gray-600)' }}>
                                        {Math.round(resolutionRate)}% resolved ({catResolved.length}/{catComplaints.length})
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Analytics;
