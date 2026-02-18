import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight, Mail, MapPin, Clock, Send } from 'lucide-react'
import './StaticPages.css'

// Change this to your actual email address
const SUPPORT_EMAIL = 'bibekhowlader8@gmail.com'

const ContactPage = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    })

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleSubmit = (e) => {
        e.preventDefault()

        // Build mailto link
        const subjectMap = {
            'order': 'Order Inquiry',
            'product': 'Product Question',
            'return': 'Return/Refund Request',
            'shipping': 'Shipping Issue',
            'feedback': 'Feedback',
            'other': 'General Inquiry'
        }

        const emailSubject = subjectMap[formData.subject] || 'Contact Form Inquiry'
        const emailBody = `Name: ${formData.name}
Email: ${formData.email}

Message:
${formData.message}`

        const mailtoLink = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`

        // Open email client
        window.location.href = mailtoLink
    }

    return (
        <div className="static-page">
            <div className="container">
                {/* Breadcrumb */}
                <nav className="breadcrumb">
                    <Link to="/">Home</Link>
                    <ChevronRight size={16} />
                    <span>Contact Us</span>
                </nav>

                <div className="static-page-content">
                    <h1 className="static-page-title">Contact Us</h1>
                    <p className="static-page-subtitle">
                        Have a question or need assistance? We're here to help. Reach out to us through any of the channels below.
                    </p>

                    <div className="contact-grid">
                        {/* Contact Info */}
                        <div className="contact-info">
                            <a href={`mailto:${SUPPORT_EMAIL}`} className="contact-card glass-card clickable">
                                <div className="contact-icon">
                                    <Mail size={24} />
                                </div>
                                <div className="contact-details">
                                    <h3>Email</h3>
                                    <p>{SUPPORT_EMAIL}</p>
                                    <span>We respond within 24 hours</span>
                                </div>
                            </a>

                            <div className="contact-card glass-card">
                                <div className="contact-icon">
                                    <MapPin size={24} />
                                </div>
                                <div className="contact-details">
                                    <h3>Location</h3>
                                    <p>Dhaka, Bangladesh</p>
                                    <span>Serving nationwide</span>
                                </div>
                            </div>

                            <div className="contact-card glass-card">
                                <div className="contact-icon">
                                    <Clock size={24} />
                                </div>
                                <div className="contact-details">
                                    <h3>Business Hours</h3>
                                    <p>Saturday - Thursday</p>
                                    <span>10:00 AM - 8:00 PM</span>
                                </div>
                            </div>
                        </div>

                        {/* Contact Form */}
                        <div className="contact-form-container glass-card">
                            <h2>Send Us a Message</h2>
                            <p>Fill out the form below to compose an email to our support team.</p>

                            <form className="contact-form" onSubmit={handleSubmit}>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="name">Your Name</label>
                                        <input
                                            type="text"
                                            id="name"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            placeholder="John Doe"
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="email">Email Address</label>
                                        <input
                                            type="email"
                                            id="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            placeholder="john@example.com"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label htmlFor="subject">Subject</label>
                                    <select
                                        id="subject"
                                        name="subject"
                                        value={formData.subject}
                                        onChange={handleChange}
                                        required
                                    >
                                        <option value="">Select a subject</option>
                                        <option value="order">Order Inquiry</option>
                                        <option value="product">Product Question</option>
                                        <option value="return">Return/Refund</option>
                                        <option value="shipping">Shipping Issue</option>
                                        <option value="feedback">Feedback</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label htmlFor="message">Your Message</label>
                                    <textarea
                                        id="message"
                                        name="message"
                                        value={formData.message}
                                        onChange={handleChange}
                                        placeholder="How can we help you?"
                                        rows="5"
                                        required
                                    ></textarea>
                                </div>

                                <button
                                    type="submit"
                                    className="btn btn-primary btn-lg"
                                >
                                    <Send size={18} />
                                    Open Email Client
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div className="quick-links-section">
                        <h2>Quick Links</h2>
                        <div className="quick-links-grid">
                            <Link to="/faq" className="quick-link-card glass-card">
                                <h3>FAQ</h3>
                                <p>Find answers to common questions</p>
                            </Link>
                            <Link to="/returns" className="quick-link-card glass-card">
                                <h3>Returns & Refunds</h3>
                                <p>Learn about our return policy</p>
                            </Link>
                            <Link to="/orders" className="quick-link-card glass-card">
                                <h3>Track Order</h3>
                                <p>Check your order status</p>
                            </Link>
                            <Link to="/size-guide" className="quick-link-card glass-card">
                                <h3>Size Guide</h3>
                                <p>Find your perfect fit</p>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ContactPage
