import { useState, useEffect } from 'react'
import { useAdminAuth } from '../../context/AdminAuthContext'
import { Package, ChevronDown, ChevronUp, MapPin, Phone, FileText, X } from 'lucide-react'
import './AdminPanel.css'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'

const AdminCustomers = () => {
    const { adminToken } = useAdminAuth()

    const [customers, setCustomers] = useState([])
    const [loading, setLoading] = useState(true)
    const [statusFilter, setStatusFilter] = useState('')
    const [searchQuery, setSearchQuery] = useState('')
    const [sortBy, setSortBy] = useState('created_at')
    const [sortOrder, setSortOrder] = useState('desc')
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [totalCustomers, setTotalCustomers] = useState(0)
    const [selectedCustomer, setSelectedCustomer] = useState(null)
    const [customerDetail, setCustomerDetail] = useState(null)
    const [loadingDetail, setLoadingDetail] = useState(false)
    const [updatingStatus, setUpdatingStatus] = useState(null)

    // Orders modal state
    const [ordersModal, setOrdersModal] = useState(null)
    const [customerOrders, setCustomerOrders] = useState([])
    const [loadingOrders, setLoadingOrders] = useState(false)
    const [ordersPage, setOrdersPage] = useState(1)
    const [ordersTotalPages, setOrdersTotalPages] = useState(1)
    const [ordersTotal, setOrdersTotal] = useState(0)
    const [expandedOrder, setExpandedOrder] = useState(null)

    useEffect(() => {
        fetchCustomers()
    }, [page, statusFilter, sortBy, sortOrder])

    const fetchCustomers = async () => {
        try {
            setLoading(true)
            const params = new URLSearchParams({
                page: page.toString(),
                limit: '15',
                sort_by: sortBy,
                sort_order: sortOrder
            })
            if (statusFilter) params.append('status', statusFilter)
            if (searchQuery) params.append('search', searchQuery)

            const response = await fetch(`${API_URL}/admin/customers?${params}`, {
                headers: { 'Authorization': `Bearer ${adminToken}` }
            })
            if (response.ok) {
                const data = await response.json()
                setCustomers(data.customers)
                setTotalPages(data.pages)
                setTotalCustomers(data.total)
            }
        } catch (error) {
            console.error('Error fetching customers:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleSearch = (e) => {
        e.preventDefault()
        setPage(1)
        fetchCustomers()
    }

    const fetchCustomerDetail = async (customerId) => {
        try {
            setLoadingDetail(true)
            const response = await fetch(`${API_URL}/admin/customers/${customerId}`, {
                headers: { 'Authorization': `Bearer ${adminToken}` }
            })
            if (response.ok) {
                const data = await response.json()
                setCustomerDetail(data)
            }
        } catch (error) {
            console.error('Error fetching customer detail:', error)
        } finally {
            setLoadingDetail(false)
        }
    }

    const updateCustomerStatus = async (customerId, newStatus) => {
        try {
            setUpdatingStatus(customerId)
            const response = await fetch(`${API_URL}/admin/customers/${customerId}/status?is_active=${newStatus}`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${adminToken}` }
            })
            if (response.ok) {
                fetchCustomers()
                if (customerDetail && customerDetail.id === customerId) {
                    setCustomerDetail({ ...customerDetail, is_active: newStatus })
                }
            }
        } catch (error) {
            console.error('Error updating customer status:', error)
        } finally {
            setUpdatingStatus(null)
        }
    }

    const fetchCustomerOrders = async (customerId, pageNum = 1) => {
        try {
            setLoadingOrders(true)
            const response = await fetch(`${API_URL}/admin/customers/${customerId}/orders?page=${pageNum}&limit=10`, {
                headers: { 'Authorization': `Bearer ${adminToken}` }
            })
            if (response.ok) {
                const data = await response.json()
                setCustomerOrders(data.orders)
                setOrdersTotalPages(data.pages)
                setOrdersTotal(data.total)
                setOrdersPage(pageNum)
            }
        } catch (error) {
            console.error('Error fetching customer orders:', error)
        } finally {
            setLoadingOrders(false)
        }
    }

    const openOrdersModal = (customer) => {
        setOrdersModal(customer)
        setOrdersPage(1)
        fetchCustomerOrders(customer.id, 1)
    }

    const getStatusColor = (status) => {
        const colors = {
            pending: 'warning',
            confirmed: 'info',
            processing: 'info',
            shipped: 'info',
            delivered: 'success',
            cancelled: 'error'
        }
        return colors[status] || 'default'
    }

    const getPaymentStatusColor = (status) => {
        const colors = {
            pending: 'warning',
            completed: 'success',
            failed: 'error',
            refunded: 'info'
        }
        return colors[status] || 'default'
    }

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-BD', {
            style: 'currency',
            currency: 'BDT',
            minimumFractionDigits: 0
        }).format(amount)
    }

    const formatDate = (dateStr) => {
        if (!dateStr) return 'Never'
        return new Date(dateStr).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        })
    }

    const openCustomerDetail = (customer) => {
        setSelectedCustomer(customer)
        fetchCustomerDetail(customer.id)
    }

    const getStatusBadge = (isActive) => {
        return isActive ? (
            <span className="status-badge active">Active</span>
        ) : (
            <span className="status-badge inactive">Inactive</span>
        )
    }

    const handleSort = (field) => {
        if (sortBy === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
        } else {
            setSortBy(field)
            setSortOrder('desc')
        }
        setPage(1)
    }

    return (
        <div className="admin-customers">
            <div className="page-header">
                <div>
                    <h1>Customers</h1>
                    <p className="subtitle">Manage and view all customers ({totalCustomers} total)</p>
                </div>
            </div>

            {/* Filters */}
            <div className="filters-bar">
                <form className="search-form" onSubmit={handleSearch}>
                    <div className="search-input-wrapper">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="11" cy="11" r="8" />
                            <line x1="21" y1="21" x2="16.65" y2="16.65" />
                        </svg>
                        <input
                            type="text"
                            placeholder="Search by name, email or phone..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <button type="submit" className="btn btn-primary">Search</button>
                </form>

                <select
                    className="filter-select"
                    value={statusFilter}
                    onChange={(e) => {
                        setStatusFilter(e.target.value)
                        setPage(1)
                    }}
                >
                    <option value="">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                </select>
            </div>

            {/* Customers Table */}
            {loading ? (
                <div className="loading-state">
                    <div className="spinner"></div>
                </div>
            ) : customers.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-icon">👥</div>
                    <h3>No customers found</h3>
                    <p>Customers will appear here once they register</p>
                </div>
            ) : (
                <div className="table-container">
                    <table className="admin-table customers-table">
                        <thead>
                            <tr>
                                <th>Customer</th>
                                <th>Contact</th>
                                <th
                                    className="sortable"
                                    onClick={() => handleSort('total_orders')}
                                >
                                    Orders {sortBy === 'total_orders' && (sortOrder === 'asc' ? '↑' : '↓')}
                                </th>
                                <th
                                    className="sortable"
                                    onClick={() => handleSort('total_spent')}
                                >
                                    Total Spent {sortBy === 'total_spent' && (sortOrder === 'asc' ? '↑' : '↓')}
                                </th>
                                <th>Last Order</th>
                                <th>Status</th>
                                <th
                                    className="sortable"
                                    onClick={() => handleSort('created_at')}
                                >
                                    Joined {sortBy === 'created_at' && (sortOrder === 'asc' ? '↑' : '↓')}
                                </th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {customers.map(customer => (
                                <tr key={customer.id}>
                                    <td>
                                        <div className="customer-cell">
                                            <div className="customer-avatar">
                                                {customer.picture ? (
                                                    <img src={customer.picture} alt={customer.name} />
                                                ) : (
                                                    <span className="avatar-placeholder">
                                                        {customer.name.charAt(0).toUpperCase()}
                                                    </span>
                                                )}
                                            </div>
                                            <span className="customer-name">{customer.name}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="contact-info">
                                            <span className="customer-email">{customer.email}</span>
                                            <span className="customer-phone">{customer.phone || 'N/A'}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <span
                                            className="order-count clickable"
                                            onClick={() => customer.total_orders > 0 && openOrdersModal(customer)}
                                            style={{ cursor: customer.total_orders > 0 ? 'pointer' : 'default' }}
                                        >
                                            {customer.total_orders}
                                        </span>
                                    </td>
                                    <td>
                                        <span className="total-spent">{formatCurrency(customer.total_spent)}</span>
                                    </td>
                                    <td>
                                        <span className="last-order-date">{formatDate(customer.last_order_date)}</span>
                                    </td>
                                    <td>
                                        {getStatusBadge(customer.is_active)}
                                    </td>
                                    <td>
                                        <span className="joined-date">{formatDate(customer.created_at)}</span>
                                    </td>
                                    <td>
                                        <div className="action-buttons">
                                            <button
                                                className="btn btn-sm btn-ghost"
                                                onClick={() => openCustomerDetail(customer)}
                                            >
                                                View
                                            </button>
                                            <button
                                                className={`btn btn-sm ${customer.is_active ? 'btn-warning' : 'btn-success'}`}
                                                onClick={() => updateCustomerStatus(customer.id, !customer.is_active)}
                                                disabled={updatingStatus === customer.id}
                                            >
                                                {customer.is_active ? 'Deactivate' : 'Activate'}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
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

            {/* Customer Orders Modal - Redesigned */}
            {ordersModal && (
                <div className="modal-overlay" onClick={() => setOrdersModal(null)}>
                    <div className="orders-modal-redesigned" onClick={e => e.stopPropagation()}>
                        {/* Header */}
                        <div className="orders-modal-header">
                            <div className="orders-modal-title">
                                <Package size={24} />
                                <div>
                                    <h2>Order History</h2>
                                    <p>{ordersModal.name} • {ordersTotal} orders</p>
                                </div>
                            </div>
                            <button className="orders-modal-close" onClick={() => setOrdersModal(null)}>
                                <X size={20} />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="orders-modal-content">
                            {loadingOrders ? (
                                <div className="orders-loading">
                                    <div className="spinner"></div>
                                    <p>Loading orders...</p>
                                </div>
                            ) : customerOrders.length === 0 ? (
                                <div className="orders-empty">
                                    <Package size={48} />
                                    <p>No orders found</p>
                                </div>
                            ) : (
                                <div className="orders-table-wrapper">
                                    <table className="orders-table">
                                        <thead>
                                            <tr>
                                                <th>Order</th>
                                                <th>Date</th>
                                                <th>Items</th>
                                                <th>Total</th>
                                                <th>Status</th>
                                                <th>Payment</th>
                                                <th></th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {customerOrders.map(order => (
                                                <>
                                                    <tr
                                                        key={order.id}
                                                        className={`orders-table-row ${expandedOrder === order.id ? 'expanded' : ''}`}
                                                        onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                                                    >
                                                        <td className="order-id-cell">
                                                            <span className="order-id">#{order.order_number}</span>
                                                        </td>
                                                        <td className="order-date-cell">
                                                            {formatDate(order.created_at)}
                                                        </td>
                                                        <td className="order-items-cell">
                                                            <span className="items-count">{order.items.length} items</span>
                                                        </td>
                                                        <td className="order-total-cell">
                                                            <span className="order-total">{formatCurrency(order.total)}</span>
                                                        </td>
                                                        <td>
                                                            <span className={`status-pill status-${getStatusColor(order.status)}`}>
                                                                {order.status}
                                                            </span>
                                                        </td>
                                                        <td>
                                                            <span className={`status-pill payment-${getPaymentStatusColor(order.payment_status)}`}>
                                                                {order.payment_status}
                                                            </span>
                                                        </td>
                                                        <td className="expand-cell">
                                                            {expandedOrder === order.id ? (
                                                                <ChevronUp size={18} />
                                                            ) : (
                                                                <ChevronDown size={18} />
                                                            )}
                                                        </td>
                                                    </tr>

                                                    {/* Expanded Order Details */}
                                                    {expandedOrder === order.id && (
                                                        <tr className="order-expanded-row">
                                                            <td colSpan="7">
                                                                <div className="order-expanded-content">
                                                                    {/* Products */}
                                                                    <div className="expanded-section">
                                                                        <h4>Products</h4>
                                                                        <div className="expanded-products">
                                                                            {order.items.map(item => (
                                                                                <div key={item.id} className="expanded-product">
                                                                                    <div className="product-thumb">
                                                                                        {item.product_image ? (
                                                                                            <img src={item.product_image} alt={item.product_name} />
                                                                                        ) : (
                                                                                            <Package size={20} />
                                                                                        )}
                                                                                    </div>
                                                                                    <div className="product-info">
                                                                                        <span className="product-name">{item.product_name}</span>
                                                                                        <span className="product-meta">
                                                                                            {item.quantity} × {formatCurrency(item.price)}
                                                                                        </span>
                                                                                    </div>
                                                                                    <span className="product-total">{formatCurrency(item.total)}</span>
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    </div>

                                                                    {/* Shipping & Summary */}
                                                                    <div className="expanded-footer">
                                                                        <div className="expanded-shipping">
                                                                            <div className="shipping-icon">
                                                                                <MapPin size={16} />
                                                                            </div>
                                                                            <div className="shipping-details">
                                                                                <strong>{order.shipping_name}</strong>
                                                                                <p>{order.shipping_address}</p>
                                                                                <p>{order.shipping_area && `${order.shipping_area}, `}{order.shipping_city}</p>
                                                                                <p className="shipping-phone">
                                                                                    <Phone size={12} /> {order.shipping_phone}
                                                                                </p>
                                                                            </div>
                                                                        </div>

                                                                        <div className="expanded-summary">
                                                                            <div className="summary-line">
                                                                                <span>Subtotal</span>
                                                                                <span>{formatCurrency(order.subtotal)}</span>
                                                                            </div>
                                                                            <div className="summary-line">
                                                                                <span>Shipping</span>
                                                                                <span>{formatCurrency(order.shipping_cost)}</span>
                                                                            </div>
                                                                            <div className="summary-line summary-total">
                                                                                <span>Total</span>
                                                                                <span>{formatCurrency(order.total)}</span>
                                                                            </div>
                                                                        </div>
                                                                    </div>

                                                                    {/* Notes */}
                                                                    {order.notes && (
                                                                        <div className="expanded-notes">
                                                                            <FileText size={14} />
                                                                            <span>{order.notes}</span>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    )}
                                                </>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>

                        {/* Footer with Pagination */}
                        {ordersTotalPages > 1 && (
                            <div className="orders-modal-footer">
                                <button
                                    className="orders-page-btn"
                                    disabled={ordersPage === 1}
                                    onClick={() => fetchCustomerOrders(ordersModal.id, ordersPage - 1)}
                                >
                                    Previous
                                </button>
                                <span className="orders-page-info">
                                    Page {ordersPage} of {ordersTotalPages}
                                </span>
                                <button
                                    className="orders-page-btn"
                                    disabled={ordersPage === ordersTotalPages}
                                    onClick={() => fetchCustomerOrders(ordersModal.id, ordersPage + 1)}
                                >
                                    Next
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Customer Detail Modal */}
            {selectedCustomer && (
                <div className="modal-overlay" onClick={() => setSelectedCustomer(null)}>
                    <div className="modal-content customer-detail-modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Customer Details</h3>
                            <button className="close-btn" onClick={() => setSelectedCustomer(null)}>×</button>
                        </div>
                        <div className="modal-body">
                            {loadingDetail ? (
                                <div className="loading-state">
                                    <div className="spinner"></div>
                                </div>
                            ) : customerDetail ? (
                                <div className="customer-detail-content">
                                    {/* Customer Profile */}
                                    <div className="customer-profile-section">
                                        <div className="customer-avatar-large">
                                            {customerDetail.picture ? (
                                                <img src={customerDetail.picture} alt={customerDetail.name} />
                                            ) : (
                                                <span className="avatar-placeholder-large">
                                                    {customerDetail.name.charAt(0).toUpperCase()}
                                                </span>
                                            )}
                                        </div>
                                        <div className="customer-profile-info">
                                            <h4>{customerDetail.name}</h4>
                                            <p>{customerDetail.email}</p>
                                            <p>{customerDetail.phone || 'No phone'}</p>
                                            {getStatusBadge(customerDetail.is_active)}
                                        </div>
                                    </div>

                                    {/* Stats */}
                                    <div className="customer-stats-grid">
                                        <div className="customer-stat">
                                            <span className="stat-value">{customerDetail.total_orders}</span>
                                            <span className="stat-label">Orders</span>
                                        </div>
                                        <div className="customer-stat">
                                            <span className="stat-value">{formatCurrency(customerDetail.total_spent)}</span>
                                            <span className="stat-label">Total Spent</span>
                                        </div>
                                        <div className="customer-stat">
                                            <span className="stat-value">{formatDate(customerDetail.created_at)}</span>
                                            <span className="stat-label">Member Since</span>
                                        </div>
                                    </div>

                                    {/* Addresses */}
                                    {customerDetail.addresses && customerDetail.addresses.length > 0 && (
                                        <div className="detail-section">
                                            <h4>Saved Addresses</h4>
                                            <div className="addresses-list">
                                                {customerDetail.addresses.map(addr => (
                                                    <div key={addr.id} className="address-card">
                                                        <p><strong>{addr.name}</strong> {addr.is_default && <span className="default-badge">Default</span>}</p>
                                                        <p>{addr.address}</p>
                                                        <p>{addr.area}, {addr.city}</p>
                                                        <p>{addr.phone}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Recent Orders */}
                                    {customerDetail.recent_orders && customerDetail.recent_orders.length > 0 && (
                                        <div className="detail-section">
                                            <h4>Recent Orders</h4>
                                            <div className="recent-orders-list">
                                                {customerDetail.recent_orders.map(order => (
                                                    <div key={order.id} className="order-card">
                                                        <div className="order-card-header">
                                                            <span className="order-number">#{order.order_number}</span>
                                                            <span className={`badge-${order.status === 'delivered' ? 'success' : order.status === 'cancelled' ? 'error' : 'info'}`}>
                                                                {order.status}
                                                            </span>
                                                        </div>
                                                        <div className="order-card-body">
                                                            <span>{formatCurrency(order.total)}</span>
                                                            <span className="order-date">{formatDate(order.created_at)}</span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : null}
                        </div>
                        <div className="modal-footer">
                            <button
                                className={`btn ${customerDetail?.is_active ? 'btn-warning' : 'btn-success'}`}
                                onClick={() => {
                                    if (customerDetail) {
                                        updateCustomerStatus(customerDetail.id, !customerDetail.is_active)
                                    }
                                }}
                                disabled={updatingStatus === customerDetail?.id}
                            >
                                {customerDetail?.is_active ? 'Deactivate Account' : 'Activate Account'}
                            </button>
                            <button className="btn btn-secondary" onClick={() => setSelectedCustomer(null)}>
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default AdminCustomers
