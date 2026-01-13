import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signUpWithEmail } from '../services/authService';
import { validateEmail, validatePhone } from '../utils/helpers';

const Signup = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        username: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: ''
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    // Real-time validation
    const validateField = (name, value) => {
        const newErrors = { ...errors };

        switch (name) {
            case 'name':
                if (!value.trim()) {
                    newErrors.name = 'Name is required';
                } else if (value.trim().length < 2) {
                    newErrors.name = 'Name must be at least 2 characters';
                } else {
                    delete newErrors.name;
                }
                break;

            case 'username':
                if (!value.trim()) {
                    newErrors.username = 'Username is required';
                } else if (value.length < 3) {
                    newErrors.username = 'Username must be at least 3 characters';
                } else if (!/^[a-zA-Z0-9_]+$/.test(value)) {
                    newErrors.username = 'Username can only contain letters, numbers, and underscores';
                } else {
                    delete newErrors.username;
                }
                break;

            case 'email':
                if (!value.trim()) {
                    newErrors.email = 'Email is required';
                } else if (!validateEmail(value)) {
                    newErrors.email = 'Please enter a valid email address';
                } else {
                    delete newErrors.email;
                }
                break;

            case 'phone':
                if (!value.trim()) {
                    newErrors.phone = 'Phone number is required';
                } else if (!validatePhone(value)) {
                    newErrors.phone = 'Please enter a valid 10-digit phone number';
                } else {
                    delete newErrors.phone;
                }
                break;

            case 'password':
                if (!value) {
                    newErrors.password = 'Password is required';
                } else if (value.length < 6) {
                    newErrors.password = 'Password must be at least 6 characters';
                } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value)) {
                    newErrors.password = 'Password must contain uppercase, lowercase, and number';
                } else {
                    delete newErrors.password;
                }

                // Also validate confirm password if it exists
                if (formData.confirmPassword && value !== formData.confirmPassword) {
                    newErrors.confirmPassword = 'Passwords do not match';
                } else if (formData.confirmPassword) {
                    delete newErrors.confirmPassword;
                }
                break;

            case 'confirmPassword':
                if (!value) {
                    newErrors.confirmPassword = 'Please confirm your password';
                } else if (value !== formData.password) {
                    newErrors.confirmPassword = 'Passwords do not match';
                } else {
                    delete newErrors.confirmPassword;
                }
                break;

            default:
                break;
        }

        setErrors(newErrors);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        validateField(name, value);
    };

    const handleBlur = (e) => {
        const { name, value } = e.target;
        validateField(name, value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate all fields
        Object.keys(formData).forEach(key => {
            validateField(key, formData[key]);
        });

        // Check if there are any errors
        if (Object.keys(errors).length > 0) {
            return;
        }

        setLoading(true);

        try {
            await signUpWithEmail(
                formData.email,
                formData.password,
                formData.name,
                formData.username
            );

            setSuccess(true);

            // Redirect to login after 3 seconds
            setTimeout(() => {
                navigate('/login');
            }, 3000);
        } catch (error) {
            const newErrors = {};

            if (error.code === 'auth/email-already-in-use') {
                newErrors.email = 'Email already in use';
            } else if (error.message === 'Username already taken') {
                newErrors.username = 'Username already taken';
            } else {
                newErrors.general = error.message || 'Failed to create account. Please try again.';
            }

            setErrors(newErrors);
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div style={{ minHeight: '100vh', background: 'var(--gradient-hero)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'var(--spacing-lg)' }}>
                <div className="card text-center" style={{ maxWidth: '500px' }}>
                    <div style={{ fontSize: '4rem', marginBottom: 'var(--spacing-lg)' }}>✅</div>
                    <h2>Account Created!</h2>
                    <p className="mt-md mb-lg" style={{ color: 'var(--gray-600)' }}>
                        A verification email has been sent to <strong>{formData.email}</strong>
                    </p>
                    <p style={{ color: 'var(--gray-600)', marginBottom: 'var(--spacing-xl)' }}>
                        Redirecting to login...
                    </p>
                    <div className="spinner" style={{ margin: '0 auto' }}></div>
                </div>
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', background: 'var(--gradient-hero)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'var(--spacing-lg)' }}>
            <div className="card" style={{ maxWidth: '500px', width: '100%' }}>
                <div className="text-center mb-xl">
                    <Link to="/" className="navbar-logo" style={{ fontSize: '2rem' }}>
                        🏛️ CivicSense
                    </Link>
                    <h2 className="mt-md">Create Account</h2>
                    <p style={{ color: 'var(--gray-600)' }}>Join us to report and track civic issues</p>
                </div>

                {errors.general && (
                    <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', padding: 'var(--spacing-md)', borderRadius: 'var(--radius-md)', marginBottom: 'var(--spacing-lg)' }}>
                        {errors.general}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    {/* Name */}
                    <div className="form-group">
                        <label className="form-label">Full Name *</label>
                        <input
                            type="text"
                            name="name"
                            className="form-input"
                            placeholder="John Doe"
                            value={formData.name}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            required
                        />
                        {errors.name && <div className="form-error">{errors.name}</div>}
                    </div>

                    {/* Username */}
                    <div className="form-group">
                        <label className="form-label">Username *</label>
                        <input
                            type="text"
                            name="username"
                            className="form-input"
                            placeholder="johndoe123"
                            value={formData.username}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            required
                        />
                        {errors.username && <div className="form-error">{errors.username}</div>}
                    </div>

                    {/* Email */}
                    <div className="form-group">
                        <label className="form-label">Email Address *</label>
                        <input
                            type="email"
                            name="email"
                            className="form-input"
                            placeholder="john@example.com"
                            value={formData.email}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            required
                        />
                        {errors.email && <div className="form-error">{errors.email}</div>}
                    </div>

                    {/* Phone */}
                    <div className="form-group">
                        <label className="form-label">Phone Number *</label>
                        <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
                            <input
                                type="text"
                                value="+91"
                                disabled
                                className="form-input"
                                style={{ width: '70px' }}
                            />
                            <input
                                type="tel"
                                name="phone"
                                className="form-input"
                                placeholder="9876543210"
                                value={formData.phone}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                pattern="[0-9]{10}"
                                maxLength="10"
                                required
                            />
                        </div>
                        {errors.phone && <div className="form-error">{errors.phone}</div>}
                    </div>

                    {/* Password */}
                    <div className="form-group">
                        <label className="form-label">Password *</label>
                        <input
                            type="password"
                            name="password"
                            className="form-input"
                            placeholder="••••••••"
                            value={formData.password}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            required
                        />
                        {errors.password && <div className="form-error">{errors.password}</div>}
                        <p style={{ fontSize: '0.75rem', color: 'var(--gray-600)', marginTop: 'var(--spacing-xs)' }}>
                            Must contain uppercase, lowercase, and number
                        </p>
                    </div>

                    {/* Confirm Password */}
                    <div className="form-group">
                        <label className="form-label">Confirm Password *</label>
                        <input
                            type="password"
                            name="confirmPassword"
                            className="form-input"
                            placeholder="••••••••"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            required
                        />
                        {errors.confirmPassword && <div className="form-error">{errors.confirmPassword}</div>}
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary w-full"
                        disabled={loading || Object.keys(errors).length > 0}
                    >
                        {loading ? 'Creating Account...' : 'Sign Up'}
                    </button>
                </form>

                <p className="text-center mt-lg" style={{ fontSize: '0.875rem', color: 'var(--gray-600)' }}>
                    Already have an account?{' '}
                    <Link to="/login" style={{ color: 'var(--primary)', fontWeight: '600' }}>
                        Login here
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default Signup;
