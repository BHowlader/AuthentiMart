import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
    Star,
    ShoppingCart,
    Minus,
    Plus,
    Truck,
    Shield,
    RotateCcw,
    ChevronRight
} from 'lucide-react'
import { useCart } from '../context/CartContext'
import ProductCard from '../components/ProductCard'
import AccessoriesSection from '../components/AccessoriesSection'
import { productsAPI } from '../utils/api'
import './ProductDetailPage.css'

const ProductDetailPage = () => {
    const { slug } = useParams()
    const [product, setProduct] = useState(null)
    const [relatedProducts, setRelatedProducts] = useState([])
    const [loading, setLoading] = useState(true)
    const [selectedImage, setSelectedImage] = useState(0)
    const [quantity, setQuantity] = useState(1)
    const [activeTab, setActiveTab] = useState('description')

    const { addToCart } = useCart()

    // Fetch product data
    useEffect(() => {
        const fetchProduct = async () => {
            try {
                setLoading(true)
                const response = await productsAPI.getById(slug)
                const p = response.data

                // Map API response to frontend format
                const mappedProduct = {
                    id: p.id,
                    name: p.name,
                    price: p.price,
                    originalPrice: p.original_price,
                    image: p.images?.[0]?.url || '/images/placeholder.png',
                    images: p.images?.map(img => img.url) || ['/images/placeholder.png'],
                    category: p.category?.name || '',
                    categorySlug: p.category?.slug || '',
                    brand: p.brand || '',
                    rating: p.rating || 0,
                    reviewCount: p.review_count || 0,
                    stock: p.stock || 0,
                    isNew: p.is_new || false,
                    discount: p.discount || 0,
                    slug: p.slug,
                    description: p.description || 'No description available.',
                    features: p.features || [],
                    specifications: p.specifications || {}
                }

                setProduct(mappedProduct)

                // Fetch related products
                fetchRelatedProducts(mappedProduct.categorySlug)
            } catch (error) {
                console.error('Error fetching product:', error)
                setProduct(null)
            } finally {
                setLoading(false)
            }
        }

        fetchProduct()
    }, [slug])

    const fetchRelatedProducts = async (categorySlug) => {
        try {
            const response = await productsAPI.getAll({ category: categorySlug, limit: 5 })
            const products = (response.data.items || response.data || [])
                .filter(p => p.slug !== slug)
                .slice(0, 4)
                .map(p => ({
                    id: p.id,
                    name: p.name,
                    price: p.price,
                    originalPrice: p.original_price,
                    image: p.image || (p.images && p.images[0]?.url) || '/images/placeholder.png',
                    category: p.category || '',
                    categorySlug: p.category?.toLowerCase().replace(/\s+/g, '-') || '',
                    brand: p.brand || '',
                    rating: p.rating || 0,
                    reviewCount: p.review_count || 0,
                    stock: p.stock || 0,
                    isNew: p.is_new || false,
                    discount: p.discount || 0,
                    slug: p.slug
                }))
            setRelatedProducts(products)
        } catch (error) {
            console.error('Error fetching related products:', error)
        }
    }

    if (loading) {
        return (
            <div className="product-detail-page">
                <div className="container">
                    <div className="loading-state">
                        <div className="spinner"></div>
                        <p>Loading product...</p>
                    </div>
                </div>
            </div>
        )
    }

    if (!product) {
        return (
            <div className="product-detail-page">
                <div className="container">
                    <div className="not-found-state">
                        <h2>Product not found</h2>
                        <p>The product you're looking for doesn't exist or has been removed.</p>
                        <Link to="/products" className="btn btn-primary">Back to Products</Link>
                    </div>
                </div>
            </div>
        )
    }

    const handleQuantityChange = (delta) => {
        const newQty = quantity + delta
        if (newQty >= 1 && newQty <= product.stock) {
            setQuantity(newQty)
        }
    }

    const handleAddToCart = () => {
        addToCart({ ...product, image: product.images[0] }, quantity)
    }

    return (
        <div className="product-detail-page">
            <div className="container">
                {/* Breadcrumb */}
                <nav className="breadcrumb">
                    <Link to="/">Home</Link>
                    <ChevronRight size={16} />
                    <Link to="/products">Products</Link>
                    <ChevronRight size={16} />
                    {product.category && (
                        <>
                            <Link to={`/products/${product.categorySlug}`}>{product.category}</Link>
                            <ChevronRight size={16} />
                        </>
                    )}
                    <span>{product.name}</span>
                </nav>

                {/* Product Content */}
                <div className="product-content">
                    {/* Image Gallery */}
                    <div className="product-gallery">
                        <div className="main-image">
                            <img src={product.images[selectedImage]} alt={product.name} />
                            {product.isNew && <span className="badge badge-new">New</span>}
                            {product.discount > 0 && (
                                <span className="badge badge-primary discount-badge">-{product.discount}%</span>
                            )}
                        </div>
                        {product.images.length > 1 && (
                            <div className="thumbnail-list">
                                {product.images.map((img, index) => (
                                    <button
                                        key={index}
                                        className={`thumbnail ${index === selectedImage ? 'active' : ''}`}
                                        onClick={() => setSelectedImage(index)}
                                    >
                                        <img src={img} alt={`${product.name} ${index + 1}`} />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Product Info */}
                    <div className="product-info">
                        {product.brand && <div className="product-brand">{product.brand}</div>}
                        <h1 className="product-title">{product.name}</h1>

                        {/* Rating */}
                        <div className="product-rating">
                            <div className="stars">
                                {[...Array(5)].map((_, i) => (
                                    <Star
                                        key={i}
                                        size={18}
                                        fill={i < Math.floor(product.rating) ? '#F59E0B' : 'none'}
                                        color="#F59E0B"
                                    />
                                ))}
                            </div>
                            <span className="rating-value">{product.rating}</span>
                            <span className="review-count">({product.reviewCount} reviews)</span>
                        </div>

                        {/* Price */}
                        <div className="product-price">
                            <span className="current-price">৳{product.price.toLocaleString()}</span>
                            {product.originalPrice && product.originalPrice > product.price && (
                                <>
                                    <span className="original-price">৳{product.originalPrice.toLocaleString()}</span>
                                    <span className="discount-text">Save ৳{(product.originalPrice - product.price).toLocaleString()}</span>
                                </>
                            )}
                        </div>

                        {/* Stock Status */}
                        <div className="stock-status">
                            {product.stock > 0 ? (
                                <span className="in-stock">In Stock ({product.stock} available)</span>
                            ) : (
                                <span className="out-of-stock">Out of Stock</span>
                            )}
                        </div>

                        {/* Quantity Selector */}
                        {product.stock > 0 && (
                            <div className="quantity-section">
                                <label>Quantity:</label>
                                <div className="quantity-selector">
                                    <button
                                        className="quantity-btn"
                                        onClick={() => handleQuantityChange(-1)}
                                        disabled={quantity <= 1}
                                    >
                                        <Minus size={18} />
                                    </button>
                                    <span className="quantity-value">{quantity}</span>
                                    <button
                                        className="quantity-btn"
                                        onClick={() => handleQuantityChange(1)}
                                        disabled={quantity >= product.stock}
                                    >
                                        <Plus size={18} />
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Actions */}
                        <div className="product-actions">
                            <button
                                className="btn btn-primary btn-lg add-to-cart-btn"
                                onClick={handleAddToCart}
                                disabled={product.stock === 0}
                            >
                                <ShoppingCart size={20} />
                                Add to Cart
                            </button>
                        </div>

                        {/* Features */}
                        <div className="product-features">
                            <div className="feature-item">
                                <Truck size={24} />
                                <div>
                                    <strong>Free Delivery</strong>
                                    <span>On orders over ৳5,000</span>
                                </div>
                            </div>
                            <div className="feature-item">
                                <Shield size={24} />
                                <div>
                                    <strong>100% Authentic</strong>
                                    <span>Verified genuine product</span>
                                </div>
                            </div>
                            <div className="feature-item">
                                <RotateCcw size={24} />
                                <div>
                                    <strong>7-Day Returns</strong>
                                    <span>Easy return policy</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="product-tabs">
                    <div className="tabs">
                        <button
                            className={`tab ${activeTab === 'description' ? 'active' : ''}`}
                            onClick={() => setActiveTab('description')}
                        >
                            Description
                        </button>
                        <button
                            className={`tab ${activeTab === 'specifications' ? 'active' : ''}`}
                            onClick={() => setActiveTab('specifications')}
                        >
                            Specifications
                        </button>
                        <button
                            className={`tab ${activeTab === 'reviews' ? 'active' : ''}`}
                            onClick={() => setActiveTab('reviews')}
                        >
                            Reviews ({product.reviewCount})
                        </button>
                    </div>

                    <div className="tab-content glass-card">
                        {activeTab === 'description' && (
                            <div className="description-content">
                                <p>{product.description}</p>
                                {product.features && product.features.length > 0 && (
                                    <>
                                        <h4>Key Features:</h4>
                                        <ul>
                                            {product.features.map((feature, index) => (
                                                <li key={index}>{feature}</li>
                                            ))}
                                        </ul>
                                    </>
                                )}
                            </div>
                        )}

                        {activeTab === 'specifications' && (
                            <div className="specifications-content">
                                {product.specifications && Object.keys(product.specifications).length > 0 ? (
                                    <table>
                                        <tbody>
                                            {Object.entries(product.specifications).map(([key, value]) => (
                                                <tr key={key}>
                                                    <th>{key}</th>
                                                    <td>{value}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                ) : (
                                    <p className="text-secondary">No specifications available.</p>
                                )}
                            </div>
                        )}

                        {activeTab === 'reviews' && (
                            <div className="reviews-content">
                                <p className="text-secondary">Reviews coming soon...</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Accessories Section */}
                <AccessoriesSection productId={product.id} productName={product.name} />

                {/* Related Products */}
                {relatedProducts.length > 0 && (
                    <section className="related-products section">
                        <h2 className="section-title">You May Also Like</h2>
                        <div className="products-grid">
                            {relatedProducts.map((prod) => (
                                <ProductCard key={prod.id} product={prod} />
                            ))}
                        </div>
                    </section>
                )}
            </div>
        </div>
    )
}

export default ProductDetailPage
