import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { officerLogin } from '../services/authService';

const OfficerLogin = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await officerLogin(formData.email, formData.password, 'officer');
            navigate('/officer/dashboard');
        } catch (err) {
            setError('Invalid credentials. Please try again.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ minHeight: '100vh', background: 'var(--gradient-hero)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'var(--spacing-lg)' }}>
            <div className="card" style={{ maxWidth: '450px', width: '100%' }}>
                <div className="text-center mb-xl">
                    <div style={{ fontSize: '3rem', marginBottom: 'var(--spacing-md)' }}>👮</div>
                    <h2>Officer Login</h2>
                    <p style={{ color: 'var(--gray-600)' }}>Access your complaint dashboard</p>
                </div>

                {error && (
                    <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', padding: 'var(--spacing-md)', borderRadius: 'var(--radius-md)', marginBottom: 'var(--spacing-lg)' }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Email / Employee ID</label>
                        <input
                            type="text"
                            className="form-input"
                            placeholder="officer@civic.gov"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Password</label>
                        <input
                            type="password"
                            className="form-input"
                            placeholder="••••••••"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            required
                        />
                    </div>

                    <button type="submit" className="btn btn-primary w-full" disabled={loading}>
                        {loading ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>

                <div style={{ marginTop: 'var(--spacing-xl)', textAlign: 'center' }}>
                    <p style={{ fontSize: '0.875rem', color: 'var(--gray-600)' }}>
                        <Link to="/" style={{ color: 'var(--primary)' }}>← Back to Home</Link>
                    </p>
                    <p style={{ fontSize: '0.875rem', color: 'var(--gray-600)', marginTop: 'var(--spacing-md)' }}>
                        Admin? <Link to="/admin/dashboard" style={{ color: 'var(--primary)' }}>Login here</Link>
                    </p>
                </div>

                {/* Demo Credentials */}
                <div style={{ marginTop: 'var(--spacing-xl)', padding: 'var(--spacing-md)', background: 'var(--gray-100)', borderRadius: 'var(--radius-md)' }}>
                    <p style={{ fontSize: '0.75rem', color: 'var(--gray-600)', marginBottom: 'var(--spacing-sm)' }}>
                        <strong>Demo Credentials:</strong>
                    </p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--gray-600)' }}>
                        Email: officer@demo.com<br />
                        Password: demo123
                    </p>
                </div>
            </div>
        </div>
    );
};

export default OfficerLogin;
