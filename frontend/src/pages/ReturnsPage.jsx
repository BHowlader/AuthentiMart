import { Link } from 'react-router-dom'
import { ChevronRight, RotateCcw, Package, Clock, CheckCircle } from 'lucide-react'
import SEO from '../components/SEO'
import './StaticPages.css'

const ReturnsPage = () => {
    return (
        <div className="static-page">
            <SEO
                title="Returns & Refunds"
                description="Learn about AuthentiMart's 7-day return policy, refund process, and exchange guidelines. Easy returns for authentic products in Bangladesh."
                keywords="returns policy, refund, exchange, AuthentiMart returns, online shopping returns Bangladesh"
                url="/returns"
            />
            <div className="container">
                {/* Breadcrumb */}
                <nav className="breadcrumb">
                    <Link to="/">Home</Link>
                    <ChevronRight size={16} />
                    <span>Returns & Refunds</span>
                </nav>

                <div className="static-page-content">
                    <h1 className="static-page-title">Returns & Refunds</h1>
                    <p className="static-page-subtitle">
                        We want you to be completely satisfied with your purchase. If you're not happy, we're here to help.
                    </p>

                    {/* Policy Highlights */}
                    <div className="policy-highlights">
                        <div className="highlight-card glass-card">
                            <div className="highlight-icon">
                                <Clock size={32} />
                            </div>
                            <h3>7-Day Return Window</h3>
                            <p>Return items within 7 days of delivery</p>
                        </div>
                        <div className="highlight-card glass-card">
                            <div className="highlight-icon">
                                <Package size={32} />
                            </div>
                            <h3>Original Packaging</h3>
                            <p>Items must be unused and in original packaging</p>
                        </div>
                        <div className="highlight-card glass-card">
                            <div className="highlight-icon">
                                <RotateCcw size={32} />
                            </div>
                            <h3>Easy Process</h3>
                            <p>Simple return process with tracking</p>
                        </div>
                    </div>

                    {/* Return Policy Details */}
                    <section className="policy-section">
                        <h2>Return Policy</h2>
                        <div className="policy-content glass-card">
                            <h3>Eligible Items</h3>
                            <ul>
                                <li>Items must be returned within 7 days of delivery</li>
                                <li>Products must be unused, unworn, and in original condition</li>
                                <li>Original packaging and tags must be intact</li>
                                <li>Receipt or proof of purchase is required</li>
                            </ul>

                            <h3>Non-Returnable Items</h3>
                            <ul>
                                <li>Opened cosmetics and skincare products (for hygiene reasons)</li>
                                <li>Intimate apparel and swimwear</li>
                                <li>Customized or personalized items</li>
                                <li>Items marked as "Final Sale"</li>
                                <li>Gift cards</li>
                            </ul>
                        </div>
                    </section>

                    {/* How to Return */}
                    <section className="policy-section">
                        <h2>How to Return an Item</h2>
                        <div className="steps-container">
                            <div className="step-card glass-card">
                                <div className="step-number">1</div>
                                <h3>Contact Us</h3>
                                <p>Reach out via email at support@authentimart.com or call +8801319826059 with your order number.</p>
                            </div>
                            <div className="step-card glass-card">
                                <div className="step-number">2</div>
                                <h3>Get Approval</h3>
                                <p>Our team will review your request and provide return instructions within 24 hours.</p>
                            </div>
                            <div className="step-card glass-card">
                                <div className="step-number">3</div>
                                <h3>Ship the Item</h3>
                                <p>Pack the item securely and ship it to our return address provided in the instructions.</p>
                            </div>
                            <div className="step-card glass-card">
                                <div className="step-number">4</div>
                                <h3>Receive Refund</h3>
                                <p>Once we receive and inspect the item, your refund will be processed within 5-7 business days.</p>
                            </div>
                        </div>
                    </section>

                    {/* Refund Policy */}
                    <section className="policy-section">
                        <h2>Refund Policy</h2>
                        <div className="policy-content glass-card">
                            <h3>Refund Methods</h3>
                            <ul>
                                <li><strong>Original Payment Method:</strong> Refunds are issued to the original payment method used for the purchase.</li>
                                <li><strong>bKash/Mobile Banking:</strong> Refunds processed within 3-5 business days.</li>
                                <li><strong>Credit/Debit Card:</strong> Refunds may take 7-10 business days to appear on your statement.</li>
                                <li><strong>Store Credit:</strong> Available immediately upon request.</li>
                            </ul>

                            <h3>Refund Amount</h3>
                            <ul>
                                <li>Full product price will be refunded for eligible returns</li>
                                <li>Original shipping charges are non-refundable unless the return is due to our error</li>
                                <li>Return shipping costs are the responsibility of the customer unless the item is defective</li>
                            </ul>
                        </div>
                    </section>

                    {/* Exchange Policy */}
                    <section className="policy-section">
                        <h2>Exchanges</h2>
                        <div className="policy-content glass-card">
                            <p>
                                We currently do not offer direct exchanges. If you need a different size, color, or product,
                                please return your original item for a refund and place a new order.
                            </p>
                            <p>
                                For defective items, we will provide a free replacement or full refund at your choice.
                            </p>
                        </div>
                    </section>

                    {/* Contact CTA */}
                    <div className="cta-section glass-card">
                        <h2>Need Help?</h2>
                        <p>Our customer service team is here to assist you with any questions about returns or refunds.</p>
                        <div className="cta-buttons">
                            <Link to="/contact" className="btn btn-primary">Contact Us</Link>
                            <Link to="/faq" className="btn btn-secondary">View FAQ</Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ReturnsPage
