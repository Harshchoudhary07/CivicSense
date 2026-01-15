import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getNearbyComplaints } from '../services/complaintService';
import { getCurrentLocation } from '../utils/helpers';
import { formatRelativeTime, getStatusClass, getPriorityClass } from '../utils/helpers';
import { STATUS_LABELS, PRIORITY_LABELS, CATEGORIES } from '../utils/constants';
import Map from '../components/Map';

const NearbyIssues = () => {
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [location, setLocation] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [selectedComplaint, setSelectedComplaint] = useState(null);

    useEffect(() => {
        loadNearbyIssues();
    }, []);

    const loadNearbyIssues = async () => {
        try {
            const userLocation = await getCurrentLocation();
            setLocation(userLocation);

            const data = await getNearbyComplaints(userLocation, 5); // 5km radius
            setComplaints(data || []);
        } catch (error) {
            console.error('Error loading nearby issues:', error);
            // Set empty array on error so page still renders
            setComplaints([]);
        } finally {
            setLoading(false);
        }
    };

    const filteredComplaints = selectedCategory === 'all'
        ? complaints
        : complaints.filter(c => c.category === selectedCategory);

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
                        <li><Link to="/report" className="navbar-link">Report Issue</Link></li>
                        <li><Link to="/my-complaints" className="navbar-link">My Complaints</Link></li>
                    </ul>
                </div>
            </nav>

            <div className="container mt-xl">
                <h1 className="mb-md">Nearby Issues</h1>
                <p style={{ color: 'var(--gray-600)', marginBottom: 'var(--spacing-xl)' }}>
                    Issues reported in your area (within 5km radius)
                </p>

                {/* Category Filter */}
                <div className="flex gap-md mb-xl" style={{ flexWrap: 'wrap' }}>
                    <button
                        className={`btn ${selectedCategory === 'all' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
                        onClick={() => setSelectedCategory('all')}
                    >
                        All
                    </button>
                    {CATEGORIES.map((cat) => (
                        <button
                            key={cat.id}
                            className={`btn ${selectedCategory === cat.id ? 'btn-primary' : 'btn-secondary'} btn-sm`}
                            onClick={() => setSelectedCategory(cat.id)}
                        >
                            {cat.icon} {cat.name}
                        </button>
                    ))}
                </div>

                {/* Map View */}
                <div className="map-container mb-xl" style={{ height: '400px', width: '100%' }}>
                    <Map
                        center={location}
                        zoom={14}
                        markers={filteredComplaints.map(complaint => ({
                            lat: complaint.location?.lat,
                            lng: complaint.location?.lng,
                            title: complaint.category,
                            onClick: () => setSelectedComplaint(complaint),
                            // Optional: add info window content
                        })).filter(m => m.lat && m.lng)}
                        height="100%"
                    />
                </div>

                {/* Issues List */}
                {filteredComplaints.length === 0 ? (
                    <div className="card text-center" style={{ padding: 'var(--spacing-3xl)' }}>
                        <div style={{ fontSize: '4rem', marginBottom: 'var(--spacing-lg)' }}>🔍</div>
                        <h3>No Issues Found</h3>
                        <p style={{ color: 'var(--gray-600)' }}>
                            No issues reported in your area yet
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-2 gap-lg">
                        {filteredComplaints.map((complaint) => (
                            <div
                                key={complaint.id}
                                className="card"
                                style={{ cursor: 'pointer' }}
                                onClick={() => setSelectedComplaint(complaint)}
                            >
                                <div className="flex-between mb-md">
                                    <h4>
                                        {CATEGORIES.find(c => c.id === complaint.category)?.icon}{' '}
                                        {complaint.category.charAt(0).toUpperCase() + complaint.category.slice(1)}
                                    </h4>
                                    <div className="flex gap-sm">
                                        <span className={`badge ${getStatusClass(complaint.status)}`}>
                                            {STATUS_LABELS[complaint.status]}
                                        </span>
                                        <span className={`badge ${getPriorityClass(complaint.priority)}`}>
                                            {PRIORITY_LABELS[complaint.priority]}
                                        </span>
                                    </div>
                                </div>

                                {complaint.photoURL && (
                                    <img
                                        src={complaint.photoURL}
                                        alt="Issue"
                                        style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: 'var(--radius-lg)', marginBottom: 'var(--spacing-md)' }}
                                    />
                                )}

                                <p style={{ color: 'var(--gray-700)', marginBottom: 'var(--spacing-md)' }}>
                                    {complaint.description.substring(0, 100)}
                                    {complaint.description.length > 100 && '...'}
                                </p>

                                <div style={{ fontSize: '0.875rem', color: 'var(--gray-600)' }}>
                                    <p>📍 {complaint.address}</p>
                                    <p>🕒 {formatRelativeTime(complaint.createdAt)}</p>
                                </div>

                                <button className="btn btn-secondary w-full mt-md btn-sm">
                                    View Details
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Detail Modal */}
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
                    onClick={() => setSelectedComplaint(null)}
                >
                    <div className="card" style={{ maxWidth: '600px', width: '100%', maxHeight: '90vh', overflowY: 'auto' }} onClick={(e) => e.stopPropagation()}>
                        <div className="flex-between mb-lg">
                            <h3>
                                {CATEGORIES.find(c => c.id === selectedComplaint.category)?.icon}{' '}
                                {selectedComplaint.category.charAt(0).toUpperCase() + selectedComplaint.category.slice(1)} Issue
                            </h3>
                            <button
                                className="btn btn-icon btn-secondary"
                                onClick={() => setSelectedComplaint(null)}
                            >
                                ✕
                            </button>
                        </div>

                        <div className="flex gap-sm mb-md">
                            <span className={`badge ${getStatusClass(selectedComplaint.status)}`}>
                                {STATUS_LABELS[selectedComplaint.status]}
                            </span>
                            <span className={`badge ${getPriorityClass(selectedComplaint.priority)}`}>
                                {PRIORITY_LABELS[selectedComplaint.priority]}
                            </span>
                        </div>

                        {selectedComplaint.photoURL && (
                            <img
                                src={selectedComplaint.photoURL}
                                alt="Issue"
                                style={{ width: '100%', maxHeight: '400px', objectFit: 'cover', borderRadius: 'var(--radius-lg)', marginBottom: 'var(--spacing-lg)' }}
                            />
                        )}

                        <div className="mb-lg">
                            <h4 style={{ fontSize: '1rem', marginBottom: 'var(--spacing-sm)' }}>Description</h4>
                            <p style={{ color: 'var(--gray-700)' }}>{selectedComplaint.description}</p>
                        </div>

                        <div className="mb-lg">
                            <h4 style={{ fontSize: '1rem', marginBottom: 'var(--spacing-sm)' }}>Location</h4>
                            <p style={{ color: 'var(--gray-700)' }}>📍 {selectedComplaint.address}</p>
                        </div>

                        <div className="mb-lg">
                            <h4 style={{ fontSize: '1rem', marginBottom: 'var(--spacing-sm)' }}>Reported</h4>
                            <p style={{ color: 'var(--gray-700)' }}>🕒 {formatRelativeTime(selectedComplaint.createdAt)}</p>
                        </div>

                        {selectedComplaint.resolutionPhotoURL && (
                            <div className="mb-lg">
                                <h4 style={{ fontSize: '1rem', marginBottom: 'var(--spacing-sm)' }}>Resolution Photo</h4>
                                <img
                                    src={selectedComplaint.resolutionPhotoURL}
                                    alt="Resolution"
                                    style={{ width: '100%', maxHeight: '300px', objectFit: 'cover', borderRadius: 'var(--radius-lg)' }}
                                />
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default NearbyIssues;
