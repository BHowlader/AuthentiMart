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
import allProducts from '../data/products'
import './HomePage.css'

const sampleProducts = allProducts.slice(0, 8)

const categories = [
    {
        id: 1,
        name: "Lip Products",
        slug: "lip-products",
        image: "/images/category-lip-products.jpg",
        count: 5,
        icon: "💄"
    },
    {
        id: 2,
        name: "Eye Products",
        slug: "eye-products",
        image: "/images/category-eye-products.jpg",
        count: 5,
        icon: "👁️"
    },
    {
        id: 3,
        name: "Face Products",
        slug: "face-products",
        image: "/images/category-face-products.jpg",
        count: 5,
        icon: "✨"
    },
    {
        id: 4,
        name: "Skincare",
        slug: "skincare",
        image: "/images/category-skincare.jpg",
        count: 8,
        icon: "🧴"
    },
    {
        id: 5,
        name: "Men's Grooming",
        slug: "mens-grooming",
        image: "/images/category-mens-grooming.jpg",
        count: 5,
        icon: "🧔"
    },
    {
        id: 6,
        name: "Tech Accessories",
        slug: "tech-accessories",
        image: "/images/category-tech-accessories.jpg",
        count: 8,
        icon: "🎧"
    },
    {
        id: 7,
        name: "Home Appliances",
        slug: "home-appliances",
        image: "/images/category-home-appliances.jpg",
        count: 4,
        icon: "🏠"
    },
    {
        id: 8,
        name: "Home Decor",
        slug: "home-decor",
        image: "/images/category-home-decor.jpg",
        count: 4,
        icon: "🪴"
    },
    {
        id: 9,
        name: "Gaming Gear",
        slug: "gaming",
        image: "/images/category-gaming.jpg",
        count: 3,
        icon: "🎮"
    },
    {
        id: 10,
        name: "Beauty Tools",
        slug: "beauty-tools",
        image: "/images/category-beauty-tools.jpg",
        count: 3,
        icon: "🖌️"
    }
]

const HomePage = () => {
    const [currentSlide, setCurrentSlide] = useState(0)

    const heroSlides = [
        {
            title: "Beauty",
            subtitle: "Premium Cosmetics",
            description: "MAC, NYX, Maybelline & K-Beauty favorites at amazing prices",
            cta: "Shop Beauty",
            link: "/products/lip-products",
            theme: "beauty",
            bgImage: "/images/hero-beauty.jpg",
            accentColor: "#FF6B9D",
            secondaryAccent: "#C44569"
        },
        {
            title: "Skincare",
            subtitle: "K-Beauty & More",
            description: "COSRX, Beauty of Joseon & The Ordinary bestsellers",
            cta: "Shop Skincare",
            link: "/products/skincare",
            theme: "skincare",
            bgImage: "/images/hero-skincare.jpg",
            accentColor: "#00D9FF",
            secondaryAccent: "#0099CC"
        },
        {
            title: "Tech",
            subtitle: "Premium Accessories",
            description: "Earbuds, power banks, chargers & gaming gear",
            cta: "Shop Tech",
            link: "/products/tech-accessories",
            theme: "tech",
            bgImage: "/images/hero-tech.jpg",
            accentColor: "#8B5CF6",
            secondaryAccent: "#6366F1"
        }
    ]

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % heroSlides.length)
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
                                onClick={() => setCurrentSlide(index)}
                                style={index === currentSlide ? { backgroundColor: slide.accentColor } : {}}
                            />
                        ))}
                    </div>
                    <div className="hero-progress">
                        <div
                            className="hero-progress-bar"
                            style={{
                                backgroundColor: heroSlides[currentSlide].accentColor,
                                animation: 'progressFill 5s linear infinite'
                            }}
                        ></div>
                    </div>
                </div>
            </section>

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

            {/* Flash Sale Banner */}
            <section className="flash-sale-banner">
                <div className="container">
                    <div className="flash-sale-content">
                        <div className="flash-sale-info">
                            <span className="flash-badge">
                                <Zap size={20} />
                                Flash Sale
                            </span>
                            <h2>Up to 50% Off!</h2>
                            <p>Limited time offer on selected items. Hurry before it's gone!</p>
                        </div>
                        <Link to="/products?sale=true" className="btn btn-primary btn-lg">
                            Shop Sale Items
                            <ArrowRight size={20} />
                        </Link>
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
                    <div className="products-grid">
                        {sampleProducts.filter(p => p.isNew).map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                </div>
            </section >

            {/* Best Sellers Section */}
            < section className="section" >
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
                    <div className="products-grid">
                        {sampleProducts.slice(0, 4).map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                </div>
            </section >

            {/* Features Section */}
            < section className="section features-section" >
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
