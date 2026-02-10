import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Zap, ShoppingCart } from 'lucide-react'
import { flashSalesAPI } from '../utils/api'
import { useCart } from '../context/CartContext'
import CountdownTimer from '../components/FlashSale/CountdownTimer'
import './FlashSalePage.css'

// Get the base URL for uploads (without /api/v1)
const API_BASE = import.meta.env.VITE_API_URL?.replace('/api/v1', '') || 'http://127.0.0.1:8000'

// Helper to get full image URL
const getImageUrl = (path) => {
    if (!path) return '/placeholder-product.jpg'
    if (path.startsWith('http')) return path
    if (path.startsWith('/uploads')) return `${API_BASE}${path}`
    return path
}

const FlashSalePage = () => {
    const { slug } = useParams()
    const { addToCart } = useCart()
    const [flashSale, setFlashSale] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [addingToCart, setAddingToCart] = useState({})

    useEffect(() => {
        fetchFlashSale()
    }, [slug])

    const fetchFlashSale = async () => {
        try {
            setLoading(true)
            const response = await flashSalesAPI.getBySlug(slug)
            setFlashSale(response.data)
            setError(null)
        } catch (err) {
            if (err.response?.status === 404) {
                setError('Flash sale not found or has ended')
            } else {
                setError('Failed to load flash sale')
            }
        } finally {
            setLoading(false)
        }
    }

    const handleAddToCart = async (item, e) => {
        e.preventDefault()
        if (item.sold_count >= item.flash_stock) return

        setAddingToCart(prev => ({ ...prev, [item.id]: true }))
        try {
            await addToCart({
                ...item.product,
                price: item.flash_price,
                isFlashSale: true,
                flashSaleItemId: item.id
            }, 1)
        } catch (err) {
            console.error('Failed to add to cart:', err)
        } finally {
            setAddingToCart(prev => ({ ...prev, [item.id]: false }))
        }
    }

    const calculateDiscount = (flashPrice, originalPrice) => {
        if (!originalPrice || originalPrice <= flashPrice) return 0
        return Math.round(((originalPrice - flashPrice) / originalPrice) * 100)
    }

    const getProgressPercentage = (soldCount, flashStock) => {
        return Math.min((soldCount / flashStock) * 100, 100)
    }

    if (loading) {
        return (
            <div className="flash-sale-page">
                <div className="container">
                    <div className="flash-sale-page-loading">
                        <div className="spinner-large"></div>
                        <p>Loading flash sale...</p>
                    </div>
                </div>
            </div>
        )
    }

    if (error || !flashSale) {
        return (
            <div className="flash-sale-page">
                <div className="container">
                    <div className="flash-sale-page-error">
                        <Zap size={64} />
                        <h2>{error || 'Flash sale not found'}</h2>
                        <p>This flash sale may have ended or doesn't exist.</p>
                        <Link to="/" className="btn btn-primary">
                            Back to Home
                        </Link>
                    </div>
                </div>
            </div>
        )
    }

    // Construct full banner URL
    const bannerUrl = flashSale.banner_image
        ? (flashSale.banner_image.startsWith('http')
            ? flashSale.banner_image
            : `${API_BASE}${flashSale.banner_image}`)
        : null

    return (
        <div className="flash-sale-page">
            {/* Hero Banner */}
            <div
                className="flash-sale-hero"
                style={bannerUrl ? {
                    backgroundImage: `linear-gradient(135deg, rgba(255, 65, 54, 0.85) 0%, rgba(255, 133, 27, 0.85) 100%), url("${bannerUrl}")`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat'
                } : {}}
            >
                <div className="container">
                    <div className="flash-sale-hero-content">
                        <div className="flash-sale-hero-badge">
                            <Zap size={24} />
                            <span>Flash Sale</span>
                        </div>
                        <h1>{flashSale.name}</h1>
                        {flashSale.description && (
                            <p className="flash-sale-hero-desc">{flashSale.description}</p>
                        )}
                        <CountdownTimer
                            endTime={flashSale.end_time}
                            onExpire={fetchFlashSale}
                        />
                    </div>
                </div>
            </div>

            {/* Products Grid */}
            <div className="container">
                <div className="flash-sale-stats">
                    <span className="stat-item">
                        <strong>{flashSale.items.length}</strong> Products
                    </span>
                    <span className="stat-item">
                        <strong>Up to {Math.max(...flashSale.items.map(item =>
                            calculateDiscount(item.flash_price, item.product?.original_price || item.product?.price)
                        ))}%</strong> Off
                    </span>
                </div>

                <div className="flash-sale-grid">
                    {flashSale.items.map((item) => {
                        const product = item.product
                        if (!product) return null

                        const isSoldOut = item.sold_count >= item.flash_stock
                        const progress = getProgressPercentage(item.sold_count, item.flash_stock)
                        const discount = calculateDiscount(item.flash_price, product.original_price || product.price)
                        const remaining = item.flash_stock - item.sold_count

                        return (
                            <Link
                                to={`/product/${product.slug}`}
                                className={`flash-product-card ${isSoldOut ? 'sold-out' : ''}`}
                                key={item.id}
                            >
                                {/* Discount Badge */}
                                {discount > 0 && (
                                    <div className="discount-badge">
                                        -{discount}%
                                    </div>
                                )}

                                {/* Flash Badge */}
                                <div className="flash-indicator">
                                    <Zap size={14} />
                                </div>

                                {/* Image */}
                                <div className="flash-product-image">
                                    <img
                                        src={getImageUrl(product.image)}
                                        alt={product.name}
                                        loading="lazy"
                                    />
                                    {isSoldOut && (
                                        <div className="sold-out-overlay">
                                            <span>SOLD OUT</span>
                                        </div>
                                    )}
                                </div>

                                {/* Content */}
                                <div className="flash-product-content">
                                    <h3 className="flash-product-title">{product.name}</h3>

                                    {product.brand && (
                                        <span className="flash-product-brand">{product.brand}</span>
                                    )}

                                    <div className="flash-product-pricing">
                                        <span className="flash-current-price">
                                            ${item.flash_price.toFixed(2)}
                                        </span>
                                        {(product.original_price || product.price) > item.flash_price && (
                                            <span className="flash-original-price">
                                                ${(product.original_price || product.price).toFixed(2)}
                                            </span>
                                        )}
                                    </div>

                                    {/* Stock Progress */}
                                    <div className="flash-stock-progress">
                                        <div className="progress-track">
                                            <div
                                                className="progress-bar-fill"
                                                style={{ width: `${progress}%` }}
                                            ></div>
                                        </div>
                                        <div className="progress-info">
                                            {isSoldOut ? (
                                                <span className="sold-out-text">Sold Out</span>
                                            ) : remaining <= 5 ? (
                                                <span className="almost-gone">Only {remaining} left!</span>
                                            ) : (
                                                <span>{item.sold_count} sold</span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Add to Cart */}
                                    <button
                                        className={`flash-add-to-cart ${isSoldOut ? 'disabled' : ''}`}
                                        onClick={(e) => handleAddToCart(item, e)}
                                        disabled={isSoldOut || addingToCart[item.id]}
                                    >
                                        {addingToCart[item.id] ? (
                                            <span className="spinner-small"></span>
                                        ) : isSoldOut ? (
                                            'Sold Out'
                                        ) : (
                                            <>
                                                <ShoppingCart size={18} />
                                                Add to Cart
                                            </>
                                        )}
                                    </button>
                                </div>
                            </Link>
                        )
                    })}
                </div>

                {flashSale.items.length === 0 && (
                    <div className="flash-sale-empty">
                        <Zap size={48} />
                        <h3>No products in this flash sale</h3>
                        <p>Check back later for more deals!</p>
                    </div>
                )}
            </div>
        </div>
    )
}

export default FlashSalePage
