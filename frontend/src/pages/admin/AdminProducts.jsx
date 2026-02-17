import { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAdminAuth } from '../../context/AdminAuthContext'
import { ADMIN_PATH } from '../../config/adminConfig'
import './AdminPanel.css'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'
const BASE_URL = API_URL.replace('/api/v1', '')

const AdminProducts = () => {
    const { adminToken } = useAdminAuth()
    const navigate = useNavigate()
    const [searchParams, setSearchParams] = useSearchParams()

    const [products, setProducts] = useState([])
    const [categories, setCategories] = useState([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState(searchParams.get('search') || '')
    const [categoryFilter, setCategoryFilter] = useState(searchParams.get('category') || '')
    const [page, setPage] = useState(parseInt(searchParams.get('page')) || 1)
    const [totalPages, setTotalPages] = useState(1)
    const [showDeleteModal, setShowDeleteModal] = useState(null)

    useEffect(() => {
        fetchProducts()
        fetchCategories()
    }, [page, categoryFilter])

    const fetchProducts = async () => {
        try {
            setLoading(true)
            const params = new URLSearchParams({
                page: page.toString(),
                limit: '20'
            })
            if (search) params.append('search', search)
            if (categoryFilter) params.append('category_id', categoryFilter)

            const response = await fetch(`${API_URL}/admin/products?${params}`, {
                headers: { 'Authorization': `Bearer ${adminToken}` }
            })
            if (response.ok) {
                const data = await response.json()
                setProducts(data.products)
                setTotalPages(data.pages)
            }
        } catch (error) {
            console.error('Error fetching products:', error)
        } finally {
            setLoading(false)
        }
    }

    const fetchCategories = async () => {
        try {
            const response = await fetch(`${API_URL}/admin/categories`, {
                headers: { 'Authorization': `Bearer ${adminToken}` }
            })
            if (response.ok) {
                setCategories(await response.json())
            }
        } catch (error) {
            console.error('Error fetching categories:', error)
        }
    }

    const handleSearch = (e) => {
        e.preventDefault()
        setPage(1)
        fetchProducts()
    }

    const handleDelete = async (productId) => {
        try {
            const response = await fetch(`${API_URL}/admin/products/${productId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${adminToken}` }
            })
            if (response.ok) {
                setShowDeleteModal(null)
                fetchProducts()
            }
        } catch (error) {
            console.error('Error deleting product:', error)
        }
    }

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-BD', {
            style: 'currency',
            currency: 'BDT',
            minimumFractionDigits: 0
        }).format(amount)
    }

    const getStockStatus = (stock) => {
        if (stock === 0) return { class: 'out', label: 'Out of Stock' }
        if (stock < 5) return { class: 'critical', label: 'Critical' }
        if (stock < 10) return { class: 'low', label: 'Low Stock' }
        return { class: 'healthy', label: 'In Stock' }
    }

    return (
        <div className="admin-products">
            <div className="page-header">
                <div>
                    <h1>Products</h1>
                    <p className="subtitle">Manage your product catalog</p>
                </div>
                <Link to={`${ADMIN_PATH}/products/new`} className="btn btn-primary">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="12" y1="5" x2="12" y2="19" />
                        <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                    Add Product
                </Link>
            </div>

            {/* Filters */}
            <div className="filters-bar">
                <form onSubmit={handleSearch} className="search-form">
                    <div className="search-input-wrapper">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="11" cy="11" r="8" />
                            <path d="m21 21-4.3-4.3" />
                        </svg>
                        <input
                            type="text"
                            placeholder="Search products..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <button type="submit" className="btn btn-secondary">Search</button>
                </form>

                <select
                    className="filter-select"
                    value={categoryFilter}
                    onChange={(e) => {
                        setCategoryFilter(e.target.value)
                        setPage(1)
                    }}
                >
                    <option value="">All Categories</option>
                    {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                </select>
            </div>

            {/* Products Table */}
            {loading ? (
                <div className="loading-state">
                    <div className="spinner"></div>
                </div>
            ) : products.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-icon">📦</div>
                    <h3>No products found</h3>
                    <p>Start by adding your first product</p>
                    <Link to={`${ADMIN_PATH}/products/new`} className="btn btn-primary">Add Product</Link>
                </div>
            ) : (
                <div className="table-container">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Product</th>
                                <th>Category</th>
                                <th>Price</th>
                                <th>Stock</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.map(product => {
                                const stockStatus = getStockStatus(product.stock)
                                return (
                                    <tr key={product.id}>
                                        <td>
                                            <div className="product-cell">
                                                <div className="product-image">
                                                    {product.image ? (
                                                        <img src={product.image.startsWith('http') ? product.image : `${BASE_URL}${product.image}`} alt={product.name} />
                                                    ) : (
                                                        <div className="no-image">📦</div>
                                                    )}
                                                </div>
                                                <div className="product-info">
                                                    <span className="product-name">{product.name}</span>
                                                    <span className="product-sku">SKU: {product.sku || 'N/A'}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td>{product.category || 'Uncategorized'}</td>
                                        <td>
                                            <div className="price-cell">
                                                <span className="current-price">{formatCurrency(product.price)}</span>
                                                {product.original_price && product.original_price > product.price && (
                                                    <span className="original-price">{formatCurrency(product.original_price)}</span>
                                                )}
                                            </div>
                                        </td>
                                        <td>
                                            <span className={`stock-count ${stockStatus.class}`}>
                                                {product.stock} units
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`status-badge ${product.is_active ? 'active' : 'inactive'}`}>
                                                {product.is_active ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="action-buttons">
                                                <Link
                                                    to={`${ADMIN_PATH}/products/${product.id}/edit`}
                                                    className="action-btn edit"
                                                    title="Edit"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                                    </svg>
                                                </Link>
                                                <button
                                                    className="action-btn delete"
                                                    title="Delete"
                                                    onClick={() => setShowDeleteModal(product)}
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                        <polyline points="3 6 5 6 21 6" />
                                                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="pagination">
                    <button
                        className="pagination-btn"
                        disabled={page === 1}
                        onClick={() => setPage(p => p - 1)}
                    >
                        Previous
                    </button>
                    <span className="pagination-info">
                        Page {page} of {totalPages}
                    </span>
                    <button
                        className="pagination-btn"
                        disabled={page === totalPages}
                        onClick={() => setPage(p => p + 1)}
                    >
                        Next
                    </button>
                </div>
            )}

            {/* Delete Modal */}
            {showDeleteModal && (
                <div className="modal-overlay" onClick={() => setShowDeleteModal(null)}>
                    <div className="modal-content delete-modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Delete Product</h3>
                            <button className="close-btn" onClick={() => setShowDeleteModal(null)}>×</button>
                        </div>
                        <div className="modal-body">
                            <p>Are you sure you want to delete <strong>{showDeleteModal.name}</strong>?</p>
                            <p className="warning-text">This action cannot be undone.</p>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={() => setShowDeleteModal(null)}>
                                Cancel
                            </button>
                            <button className="btn btn-danger" onClick={() => handleDelete(showDeleteModal.id)}>
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default AdminProducts
