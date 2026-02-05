import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Mail, Lock, User, Phone, ArrowRight } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import './AuthPages.css'

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

    const { register } = useAuth()
    const navigate = useNavigate()

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

        if (result.success) {
            navigate('/')
        }

        setLoading(false)
    }

    return (
        <div className="auth-page">
            <div className="auth-container">
                <div className="auth-content">
                    {/* Left Side - Form */}
                    <div className="auth-form-section">
                        <div className="auth-header">
                            <Link to="/" className="auth-logo">
                                <div className="logo-icon">A</div>
                                <span>AuthentiMart</span>
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
