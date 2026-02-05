import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import {
    Search,
    ShoppingCart,
    Heart,
    User,
    Menu,
    X,
    ChevronDown,
    LogOut,
    Package,
    Settings,
    Home
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { useWishlist } from '../context/WishlistContext'
import './Navbar.css'

const Navbar = () => {
    const [isScrolled, setIsScrolled] = useState(false)
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const [isSearchOpen, setIsSearchOpen] = useState(false)

    const navigate = useNavigate()
    const location = useLocation()
    const { isAuthenticated, user, logout } = useAuth()
    const { getItemCount } = useCart()
    const { itemCount: wishlistCount } = useWishlist()

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50)
        }
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    useEffect(() => {
        setIsMobileMenuOpen(false)
    }, [location])

    const handleSearch = (e) => {
        e.preventDefault()
        if (searchQuery.trim()) {
            navigate(`/products?search=${encodeURIComponent(searchQuery)}`)
            setSearchQuery('')
            setIsSearchOpen(false)
        }
    }

    const handleLogout = () => {
        logout()
        setIsUserMenuOpen(false)
        navigate('/')
    }

    const categories = [
        { name: 'Lip Products', path: '/products/lip-products', icon: '💄' },
        { name: 'Eye Products', path: '/products/eye-products', icon: '👁️' },
        { name: 'Face Products', path: '/products/face-products', icon: '✨' },
        { name: 'Skincare', path: '/products/skincare', icon: '🧴' },
        { name: "Men's Grooming", path: '/products/mens-grooming', icon: '🧔' },
        { name: 'Tech Accessories', path: '/products/tech-accessories', icon: '🎧' },
        { name: 'Home Appliances', path: '/products/home-appliances', icon: '🏠' },
        { name: 'Home Decor', path: '/products/home-decor', icon: '🪴' },
    ]

    return (
        <header className={`navbar ${isScrolled ? 'scrolled' : ''}`}>
            <div className="navbar-container container">
                {/* Logo */}
                <Link to="/" className="navbar-logo">
                    <div className="logo-icon">🛍️</div>
                    <span className="logo-text">AuthentiMart</span>
                </Link>

                {/* Desktop Navigation */}
                <nav className="navbar-nav desktop-nav">
                    <Link to="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}>
                        Home
                    </Link>
                    <div className="nav-dropdown">
                        <button className="nav-link dropdown-trigger">
                            Categories <ChevronDown size={16} />
                        </button>
                        <div className="dropdown-menu">
                            {categories.map((cat) => (
                                <Link key={cat.path} to={cat.path} className="dropdown-item">
                                    <span>{cat.icon}</span>
                                    {cat.name}
                                </Link>
                            ))}
                        </div>
                    </div>
                    <Link to="/products" className={`nav-link ${location.pathname === '/products' ? 'active' : ''}`}>
                        All Products
                    </Link>
                </nav>

                {/* Search Bar - Desktop */}
                <form className="navbar-search desktop-search" onSubmit={handleSearch}>
                    <Search size={18} />
                    <input
                        type="text"
                        placeholder="Search products..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </form>

                {/* Actions */}
                <div className="navbar-actions">
                    {/* Mobile Search Toggle */}
                    <button
                        className="action-btn mobile-search-toggle"
                        onClick={() => setIsSearchOpen(!isSearchOpen)}
                    >
                        <Search size={22} />
                    </button>

                    {/* Wishlist */}
                    <Link to="/wishlist" className="action-btn">
                        <Heart size={22} />
                        {wishlistCount > 0 && (
                            <span className="action-badge">{wishlistCount}</span>
                        )}
                    </Link>

                    {/* Cart */}
                    <Link to="/cart" className="action-btn">
                        <ShoppingCart size={22} />
                        {getItemCount() > 0 && (
                            <span className="action-badge">{getItemCount()}</span>
                        )}
                    </Link>

                    {/* User Menu */}
                    {isAuthenticated ? (
                        <div className="user-menu-container">
                            <button
                                className="action-btn user-btn"
                                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                            >
                                <div className="user-avatar">
                                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                                </div>
                            </button>
                            {isUserMenuOpen && (
                                <>
                                    <div className="menu-overlay" onClick={() => setIsUserMenuOpen(false)} />
                                    <div className="user-dropdown">
                                        <div className="user-info">
                                            <div className="user-avatar-lg">
                                                {user?.name?.charAt(0).toUpperCase() || 'U'}
                                            </div>
                                            <div>
                                                <p className="user-name">{user?.name}</p>
                                                <p className="user-email">{user?.email}</p>
                                            </div>
                                        </div>
                                        <div className="dropdown-divider" />
                                        <Link to="/profile" className="dropdown-link" onClick={() => setIsUserMenuOpen(false)}>
                                            <Settings size={18} />
                                            My Profile
                                        </Link>
                                        <Link to="/orders" className="dropdown-link" onClick={() => setIsUserMenuOpen(false)}>
                                            <Package size={18} />
                                            My Orders
                                        </Link>
                                        <div className="dropdown-divider" />
                                        <button className="dropdown-link logout-btn" onClick={handleLogout}>
                                            <LogOut size={18} />
                                            Logout
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    ) : (
                        <Link to="/login" className="btn btn-primary btn-sm login-btn">
                            Login
                        </Link>
                    )}

                    {/* Mobile Menu Toggle */}
                    <button
                        className="action-btn mobile-menu-toggle"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    >
                        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </div>

            {/* Mobile Search */}
            {isSearchOpen && (
                <div className="mobile-search">
                    <form onSubmit={handleSearch}>
                        <Search size={18} />
                        <input
                            type="text"
                            placeholder="Search products..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            autoFocus
                        />
                        <button type="button" onClick={() => setIsSearchOpen(false)}>
                            <X size={18} />
                        </button>
                    </form>
                </div>
            )}

            {/* Mobile Menu */}
            {isMobileMenuOpen && (
                <div className="mobile-menu">
                    <nav className="mobile-nav">
                        <Link to="/" className="mobile-nav-link">
                            <Home size={20} />
                            Home
                        </Link>
                        <div className="mobile-nav-section">
                            <p className="mobile-nav-title">Categories</p>
                            {categories.map((cat) => (
                                <Link key={cat.path} to={cat.path} className="mobile-nav-link">
                                    <span>{cat.icon}</span>
                                    {cat.name}
                                </Link>
                            ))}
                        </div>
                        <Link to="/products" className="mobile-nav-link">
                            All Products
                        </Link>
                        {isAuthenticated ? (
                            <>
                                <div className="mobile-nav-section">
                                    <p className="mobile-nav-title">Account</p>
                                    <Link to="/profile" className="mobile-nav-link">
                                        <Settings size={20} />
                                        My Profile
                                    </Link>
                                    <Link to="/orders" className="mobile-nav-link">
                                        <Package size={20} />
                                        My Orders
                                    </Link>
                                    <button className="mobile-nav-link logout" onClick={handleLogout}>
                                        <LogOut size={20} />
                                        Logout
                                    </button>
                                </div>
                            </>
                        ) : (
                            <div className="mobile-nav-auth">
                                <Link to="/login" className="btn btn-primary">Login</Link>
                                <Link to="/register" className="btn btn-secondary">Register</Link>
                            </div>
                        )}
                    </nav>
                </div>
            )}
        </header>
    )
}

export default Navbar
