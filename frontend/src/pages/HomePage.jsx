import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import {
    ArrowRight,
    Sparkles,
    Zap,
    Star,
    Gift,
    ChevronLeft,
    ChevronRight
} from 'lucide-react'
import ProductCard from '../components/ProductCard'
import { FlashSaleSection } from '../components/FlashSale'
import SEO from '../components/SEO'
import { productsAPI, categoriesAPI } from '../utils/api'
import './HomePage.css'

// Category icons mapping (fallback when not from API)
const categoryIcons = {
    // Beauty & Cosmetics
    'lip-products': '👄',
    'eye-products': '👁️',
    'face-products': '✨',
    'skincare': '🧴',
    'beauty-tools': '🖌️',
    'cosmetics-skincare': '💄',
    'korean-skincare': '🇰🇷',
    'serums-essences': '💧',
    'cleansers-toners': '🧼',
    'moisturizers-masks': '🧖',
    'sunscreen-spf': '☀️',
    'lip-care': '💋',
    'makeup': '💅',
    // Men's
    'mens-grooming': '🧔',
    'hair-styling': '💇',
    'beard-shaving': '🪒',
    'mens-fragrances': '🧴',
    'wallets-belts': '👛',
    'mens-accessories': '⌚',
    'mens-skincare': '🧴',
    // Tech & Electronics
    'tech-accessories': '🎧',
    'earbuds-headphones': '🎧',
    'speakers-audio': '🔊',
    'phone-cases-protectors': '📱',
    'phone-accessories': '📲',
    'power-banks': '🔋',
    'chargers-cables': '🔌',
    'smartwatches-bands': '⌚',
    'storage-memory': '💾',
    // Gaming
    'gaming': '🎮',
    'gaming-peripherals': '🕹️',
    // Home & Kitchen
    'home-appliances': '🏠',
    'home-decor': '🪴',
    'kitchen-appliances': '🍳',
    'cooking-appliances': '🍲',
    'kitchenware': '🥄',
    'kitchen-storage': '🫙',
    'drinkware': '🥤',
    'lighting-lamps': '💡',
    'wall-art-decor': '🖼️',
    'home-essentials': '🏡',
    'candles-aromatherapy': '🕯️',
    // Fashion
    'ladies-fashion': '👜',
    'bags-purses': '👛',
    'jewelry': '💍',
    'womens-watches': '⌚',
    'hair-accessories': '🎀',
    // Baby & Kids
    'baby-kids': '👶',
    'baby-care': '🍼',
    'baby-feeding': '🥣',
    'kids-fashion': '👕',
    'kids-accessories': '🧢',
    'kids-toys': '🧸',
    'educational-toys': '🎓',
    // Travel
    'travel-luggage': '🧳',
    'travel': '✈️',
    'luggage-bags': '💼',
    'travel-accessories': '🎒',
    'travel-organizers': '📦',
    // Toys & Collectibles
    'toys-collectibles': '🧸',
    'anime-figures': '🎭',
    'collectibles': '🏆',
    // Smart Home
    'smart-home': '📷',
    'security-cameras': '📹',
    'smart-locks': '🔐',
    'smart-lighting': '💡',
    'smart-devices': '📡',
    // Other
    'bundles': '🎁'
}

