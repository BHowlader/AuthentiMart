import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { recentlyViewedAPI } from '../utils/api'
import { Clock, ChevronRight } from 'lucide-react'
import ProductCard from './ProductCard'
import './RecentlyViewedSection.css'

const RecentlyViewedSection = ({ limit = 6 }) => {
    const [products, setProducts] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchRecentlyViewed = async () => {
            try {
                // Get session ID from localStorage for guests
                let sessionId = localStorage.getItem('sessionId')
                if (!sessionId) {
                    sessionId = 'session_' + Math.random().toString(36).substr(2, 9)
                    localStorage.setItem('sessionId', sessionId)
                }

                const response = await recentlyViewedAPI.get(limit, sessionId)
                setProducts(response.data.items || [])
            } catch (error) {
                console.error('Error fetching recently viewed:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchRecentlyViewed()
    }, [limit])

    // Don't render if no recently viewed products
    if (!loading && products.length === 0) {
        return null
    }

    return (
        <section className="recently-viewed-section">
            <div className="section-header">
                <div className="section-title">
                    <Clock size={24} />
                    <h2>Recently Viewed</h2>
                </div>
                {products.length > 4 && (
                    <Link to="/products" className="view-all-link">
                        View All <ChevronRight size={18} />
                    </Link>
                )}
            </div>

            {loading ? (
                <div className="recently-viewed-loading">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="product-skeleton" />
                    ))}
                </div>
            ) : (
                <div className="recently-viewed-grid">
                    {products.map((item) => (
                        <ProductCard key={item.product_id} product={item.product} />
                    ))}
                </div>
            )}
        </section>
    )
}

export default RecentlyViewedSection
