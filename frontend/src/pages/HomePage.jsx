import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
    ArrowRight,
    Sparkles,
    Zap,
    Star,
    TrendingUp,
    Gift
} from 'lucide-react'
import ProductCard from '../components/ProductCard'
import { FlashSaleSection } from '../components/FlashSale'
import { productsAPI, categoriesAPI } from '../utils/api'
import './HomePage.css'

// Category icons mapping (fallback when not from API)
const categoryIcons = {
    'lip-products': '👄',
    'eye-products': '👁️',
    'face-products': '✨',
    'skincare': '🧴',
    'mens-grooming': '🧔',
    'tech-accessories': '🎧',
    'home-appliances': '🏠',
    'home-decor': '🪴',
    'gaming': '🎮',
    'beauty-tools': '🖌️',
    'ladies-fashion': '👜',
    'baby-kids': '👶',
    'travel-luggage': '🧳',
    'toys-collectibles': '🧸',
    'smart-home': '📷',
    'bundles': '🎁'
}

const HomePage = () => {
    const [currentSlide, setCurrentSlide] = useState(0)
    const [categories, setCategories] = useState([])
    const [newArrivals, setNewArrivals] = useState([])
    const [bestSellers, setBestSellers] = useState([])
    const [loading, setLoading] = useState(true)
    const [imagesLoaded, setImagesLoaded] = useState(false)
    const [progressKey, setProgressKey] = useState(0)

    const heroSlides = [
        {
            title: "Beauty",
            subtitle: "Premium Cosmetics",
            description: "MAC, NYX, Maybelline & K-Beauty favorites at amazing prices",
            cta: "Shop Beauty",
            link: "/products/lip-products",
            theme: "beauty",
            bgImage: "/images/hero-beauty-new.jpg",
            accentColor: "#3d3630",
            secondaryAccent: "#302b26"
        },
        {
            title: "Skincare",
            subtitle: "K-Beauty & More",
            description: "COSRX, Beauty of Joseon & The Ordinary bestsellers",
            cta: "Shop Skincare",
            link: "/products/skincare",
            theme: "skincare",
            bgImage: "/images/hero-skin_care-new.jpg",
            accentColor: "#884a0e",
            secondaryAccent: "#6c3b0b"
        },
        {
            title: "Tech",
            subtitle: "Premium Accessories",
            description: "Earbuds, power banks, chargers & gaming gear",
            cta: "Shop Tech",
            link: "/products/tech-accessories",
            theme: "tech",
            bgImage: "/images/tech_new.jpg",
            accentColor: "#d96200",
            secondaryAccent: "#ad4e00"
        },
        {
            title: "Home Appliances",
            subtitle: "Modern Living",
            description: "Upgrade your home with premium air fryers, kettles & smart devices",
            cta: "Shop Appliances",
            link: "/products/home-appliances",
            theme: "appliances",
            bgImage: "/images/hero-appliances-new.jpg",
            accentColor: "#d8cfc0",
            secondaryAccent: "#b8a88d"
        },
        {
            title: "Home Decor",
            subtitle: "Elevate Your Space",
            description: "Chic vases, candles & aesthetic pieces for a cozy home",
            cta: "Discover Decor",
            link: "/products/home-decor",
            theme: "decor",
            bgImage: "/images/hero-decor-new.jpg",
            accentColor: "#784634",
            secondaryAccent: "#603829"
        },
        {
            title: "Ladies Fashion",
            subtitle: "Trendy & Elegant",
            description: "Shop the latest bags, jewelry, and watches for every occasion.",
            cta: "Shop Fashion",
            link: "/products/ladies-fashion",
            theme: "fashion",
            bgImage: "/images/hero-ladies_fashion-new.jpg",
            accentColor: "#884b20",
            secondaryAccent: "#6c3c19"
        },
        {
            title: "Baby & Kids",
            subtitle: "Care & Comfort",
            description: "Safe, high-quality essentials for your little ones.",
            cta: "Shop Kids",
            link: "/products/baby-kids",
            theme: "kids",
            bgImage: "/images/category-baby-kids_new.jpg",
            accentColor: "#8b5c4e",
            secondaryAccent: "#6f493e"
        },
        {
            title: "Travel Gear",
            subtitle: "Explore the World",
            description: "Durable luggage and accessories for your next adventure.",
            cta: "Shop Travel",
            link: "/products/travel-luggage",
            theme: "travel",
            bgImage: "/images/hero-travel_gear-new.jpg",
            accentColor: "#553929",
            secondaryAccent: "#442d20"
        },
        {
            title: "Toys & Fun",
            subtitle: "Play & Collect",
            description: "From STEM toys to premium anime collectibles.",
            cta: "Shop Toys",
            link: "/products/toys-collectibles",
            theme: "toys",
            bgImage: "/images/hero-toys-new.jpg",
            accentColor: "#251610",
            secondaryAccent: "#1d110c"
        },
        {
            title: "Smart Home",
            subtitle: "Intelligent Living",
            description: "Secure and automate your home with potential tech.",
            cta: "Shop Smart",
            link: "/products/smart-home",
            theme: "smarthome",
            bgImage: "/images/hero-smart_home-new.jpg",
            accentColor: "#9b0147",
            secondaryAccent: "#7c0038"
        },
        {
            title: "Gift Bundles",
            subtitle: "Perfect Presents",
            description: "Save up to 30% with exclusive curated gift sets.",
            cta: "Shop Bundles",
            link: "/products/bundles",
            theme: "bundles",
            bgImage: "/images/gift-box.jpg",
            accentColor: "#5d100b",
            secondaryAccent: "#4a0c08"
        }
    ]

    // Fetch categories and products
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true)

                // Fetch categories
                const categoriesRes = await categoriesAPI.getAll()
                const mappedCategories = (categoriesRes.data || []).map(cat => ({
                    id: cat.id,
                    name: cat.name,
                    slug: cat.slug,
                    image: cat.image || `/images/category-${cat.slug}.jpg`,
                    count: cat.product_count || 0,
                    icon: categoryIcons[cat.slug] || '📦'
                }))
                setCategories(mappedCategories)

                // Fetch products for new arrivals and best sellers
                const productsRes = await productsAPI.getAll({ page_size: 20 })
                const allProducts = (productsRes.data.items || productsRes.data || []).map(p => ({
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

                // Filter new arrivals
                const newProducts = allProducts.filter(p => p.isNew).slice(0, 4)
                setNewArrivals(newProducts.length > 0 ? newProducts : allProducts.slice(0, 4))

                // Best sellers (by rating or just first 4)
                const bestProducts = [...allProducts].sort((a, b) => b.rating - a.rating).slice(0, 4)
                setBestSellers(bestProducts)

            } catch (error) {
                console.error('Error fetching data:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [])

    // Preload hero images
    useEffect(() => {
        const imagePromises = heroSlides.map((slide) => {
            return new Promise((resolve) => {
                const img = new Image()
                img.onload = resolve
                img.onerror = resolve
                img.src = slide.bgImage
            })
        })
        Promise.all(imagePromises).then(() => setImagesLoaded(true))
    }, [])

    // Trigger initial animation on mount
    useEffect(() => {
        // Small delay to ensure DOM is ready, then trigger animation
        const timeout = setTimeout(() => {
            setProgressKey(1)
        }, 50)
        return () => clearTimeout(timeout)
    }, [])

    // Auto-advance slider with progress reset
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % heroSlides.length)
            setProgressKey((prev) => prev + 1) // Reset progress bar animation
        }, 5000)
        return () => clearInterval(timer)
    }, [])

    // Dynamic Navbar Theme Sync
    useEffect(() => {
        const currentThemeColor = heroSlides[currentSlide].accentColor;
        document.documentElement.style.setProperty('--navbar-theme-color', currentThemeColor);

        return () => {
            // Cleanup: reset when component unmounts
            document.documentElement.style.removeProperty('--navbar-theme-color');
        }
    }, [currentSlide]);

    return (
        <div className="home-page">
            {/* Hero Section */}
            <section className="hero">
                {!imagesLoaded && (
                    <div className="hero-loading">
                        <div className="hero-loading-spinner"></div>
                    </div>
                )}
                <div className="hero-slider">
                    {heroSlides.map((slide, index) => (
                        <div
                            key={index}
                            className={`hero-slide ${index === currentSlide ? 'active' : ''}`}
                            style={{
                                '--accent-color': slide.accentColor,
                                '--secondary-accent': slide.secondaryAccent
                            }}
                        >
                            {/* Full Background Image */}
                            <div className="hero-bg">
                                <img src={slide.bgImage} alt="" className="hero-bg-image" />
                                <div className="hero-overlay"></div>
                            </div>

                            {/* Decorative Elements */}
                            <div className="hero-decoration">
                                {/* Accent Lines */}
                                <div className="accent-line accent-line-1"></div>
                                <div className="accent-line accent-line-2"></div>
                                <div className="accent-line accent-line-3"></div>

                                {/* Floating Orbs */}
                                <div className="floating-orb orb-1"></div>
                                <div className="floating-orb orb-2"></div>
                                <div className="floating-orb orb-3"></div>
                            </div>

                            {/* Content */}
                            <div className="container">
                                <div className="hero-content">
                                    <span className="hero-badge" style={{ borderColor: slide.accentColor }}>
                                        <Sparkles size={16} style={{ color: slide.accentColor }} />
                                        {slide.subtitle}
                                    </span>
                                    <h1 className="hero-title">
                                        {slide.title}
                                        <span className="title-accent" style={{ color: slide.accentColor }}>.</span>
                                    </h1>
                                    <p className="hero-description">{slide.description}</p>
                                    <div className="hero-actions">
                                        <Link
                                            to={slide.link}
                                            className="btn hero-btn-primary"
                                            style={{
                                                background: `linear-gradient(135deg, ${slide.accentColor} 0%, ${slide.secondaryAccent} 100%)`
                                            }}
                                        >
                                            {slide.cta}
                                            <ArrowRight size={20} />
                                        </Link>
                                        <Link to="/products" className="btn hero-btn-outline">
                                            View All
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Progress Bar & Dots */}
                <div className="hero-progress-container">
                    <div className="hero-dots">
                        {heroSlides.map((slide, index) => (
                            <button
                                key={index}
                                className={`hero-dot ${index === currentSlide ? 'active' : ''}`}
                                onClick={() => {
                                    setCurrentSlide(index)
                                    setProgressKey((prev) => prev + 1)
                                }}
                                style={index === currentSlide ? { backgroundColor: slide.accentColor } : {}}
                            />
                        ))}
                    </div>
                    <div className="hero-progress">
                        <div
                            key={`progress-${currentSlide}-${progressKey}`}
                            className="hero-progress-bar"
                            style={{
                                backgroundColor: heroSlides[currentSlide].accentColor
                            }}
                        ></div>
                    </div>
                </div>
            </section>

            {/* Flash Sale Section - Top Priority */}
            <FlashSaleSection />

            {/* Categories Section */}
            <section className="section categories-section">
                <div className="container">
                    <div className="section-header">
                        <div>
                            <h2 className="section-title">Shop by Category</h2>
                            <p className="text-secondary">Explore our wide range of products</p>
                        </div>
                        <Link to="/products" className="section-link">
                            View All <ArrowRight size={18} />
                        </Link>
                    </div>
                    <div className="categories-grid">
                        {categories.map((category) => (
                            <Link
                                key={category.id}
                                to={`/products/${category.slug}`}
                                className="category-card"
                            >
                                <img src={category.image} alt={category.name} />
                                <div className="category-card-overlay"></div>
                                <div className="category-card-content">
                                    <span className="category-icon">{category.icon}</span>
                                    <h3 className="category-card-title">{category.name}</h3>
                                    <p className="category-card-count">{category.count} Products</p>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* New Arrivals Section */}
            <section className="section">
                <div className="container">
                    <div className="section-header">
                        <div>
                            <span className="section-badge">
                                <Gift size={16} />
                                Just Arrived
                            </span>
                            <h2 className="section-title">New Arrivals</h2>
                        </div>
                        <Link to="/products?new=true" className="section-link">
                            View All <ArrowRight size={18} />
                        </Link>
                    </div>
                    {loading ? (
                        <div className="loading-state">
                            <div className="spinner"></div>
                        </div>
                    ) : (
                        <div className="products-grid">
                            {newArrivals.map((product) => (
                                <ProductCard key={product.id} product={product} />
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* Best Sellers Section */}
            <section className="section">
                <div className="container">
                    <div className="section-header">
                        <div>
                            <span className="section-badge trending">
                                <TrendingUp size={16} />
                                Most Popular
                            </span>
                            <h2 className="section-title">Best Sellers</h2>
                        </div>
                        <Link to="/products?bestseller=true" className="section-link">
                            View All <ArrowRight size={18} />
                        </Link>
                    </div>
                    {loading ? (
                        <div className="loading-state">
                            <div className="spinner"></div>
                        </div>
                    ) : (
                        <div className="products-grid">
                            {bestSellers.map((product) => (
                                <ProductCard key={product.id} product={product} />
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* Features Section */}
            <section className="section features-section">
                <div className="container">
                    <div className="features-content">
                        <div className="features-text">
                            <h2>Why Choose <span className="text-gradient">AuthentiMart?</span></h2>
                            <p>We're committed to bringing you only the finest authentic products from trusted brands worldwide.</p>
                        </div>
                        <div className="features-list">
                            <div className="feature-card glass-card">
                                <div className="feature-icon">
                                    <Star size={28} />
                                </div>
                                <h3>100% Authentic</h3>
                                <p>Every product is verified genuine with manufacturer warranty.</p>
                            </div>
                            <div className="feature-card glass-card">
                                <div className="feature-icon secondary">
                                    <Zap size={28} />
                                </div>
                                <h3>Fast Delivery</h3>
                                <p>Get your orders delivered within 2-3 business days nationwide.</p>
                            </div>
                            <div className="feature-card glass-card">
                                <div className="feature-icon cyan">
                                    <Gift size={28} />
                                </div>
                                <h3>Easy Returns</h3>
                                <p>7-day hassle-free return policy on all products.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Newsletter Section */}
            <section className="newsletter-section">
                <div className="container">
                    <div className="newsletter-content glass-card">
                        <div className="newsletter-text">
                            <h2>Stay Updated!</h2>
                            <p>Subscribe to get exclusive offers and updates on new arrivals.</p>
                        </div>
                        <form className="newsletter-form-large">
                            <input type="email" placeholder="Enter your email address" />
                            <button type="submit" className="btn btn-primary">
                                Subscribe
                                <ArrowRight size={18} />
                            </button>
                        </form>
                    </div>
                </div>
            </section>
        </div>
    )
}

export default HomePage
