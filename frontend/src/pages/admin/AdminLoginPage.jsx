import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Mail, Lock, Shield, ArrowRight } from 'lucide-react'
import { useAdminAuth } from '../../context/AdminAuthContext'
import { useGoogleLogin } from '@react-oauth/google'
import './AdminLoginPage.css'
import { ADMIN_PATH } from '../../config/adminConfig'

const AdminLoginPage = () => {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const { adminLogin, adminGoogleLogin, admin, loading: authLoading } = useAdminAuth()
    const navigate = useNavigate()

    // Google Login
    const handleGoogleLogin = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            setLoading(true)
            setError('')
            const result = await adminGoogleLogin(tokenResponse.access_token)
            if (result.success) {
                navigate(ADMIN_PATH)
            } else {
                setError(result.error || 'Google login failed')
            }
            setLoading(false)
        },
        onError: () => {
            setError('Google login failed')
        },
    })

    // Redirect if already logged in as admin
    useEffect(() => {
        if (!authLoading && admin) {
            navigate(ADMIN_PATH)
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
            navigate(ADMIN_PATH)
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

                        <div className="auth-divider">
                            <span>or continue with</span>
                        </div>

                        <div className="social-login">
                            <button
                                type="button"
                                className="btn btn-secondary social-btn"
                                onClick={() => handleGoogleLogin()}
                                disabled={loading}
                            >
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                </svg>
                                Google
                            </button>
                        </div>

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
