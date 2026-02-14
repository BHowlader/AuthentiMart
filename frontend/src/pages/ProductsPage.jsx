import { useState, useEffect } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { Filter, Grid, List, ChevronDown, X, SlidersHorizontal } from 'lucide-react'
import ProductCard from '../components/ProductCard'
import { productsAPI, categoriesAPI } from '../utils/api'
import './ProductsPage.css'

const sortOptions = [
    { label: 'Newest', value: 'newest' },
    { label: 'Price: Low to High', value: 'price_low' },
    { label: 'Price: High to Low', value: 'price_high' },
    { label: 'Best Rating', value: 'rating' },
    { label: 'Most Popular', value: 'popular' },
]

const ProductsPage = () => {
    const { category } = useParams()
    const [searchParams] = useSearchParams()
    const searchQuery = searchParams.get('search') || ''

    const [products, setProducts] = useState([])
    const [filteredProducts, setFilteredProducts] = useState([])
    const [categories, setCategories] = useState([{ name: 'All', slug: '' }])
    const [selectedCategory, setSelectedCategory] = useState(category || '')
    const [sortBy, setSortBy] = useState('newest')
    const [priceRange, setPriceRange] = useState([0, 100000])
    const [showFilters, setShowFilters] = useState(false)
    const [viewMode, setViewMode] = useState('grid')
    const [loading, setLoading] = useState(true)
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [loadingMore, setLoadingMore] = useState(false)

    // Fetch categories
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await categoriesAPI.getAll()
                const cats = response.data.map(cat => ({
                    name: cat.name,
                    slug: cat.slug
                }))
                setCategories([{ name: 'All', slug: '' }, ...cats])
            } catch (error) {
                console.error('Error fetching categories:', error)
            }
        }
        fetchCategories()
    }, [])

    // Map API products to frontend format
    const mapProducts = (items) => {
        return (items || []).map(p => ({
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
            slug: p.slug,
            description: p.description || ''
        }))
    }

    // Fetch products
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setLoading(true)
                setPage(1)
                const params = {
                    page: 1,
                    page_size: 24,
                    sort: sortBy
                }
                if (selectedCategory) {
                    params.category = selectedCategory
                }
                if (searchQuery) {
                    params.search = searchQuery
                }
                if (priceRange[0] > 0) {
                    params.min_price = priceRange[0]
                }
                if (priceRange[1] < 100000) {
                    params.max_price = priceRange[1]
                }

                const response = await productsAPI.getAll(params)
                const data = response.data

                setProducts(mapProducts(data.items || data || []))
                setTotalPages(data.total_pages || 1)
            } catch (error) {
                console.error('Error fetching products:', error)
                setProducts([])
            } finally {
                setLoading(false)
            }
        }
        fetchProducts()
    }, [selectedCategory, searchQuery, sortBy, priceRange])

    // Load more products
    const loadMoreProducts = async () => {
        if (loadingMore || page >= totalPages) return

        try {
            setLoadingMore(true)
            const nextPage = page + 1
            const params = {
                page: nextPage,
                page_size: 24,
                sort: sortBy
            }
            if (selectedCategory) {
                params.category = selectedCategory
            }
            if (searchQuery) {
                params.search = searchQuery
            }
            if (priceRange[0] > 0) {
                params.min_price = priceRange[0]
            }
            if (priceRange[1] < 100000) {
                params.max_price = priceRange[1]
            }

            const response = await productsAPI.getAll(params)
            const data = response.data

            setProducts(prev => [...prev, ...mapProducts(data.items || data || [])])
            setPage(nextPage)
        } catch (error) {
            console.error('Error loading more products:', error)
        } finally {
            setLoadingMore(false)
        }
    }

    useEffect(() => {
        if (category) {
            setSelectedCategory(category)
        }
    }, [category])

    // Update filtered products when products change (sorting/filtering done by backend)
    useEffect(() => {
        setFilteredProducts(products)
    }, [products])

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
                        {loading ? (
                            <div className="loading-state">
                                <div className="spinner"></div>
                                <p>Loading products...</p>
                            </div>
                        ) : filteredProducts.length > 0 ? (
                            <>
                                <div className={`products-grid ${viewMode}`}>
                                    {filteredProducts.map((product) => (
                                        <ProductCard key={product.id} product={product} />
                                    ))}
                                </div>

                                {/* Load More Button */}
                                {page < totalPages && (
                                    <div className="load-more-container">
                                        <button
                                            className="btn btn-primary load-more-btn"
                                            onClick={loadMoreProducts}
                                            disabled={loadingMore}
                                        >
                                            {loadingMore ? 'Loading...' : 'Load More'}
                                        </button>
                                    </div>
                                )}
                            </>
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
