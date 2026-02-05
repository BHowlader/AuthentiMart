import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Mail, Lock, Shield, ArrowRight } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import './AdminLoginPage.css'

const AdminLoginPage = () => {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const { login, user, loading: authLoading } = useAuth()
    const navigate = useNavigate()

    // Redirect if already logged in as admin
    useEffect(() => {
        if (!authLoading && user && user.role === 'admin') {
            navigate('/admin')
        }
    }, [user, authLoading, navigate])

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        const result = await login(email, password)

        if (result.success) {
            // Check if the user is an admin after login
            const storedUser = JSON.parse(localStorage.getItem('user'))
            if (storedUser && storedUser.role === 'admin') {
                navigate('/admin')
            } else {
                // Not an admin, show error and clear session
                setError('Access denied. Admin credentials required.')
                localStorage.removeItem('token')
                localStorage.removeItem('user')
                // Also need to reload to reset auth state
                window.location.reload()
            }
        } else {
            setError(result.error ? `${result.error} (Debug: ${JSON.stringify(result)})` : 'Invalid credentials')
        }
        setLoading(false)
    }

    // Show loading while checking auth
    if (authLoading) {
        return (
            <div className="admin-login-page">
                <div className="admin-login-bg">
                    <div className="bg-grid"></div>
                    <div className="bg-glow bg-glow-1"></div>
                    <div className="bg-glow bg-glow-2"></div>
                    <div className="bg-glow bg-glow-3"></div>
                </div>
                <div className="loading-spinner" style={{ width: 40, height: 40 }}></div>
            </div>
        )
    }

    return (
        <div className="admin-login-page">
            {/* Background Effects */}
            <div className="admin-login-bg">
                <div className="bg-grid"></div>
                <div className="bg-glow bg-glow-1"></div>
                <div className="bg-glow bg-glow-2"></div>
                <div className="bg-glow bg-glow-3"></div>
            </div>

            <div className="admin-login-container">
                {/* Left Panel - Branding */}
                <div className="admin-login-branding">
                    <div className="branding-content">
                        <div className="admin-shield-icon">
                            <Shield size={48} strokeWidth={1.5} />
                        </div>
                        <h1>Admin Portal</h1>
                        <p>Secure access to your AuthentiMart management dashboard</p>

                        <div className="admin-features">
                            <div className="admin-feature">
                                <div className="feature-icon">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <rect x="3" y="3" width="7" height="9" />
                                        <rect x="14" y="3" width="7" height="5" />
                                        <rect x="14" y="12" width="7" height="9" />
                                        <rect x="3" y="16" width="7" height="5" />
                                    </svg>
                                </div>
                                <span>Dashboard Analytics</span>
                            </div>
                            <div className="admin-feature">
                                <div className="feature-icon">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="m7.5 4.27 9 5.15" />
                                        <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
                                        <path d="m3.3 7 8.7 5 8.7-5" />
                                        <path d="M12 22V12" />
                                    </svg>
                                </div>
                                <span>Product Management</span>
                            </div>
                            <div className="admin-feature">
                                <div className="feature-icon">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M3 3v18h18" />
                                        <path d="m19 9-5 5-4-4-3 3" />
                                    </svg>
                                </div>
                                <span>Sales Analytics</span>
                            </div>
                            <div className="admin-feature">
                                <div className="feature-icon">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <circle cx="12" cy="12" r="10" />
                                        <path d="M12 6v6l4 2" />
                                    </svg>
                                </div>
                                <span>Real-time Updates</span>
                            </div>
                        </div>
                    </div>

                    <div className="branding-footer">
                        <Link to="/" className="back-to-store">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="m15 18-6-6 6-6" />
                            </svg>
                            Back to Store
                        </Link>
                    </div>
                </div>

                {/* Right Panel - Login Form */}
                <div className="admin-login-form-section">
                    <div className="form-header">
                        <div className="logo-badge">
                            <span className="logo-a">A</span>
                        </div>
                        <h2>Welcome Back, Admin</h2>
                        <p>Enter your credentials to access the dashboard</p>
                    </div>

                    {error && (
                        <div className="admin-error-message">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="10" />
                                <line x1="12" y1="8" x2="12" y2="12" />
                                <line x1="12" y1="16" x2="12.01" y2="16" />
                            </svg>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="admin-login-form">
                        <div className="admin-input-group">
                            <label className="admin-input-label">Email Address</label>
                            <div className="admin-input-wrapper">
                                <Mail size={20} />
                                <input
                                    type="email"
                                    className="admin-input-field"
                                    placeholder="admin@authenticart.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="admin-input-group">
                            <label className="admin-input-label">Password</label>
                            <div className="admin-input-wrapper">
                                <Lock size={20} />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    className="admin-input-field"
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                                <button
                                    type="button"
                                    className="admin-password-toggle"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                        </div>

                        <div className="admin-form-options">
                            <label className="admin-checkbox-label">
                                <input type="checkbox" />
                                <span className="admin-checkmark"></span>
                                Remember this device
                            </label>
                        </div>

                        <button
                            type="submit"
                            className="admin-submit-btn"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <span className="loading-spinner"></span>
                                    Authenticating...
                                </>
                            ) : (
                                <>
                                    Access Dashboard
                                    <ArrowRight size={20} />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="admin-security-notice">
                        <Shield size={16} />
                        <span>Protected by 256-bit SSL encryption</span>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AdminLoginPage
