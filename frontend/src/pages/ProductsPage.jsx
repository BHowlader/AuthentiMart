import { useState, useEffect } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { Filter, Grid, List, ChevronDown, X, SlidersHorizontal } from 'lucide-react'
import ProductCard from '../components/ProductCard'
import allProducts from '../data/products'
import './ProductsPage.css'

const categories = [
    { name: 'All', slug: '' },
    { name: 'Lip Products', slug: 'lip-products' },
    { name: 'Eye Products', slug: 'eye-products' },
    { name: 'Face Products', slug: 'face-products' },
    { name: 'Skincare', slug: 'skincare' },
    { name: "Men's Grooming", slug: 'mens-grooming' },
    { name: 'Tech Accessories', slug: 'tech-accessories' },
    { name: 'Gaming', slug: 'gaming' },
    { name: 'Home Appliances', slug: 'home-appliances' },
    { name: 'Home Decor', slug: 'home-decor' },
    { name: 'Beauty Tools', slug: 'beauty-tools' },
]

const sortOptions = [
    { label: 'Featured', value: 'featured' },
    { label: 'Price: Low to High', value: 'price-asc' },
    { label: 'Price: High to Low', value: 'price-desc' },
    { label: 'Newest', value: 'newest' },
    { label: 'Best Rating', value: 'rating' },
]

const ProductsPage = () => {
    const { category } = useParams()
    const [searchParams] = useSearchParams()
    const searchQuery = searchParams.get('search') || ''

    const [products, setProducts] = useState([])
    const [filteredProducts, setFilteredProducts] = useState([])
    const [selectedCategory, setSelectedCategory] = useState(category || '')
    const [sortBy, setSortBy] = useState('featured')
    const [priceRange, setPriceRange] = useState([0, 100000])
    const [showFilters, setShowFilters] = useState(false)
    const [viewMode, setViewMode] = useState('grid')

    useEffect(() => {
        // Simulate API fetch
        setProducts(allProducts)
    }, [])

    useEffect(() => {
        if (category) {
            setSelectedCategory(category)
        }
    }, [category])

    useEffect(() => {
        let filtered = [...products]

        // Filter by category
        if (selectedCategory) {
            filtered = filtered.filter(p => p.categorySlug === selectedCategory)
        }

        // Filter by search query
        if (searchQuery) {
            filtered = filtered.filter(p =>
                p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                p.brand.toLowerCase().includes(searchQuery.toLowerCase())
            )
        }

        // Filter by price
        filtered = filtered.filter(p => p.price >= priceRange[0] && p.price <= priceRange[1])

        // Sort
        switch (sortBy) {
            case 'price-asc':
                filtered.sort((a, b) => a.price - b.price)
                break
            case 'price-desc':
                filtered.sort((a, b) => b.price - a.price)
                break
            case 'newest':
                filtered.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0))
                break
            case 'rating':
                filtered.sort((a, b) => b.rating - a.rating)
                break
            default:
                break
        }

        setFilteredProducts(filtered)
    }, [products, selectedCategory, searchQuery, priceRange, sortBy])

    const getCategoryName = () => {
        if (searchQuery) return `Search: "${searchQuery}"`
        const cat = categories.find(c => c.slug === selectedCategory)
        return cat ? cat.name : 'All Products'
    }

    return (
        <div className="products-page">
            <div className="container">
                {/* Page Header */}
                <div className="page-header">
                    <div>
                        <h1>{getCategoryName()}</h1>
                        <p className="text-secondary">{filteredProducts.length} products found</p>
                    </div>
                </div>

                <div className="products-layout">
                    {/* Sidebar Filters - Desktop */}
                    <aside className={`filters-sidebar ${showFilters ? 'show' : ''}`}>
                        <div className="filters-header">
                            <h3><Filter size={18} /> Filters</h3>
                            <button className="close-filters" onClick={() => setShowFilters(false)}>
                                <X size={20} />
                            </button>
                        </div>

                        {/* Categories */}
                        <div className="filter-group">
                            <h4>Categories</h4>
                            <div className="filter-options">
                                {categories.map((cat) => (
                                    <label key={cat.slug} className="filter-option">
                                        <input
                                            type="radio"
                                            name="category"
                                            checked={selectedCategory === cat.slug}
                                            onChange={() => setSelectedCategory(cat.slug)}
                                        />
                                        <span className="checkmark"></span>
                                        {cat.name}
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Price Range */}
                        <div className="filter-group">
                            <h4>Price Range</h4>
                            <div className="price-inputs">
                                <input
                                    type="number"
                                    placeholder="Min"
                                    value={priceRange[0]}
                                    onChange={(e) => setPriceRange([parseInt(e.target.value) || 0, priceRange[1]])}
                                />
                                <span>-</span>
                                <input
                                    type="number"
                                    placeholder="Max"
                                    value={priceRange[1]}
                                    onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value) || 100000])}
                                />
                            </div>
                        </div>

                        {/* Clear Filters */}
                        <button
                            className="btn btn-outline btn-sm"
                            onClick={() => {
                                setSelectedCategory('')
                                setPriceRange([0, 100000])
                            }}
                        >
                            Clear All Filters
                        </button>
                    </aside>

                    {/* Products Grid */}
                    <div className="products-main">
                        {/* Toolbar */}
                        <div className="products-toolbar">
                            <button
                                className="btn btn-secondary filter-toggle"
                                onClick={() => setShowFilters(true)}
                            >
                                <SlidersHorizontal size={18} />
                                Filters
                            </button>

                            <div className="toolbar-right">
                                {/* Sort Dropdown */}
                                <div className="sort-dropdown">
                                    <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                                        {sortOptions.map((option) => (
                                            <option key={option.value} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                    <ChevronDown size={16} />
                                </div>

                                {/* View Toggle */}
                                <div className="view-toggle">
                                    <button
                                        className={viewMode === 'grid' ? 'active' : ''}
                                        onClick={() => setViewMode('grid')}
                                    >
                                        <Grid size={18} />
                                    </button>
                                    <button
                                        className={viewMode === 'list' ? 'active' : ''}
                                        onClick={() => setViewMode('list')}
                                    >
                                        <List size={18} />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Active Filters */}
                        {(selectedCategory || searchQuery) && (
                            <div className="active-filters">
                                {selectedCategory && (
                                    <span className="filter-tag">
                                        {categories.find(c => c.slug === selectedCategory)?.name}
                                        <button onClick={() => setSelectedCategory('')}>
                                            <X size={14} />
                                        </button>
                                    </span>
                                )}
                                {searchQuery && (
                                    <span className="filter-tag">
                                        Search: {searchQuery}
                                    </span>
                                )}
                            </div>
                        )}

                        {/* Products Grid */}
                        {filteredProducts.length > 0 ? (
                            <div className={`products-grid ${viewMode}`}>
                                {filteredProducts.map((product) => (
                                    <ProductCard key={product.id} product={product} />
                                ))}
                            </div>
                        ) : (
                            <div className="no-products">
                                <h3>No products found</h3>
                                <p>Try adjusting your filters or search query</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Filter Overlay */}
            {showFilters && (
                <div className="filter-overlay" onClick={() => setShowFilters(false)} />
            )}
        </div>
    )
}

export default ProductsPage
