import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Mail, Lock, User, Phone, ArrowRight } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import './AuthPages.css'
import { useGoogleLogin } from '@react-oauth/google'
import FacebookLogin from 'react-facebook-login/dist/facebook-login-render-props'

const RegisterPage = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: ''
    })
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const [errors, setErrors] = useState({})

    const { register, socialLogin } = useAuth()
    const navigate = useNavigate()

    // Social Login Handlers
    const handleGoogleLogin = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            setLoading(true)
            await socialLogin('google', tokenResponse.access_token)
            setLoading(false)
            navigate('/')
        },
        onError: () => console.log('Google Login Failed'),
    })

    const responseFacebook = async (response) => {
        if (response.accessToken) {
            setLoading(true)
            await socialLogin('facebook', response.accessToken)
            setLoading(false)
            navigate('/')
        }
    }

    useEffect(() => {
        // Disable scroll on mount
        document.body.style.overflow = 'hidden'
        return () => {
            // Enable scroll on unmount
            document.body.style.overflow = 'unset'
        }
    }, [])

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
        // Clear error when user types
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }))
        }
    }

    const validate = () => {
        const newErrors = {}

        if (!formData.name.trim()) {
            newErrors.name = 'Name is required'
        }

        if (!formData.email.trim()) {
            newErrors.email = 'Email is required'
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Email is invalid'
        }

        // Phone is optional for social login but required for manual register
        // But here we are validating manual register form
        if (!formData.phone.trim()) {
            newErrors.phone = 'Phone number is required'
        } else if (!/^01[3-9]\d{8}$/.test(formData.phone)) {
            newErrors.phone = 'Enter a valid Bangladesh phone number'
        }

        if (!formData.password) {
            newErrors.password = 'Password is required'
        } else if (formData.password.length < 8) {
            newErrors.password = 'Password must be at least 8 characters'
        }

        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match'
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!validate()) return

        setLoading(true)

        const result = await register({
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            password: formData.password
        })

        setLoading(false)

        if (result.success) {
            navigate('/')
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
                            <h1>Create account</h1>
                            <p>Join us and start shopping authentic products</p>
                        </div>

                        <form onSubmit={handleSubmit} className="auth-form">
                            <div className="input-group">
                                <label className="input-label">Full Name</label>
                                <div className={`input-wrapper ${errors.name ? 'error' : ''}`}>
                                    <User size={20} />
                                    <input
                                        type="text"
                                        name="name"
                                        className="input-field"
                                        placeholder="Enter your full name"
                                        value={formData.name}
                                        onChange={handleChange}
                                    />
                                </div>
                                {errors.name && <span className="error-message">{errors.name}</span>}
                            </div>

                            <div className="input-row">
                                <div className="input-group">
                                    <label className="input-label">Email Address</label>
                                    <div className={`input-wrapper ${errors.email ? 'error' : ''}`}>
                                        <Mail size={20} />
                                        <input
                                            type="email"
                                            name="email"
                                            className="input-field"
                                            placeholder="Enter your email"
                                            value={formData.email}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    {errors.email && <span className="error-message">{errors.email}</span>}
                                </div>

                                <div className="input-group">
                                    <label className="input-label">Phone Number</label>
                                    <div className={`input-wrapper ${errors.phone ? 'error' : ''}`}>
                                        <Phone size={20} />
                                        <input
                                            type="tel"
                                            name="phone"
                                            className="input-field"
                                            placeholder="01XXXXXXXXX"
                                            value={formData.phone}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    {errors.phone && <span className="error-message">{errors.phone}</span>}
                                </div>
                            </div>

                            <div className="input-row">
                                <div className="input-group">
                                    <label className="input-label">Password</label>
                                    <div className={`input-wrapper ${errors.password ? 'error' : ''}`}>
                                        <Lock size={20} />
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            name="password"
                                            className="input-field"
                                            placeholder="Create password"
                                            value={formData.password}
                                            onChange={handleChange}
                                        />
                                        <button
                                            type="button"
                                            className="password-toggle"
                                            onClick={() => setShowPassword(!showPassword)}
                                        >
                                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                        </button>
                                    </div>
                                    {errors.password && <span className="error-message">{errors.password}</span>}
                                </div>

                                <div className="input-group">
                                    <label className="input-label">Confirm Password</label>
                                    <div className={`input-wrapper ${errors.confirmPassword ? 'error' : ''}`}>
                                        <Lock size={20} />
                                        <input
                                            type={showConfirmPassword ? 'text' : 'password'}
                                            name="confirmPassword"
                                            className="input-field"
                                            placeholder="Confirm password"
                                            value={formData.confirmPassword}
                                            onChange={handleChange}
                                        />
                                        <button
                                            type="button"
                                            className="password-toggle"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        >
                                            {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                        </button>
                                    </div>
                                    {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
                                </div>
                            </div>

                            <label className="checkbox-label terms-checkbox">
                                <input type="checkbox" required />
                                <span className="checkmark"></span>
                                I agree to the <Link to="/terms">Terms of Service</Link> and <Link to="/privacy">Privacy Policy</Link>
                            </label>

                            <button
                                type="submit"
                                className="btn btn-primary btn-lg auth-submit"
                                disabled={loading}
                            >
                                {loading ? 'Creating account...' : 'Create Account'}
                                <ArrowRight size={20} />
                            </button>
                        </form>

                        <div className="auth-divider">
                            <span>or join with</span>
                        </div>

                        <div className="social-login">
                            <button
                                type="button"
                                className="btn btn-secondary social-btn"
                                onClick={() => handleGoogleLogin()}
                            >
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                </svg>
                                Google
                            </button>

                            <FacebookLogin
                                appId={import.meta.env.VITE_FACEBOOK_APP_ID || "YOUR_FACEBOOK_APP_ID"}
                                autoLoad={false}
                                fields="name,email,picture"
                                callback={responseFacebook}
                                render={renderProps => (
                                    <button
                                        type="button"
                                        className="btn btn-secondary social-btn"
                                        onClick={renderProps.onClick}
                                    >
                                        <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                                        </svg>
                                        Facebook
                                    </button>
                                )}
                            />
                        </div>

                        <p className="auth-footer">
                            Already have an account?{' '}
                            <Link to="/login">Sign in</Link>
                        </p>
                    </div>

                    {/* Right Side - Visual */}
                    <div className="auth-visual register-visual">
                        <div className="visual-content">
                            <h2>Join AuthentiMart Today</h2>
                            <p>Create your account and enjoy exclusive benefits.</p>
                            <div className="visual-features">
                                <div className="visual-feature">
                                    <span className="feature-check">✓</span>
                                    Exclusive member discounts
                                </div>
                                <div className="visual-feature">
                                    <span className="feature-check">✓</span>
                                    Early access to sales
                                </div>
                                <div className="visual-feature">
                                    <span className="feature-check">✓</span>
                                    Track orders easily
                                </div>
                                <div className="visual-feature">
                                    <span className="feature-check">✓</span>
                                    Save favorite products
                                </div>
                            </div>
                        </div>
                        <div className="visual-decoration">
                            <div className="float-card card-1">🎉 Welcome!</div>
                            <div className="float-card card-2">🛒 Shop Now</div>
                            <div className="float-card card-3">💯 Authentic</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default RegisterPage
