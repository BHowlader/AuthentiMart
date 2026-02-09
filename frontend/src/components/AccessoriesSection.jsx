import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ShoppingCart, ChevronLeft, ChevronRight, Package } from 'lucide-react'
import { comparisonAPI } from '../utils/api'
import { useCart } from '../context/CartContext'
import { useScrollAnimation } from '../hooks/useScrollAnimation'
import './AccessoriesSection.css'

const AccessoriesSection = ({ productId, productName }) => {
    const [accessories, setAccessories] = useState([])
    const [loading, setLoading] = useState(true)
    const [scrollPosition, setScrollPosition] = useState(0)
    const { addToCart } = useCart()
    const { ref, isVisible } = useScrollAnimation({ threshold: 0.2 })

    useEffect(() => {
        if (productId) {
            fetchAccessories()
        }
    }, [productId])

    const fetchAccessories = async () => {
        try {
            setLoading(true)
            const response = await comparisonAPI.getAccessories(productId)
            setAccessories(response.data || [])
        } catch (error) {
            console.error('Error fetching accessories:', error)
            setAccessories([])
        } finally {
            setLoading(false)
        }
    }

    const handleAddToCart = (e, accessory) => {
        e.preventDefault()
        e.stopPropagation()
        addToCart({
            id: accessory.accessory.id,
            name: accessory.accessory.name,
            price: accessory.accessory.price,
            image: accessory.accessory.image,
            slug: accessory.accessory.slug
        })
    }

    const scrollLeft = () => {
        const container = document.querySelector('.accessories-scroll')
        if (container) {
            const newPosition = Math.max(0, scrollPosition - 300)
            container.scrollTo({ left: newPosition, behavior: 'smooth' })
            setScrollPosition(newPosition)
        }
    }

    const scrollRight = () => {
        const container = document.querySelector('.accessories-scroll')
        if (container) {
            const maxScroll = container.scrollWidth - container.clientWidth
            const newPosition = Math.min(maxScroll, scrollPosition + 300)
            container.scrollTo({ left: newPosition, behavior: 'smooth' })
            setScrollPosition(newPosition)
        }
    }

    // Don't render if no accessories or loading
    if (loading) {
        return null
    }

    if (accessories.length === 0) {
        return null
    }

    return (
        <section
            ref={ref}
            className={`accessories-section ${isVisible ? 'visible' : ''}`}
        >
            <div className="accessories-header">
                <div className="accessories-title-area">
                    <div className="accessories-icon">
                        <Package size={24} />
                    </div>
                    <div>
                        <h2 className="accessories-title">Complete Your Setup</h2>
                        <p className="accessories-subtitle">
                            Accessories that work great with {productName}
                        </p>
                    </div>
                </div>
            </div>

            <div className="accessories-carousel">
                <button
                    className="accessories-nav prev"
                    onClick={scrollLeft}
                    aria-label="Scroll left"
                >
                    <ChevronLeft size={24} />
                </button>

                <div className="accessories-scroll">
                    {accessories.map((acc, index) => (
                        <Link
                            to={`/product/${acc.accessory.slug}`}
                            key={acc.id}
                            className="accessory-card"
                            style={{
                                transitionDelay: isVisible ? `${index * 100}ms` : '0ms'
                            }}
                        >
                            <div className="accessory-image">
                                <img
                                    src={acc.accessory.image || '/images/placeholder.png'}
                                    alt={acc.accessory.name}
                                />
                            </div>
                            <div className="accessory-content">
                                <span className="accessory-category">
                                    {acc.accessory.category || 'Accessory'}
                                </span>
                                <h4 className="accessory-name">{acc.accessory.name}</h4>
                                <div className="accessory-price">
                                    <span className="current-price">
                                        ৳{acc.accessory.price.toLocaleString()}
                                    </span>
                                    {acc.accessory.original_price && acc.accessory.original_price > acc.accessory.price && (
                                        <span className="original-price">
                                            ৳{acc.accessory.original_price.toLocaleString()}
                                        </span>
                                    )}
                                </div>
                                <button
                                    className="accessory-add-btn"
                                    onClick={(e) => handleAddToCart(e, acc)}
                                >
                                    <ShoppingCart size={16} />
                                    Add
                                </button>
                            </div>
                        </Link>
                    ))}
                </div>

                <button
                    className="accessories-nav next"
                    onClick={scrollRight}
                    aria-label="Scroll right"
                >
                    <ChevronRight size={24} />
                </button>
            </div>
        </section>
    )
}

export default AccessoriesSection
