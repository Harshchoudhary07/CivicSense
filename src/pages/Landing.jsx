import React from 'react';
import { Link } from 'react-router-dom';

const Landing = () => {
    return (
        <div className="landing">
            {/* Navbar */}
            <nav className="navbar">
                <div className="container navbar-content">
                    <Link to="/" className="navbar-logo">
                        🏛️ CivicSense
                    </Link>
                    <ul className="navbar-menu">
                        <li><Link to="/nearby" className="navbar-link">Nearby Issues</Link></li>
                        <li><Link to="/login" className="navbar-link">Login</Link></li>
                        <li><Link to="/report" className="btn btn-primary btn-sm">Report Issue</Link></li>
                    </ul>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="hero">
                <div className="container hero-content fade-in">
                    <h1>Report. Track. Resolve.</h1>
                    <p>
                        Empowering citizens to make their communities better, one issue at a time.
                        Report civic problems and track their resolution in real-time.
                    </p>
                    <div className="flex-center gap-md">
                        <Link to="/report" className="btn btn-primary btn-lg">
                            📝 Report an Issue
                        </Link>
                        <Link to="/nearby" className="btn btn-secondary btn-lg">
                            🗺️ View Nearby Issues
                        </Link>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="container mt-2xl">
                <div className="stats">
                    <div className="stat-card fade-in">
                        <div className="stat-value">1,247</div>
                        <div className="stat-label">Issues Reported</div>
                    </div>
                    <div className="stat-card fade-in">
                        <div className="stat-value">892</div>
                        <div className="stat-label">Issues Resolved</div>
                    </div>
                    <div className="stat-card fade-in">
                        <div className="stat-value">71%</div>
                        <div className="stat-label">Resolution Rate</div>
                    </div>
                    <div className="stat-card fade-in">
                        <div className="stat-value">4.2</div>
                        <div className="stat-label">Avg. Rating</div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="container mt-2xl mb-2xl">
                <h2 className="text-center mb-xl">How It Works</h2>
                <div className="grid grid-3">
                    <div className="card text-center fade-in">
                        <div className="category-icon category-road" style={{ margin: '0 auto' }}>
                            📱
                        </div>
                        <h3>Report Issue</h3>
                        <p>
                            Take a photo, add location, and submit your complaint in seconds.
                            Our smart system categorizes and prioritizes automatically.
                        </p>
                    </div>
                    <div className="card text-center fade-in">
                        <div className="category-icon category-water" style={{ margin: '0 auto' }}>
                            👁️
                        </div>
                        <h3>Track Progress</h3>
                        <p>
                            Get real-time updates on your complaint status. See when it's
                            assigned, in progress, and finally resolved.
                        </p>
                    </div>
                    <div className="card text-center fade-in">
                        <div className="category-icon category-garbage" style={{ margin: '0 auto' }}>
                            ⭐
                        </div>
                        <h3>Rate Service</h3>
                        <p>
                            Once resolved, rate the service and help us improve. Your
                            feedback makes the system better for everyone.
                        </p>
                    </div>
                </div>
            </section>

            {/* Categories Section */}
            <section className="container mb-2xl">
                <h2 className="text-center mb-xl">Report Categories</h2>
                <div className="grid grid-4">
                    <div className="card text-center card-glass">
                        <div className="category-icon category-road" style={{ margin: '0 auto' }}>
                            🛣️
                        </div>
                        <h4>Road Issues</h4>
                        <p>Potholes, damaged roads, traffic signals</p>
                    </div>
                    <div className="card text-center card-glass">
                        <div className="category-icon category-water" style={{ margin: '0 auto' }}>
                            💧
                        </div>
                        <h4>Water Supply</h4>
                        <p>Leaks, water shortage, quality issues</p>
                    </div>
                    <div className="card text-center card-glass">
                        <div className="category-icon category-garbage" style={{ margin: '0 auto' }}>
                            🗑️
                        </div>
                        <h4>Garbage</h4>
                        <p>Waste collection, littering, sanitation</p>
                    </div>
                    <div className="card text-center card-glass">
                        <div className="category-icon category-electricity" style={{ margin: '0 auto' }}>
                            ⚡
                        </div>
                        <h4>Electricity</h4>
                        <p>Power outages, street lights, wiring</p>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="hero" style={{ padding: '3rem 0' }}>
                <div className="container text-center">
                    <h2>Ready to Make a Difference?</h2>
                    <p className="mb-xl">Join thousands of citizens making their community better</p>
                    <Link to="/report" className="btn btn-primary btn-lg">
                        Get Started Now
                    </Link>
                </div>
            </section>

            {/* Footer */}
            <footer style={{ background: 'var(--gray-900)', color: 'white', padding: '2rem 0', textAlign: 'center' }}>
                <div className="container">
                    <div className="flex-between" style={{ flexWrap: 'wrap', gap: '2rem' }}>
                        <div>
                            <h3 style={{ color: 'white' }}>🏛️ CivicSense</h3>
                            <p style={{ opacity: 0.8 }}>Building better communities together</p>
                        </div>
                        <div>
                            <p style={{ opacity: 0.8 }}>
                                <Link to="/officer/login" style={{ color: 'white', marginRight: '1rem' }}>Officer Login</Link>
                                <Link to="/admin/dashboard" style={{ color: 'white' }}>Admin Portal</Link>
                            </p>
                        </div>
                    </div>
                    <p style={{ marginTop: '2rem', opacity: 0.6 }}>
                        © 2026 CivicSense Platform. All rights reserved.
                    </p>
                </div>
            </footer>
        </div>
    );
};

export default Landing;
