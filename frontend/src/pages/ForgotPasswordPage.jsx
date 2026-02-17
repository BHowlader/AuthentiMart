import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Mail, ArrowLeft, Send } from 'lucide-react'
import { authAPI } from '../utils/api'
import './AuthPages.css'

const ForgotPasswordPage = () => {
    const [email, setEmail] = useState('')
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

        try {
            const response = await authAPI.forgotPassword({ email })
            setStatus('success')
            setMessage(response.data.message || 'If this email is registered, you will receive password reset instructions.')
        } catch (err) {
            setStatus('error')
            setMessage(err.response?.data?.detail || 'Something went wrong. Please try again.')
        }
    }

    return (
        <div className="auth-page">
            <div className="auth-container">
                <div className="auth-content">
                    {/* Left Side - Form */}
                    <div className="auth-form-section">
                        <div className="auth-header">
                            <Link to="/" className="auth-logo">
                                <img src="/logo.png" alt="AuthentiMart" className="auth-logo-image" />
                            </Link>
                            <h1>Forgot Password?</h1>
                            <p>Enter your email address to reset your password.</p>
                        </div>

                        {status === 'success' ? (
                            <div className="success-message">
                                <div className="success-icon">
                                    <Send size={48} />
                                </div>
                                <h3>Check your email</h3>
                                <p>{message}</p>
                                <Link to="/login" className="btn btn-primary btn-block">
                                    Back to Login
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
                                    <label className="input-label">Email Address</label>
                                    <div className="input-wrapper">
                                        <Mail size={20} />
                                        <input
                                            type="email"
                                            className="input-field"
                                            placeholder="Enter your email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    className="btn btn-primary btn-lg auth-submit"
                                    disabled={status === 'loading'}
                                >
                                    {status === 'loading' ? 'Sending...' : 'Send Reset Link'}
                                </button>

                                <div className="auth-footer">
                                    <Link to="/login" className="back-link">
                                        <ArrowLeft size={16} />
                                        Back to Login
                                    </Link>
                                </div>
                            </form>
                        )}
                    </div>

                    {/* Right Side - Visual */}
                    <div className="auth-visual">
                        <div className="visual-content">
                            <h2>Recovery Made Simple</h2>
                            <p>Don't worry, we'll help you get back into your account in no time.</p>
                            <div className="visual-features">
                                <div className="visual-feature">
                                    <span className="feature-check">1</span>
                                    Enter your registered email
                                </div>
                                <div className="visual-feature">
                                    <span className="feature-check">2</span>
                                    Check your inbox for the link
                                </div>
                                <div className="visual-feature">
                                    <span className="feature-check">3</span>
                                    Set a new strong password
                                </div>
                            </div>
                        </div>
                        <div className="visual-decoration">
                            <div className="float-card card-1">🔒 Secure</div>
                            <div className="float-card card-2">⚡ Fast</div>
                            <div className="float-card card-3">🛡️ Safe</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ForgotPasswordPage
