import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Zap, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react'
import { flashSalesAPI } from '../../utils/api'
import CountdownTimer from './CountdownTimer'
import FlashSaleCard from './FlashSaleCard'
import './FlashSale.css'

const FlashSaleSection = () => {
    const [flashSale, setFlashSale] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [scrollPosition, setScrollPosition] = useState(0)

    useEffect(() => {
        fetchFlashSale()
    }, [])

    const fetchFlashSale = async () => {
        try {
            setLoading(true)
            const response = await flashSalesAPI.getCurrent()
            setFlashSale(response.data)
            setError(null)
        } catch (err) {
            // No active flash sale is not an error state
            if (err.response?.status === 404) {
                setFlashSale(null)
            } else {
                setError('Failed to load flash sale')
            }
        } finally {
            setLoading(false)
        }
    }

    const handleExpire = () => {
        // Refresh to check for new flash sale
        fetchFlashSale()
    }

    const scrollLeft = () => {
        const container = document.querySelector('.flash-sale-products')
        if (container) {
            const newPosition = Math.max(0, scrollPosition - 300)
            container.scrollTo({ left: newPosition, behavior: 'smooth' })
            setScrollPosition(newPosition)
        }
    }

    const scrollRight = () => {
        const container = document.querySelector('.flash-sale-products')
        if (container) {
            const maxScroll = container.scrollWidth - container.clientWidth
            const newPosition = Math.min(maxScroll, scrollPosition + 300)
            container.scrollTo({ left: newPosition, behavior: 'smooth' })
            setScrollPosition(newPosition)
        }
    }

    // Don't render anything while loading or if no flash sale
    if (loading || !flashSale || error) {
        return null
    }

    return (
        <section className="flash-sale-section">
            <div className="container">
                {/* Header */}
                <div className="flash-sale-header">
                    <div className="flash-sale-title-area">
                        <div className="flash-sale-badge">
                            <Zap size={24} />
                            <span>Flash Sale</span>
                        </div>
                        <h2 className="flash-sale-name">{flashSale.name}</h2>
                    </div>

                    <div className="flash-sale-timer-area">
                        <CountdownTimer
                            endTime={flashSale.end_time}
                            onExpire={handleExpire}
                        />
                    </div>

                    <Link to={`/flash-sale/${flashSale.slug}`} className="flash-sale-view-all">
                        View All
                        <ArrowRight size={18} />
                    </Link>
                </div>

                {/* Products Carousel */}
                <div className="flash-sale-carousel">
                    <button
                        className="flash-sale-nav prev"
                        onClick={scrollLeft}
                        aria-label="Scroll left"
                    >
                        <ChevronLeft size={24} />
                    </button>

                    <div className="flash-sale-products">
                        {flashSale.items.map((item) => (
                            <FlashSaleCard key={item.id} item={item} />
                        ))}
                    </div>

                    <button
                        className="flash-sale-nav next"
                        onClick={scrollRight}
                        aria-label="Scroll right"
                    >
                        <ChevronRight size={24} />
                    </button>
                </div>
            </div>
        </section>
    )
}

export default FlashSaleSection
