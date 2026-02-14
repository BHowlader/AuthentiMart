import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Mail, Lock, Shield, ArrowRight } from 'lucide-react'
import { useAdminAuth } from '../../context/AdminAuthContext'
import './AdminLoginPage.css'

const AdminLoginPage = () => {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const { adminLogin, admin, loading: authLoading } = useAdminAuth()
    const navigate = useNavigate()

    // Redirect if already logged in as admin
    useEffect(() => {
        if (!authLoading && admin) {
            navigate('/admin')
        }
    }, [admin, authLoading, navigate])

    useEffect(() => {
        // Disable scroll on mount
        document.body.style.overflow = 'hidden'
        return () => {
            // Enable scroll on unmount
            document.body.style.overflow = 'unset'
        }
    }, [])

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        const result = await adminLogin(email, password)

        if (result.success) {
            navigate('/admin')
        } else {
            setError(result.error || 'Invalid credentials')
        }
        setLoading(false)
    }

    // Show loading while checking auth
    if (authLoading) {
        return (
            <div className="auth-page admin-auth-page">
                <div className="auth-container">
                    <div className="loading-state">
                        <div className="spinner"></div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="auth-page admin-auth-page">
            <div className="auth-container">
                <div className="auth-content">
                    {/* Left Side - Form */}
                    <div className="auth-form-section">
                        <div className="auth-header">
                            <div className="auth-logo">
                                <div className="logo-icon">🛡️</div>
                                <span>AuthentiMart Admin</span>
                            </div>
                            <h1>Welcome Back, Admin</h1>
                            <p>Enter your credentials to access the dashboard</p>
                        </div>

                        {error && (
                            <div className="auth-error-message">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="12" cy="12" r="10" />
                                    <line x1="12" y1="8" x2="12" y2="12" />
                                    <line x1="12" y1="16" x2="12.01" y2="16" />
                                </svg>
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="auth-form">
                            <div className="input-group">
                                <label className="input-label">Email Address</label>
                                <div className="input-wrapper">
                                    <Mail size={20} />
                                    <input
                                        type="email"
                                        className="input-field"
                                        placeholder="admin@authenticart.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="input-group">
                                <label className="input-label">Password</label>
                                <div className="input-wrapper">
                                    <Lock size={20} />
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        className="input-field"
                                        placeholder="Enter your password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                    <button
                                        type="button"
                                        className="password-toggle"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                </div>
                            </div>

                            <div className="auth-options">
                                <label className="checkbox-label">
                                    <input type="checkbox" />
                                    <span className="checkmark"></span>
                                    Remember this device
                                </label>
                            </div>

                            <button
                                type="submit"
                                className="btn btn-primary btn-lg auth-submit"
                                disabled={loading}
                            >
                                {loading ? 'Authenticating...' : 'Access Dashboard'}
                                <ArrowRight size={20} />
                            </button>
                        </form>

                        <div className="admin-security-notice">
                            <Shield size={16} />
                            <span>Protected by 256-bit SSL encryption</span>
                        </div>

                        <p className="auth-footer">
                            <Link to="/">← Back to Store</Link>
                        </p>
                    </div>

                    {/* Right Side - Visual */}
                    <div className="auth-visual admin-visual">
                        <div className="visual-content">
                            <h2>Admin Dashboard</h2>
                            <p>Manage your AuthentiMart store with powerful tools and real-time analytics.</p>
                            <div className="visual-features">
                                <div className="visual-feature">
                                    <span className="feature-check">✓</span>
                                    Dashboard Analytics
                                </div>
                                <div className="visual-feature">
                                    <span className="feature-check">✓</span>
                                    Product Management
                                </div>
                                <div className="visual-feature">
                                    <span className="feature-check">✓</span>
                                    Order Processing
                                </div>
                                <div className="visual-feature">
                                    <span className="feature-check">✓</span>
                                    Real-time Updates
                                </div>
                            </div>
                        </div>
                        <div className="visual-decoration">
                            <div className="float-card card-1">📊 Analytics</div>
                            <div className="float-card card-2">📦 Orders</div>
                            <div className="float-card card-3">👥 Customers</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AdminLoginPage
