import { Link } from 'react-router-dom'
import { Heart, ShoppingCart, Eye, Star } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { useWishlist } from '../context/WishlistContext'
import './ProductCard.css'

const ProductCard = ({ product }) => {
    const { addToCart } = useCart()
    const { toggleWishlist, isInWishlist } = useWishlist()

    const {
        id,
        name,
        price,
        originalPrice,
        image,
        category,
        rating,
        reviewCount,
        stock,
        isNew,
        discount,
        slug,
    } = product

    const inWishlist = isInWishlist(id)

    const handleAddToCart = (e) => {
        e.preventDefault()
        e.stopPropagation()
        addToCart(product, 1)
    }

    const handleToggleWishlist = (e) => {
        e.preventDefault()
        e.stopPropagation()
        toggleWishlist(product)
    }

    return (
        <Link to={`/product/${slug}`} className="product-card">
            <div className="product-card-image">
                <img src={image} alt={name} loading="lazy" />

                {/* Badges */}
                <div className="product-card-badges">
                    {isNew && <span className="badge badge-new">New</span>}
                    {discount > 0 && (
                        <span className="badge badge-primary">-{discount}%</span>
                    )}
                </div>

                {/* Quick Actions */}
                <div className="product-card-actions">
                    <button
                        className={`product-card-action ${inWishlist ? 'active' : ''}`}
                        onClick={handleToggleWishlist}
                        aria-label="Add to wishlist"
                    >
                        <Heart size={18} fill={inWishlist ? 'currentColor' : 'none'} />
                    </button>
                    <button
                        className="product-card-action"
                        aria-label="Quick view"
                    >
                        <Eye size={18} />
                    </button>
                </div>
            </div>

            <div className="product-card-content">
                <span className="product-card-category">{category}</span>
                <h3 className="product-card-title">{name}</h3>

                <div className="product-card-rating">
                    {[...Array(5)].map((_, i) => (
                        <Star
                            key={i}
                            size={14}
                            fill={i < Math.floor(rating) ? '#F59E0B' : 'none'}
                            color="#F59E0B"
                        />
                    ))}
                    <span>({reviewCount})</span>
                </div>

                <div className="product-card-price">
                    <span className="product-card-price-current">৳{price.toLocaleString()}</span>
                    {originalPrice && originalPrice > price && (
                        <span className="product-card-price-original">৳{originalPrice.toLocaleString()}</span>
                    )}
                </div>

                <button
                    className="product-card-add-btn"
                    onClick={handleAddToCart}
                    disabled={stock === 0}
                >
                    <ShoppingCart size={18} />
                    {stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                </button>
            </div>
        </Link>
    )
}

export default ProductCard
