import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import './AdminPanel.css'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'
const BASE_URL = API_URL.replace('/api/v1', '')

const AdminInventory = () => {
    const { token } = useAuth()
    const [searchParams, setSearchParams] = useSearchParams()

    const [inventory, setInventory] = useState([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState(searchParams.get('filter') || 'all')
    const [editingStock, setEditingStock] = useState(null)
    const [newStock, setNewStock] = useState('')

    useEffect(() => {
        fetchInventory()
    }, [filter])

    const fetchInventory = async () => {
        try {
            setLoading(true)
            const response = await fetch(`${API_URL}/admin/inventory?filter=${filter}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            if (response.ok) {
                setInventory(await response.json())
            }
        } catch (error) {
            console.error('Error fetching inventory:', error)
        } finally {
            setLoading(false)
        }
    }

    const updateStock = async (productId) => {
        try {
            const response = await fetch(`${API_URL}/admin/inventory/${productId}/stock?stock=${newStock}`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` }
            })
            if (response.ok) {
                setEditingStock(null)
                setNewStock('')
                fetchInventory()
            }
        } catch (error) {
            console.error('Error updating stock:', error)
        }
    }

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-BD', {
            style: 'currency',
            currency: 'BDT',
            minimumFractionDigits: 0
        }).format(amount)
    }

    const getStatusInfo = (status) => {
        const statusMap = {
            healthy: { class: 'healthy', label: 'Healthy', icon: '✓' },
            low: { class: 'low', label: 'Low Stock', icon: '⚠' },
            critical: { class: 'critical', label: 'Critical', icon: '⚠' },
            out_of_stock: { class: 'out', label: 'Out of Stock', icon: '✕' }
        }
        return statusMap[status] || statusMap.healthy
    }

    const stats = {
        total: inventory.length,
        healthy: inventory.filter(i => i.status === 'healthy').length,
        low: inventory.filter(i => i.status === 'low').length,
        critical: inventory.filter(i => i.status === 'critical').length,
        outOfStock: inventory.filter(i => i.status === 'out_of_stock').length
    }

    return (
        <div className="admin-inventory">
            <div className="page-header">
                <div>
                    <h1>Inventory Management</h1>
                    <p className="subtitle">Monitor and manage your product stock levels</p>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="inventory-stats">
                <div className="inv-stat-card">
                    <span className="inv-stat-value">{stats.total}</span>
                    <span className="inv-stat-label">Total Products</span>
                </div>
                <div className="inv-stat-card healthy">
                    <span className="inv-stat-value">{stats.healthy}</span>
                    <span className="inv-stat-label">Healthy Stock</span>
                </div>
                <div className="inv-stat-card low">
                    <span className="inv-stat-value">{stats.low}</span>
                    <span className="inv-stat-label">Low Stock</span>
                </div>
                <div className="inv-stat-card critical">
                    <span className="inv-stat-value">{stats.critical}</span>
                    <span className="inv-stat-label">Critical</span>
                </div>
                <div className="inv-stat-card out">
                    <span className="inv-stat-value">{stats.outOfStock}</span>
                    <span className="inv-stat-label">Out of Stock</span>
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="filter-tabs">
                {[
                    { value: 'all', label: 'All Products' },
                    { value: 'low', label: 'Low Stock' },
                    { value: 'out', label: 'Out of Stock' }
                ].map(tab => (
                    <button
                        key={tab.value}
                        className={`filter-tab ${filter === tab.value ? 'active' : ''}`}
                        onClick={() => {
                            setFilter(tab.value)
                            setSearchParams({ filter: tab.value })
                        }}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Inventory Table */}
            {loading ? (
                <div className="loading-state">
                    <div className="spinner"></div>
                </div>
            ) : inventory.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-icon">📦</div>
                    <h3>No products found</h3>
                    <p>All products have healthy stock levels</p>
                </div>
            ) : (
                <div className="table-container">
                    <table className="admin-table inventory-table">
                        <thead>
                            <tr>
                                <th>Product</th>
                                <th>Category</th>
                                <th>Price</th>
                                <th>Current Stock</th>
                                <th>Total Sold</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {inventory.map(item => {
                                const statusInfo = getStatusInfo(item.status)
                                return (
                                    <tr key={item.id} className={`status-${item.status}`}>
                                        <td>
                                            <div className="product-cell">
                                                <div className="product-image">
                                                    {item.image ? (
                                                        <img src={`${BASE_URL}${item.image}`} alt={item.name} />
                                                    ) : (
                                                        <div className="no-image">📦</div>
                                                    )}
                                                </div>
                                                <span className="product-name">{item.name}</span>
                                            </div>
                                        </td>
                                        <td>{item.category}</td>
                                        <td>{formatCurrency(item.price)}</td>
                                        <td>
                                            {editingStock === item.id ? (
                                                <div className="stock-edit">
                                                    <input
                                                        type="number"
                                                        value={newStock}
                                                        onChange={(e) => setNewStock(e.target.value)}
                                                        min="0"
                                                        autoFocus
                                                    />
                                                    <button
                                                        className="save-btn"
                                                        onClick={() => updateStock(item.id)}
                                                    >
                                                        ✓
                                                    </button>
                                                    <button
                                                        className="cancel-btn"
                                                        onClick={() => {
                                                            setEditingStock(null)
                                                            setNewStock('')
                                                        }}
                                                    >
                                                        ✕
                                                    </button>
                                                </div>
                                            ) : (
                                                <span className={`stock-count ${statusInfo.class}`}>
                                                    {item.stock} units
                                                </span>
                                            )}
                                        </td>
                                        <td>
                                            <span className="sold-count">{item.sold} sold</span>
                                        </td>
                                        <td>
                                            <span className={`status-badge ${statusInfo.class}`}>
                                                {statusInfo.icon} {statusInfo.label}
                                            </span>
                                        </td>
                                        <td>
                                            <button
                                                className="btn btn-sm btn-secondary"
                                                onClick={() => {
                                                    setEditingStock(item.id)
                                                    setNewStock(item.stock.toString())
                                                }}
                                            >
                                                Update Stock
                                            </button>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    )
}

export default AdminInventory
