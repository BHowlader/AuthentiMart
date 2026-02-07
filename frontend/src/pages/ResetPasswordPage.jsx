```javascript
import { useState, useEffect } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import { Lock, Eye, EyeOff, CheckCircle } from 'lucide-react'
import { authAPI } from '../utils/api'
import './AuthPages.css'

const ResetPasswordPage = () => {
    const [searchParams] = useSearchParams()
    const token = searchParams.get('token')
    const navigate = useNavigate()

    const [formData, setFormData] = useState({
        newPassword: '',
        confirmPassword: ''
    })
    const [showPassword, setShowPassword] = useState(false)
    const [status, setStatus] = useState('idle') // idle, loading, success, error
    const [message, setMessage] = useState('')

    useEffect(() => {
        document.body.style.overflow = 'hidden'
        return () => {
            document.body.style.overflow = 'unset'
        }
    }, [])

    const handleSubmit = async (e) => {
        e.preventDefault()
        setStatus('loading')
        setMessage('')

        if (formData.newPassword !== formData.confirmPassword) {
            setStatus('error')
            setMessage('Passwords do not match')
            return
        }

        try {
            await authAPI.resetPassword({
                token: token,
                new_password: formData.newPassword
            })
            setStatus('success')
            // Redirect after 3 seconds
            setTimeout(() => {
                navigate('/login')
            }, 3000)
        } catch (err) {
            setStatus('error')
            setMessage(err.response?.data?.detail || 'Failed to reset password. Token may be invalid or expired.')
        }
    }

    if (!token) {
        return (
            <div className="auth-page">
                <div className="auth-container">
                    <div className="auth-content">
                        <div className="auth-form-section">
                            <div className="error-message">
                                <h2>Invalid Link</h2>
                                <p>The password reset link is invalid or missing a token.</p>
                                <Link to="/forgot-password" className="btn btn-primary btn-block">
                                    Request New Link
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="auth-page">
            <div className="auth-container">
                <div className="auth-content">
                    {/* Left Side - Form */}
                    <div className="auth-form-section">
                        <div className="auth-header">
                            <Link to="/" className="auth-logo">
                                <div className="logo-icon">🛍️</div>
                                <span>AuthentiMart</span>
                            </Link>
                            <h1>Reset Password</h1>
                            <p>Enter your new password below.</p>
                        </div>

                        {status === 'success' ? (
                            <div className="success-message">
                                <CheckCircle size={48} className="success-icon" />
                                <h3>Password Reset Successfully!</h3>
                                <p>You will be redirected to the login page shortly.</p>
                                <Link to="/login" className="btn btn-primary btn-block">
                                    Go to Login
                                </Link>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="auth-form">
                                {status === 'error' && (
                                    <div className="error-message">
                                        {message}
                                    </div>
                                )}

                                <div className="input-group">
                                    <label className="input-label">New Password</label>
                                    <div className="input-wrapper">
                                        <Lock size={20} />
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            className="input-field"
                                            placeholder="Enter new password"
                                            value={formData.newPassword}
                                            onChange={(e) => setFormData({...formData, newPassword: e.target.value})}
                                            required
                                            minLength={8}
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

                                <div className="input-group">
                                    <label className="input-label">Confirm Password</label>
                                    <div className="input-wrapper">
                                        <Lock size={20} />
                                        <input
                                            type="password"
                                            className="input-field"
                                            placeholder="Confirm new password"
                                            value={formData.confirmPassword}
                                            onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                                            required
                                        />
                                    </div>
                                </div>

                                <button 
                                    type="submit" 
                                    className="btn btn-primary btn-lg auth-submit"
                                    disabled={status === 'loading'}
                                >
                                    {status === 'loading' ? 'Resetting...' : 'Reset Password'}
                                </button>
                            </form>
                        )}
                    </div>

                    {/* Right Side - Visual */}
                    <div className="auth-visual">
                        <div className="visual-content">
                            <h2>Secure Your Account</h2>
                            <p>Create a strong password to keep your account safe.</p>
                            <div className="visual-features">
                                <div className="visual-feature">
                                    <span className="feature-check">✓</span>
                                    At least 8 characters long
                                </div>
                                <div className="visual-feature">
                                    <span className="feature-check">✓</span>
                                    Mix of letters and numbers
                                </div>
                                <div className="visual-feature">
                                    <span className="feature-check">✓</span>
                                    Unique and hard to guess
                                </div>
                            </div>
                        </div>
                        <div className="visual-decoration">
                            <div className="float-card card-1">🔒 Secure</div>
                            <div className="float-card card-2">🔑 Access</div>
                            <div className="float-card card-3">✅ Done</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ResetPasswordPage
