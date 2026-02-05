import { Link } from 'react-router-dom'
import {
    Facebook,
    Instagram,
    Twitter,
    Youtube,
    Mail,
    Phone,
    MapPin,
    CreditCard,
    Truck,
    Shield,
    HeadphonesIcon
} from 'lucide-react'
import './Footer.css'

const Footer = () => {
    const currentYear = new Date().getFullYear()

    return (
        <footer className="footer">
            {/* Features Strip */}
            <div className="footer-features">
                <div className="container">
                    <div className="features-grid">
                        <div className="feature-item glass-card">
                            <div className="feature-icon">
                                <Truck size={24} />
                            </div>
                            <div>
                                <h4>Free Shipping</h4>
                                <p>On orders over ৳5,000</p>
                            </div>
                        </div>
                        <div className="feature-item glass-card">
                            <div className="feature-icon">
                                <Shield size={24} />
                            </div>
                            <div>
                                <h4>100% Authentic</h4>
                                <p>Genuine products only</p>
                            </div>
                        </div>
                        <div className="feature-item glass-card">
                            <div className="feature-icon">
                                <CreditCard size={24} />
                            </div>
                            <div>
                                <h4>Secure Payment</h4>
                                <p>bKash, Visa, Mastercard</p>
                            </div>
                        </div>
                        <div className="feature-item glass-card">
                            <div className="feature-icon">
                                <HeadphonesIcon size={24} />
                            </div>
                            <div>
                                <h4>24/7 Support</h4>
                                <p>Dedicated assistance</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Footer */}
            <div className="footer-main">
                <div className="container">
                    <div className="footer-grid">
                        {/* Brand Column */}
                        <div className="footer-brand">
                            <Link to="/" className="footer-logo">
                                <div className="logo-icon">🛍️</div>
                                <span>AuthentiMart</span>
                            </Link>
                            <p className="footer-description">
                                Your trusted destination for authentic beauty, skincare, tech accessories, and home products in Bangladesh.
                            </p>
                            <div className="footer-social">
                                <a href="#" className="social-link" aria-label="Facebook">
                                    <Facebook size={20} />
                                </a>
                                <a href="#" className="social-link" aria-label="Instagram">
                                    <Instagram size={20} />
                                </a>
                                <a href="#" className="social-link" aria-label="Twitter">
                                    <Twitter size={20} />
                                </a>
                                <a href="#" className="social-link" aria-label="Youtube">
                                    <Youtube size={20} />
                                </a>
                            </div>
                        </div>

                        {/* Quick Links */}
                        <div className="footer-column">
                            <h3>Shop By Category</h3>
                            <ul>
                                <li><Link to="/products">All Products</Link></li>
                                <li><Link to="/products/lip-products">Lip Products</Link></li>
                                <li><Link to="/products/skincare">Skincare</Link></li>
                                <li><Link to="/products/tech-accessories">Tech Accessories</Link></li>
                                <li><Link to="/products/home-appliances">Home Appliances</Link></li>
                            </ul>
                        </div>

                        {/* Customer Service */}
                        <div className="footer-column">
                            <h3>Customer Service</h3>
                            <ul>
                                <li><Link to="/orders">Track Order</Link></li>
                                <li><Link to="/returns">Returns & Refunds</Link></li>
                                <li><Link to="/faq">FAQ</Link></li>
                                <li><Link to="/contact">Contact Us</Link></li>
                                <li><Link to="/size-guide">Size Guide</Link></li>
                            </ul>
                        </div>

                        {/* Contact Info */}
                        <div className="footer-column">
                            <h3>Contact Us</h3>
                            <ul className="contact-list">
                                <li>
                                    <Phone size={18} />
                                    <span>+880 1700-000000</span>
                                </li>
                                <li>
                                    <Mail size={18} />
                                    <span>support@authentimart.com</span>
                                </li>
                                <li>
                                    <MapPin size={18} />
                                    <span>Dhaka, Bangladesh</span>
                                </li>
                            </ul>
                            <div className="newsletter">
                                <h4>Subscribe to Newsletter</h4>
                                <form className="newsletter-form">
                                    <input type="email" placeholder="Enter your email" />
                                    <button type="submit">Subscribe</button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Payment Methods */}
            <div className="footer-payment">
                <div className="container">
                    <div className="payment-methods">
                        <span>We Accept:</span>
                        <div className="payment-icons">
                            <div className="payment-icon bkash" title="bKash">
                                <img src="/images/payment/Bkash.wine.svg" alt="bKash" />
                            </div>
                            <div className="payment-icon visa" title="Visa">
                                <img src="/images/payment/Unknown.png" alt="Visa" />
                            </div>
                            <div className="payment-icon mastercard" title="Mastercard">
                                <svg viewBox="10 8 132 84" xmlns="http://www.w3.org/2000/svg">
                                    <circle cx="52" cy="50" r="36" fill="#EB001B" />
                                    <circle cx="100" cy="50" r="36" fill="#F79E1B" />
                                    <path d="M76 22.8A35.9 35.9 0 0 0 63.1 50c0 11.1 5 21 12.9 27.2A35.9 35.9 0 0 0 88.9 50c0-11.1-5-21-12.9-27.2z" fill="#FF5F00" />
                                </svg>
                            </div>
                            <div className="payment-icon amex" title="American Express">
                                <img src="/images/payment/images.png" alt="American Express" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Copyright */}
            <div className="footer-bottom">
                <div className="container">
                    <div className="footer-bottom-content">
                        <p>&copy; {currentYear} AuthentiMart. All rights reserved.</p>
                        <div className="footer-links">
                            <Link to="/privacy">Privacy Policy</Link>
                            <Link to="/terms">Terms of Service</Link>
                            <Link to="/cookies">Cookie Policy</Link>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    )
}

export default Footer
