import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight, ChevronDown, Search } from 'lucide-react'
import SEO from '../components/SEO'
import './StaticPages.css'

const FAQPage = () => {
    const [activeIndex, setActiveIndex] = useState(null)
    const [searchQuery, setSearchQuery] = useState('')

    const faqCategories = [
        {
            category: 'Orders & Shipping',
            faqs: [
                {
                    question: 'How long does shipping take?',
                    answer: 'Standard shipping within Dhaka takes 1-2 business days. For other areas in Bangladesh, delivery typically takes 3-5 business days. Express shipping options are available at checkout for faster delivery.'
                },
                {
                    question: 'How can I track my order?',
                    answer: 'Once your order is shipped, you will receive a tracking number via SMS and email. You can also track your order by logging into your account and visiting the "My Orders" section.'
                },
                {
                    question: 'Do you offer free shipping?',
                    answer: 'Yes! We offer free standard shipping on all orders over ৳5,000. Orders below this amount have a flat shipping fee of ৳60 within Dhaka and ৳120 for other areas.'
                },
                {
                    question: 'Can I change my shipping address after placing an order?',
                    answer: 'You can change your shipping address within 1 hour of placing your order by contacting our customer service. After that, changes may not be possible if the order has already been processed.'
                }
            ]
        },
        {
            category: 'Payments',
            faqs: [
                {
                    question: 'What payment methods do you accept?',
                    answer: 'We accept bKash, Nagad, Visa, Mastercard, American Express, and Cash on Delivery (COD). All online payments are processed securely through SSL encryption.'
                },
                {
                    question: 'Is it safe to pay online?',
                    answer: 'Absolutely! We use industry-standard SSL encryption and secure payment gateways to protect your financial information. We never store your complete card details on our servers.'
                },
                {
                    question: 'Can I pay Cash on Delivery?',
                    answer: 'Yes, Cash on Delivery (COD) is available for orders within Bangladesh. A small COD fee of ৳20 applies to all COD orders.'
                },
                {
                    question: 'My payment failed. What should I do?',
                    answer: 'If your payment fails, please ensure your card/account has sufficient balance and try again. If the issue persists, contact your bank or try a different payment method. For further assistance, reach out to our support team.'
                }
            ]
        },
        {
            category: 'Returns & Refunds',
            faqs: [
                {
                    question: 'What is your return policy?',
                    answer: 'We offer a 7-day return policy for most items. Products must be unused, in original packaging, and with all tags attached. Some items like opened cosmetics are non-returnable for hygiene reasons.'
                },
                {
                    question: 'How do I return an item?',
                    answer: 'To initiate a return, contact us at support@authentimart.com with your order number. Our team will guide you through the process and provide the return shipping address.'
                },
                {
                    question: 'How long does it take to receive a refund?',
                    answer: 'Once we receive and inspect your returned item, refunds are processed within 5-7 business days. The time it takes to appear in your account depends on your payment method and bank.'
                },
                {
                    question: 'Do you offer exchanges?',
                    answer: 'We currently don\'t offer direct exchanges. Please return the original item for a refund and place a new order for the item you want.'
                }
            ]
        },
        {
            category: 'Products',
            faqs: [
                {
                    question: 'Are all products authentic?',
                    answer: 'Yes, 100%! AuthentiMart only sells genuine, authentic products sourced directly from brands or authorized distributors. We guarantee the authenticity of every item we sell.'
                },
                {
                    question: 'How do I know if a product is in stock?',
                    answer: 'Product availability is shown on each product page. If an item is out of stock, you can click "Notify Me" to receive an email when it becomes available again.'
                },
                {
                    question: 'Can I request a product that\'s not on your website?',
                    answer: 'Absolutely! Send us a request at support@authentimart.com with the product details, and we\'ll do our best to source it for you.'
                },
                {
                    question: 'Do products come with warranty?',
                    answer: 'Electronic products and appliances come with manufacturer warranty. The warranty period varies by product and is mentioned on the product page. Beauty and skincare products don\'t have warranty but are covered by our return policy.'
                }
            ]
        },
        {
            category: 'Account & Privacy',
            faqs: [
                {
                    question: 'How do I create an account?',
                    answer: 'Click on "Login" and then "Register" to create a new account. You can also sign up using your Google or Facebook account for faster registration.'
                },
                {
                    question: 'I forgot my password. How can I reset it?',
                    answer: 'Click on "Login" and then "Forgot Password". Enter your email address, and we\'ll send you a link to reset your password.'
                },
                {
                    question: 'How is my personal information protected?',
                    answer: 'We take privacy seriously. Your personal information is encrypted and securely stored. We never share your data with third parties for marketing purposes. Read our Privacy Policy for more details.'
                },
                {
                    question: 'Can I delete my account?',
                    answer: 'Yes, you can request account deletion by contacting our support team. Please note that this action is irreversible and will delete all your order history.'
                }
            ]
        }
    ]

    const toggleFaq = (index) => {
        setActiveIndex(activeIndex === index ? null : index)
    }

    // Filter FAQs based on search
    const filteredCategories = faqCategories.map(cat => ({
        ...cat,
        faqs: cat.faqs.filter(faq =>
            faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
            faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
        )
    })).filter(cat => cat.faqs.length > 0)

    let globalIndex = 0

    return (
        <div className="static-page">
            <SEO
                title="FAQ - Frequently Asked Questions"
                description="Find answers to common questions about AuthentiMart orders, shipping, returns, and payments."
                keywords="faq, help center, shipping questions, return policy, payment methods"
            />
            <div className="container">
                {/* Breadcrumb */}
                <nav className="breadcrumb">
                    <Link to="/">Home</Link>
                    <ChevronRight size={16} />
                    <span>FAQ</span>
                </nav>

                <div className="static-page-content">
                    <h1 className="static-page-title">Frequently Asked Questions</h1>
                    <p className="static-page-subtitle">
                        Find answers to common questions about orders, shipping, returns, and more.
                    </p>

                    {/* Search */}
                    <div className="faq-search glass-card">
                        <Search size={20} />
                        <input
                            type="text"
                            placeholder="Search for answers..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    {/* FAQ Categories */}
                    <div className="faq-container">
                        {filteredCategories.map((category) => (
                            <div key={category.category} className="faq-category">
                                <h2 className="faq-category-title">{category.category}</h2>
                                <div className="faq-list">
                                    {category.faqs.map((faq) => {
                                        const currentIndex = globalIndex++
                                        return (
                                            <div
                                                key={currentIndex}
                                                className={`faq-item glass-card ${activeIndex === currentIndex ? 'active' : ''}`}
                                            >
                                                <button
                                                    className="faq-question"
                                                    onClick={() => toggleFaq(currentIndex)}
                                                >
                                                    <span>{faq.question}</span>
                                                    <ChevronDown
                                                        size={20}
                                                        className={`faq-icon ${activeIndex === currentIndex ? 'rotated' : ''}`}
                                                    />
                                                </button>
                                                {activeIndex === currentIndex && (
                                                    <div className="faq-answer">
                                                        <p>{faq.answer}</p>
                                                    </div>
                                                )}
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        ))}

                        {filteredCategories.length === 0 && (
                            <div className="no-results glass-card">
                                <p>No results found for "{searchQuery}"</p>
                                <button className="btn btn-secondary" onClick={() => setSearchQuery('')}>
                                    Clear Search
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Contact CTA */}
                    <div className="cta-section glass-card">
                        <h2>Still Have Questions?</h2>
                        <p>Can't find the answer you're looking for? Our customer support team is here to help.</p>
                        <div className="cta-buttons">
                            <Link to="/contact" className="btn btn-primary">Contact Us</Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default FAQPage
