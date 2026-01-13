import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signInWithEmail, signInWithUsername, sendOTP, verifyOTP, signInAsGuest } from '../services/authService';
import { validateEmail, validatePhone } from '../utils/helpers';

const Login = () => {
    const navigate = useNavigate();
    const [loginMethod, setLoginMethod] = useState('email'); // 'email', 'username', 'phone'
    const [step, setStep] = useState('credentials'); // 'credentials' or 'otp'

    const [formData, setFormData] = useState({
        identifier: '', // email, username, or phone
        password: '',
        otp: ''
    });

    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [confirmationResult, setConfirmationResult] = useState(null);

    // Real-time validation
    const validateField = (name, value) => {
        const newErrors = { ...errors };

        if (name === 'identifier') {
            if (!value.trim()) {
                newErrors.identifier = `${loginMethod === 'email' ? 'Email' : loginMethod === 'username' ? 'Username' : 'Phone'} is required`;
            } else {
                if (loginMethod === 'email' && !validateEmail(value)) {
                    newErrors.identifier = 'Please enter a valid email address';
                } else if (loginMethod === 'phone' && !validatePhone(value)) {
                    newErrors.identifier = 'Please enter a valid 10-digit phone number';
                } else if (loginMethod === 'username' && value.length < 3) {
                    newErrors.identifier = 'Username must be at least 3 characters';
                } else {
                    delete newErrors.identifier;
                }
            }
        }

        if (name === 'password') {
            if (!value) {
                newErrors.password = 'Password is required';
            } else if (value.length < 6) {
                newErrors.password = 'Password must be at least 6 characters';
            } else {
                delete newErrors.password;
            }
        }

        if (name === 'otp') {
            if (!value) {
                newErrors.otp = 'OTP is required';
            } else if (value.length !== 6) {
                newErrors.otp = 'OTP must be 6 digits';
            } else if (!/^\d+$/.test(value)) {
                newErrors.otp = 'OTP must contain only numbers';
            } else {
                delete newErrors.otp;
            }
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

    const handleMethodChange = (method) => {
        setLoginMethod(method);
        setFormData({ identifier: '', password: '', otp: '' });
        setErrors({});
        setStep('credentials');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate fields
        validateField('identifier', formData.identifier);
        if (loginMethod !== 'phone') {
            validateField('password', formData.password);
        }

        if (Object.keys(errors).length > 0) {
            return;
        }

        setLoading(true);

        try {
            if (loginMethod === 'phone') {
                // Send OTP
                const result = await sendOTP(formData.identifier);
                setConfirmationResult(result);
                setStep('otp');
            } else if (loginMethod === 'email') {
                // Sign in with email
                await signInWithEmail(formData.identifier, formData.password);
                navigate('/report');
            } else if (loginMethod === 'username') {
                // Sign in with username
                await signInWithUsername(formData.identifier, formData.password);
                navigate('/report');
            }
        } catch (error) {
            const newErrors = {};

            if (error.code === 'auth/user-not-found') {
                newErrors.identifier = 'Account not found';
            } else if (error.code === 'auth/wrong-password') {
                newErrors.password = 'Incorrect password';
            } else if (error.code === 'auth/invalid-email') {
                newErrors.identifier = 'Invalid email address';
            } else if (error.code === 'auth/too-many-requests') {
                newErrors.general = 'Too many failed attempts. Please try again later.';
            } else if (error.message === 'Username not found') {
                newErrors.identifier = 'Username not found';
            } else {
                newErrors.general = error.message || 'Failed to sign in. Please try again.';
            }

            setErrors(newErrors);
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOTP = async (e) => {
        e.preventDefault();

        validateField('otp', formData.otp);

        if (errors.otp) {
            return;
        }

        setLoading(true);

        try {
            await verifyOTP(confirmationResult, formData.otp);
            navigate('/report');
        } catch (error) {
            const newErrors = {};

            if (error.code === 'auth/invalid-verification-code') {
                newErrors.otp = 'Invalid OTP. Please try again.';
            } else if (error.code === 'auth/code-expired') {
                newErrors.otp = 'OTP expired. Please request a new one.';
            } else {
                newErrors.general = 'Failed to verify OTP. Please try again.';
            }

            setErrors(newErrors);
        } finally {
            setLoading(false);
        }
    };

    const handleGuestLogin = async () => {
        setLoading(true);
        try {
            await signInAsGuest();
            navigate('/report');
        } catch (error) {
            setErrors({ general: 'Failed to sign in as guest.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ minHeight: '100vh', background: 'var(--gradient-hero)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'var(--spacing-lg)' }}>
            <div className="card" style={{ maxWidth: '500px', width: '100%' }}>
                <div className="text-center mb-xl">
                    <Link to="/" className="navbar-logo" style={{ fontSize: '2rem' }}>
                        🏛️ CivicSense
                    </Link>
                    <h2 className="mt-md">Welcome Back</h2>
                    <p style={{ color: 'var(--gray-600)' }}>Sign in to report and track issues</p>
                </div>

                {errors.general && (
                    <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', padding: 'var(--spacing-md)', borderRadius: 'var(--radius-md)', marginBottom: 'var(--spacing-lg)' }}>
                        {errors.general}
                    </div>
                )}

                {step === 'credentials' ? (
                    <>
                        {/* Login Method Tabs */}
                        <div className="flex gap-sm mb-lg" style={{ borderBottom: '2px solid var(--gray-200)' }}>
                            <button
                                type="button"
                                className={`btn ${loginMethod === 'email' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
                                onClick={() => handleMethodChange('email')}
                                style={{ borderRadius: '0', borderBottom: loginMethod === 'email' ? '2px solid var(--primary)' : 'none' }}
                            >
                                📧 Email
                            </button>
                            <button
                                type="button"
                                className={`btn ${loginMethod === 'username' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
                                onClick={() => handleMethodChange('username')}
                                style={{ borderRadius: '0', borderBottom: loginMethod === 'username' ? '2px solid var(--primary)' : 'none' }}
                            >
                                👤 Username
                            </button>
                            <button
                                type="button"
                                className={`btn ${loginMethod === 'phone' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
                                onClick={() => handleMethodChange('phone')}
                                style={{ borderRadius: '0', borderBottom: loginMethod === 'phone' ? '2px solid var(--primary)' : 'none' }}
                            >
                                📱 Phone
                            </button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            {/* Identifier Field */}
                            <div className="form-group">
                                <label className="form-label">
                                    {loginMethod === 'email' ? 'Email Address' : loginMethod === 'username' ? 'Username' : 'Phone Number'}
                                </label>

                                {loginMethod === 'phone' ? (
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
                                            name="identifier"
                                            className="form-input"
                                            placeholder="9876543210"
                                            value={formData.identifier}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            pattern="[0-9]{10}"
                                            maxLength="10"
                                            required
                                        />
                                    </div>
                                ) : (
                                    <input
                                        type={loginMethod === 'email' ? 'email' : 'text'}
                                        name="identifier"
                                        className="form-input"
                                        placeholder={
                                            loginMethod === 'email'
                                                ? 'john@example.com'
                                                : 'johndoe123'
                                        }
                                        value={formData.identifier}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        required
                                    />
                                )}

                                {errors.identifier && <div className="form-error">{errors.identifier}</div>}
                            </div>

                            {/* Password Field (not for phone) */}
                            {loginMethod !== 'phone' && (
                                <div className="form-group">
                                    <label className="form-label">Password</label>
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
                                </div>
                            )}

                            <button
                                type="submit"
                                className="btn btn-primary w-full"
                                disabled={loading || Object.keys(errors).length > 0}
                            >
                                {loading ? (loginMethod === 'phone' ? 'Sending OTP...' : 'Signing in...') : (loginMethod === 'phone' ? 'Send OTP' : 'Sign In')}
                            </button>
                        </form>
                    </>
                ) : (
                    // OTP Verification Step
                    <form onSubmit={handleVerifyOTP}>
                        <div className="form-group">
                            <label className="form-label">Enter OTP</label>
                            <input
                                type="text"
                                name="otp"
                                className="form-input"
                                placeholder="123456"
                                value={formData.otp}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                pattern="[0-9]{6}"
                                maxLength="6"
                                required
                                autoFocus
                            />
                            <p style={{ fontSize: '0.875rem', color: 'var(--gray-600)', marginTop: 'var(--spacing-sm)' }}>
                                OTP sent to +91{formData.identifier}
                            </p>
                            {errors.otp && <div className="form-error">{errors.otp}</div>}
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary w-full"
                            disabled={loading || errors.otp}
                        >
                            {loading ? 'Verifying...' : 'Verify & Login'}
                        </button>

                        <button
                            type="button"
                            className="btn btn-secondary w-full mt-md"
                            onClick={() => setStep('credentials')}
                        >
                            Change Number
                        </button>
                    </form>
                )}

                <div style={{ margin: 'var(--spacing-xl) 0', textAlign: 'center', color: 'var(--gray-500)' }}>
                    OR
                </div>

                <button
                    className="btn btn-secondary w-full"
                    onClick={handleGuestLogin}
                    disabled={loading}
                >
                    🚶 Continue as Guest
                </button>

                <div id="recaptcha-container"></div>

                <p className="text-center mt-lg" style={{ fontSize: '0.875rem', color: 'var(--gray-600)' }}>
                    Don't have an account?{' '}
                    <Link to="/signup" style={{ color: 'var(--primary)', fontWeight: '600' }}>
                        Sign up here
                    </Link>
                </p>

                <p className="text-center mt-md" style={{ fontSize: '0.875rem', color: 'var(--gray-600)' }}>
                    <Link to="/" style={{ color: 'var(--primary)' }}>← Back to Home</Link>
                </p>
            </div>
        </div>
    );
};

export default Login;
