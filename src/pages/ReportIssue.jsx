import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createComplaint } from '../services/complaintService';
import { autoAssignComplaint } from '../services/assignmentService';
import { getCurrentUser } from '../services/authService';
import { getCurrentLocation } from '../utils/helpers';
import { CATEGORIES } from '../utils/constants';
import { useToast } from '../context/ToastContext';
import { createNotification, NOTIFICATION_TYPES } from '../services/notificationService';
import Map from '../components/Map';

const ReportIssue = () => {
    const navigate = useNavigate();
    const { showToast } = useToast();
    const [formData, setFormData] = useState({
        category: '',
        description: '',
        location: null,
        address: ''
    });
    const [photo, setPhoto] = useState(null);
    const [photoPreview, setPhotoPreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [locationLoading, setLocationLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [complaintId, setComplaintId] = useState('');

    useEffect(() => {
        // Check if user is logged in
        const user = getCurrentUser();
        if (!user) {
            navigate('/login');
        }
    }, [navigate]);

    const handleGetLocation = async () => {
        setLocationLoading(true);
        try {
            const location = await getCurrentLocation();
            setFormData({ ...formData, location });

            // Reverse geocode to get address (simplified)
            setFormData(prev => ({
                ...prev,
                location,
                address: `Lat: ${location.lat.toFixed(6)}, Lng: ${location.lng.toFixed(6)}`
            }));
            showToast('Location captured successfully!', 'success');
        } catch (error) {
            showToast('Failed to get location. Please enable location services.', 'error');
        } finally {
            setLocationLoading(false);
        }
    };

    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setPhoto(file);
            setPhotoPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const user = getCurrentUser();

            const complaintData = {
                ...formData,
                userId: user.uid,
                userName: user.displayName || user.phoneNumber || 'Guest User'
            };

            const complaint = await createComplaint(complaintData, photo);

            // Auto-assign to department
            await autoAssignComplaint(complaint.id, formData.category, formData.location);

            // Create notification for user
            await createNotification(
                user.uid,
                NOTIFICATION_TYPES.COMPLAINT_SUBMITTED,
                `Your ${formData.category} complaint has been submitted successfully!`,
                { complaintId: complaint.id, link: '/my-complaints' }
            );

            setComplaintId(complaint.complaintId);
            setSuccess(true);
            showToast('Complaint submitted successfully!', 'success');

            // Reset form
            setTimeout(() => {
                navigate('/my-complaints');
            }, 3000);
        } catch (error) {
            showToast('Failed to submit complaint. Please try again.', 'error');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div style={{ minHeight: '100vh', background: 'var(--gradient-hero)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'var(--spacing-lg)' }}>
                <div className="card text-center" style={{ maxWidth: '500px' }}>
                    <div style={{ fontSize: '4rem', marginBottom: 'var(--spacing-lg)' }}>✅</div>
                    <h2>Complaint Submitted!</h2>
                    <p className="mt-md mb-lg" style={{ color: 'var(--gray-600)' }}>
                        Your complaint has been registered successfully.
                    </p>
                    <div style={{ background: 'var(--gray-100)', padding: 'var(--spacing-lg)', borderRadius: 'var(--radius-lg)', marginBottom: 'var(--spacing-xl)' }}>
                        <p style={{ fontSize: '0.875rem', color: 'var(--gray-600)', marginBottom: 'var(--spacing-sm)' }}>
                            Complaint ID
                        </p>
                        <p style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--primary)' }}>
                            {complaintId}
                        </p>
                    </div>
                    <Link to="/my-complaints" className="btn btn-primary w-full">
                        Track Your Complaints
                    </Link>
                </div>
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
                        <li><Link to="/my-complaints" className="navbar-link">My Complaints</Link></li>
                        <li><Link to="/nearby" className="navbar-link">Nearby Issues</Link></li>
                    </ul>
                </div>
            </nav>

            <div className="container mt-xl">
                <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                    <h1 className="text-center mb-md">Report an Issue</h1>
                    <p className="text-center mb-xl" style={{ color: 'var(--gray-600)' }}>
                        Help us make your community better by reporting civic issues
                    </p>

                    <div className="card">
                        <form onSubmit={handleSubmit}>
                            {/* Category Selection */}
                            <div className="form-group">
                                <label className="form-label">Category *</label>
                                <div className="grid grid-2">
                                    {CATEGORIES.map((cat) => (
                                        <div
                                            key={cat.id}
                                            className={`card ${formData.category === cat.id ? 'card-glass' : ''}`}
                                            onClick={() => setFormData({ ...formData, category: cat.id })}
                                            style={{
                                                cursor: 'pointer',
                                                border: formData.category === cat.id ? '2px solid var(--primary)' : '2px solid transparent',
                                                transition: 'all var(--transition-base)'
                                            }}
                                        >
                                            <div className={`category-icon ${cat.color}`}>
                                                {cat.icon}
                                            </div>
                                            <h4>{cat.name}</h4>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Description */}
                            <div className="form-group">
                                <label className="form-label">Description *</label>
                                <textarea
                                    className="form-textarea"
                                    placeholder="Describe the issue in detail..."
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    required
                                    rows="5"
                                />
                            </div>

                            {/* Photo Upload */}
                            <div className="form-group">
                                <label className="form-label">Upload Photo</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handlePhotoChange}
                                    className="form-input"
                                />
                                {photoPreview && (
                                    <div className="mt-md">
                                        <img
                                            src={photoPreview}
                                            alt="Preview"
                                            style={{ maxWidth: '100%', borderRadius: 'var(--radius-lg)', maxHeight: '300px', objectFit: 'cover' }}
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Location */}
                            <div className="form-group">
                                <label className="form-label">Location *</label>
                                <div className="mb-md">
                                    <button
                                        type="button"
                                        className="btn btn-secondary btn-sm mb-sm"
                                        onClick={handleGetLocation}
                                        disabled={locationLoading}
                                    >
                                        {locationLoading ? 'Getting Location...' : '📍 Use Current Location'}
                                    </button>
                                    <p style={{ fontSize: '0.875rem', color: 'var(--gray-600)' }}>
                                        Check the map to precise location
                                    </p>
                                </div>

                                <div className="map-container mb-md" style={{ height: '300px' }}>
                                    <Map
                                        center={formData.location}
                                        zoom={15}
                                        onLocationSelect={async (loc) => {
                                            setFormData(prev => ({ ...prev, location: loc }));
                                            // Optional: You could call a geocoding API here to update address
                                            setFormData(prev => ({
                                                ...prev,
                                                address: `Lat: ${loc.lat.toFixed(6)}, Lng: ${loc.lng.toFixed(6)}`
                                            }));
                                        }}
                                        markers={formData.location ? [{ lat: formData.location.lat, lng: formData.location.lng }] : []}
                                        height="100%"
                                    />
                                </div>

                                {formData.location && (
                                    <div style={{ background: 'var(--gray-100)', padding: 'var(--spacing-md)', borderRadius: 'var(--radius-md)' }}>
                                        <p style={{ fontSize: '0.875rem', color: 'var(--gray-700)' }}>
                                            📍 {formData.address}
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                className="btn btn-primary w-full btn-lg"
                                disabled={loading || !formData.category || !formData.description || !formData.location}
                            >
                                {loading ? 'Submitting...' : 'Submit Complaint'}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReportIssue;
