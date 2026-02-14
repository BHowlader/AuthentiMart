import { useState } from 'react'
import { newsletterAPI } from '../utils/api'
import { Mail, CheckCircle, Loader } from 'lucide-react'
import './NewsletterForm.css'

const NewsletterForm = () => {
    const [email, setEmail] = useState('')
    const [name, setName] = useState('')
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)
    const [error, setError] = useState('')

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        try {
            await newsletterAPI.subscribe({ email, name: name || undefined, source: 'footer' })
            setSuccess(true)
            setEmail('')
            setName('')
        } catch (err) {
            setError(err.response?.data?.detail || 'Failed to subscribe. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    if (success) {
        return (
            <div className="newsletter-form newsletter-success">
                <CheckCircle size={32} className="success-icon" />
                <h4>You're subscribed!</h4>
                <p>Thank you for joining our newsletter. Stay tuned for updates!</p>
            </div>
        )
    }

    return (
        <form className="newsletter-form" onSubmit={handleSubmit}>
            <div className="newsletter-header">
                <Mail size={24} />
                <div>
                    <h4>Subscribe to our Newsletter</h4>
                    <p>Get updates on new products, exclusive deals, and more!</p>
                </div>
            </div>

            <div className="newsletter-inputs">
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                    disabled={loading}
                />
                <button type="submit" disabled={loading}>
                    {loading ? <Loader size={18} className="spinner" /> : 'Subscribe'}
                </button>
            </div>

            {error && <p className="newsletter-error">{error}</p>}
        </form>
    )
}

export default NewsletterForm
