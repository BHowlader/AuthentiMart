import { useState, useEffect } from 'react'
import { useAdminAuth } from '../../context/AdminAuthContext'
import './AdminPanel.css'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'

const AdminFlashSales = () => {
    const { adminToken } = useAdminAuth()

    const [flashSales, setFlashSales] = useState([])
    const [loading, setLoading] = useState(true)
    const [showModal, setShowModal] = useState(false)
    const [editingFlashSale, setEditingFlashSale] = useState(null)
    const [showDeleteModal, setShowDeleteModal] = useState(null)
    const [showItemsModal, setShowItemsModal] = useState(null)
    const [products, setProducts] = useState([])
    const [formData, setFormData] = useState({
        name: '',
        slug: '',
        start_time: '',
        end_time: '',
        banner_image: '',
        is_active: true
    })
    const [itemFormData, setItemFormData] = useState({
        product_id: '',
        flash_price: '',
        flash_stock: ''
    })

    useEffect(() => {
        fetchFlashSales()
        fetchProducts()
    }, [])

    const fetchFlashSales = async () => {
        try {
            setLoading(true)
            const response = await fetch(`${API_URL}/flash-sales`, {
                headers: { 'Authorization': `Bearer ${adminToken}` }
            })
            if (response.ok) {
                const data = await response.json()
                setFlashSales(data.items || data)
            }
        } catch (error) {
            console.error('Error fetching flash sales:', error)
        } finally {
            setLoading(false)
        }
    }

    const fetchProducts = async () => {
        try {
            const response = await fetch(`${API_URL}/admin/products?limit=100`, {
                headers: { 'Authorization': `Bearer ${adminToken}` }
            })
            if (response.ok) {
                const data = await response.json()
                setProducts(data.products || [])
            }
        } catch (error) {
            console.error('Error fetching products:', error)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            const url = editingFlashSale
                ? `${API_URL}/flash-sales/${editingFlashSale.id}`
                : `${API_URL}/flash-sales`
            const method = editingFlashSale ? 'PUT' : 'POST'

            const response = await fetch(url, {
                method,
                headers: {
                    'Authorization': `Bearer ${adminToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            })

            if (response.ok) {
                setShowModal(false)
                setEditingFlashSale(null)
                resetForm()
                fetchFlashSales()
            }
        } catch (error) {
            console.error('Error saving flash sale:', error)
        }
    }

    const handleDelete = async (id) => {
        try {
            const response = await fetch(`${API_URL}/flash-sales/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${adminToken}` }
            })
            if (response.ok) {
                setShowDeleteModal(null)
                fetchFlashSales()
            }
        } catch (error) {
            console.error('Error deleting flash sale:', error)
        }
    }

    const handleAddItem = async (e) => {
        e.preventDefault()
        try {
            const response = await fetch(`${API_URL}/flash-sales/${showItemsModal.id}/items`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${adminToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    product_id: parseInt(itemFormData.product_id),
                    flash_price: parseFloat(itemFormData.flash_price),
                    flash_stock: parseInt(itemFormData.flash_stock)
                })
            })

            if (response.ok) {
                setItemFormData({ product_id: '', flash_price: '', flash_stock: '' })
                fetchFlashSales()
                // Refresh the items modal data
                const updatedSales = await fetch(`${API_URL}/flash-sales`, {
                    headers: { 'Authorization': `Bearer ${adminToken}` }
                })
                if (updatedSales.ok) {
                    const data = await updatedSales.json()
                    const items = data.items || data
                    const updated = items.find(s => s.id === showItemsModal.id)
                    if (updated) setShowItemsModal(updated)
                }
            }
        } catch (error) {
            console.error('Error adding item:', error)
        }
    }

    const handleRemoveItem = async (itemId) => {
        try {
            const response = await fetch(`${API_URL}/flash-sales/${showItemsModal.id}/items/${itemId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${adminToken}` }
            })

            if (response.ok) {
                fetchFlashSales()
                // Refresh the items modal data
                const updatedSales = await fetch(`${API_URL}/flash-sales`, {
                    headers: { 'Authorization': `Bearer ${adminToken}` }
                })
                if (updatedSales.ok) {
                    const data = await updatedSales.json()
                    const items = data.items || data
                    const updated = items.find(s => s.id === showItemsModal.id)
                    if (updated) setShowItemsModal(updated)
                }
            }
        } catch (error) {
            console.error('Error removing item:', error)
        }
    }

    const openEditModal = (flashSale) => {
        setEditingFlashSale(flashSale)
        setFormData({
            name: flashSale.name,
            slug: flashSale.slug,
            start_time: formatDateTimeLocal(flashSale.start_time),
            end_time: formatDateTimeLocal(flashSale.end_time),
            banner_image: flashSale.banner_image || '',
            is_active: flashSale.is_active
        })
        setShowModal(true)
    }

    const resetForm = () => {
        setFormData({
            name: '',
            slug: '',
            start_time: '',
            end_time: '',
            banner_image: '',
            is_active: true
        })
    }

    const formatDateTimeLocal = (dateString) => {
        if (!dateString) return ''
        const date = new Date(dateString)
        return date.toISOString().slice(0, 16)
    }

    const formatDateTime = (dateString) => {
        return new Date(dateString).toLocaleString()
    }

    const getFlashSaleStatus = (flashSale) => {
        const now = new Date()
        const start = new Date(flashSale.start_time)
        const end = new Date(flashSale.end_time)

        if (!flashSale.is_active) return { class: 'inactive', label: 'Inactive' }
        if (now < start) return { class: 'upcoming', label: 'Upcoming' }
        if (now > end) return { class: 'expired', label: 'Expired' }
        return { class: 'active', label: 'Live' }
    }

    const generateSlug = (name) => {
        return name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '')
    }

    return (
        <div className="admin-flash-sales">
            <div className="page-header">
                <div>
                    <h1>Flash Sales</h1>
                    <p className="subtitle">Manage flash sales and time-limited offers</p>
                </div>
                <button
                    className="btn btn-primary"
                    onClick={() => {
                        setEditingFlashSale(null)
                        resetForm()
                        setShowModal(true)
                    }}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="12" y1="5" x2="12" y2="19" />
                        <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                    Create Flash Sale
                </button>
            </div>

            {loading ? (
                <div className="loading-state">
                    <div className="spinner"></div>
                </div>
            ) : flashSales.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-icon">&#9889;</div>
                    <h3>No flash sales yet</h3>
                    <p>Create your first flash sale to boost sales</p>
                    <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                        Create Flash Sale
                    </button>
                </div>
            ) : (
                <div className="table-container">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Flash Sale</th>
                                <th>Duration</th>
                                <th>Products</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {flashSales.map(flashSale => {
                                const status = getFlashSaleStatus(flashSale)
                                return (
                                    <tr key={flashSale.id}>
                                        <td>
                                            <div className="flash-sale-cell">
                                                <span className="flash-sale-name">{flashSale.name}</span>
                                                <span className="flash-sale-slug">/{flashSale.slug}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="duration-cell">
                                                <span>{formatDateTime(flashSale.start_time)}</span>
                                                <span className="duration-separator">to</span>
                                                <span>{formatDateTime(flashSale.end_time)}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <button
                                                className="items-count-btn"
                                                onClick={() => setShowItemsModal(flashSale)}
                                            >
                                                {flashSale.items?.length || 0} products
                                            </button>
                                        </td>
                                        <td>
                                            <span className={`status-badge ${status.class}`}>
                                                {status.label}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="action-buttons">
                                                <button
                                                    className="action-btn edit"
                                                    title="Edit"
                                                    onClick={() => openEditModal(flashSale)}
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                                    </svg>
                                                </button>
                                                <button
                                                    className="action-btn delete"
                                                    title="Delete"
                                                    onClick={() => setShowDeleteModal(flashSale)}
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

            {/* Create/Edit Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>{editingFlashSale ? 'Edit Flash Sale' : 'Create Flash Sale'}</h3>
                            <button className="close-btn" onClick={() => setShowModal(false)}>x</button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="modal-body">
                                <div className="form-group">
                                    <label>Name</label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => {
                                            setFormData({
                                                ...formData,
                                                name: e.target.value,
                                                slug: !editingFlashSale ? generateSlug(e.target.value) : formData.slug
                                            })
                                        }}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Slug</label>
                                    <input
                                        type="text"
                                        value={formData.slug}
                                        onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Start Time</label>
                                        <input
                                            type="datetime-local"
                                            value={formData.start_time}
                                            onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>End Time</label>
                                        <input
                                            type="datetime-local"
                                            value={formData.end_time}
                                            onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>Banner Image URL</label>
                                    <input
                                        type="url"
                                        value={formData.banner_image}
                                        onChange={(e) => setFormData({ ...formData, banner_image: e.target.value })}
                                        placeholder="https://example.com/banner.jpg"
                                    />
                                </div>
                                <div className="form-group checkbox-group">
                                    <label>
                                        <input
                                            type="checkbox"
                                            checked={formData.is_active}
                                            onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                                        />
                                        Active
                                    </label>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    {editingFlashSale ? 'Update' : 'Create'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Items Modal */}
            {showItemsModal && (
                <div className="modal-overlay" onClick={() => setShowItemsModal(null)}>
                    <div className="modal-content wide" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Flash Sale Products - {showItemsModal.name}</h3>
                            <button className="close-btn" onClick={() => setShowItemsModal(null)}>x</button>
                        </div>
                        <div className="modal-body">
                            {/* Add Product Form */}
                            <form onSubmit={handleAddItem} className="add-item-form">
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Product</label>
                                        <select
                                            value={itemFormData.product_id}
                                            onChange={(e) => setItemFormData({ ...itemFormData, product_id: e.target.value })}
                                            required
                                        >
                                            <option value="">Select a product</option>
                                            {products.map(product => (
                                                <option key={product.id} value={product.id}>
                                                    {product.name} - &#2547;{product.price}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>Flash Price</label>
                                        <input
                                            type="number"
                                            value={itemFormData.flash_price}
                                            onChange={(e) => setItemFormData({ ...itemFormData, flash_price: e.target.value })}
                                            placeholder="0.00"
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Flash Stock</label>
                                        <input
                                            type="number"
                                            value={itemFormData.flash_stock}
                                            onChange={(e) => setItemFormData({ ...itemFormData, flash_stock: e.target.value })}
                                            placeholder="0"
                                            required
                                        />
                                    </div>
                                    <button type="submit" className="btn btn-primary">Add</button>
                                </div>
                            </form>

                            {/* Items List */}
                            {showItemsModal.items?.length > 0 ? (
                                <table className="admin-table">
                                    <thead>
                                        <tr>
                                            <th>Product</th>
                                            <th>Original Price</th>
                                            <th>Flash Price</th>
                                            <th>Stock</th>
                                            <th>Sold</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {showItemsModal.items.map(item => (
                                            <tr key={item.id}>
                                                <td>{item.product?.name || `Product #${item.product_id}`}</td>
                                                <td>&#2547;{item.product?.price?.toLocaleString() || 'N/A'}</td>
                                                <td className="flash-price">&#2547;{item.flash_price?.toLocaleString()}</td>
                                                <td>{item.flash_stock}</td>
                                                <td>{item.sold_count || 0}</td>
                                                <td>
                                                    <button
                                                        className="action-btn delete"
                                                        onClick={() => handleRemoveItem(item.id)}
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                            <polyline points="3 6 5 6 21 6" />
                                                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                                        </svg>
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <div className="empty-state small">
                                    <p>No products added to this flash sale yet</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Modal */}
            {showDeleteModal && (
                <div className="modal-overlay" onClick={() => setShowDeleteModal(null)}>
                    <div className="modal-content delete-modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Delete Flash Sale</h3>
                            <button className="close-btn" onClick={() => setShowDeleteModal(null)}>x</button>
                        </div>
                        <div className="modal-body">
                            <p>Are you sure you want to delete <strong>{showDeleteModal.name}</strong>?</p>
                            <p className="warning-text">This will also remove all associated products from this sale.</p>
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

export default AdminFlashSales