const HomePage = () => {
    const [currentSlide, setCurrentSlide] = useState(0)
    const [categories, setCategories] = useState([])
    const [newArrivals, setNewArrivals] = useState([])
    const [bestSellers, setBestSellers] = useState([])
    const [imagesLoaded] = useState(true) // Show immediately, don't wait for images
    const [progressKey, setProgressKey] = useState(0)

    // Refs for horizontal scroll
    const newArrivalsRef = useRef(null)
    const bestSellersRef = useRef(null)

    // Scroll carousel function
    const scrollCarousel = (ref, direction) => {
        if (ref.current) {
            const scrollAmount = 300
            ref.current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth'
            })
        }
    }

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

    // Fetch all data in parallel for faster loading
    useEffect(() => {
        // Start all API calls simultaneously
        const fetchCategories = async () => {
            try {
                const res = await categoriesAPI.getHomepage(16)
                const mapped = (res.data || []).map(cat => ({
                    id: cat.id,
                    name: cat.name,
                    slug: cat.slug,
                    image: cat.image || `/images/category-${cat.slug}.jpg`,
                    count: cat.product_count || 0,
                    icon: categoryIcons[cat.slug] || '📦'
                }))
                setCategories(mapped)
            } catch (error) {
                console.error('Error fetching categories:', error)
            }
        }

        const fetchNewArrivals = async () => {
            try {
                const res = await productsAPI.getNewArrivals()
                const products = (res.data.items || []).slice(0, 10).map(p => ({
                    id: p.id,
                    name: p.name,
                    price: p.price,
                    originalPrice: p.original_price,
                    image: p.image || '/images/placeholder.png',
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
                setNewArrivals(products)
            } catch (error) {
                console.error('Error fetching new arrivals:', error)
            }
        }

        const fetchBestSellers = async () => {
            try {
                const res = await productsAPI.getBestSellers()
                const products = (res.data.items || []).slice(0, 10).map(p => ({
                    id: p.id,
                    name: p.name,
                    price: p.price,
                    originalPrice: p.original_price,
                    image: p.image || '/images/placeholder.png',
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
                setBestSellers(products)
            } catch (error) {
                console.error('Error fetching best sellers:', error)
            }
        }

        // Fire all requests in parallel - each updates UI independently
        fetchCategories()
        fetchNewArrivals()
        fetchBestSellers()
    }, [])

    // Preload remaining hero images in background (don't block render)
    useEffect(() => {
        // Defer preloading to not block initial render
        const timeoutId = setTimeout(() => {
            heroSlides.forEach((slide) => {
                const img = new Image()
                img.src = slide.bgImage
            })
        }, 100)
        return () => clearTimeout(timeoutId)
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


    return (
        <div className="home-page">
            <SEO
                title="Home"
                description="AuthentiMart - Your one-stop shop for authentic cosmetics, electronics, and home appliances in Bangladesh. Premium brands, best prices, and fast delivery."
                keywords="online shopping bd, authentic cosmetics bangladesh, electronics shop dhaka, home appliances bd"
            />
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
                        >
                            {/* Full Background Image */}
                            <div className="hero-bg">
                                <img
                                    src={slide.bgImage}
                                    alt=""
                                    className="hero-bg-image"
                                    loading={index === 0 ? "eager" : "lazy"}
                                />
                                <div className="hero-overlay"></div>
                            </div>

                            {/* Content */}
                            <div className="container">
                                <div className="hero-content">
                                    <span className="hero-badge">
                                        <Sparkles size={16} />
                                        {slide.subtitle}
                                    </span>
                                    <h1 className="hero-title">{slide.title}</h1>
                                    <p className="hero-description">{slide.description}</p>
                                    <div className="hero-actions">
                                        <Link to={slide.link} className="btn hero-btn-primary">
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
                        {heroSlides.map((_, index) => (
                            <button
                                key={index}
                                className={`hero-dot ${index === currentSlide ? 'active' : ''}`}
                                onClick={() => {
                                    setCurrentSlide(index)
                                    setProgressKey((prev) => prev + 1)
                                }}
                            />
                        ))}
                    </div>
                    <div className="hero-progress">
                        <div
                            key={`progress-${currentSlide}-${progressKey}`}
                            className="hero-progress-bar"
                        ></div>
                    </div>
                </div>
            </section>

            {/* Flash Sale Section - Top Priority */}
            <FlashSaleSection />

            {/* Categories Section - Apple Gadgets Style Grid */}
            <section className="section categories-section">
                <div className="container">
                    <div className="section-header-clean">
                        <h2 className="section-title-clean">Featured Categories</h2>
                    </div>
                    <div className="categories-grid-clean">
                        {categories.map((category) => (
                            <Link
                                key={category.id}
                                to={`/products/${category.slug}`}
                                className="category-item-clean"
                            >
                                <div className="category-image-wrapper">
                                    <img src={category.image} alt={category.name} loading="lazy" />
                                </div>
                                <span className="category-name-clean">{category.name}</span>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* New Arrivals Section - Horizontal Carousel */}
            <section className="section products-carousel-section">
                <div className="container">
                    <div className="carousel-header">
                        <h2 className="section-title-clean">New Arrivals</h2>
                        <div className="carousel-controls">
                            <button
                                className="carousel-btn"
                                onClick={() => scrollCarousel(newArrivalsRef, 'left')}
                                aria-label="Scroll left"
                            >
                                <ChevronLeft size={20} />
                            </button>
                            <button
                                className="carousel-btn"
                                onClick={() => scrollCarousel(newArrivalsRef, 'right')}
                                aria-label="Scroll right"
                            >
                                <ChevronRight size={20} />
                            </button>
                            <Link to="/products?new=true" className="view-all-link">
                                View All <ArrowRight size={16} />
                            </Link>
                        </div>
                    </div>
                    <div className="products-carousel" ref={newArrivalsRef}>
                        {newArrivals.length > 0 ? (
                            newArrivals.map((product) => (
                                <div key={product.id} className="carousel-item">
                                    <ProductCard product={product} />
                                </div>
                            ))
                        ) : (
                            /* Skeleton loaders while loading */
                            [...Array(5)].map((_, i) => (
                                <div key={i} className="carousel-item">
                                    <div className="product-card-skeleton">
                                        <div className="skeleton-image"></div>
                                        <div className="skeleton-content">
                                            <div className="skeleton-line short"></div>
                                            <div className="skeleton-line"></div>
                                            <div className="skeleton-line medium"></div>
                                            <div className="skeleton-btn"></div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </section>

            {/* Best Sellers Section - Horizontal Carousel */}
            <section className="section products-carousel-section">
                <div className="container">
                    <div className="carousel-header">
                        <h2 className="section-title-clean">Best Sellers</h2>
                        <div className="carousel-controls">
                            <button
                                className="carousel-btn"
                                onClick={() => scrollCarousel(bestSellersRef, 'left')}
                                aria-label="Scroll left"
                            >
                                <ChevronLeft size={20} />
                            </button>
                            <button
                                className="carousel-btn"
                                onClick={() => scrollCarousel(bestSellersRef, 'right')}
                                aria-label="Scroll right"
                            >
                                <ChevronRight size={20} />
                            </button>
                            <Link to="/products?bestseller=true" className="view-all-link">
                                View All <ArrowRight size={16} />
                            </Link>
                        </div>
                    </div>
                    <div className="products-carousel" ref={bestSellersRef}>
                        {bestSellers.length > 0 ? (
                            bestSellers.map((product) => (
                                <div key={product.id} className="carousel-item">
                                    <ProductCard product={product} />
                                </div>
                            ))
                        ) : (
                            /* Skeleton loaders while loading */
                            [...Array(5)].map((_, i) => (
                                <div key={i} className="carousel-item">
                                    <div className="product-card-skeleton">
                                        <div className="skeleton-image"></div>
                                        <div className="skeleton-content">
                                            <div className="skeleton-line short"></div>
                                            <div className="skeleton-line"></div>
                                            <div className="skeleton-line medium"></div>
                                            <div className="skeleton-btn"></div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
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
