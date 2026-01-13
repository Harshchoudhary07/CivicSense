import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { DEPARTMENTS } from '../utils/constants';

const DepartmentManagement = () => {
    const [departments, setDepartments] = useState(DEPARTMENTS);
    const [showAddModal, setShowAddModal] = useState(false);
    const [newDept, setNewDept] = useState({ name: '', categories: [] });

    const handleAddDepartment = (e) => {
        e.preventDefault();
        const dept = {
            id: newDept.name.toLowerCase().replace(/\s+/g, '_'),
            ...newDept
        };
        setDepartments([...departments, dept]);
        setNewDept({ name: '', categories: [] });
        setShowAddModal(false);
    };

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-secondary)', paddingBottom: 'var(--spacing-3xl)' }}>
            {/* Navbar */}
            <nav className="navbar">
                <div className="container navbar-content">
                    <Link to="/" className="navbar-logo">🏛️ CivicSense</Link>
                    <ul className="navbar-menu">
                        <li><Link to="/admin/dashboard" className="navbar-link">Dashboard</Link></li>
                        <li><Link to="/admin/analytics" className="navbar-link">Analytics</Link></li>
                    </ul>
                </div>
            </nav>

            <div className="container mt-xl">
                <div className="flex-between mb-xl">
                    <div>
                        <h1>Department Management</h1>
                        <p style={{ color: 'var(--gray-600)' }}>Manage departments and officer assignments</p>
                    </div>
                    <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
                        + Add Department
                    </button>
                </div>

                {/* Departments Grid */}
                <div className="grid grid-2 gap-lg">
                    {departments.map((dept) => (
                        <div key={dept.id} className="card">
                            <div className="flex-between mb-md">
                                <h3>{dept.name}</h3>
                                <button className="btn btn-secondary btn-sm">
                                    Edit
                                </button>
                            </div>

                            <div className="mb-md">
                                <p style={{ fontSize: '0.875rem', color: 'var(--gray-600)', marginBottom: 'var(--spacing-sm)' }}>
                                    <strong>Categories:</strong>
                                </p>
                                <div className="flex gap-sm" style={{ flexWrap: 'wrap' }}>
                                    {dept.categories.map((cat) => (
                                        <span key={cat} className="badge badge-submitted">
                                            {cat}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <div className="mb-lg">
                                <p style={{ fontSize: '0.875rem', color: 'var(--gray-600)', marginBottom: 'var(--spacing-sm)' }}>
                                    <strong>Assigned Officers:</strong>
                                </p>
                                <div style={{ background: 'var(--gray-100)', padding: 'var(--spacing-md)', borderRadius: 'var(--radius-md)' }}>
                                    <p style={{ fontSize: '0.875rem', color: 'var(--gray-700)' }}>
                                        👮 Officer 1 (5 active complaints)
                                    </p>
                                    <p style={{ fontSize: '0.875rem', color: 'var(--gray-700)', marginTop: 'var(--spacing-sm)' }}>
                                        👮 Officer 2 (3 active complaints)
                                    </p>
                                </div>
                            </div>

                            <button className="btn btn-secondary w-full">
                                Manage Officers
                            </button>
                        </div>
                    ))}
                </div>

                {/* Officer Assignment Section */}
                <div className="mt-2xl">
                    <h2 className="mb-lg">Officer Management</h2>
                    <div className="card">
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ borderBottom: '2px solid var(--gray-200)', textAlign: 'left' }}>
                                        <th style={{ padding: 'var(--spacing-md)', color: 'var(--gray-600)', fontWeight: '600' }}>Officer Name</th>
                                        <th style={{ padding: 'var(--spacing-md)', color: 'var(--gray-600)', fontWeight: '600' }}>Department</th>
                                        <th style={{ padding: 'var(--spacing-md)', color: 'var(--gray-600)', fontWeight: '600' }}>Active Cases</th>
                                        <th style={{ padding: 'var(--spacing-md)', color: 'var(--gray-600)', fontWeight: '600' }}>Status</th>
                                        <th style={{ padding: 'var(--spacing-md)', color: 'var(--gray-600)', fontWeight: '600' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {departments.map((dept, idx) => (
                                        <tr key={idx} style={{ borderBottom: '1px solid var(--gray-200)' }}>
                                            <td style={{ padding: 'var(--spacing-md)' }}>
                                                👮 Officer {idx + 1}
                                            </td>
                                            <td style={{ padding: 'var(--spacing-md)' }}>
                                                {dept.name}
                                            </td>
                                            <td style={{ padding: 'var(--spacing-md)' }}>
                                                {Math.floor(Math.random() * 10)}
                                            </td>
                                            <td style={{ padding: 'var(--spacing-md)' }}>
                                                <span className="badge badge-resolved">Active</span>
                                            </td>
                                            <td style={{ padding: 'var(--spacing-md)' }}>
                                                <button className="btn btn-secondary btn-sm">
                                                    Edit
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            {/* Add Department Modal */}
            {showAddModal && (
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
                        padding: 'var(--spacing-lg)'
                    }}
                >
                    <div className="card" style={{ maxWidth: '500px', width: '100%' }}>
                        <h3 className="mb-lg">Add New Department</h3>
                        <form onSubmit={handleAddDepartment}>
                            <div className="form-group">
                                <label className="form-label">Department Name</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="e.g., Parks & Recreation"
                                    value={newDept.name}
                                    onChange={(e) => setNewDept({ ...newDept, name: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Categories (comma-separated)</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="e.g., parks, trees, playgrounds"
                                    onChange={(e) => setNewDept({ ...newDept, categories: e.target.value.split(',').map(c => c.trim()) })}
                                />
                            </div>

                            <div className="flex gap-md">
                                <button
                                    type="button"
                                    className="btn btn-secondary w-full"
                                    onClick={() => setShowAddModal(false)}
                                >
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary w-full">
                                    Add Department
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DepartmentManagement;
