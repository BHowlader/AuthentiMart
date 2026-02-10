import { Link } from 'react-router-dom'
import { ShoppingCart, Zap } from 'lucide-react'
import { useCart } from '../../context/CartContext'
import './FlashSale.css'

// Get the base URL for uploads
const API_BASE = import.meta.env.VITE_API_URL?.replace('/api/v1', '') || 'http://127.0.0.1:8000'

// Helper to get full image URL
const getImageUrl = (path) => {
    if (!path) return '/images/placeholder.png'
    if (path.startsWith('http')) return path
    if (path.startsWith('/uploads')) return `${API_BASE}${path}`
    return path
}

const FlashSaleCard = ({ item }) => {
    const { addToCart } = useCart()
    const { product, flash_price, flash_stock, sold_count } = item

    const soldPercentage = flash_stock > 0 ? Math.round((sold_count / (sold_count + flash_stock)) * 100) : 100
    const isAlmostGone = flash_stock <= 5 && flash_stock > 0
    const isSoldOut = flash_stock === 0

    const savings = product.price - flash_price
    const savingsPercent = Math.round((savings / product.price) * 100)

    const handleAddToCart = (e) => {
        e.preventDefault()
        e.stopPropagation()
        if (!isSoldOut) {
            addToCart({
                id: product.id,
                name: product.name,
                price: flash_price,
                image: product.image,
                slug: product.slug
            })
        }
    }

    return (
        <Link to={`/product/${product.slug}`} className={`flash-sale-card ${isSoldOut ? 'sold-out' : ''}`}>
            {/* Flash Badge */}
            <div className="flash-badge">
                <Zap size={14} />
                <span>-{savingsPercent}%</span>
            </div>

            {/* Product Image */}
            <div className="flash-sale-card-image">
                <img src={getImageUrl(product.image)} alt={product.name} />
                {isSoldOut && (
                    <div className="sold-out-overlay">
                        <span>SOLD OUT</span>
                    </div>
                )}
            </div>

            {/* Product Info */}
            <div className="flash-sale-card-content">
                <h4 className="flash-sale-card-title">{product.name}</h4>

                {/* Price */}
                <div className="flash-sale-price">
                    <span className="flash-price">৳{flash_price.toLocaleString()}</span>
                    <span className="original-price">৳{product.price.toLocaleString()}</span>
                </div>

                {/* Progress Bar */}
                <div className="flash-sale-progress">
                    <div className="progress-bar">
                        <div
                            className="progress-fill"
                            style={{ width: `${soldPercentage}%` }}
                        />
                    </div>
                    <div className="progress-text">
                        {isSoldOut ? (
                            <span className="sold-out-text">Sold Out!</span>
                        ) : isAlmostGone ? (
                            <span className="almost-gone">Only {flash_stock} left!</span>
                        ) : (
                            <span>{sold_count} sold</span>
                        )}
                    </div>
                </div>

                {/* Add to Cart Button */}
                <button
                    className={`flash-sale-cart-btn ${isSoldOut ? 'disabled' : ''}`}
                    onClick={handleAddToCart}
                    disabled={isSoldOut}
                >
                    <ShoppingCart size={16} />
                    {isSoldOut ? 'Sold Out' : 'Add to Cart'}
                </button>
            </div>
        </Link>
    )
}

export default FlashSaleCard
