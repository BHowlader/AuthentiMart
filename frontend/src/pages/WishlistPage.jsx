import { Link } from 'react-router-dom'
import { Heart, ShoppingCart, Trash2, ArrowRight } from 'lucide-react'
import { useWishlist } from '../context/WishlistContext'
import { useCart } from '../context/CartContext'
import './WishlistPage.css'

const WishlistPage = () => {
    const { items, loading, initialized, removeFromWishlist, clearWishlist } = useWishlist()
    const { addToCart } = useCart()

    const handleAddToCart = (product) => {
        addToCart(product, 1)
        removeFromWishlist(product.id)
    }

    if (!initialized || loading) {
        return (
            <div className="wishlist-page">
                <div className="container">
                    <div className="empty-wishlist">
                        <div className="spinner"></div>
                        <p>Loading wishlist...</p>
                    </div>
                </div>
            </div>
        )
    }

    if (items.length === 0) {
        return (
            <div className="wishlist-page">
                <div className="container">
                    <div className="empty-wishlist">
                        <Heart size={80} />
                        <h2>Your wishlist is empty</h2>
                        <p>Save items you love by clicking the heart icon on any product.</p>
                        <Link to="/products" className="btn btn-primary btn-lg">
                            Explore Products
                            <ArrowRight size={20} />
                        </Link>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="wishlist-page">
            <div className="container">
                <div className="page-header">
                    <div>
                        <h1>My Wishlist</h1>
                        <p className="text-secondary">{items.length} item{items.length !== 1 ? 's' : ''} saved</p>
                    </div>
                    <button className="btn btn-ghost" onClick={clearWishlist}>
                        Clear All
                    </button>
                </div>

                <div className="wishlist-grid">
                    {items.map((item) => (
                        <div key={item.id} className="wishlist-item glass-card">
                            <Link to={`/product/${item.slug}`} className="wishlist-image">
                                <img src={item.image} alt={item.name} />
                                {item.discount > 0 && (
                                    <span className="badge badge-primary">-{item.discount}%</span>
                                )}
                            </Link>

                            <div className="wishlist-content">
                                <span className="wishlist-category">{item.category}</span>
                                <Link to={`/product/${item.slug}`} className="wishlist-name">
                                    {item.name}
                                </Link>
                                <div className="wishlist-price">
                                    <span className="current-price">৳{item.price.toLocaleString()}</span>
                                    {item.originalPrice > item.price && (
                                        <span className="original-price">৳{item.originalPrice.toLocaleString()}</span>
                                    )}
                                </div>

                                <div className="wishlist-actions">
                                    <button
                                        className="btn btn-primary add-btn"
                                        onClick={() => handleAddToCart(item)}
                                        disabled={item.stock === 0}
                                    >
                                        <ShoppingCart size={18} />
                                        {item.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                                    </button>
                                    <button
                                        className="btn btn-ghost remove-btn"
                                        onClick={() => removeFromWishlist(item.id)}
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default WishlistPage
