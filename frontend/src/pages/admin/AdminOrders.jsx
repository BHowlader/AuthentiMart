import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useAdminAuth } from '../../context/AdminAuthContext'
import './AdminPanel.css'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'

const AdminOrders = () => {
    const { adminToken } = useAdminAuth()
    const [searchParams, setSearchParams] = useSearchParams()

    const [orders, setOrders] = useState([])
    const [loading, setLoading] = useState(true)
    const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || '')
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [selectedOrder, setSelectedOrder] = useState(null)
    const [updatingStatus, setUpdatingStatus] = useState(null)

    useEffect(() => {
        fetchOrders()
    }, [page, statusFilter])

    const fetchOrders = async () => {
        try {
            setLoading(true)
            const params = new URLSearchParams({ page: page.toString(), limit: '15' })
            if (statusFilter) params.append('status', statusFilter)

            const response = await fetch(`${API_URL}/admin/orders?${params}`, {
                headers: { 'Authorization': `Bearer ${adminToken}` }
            })
            if (response.ok) {
                const data = await response.json()
                setOrders(data.orders)
                setTotalPages(data.pages)
            }
        } catch (error) {
            console.error('Error fetching orders:', error)
        } finally {
            setLoading(false)
        }
    }

    const updateOrderStatus = async (orderId, newStatus) => {
        try {
            setUpdatingStatus(orderId)
            const response = await fetch(`${API_URL}/admin/orders/${orderId}/status?status=${newStatus}`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${adminToken}` }
            })
            if (response.ok) {
                fetchOrders()
            }
        } catch (error) {
            console.error('Error updating order status:', error)
        } finally {
            setUpdatingStatus(null)
        }
    }

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-BD', {
            style: 'currency',
            currency: 'BDT',
            minimumFractionDigits: 0
        }).format(amount)
    }

    const formatDate = (dateStr) => {
        return new Date(dateStr).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    const getStatusColor = (status) => {
        const colors = {
            pending: 'warning',
            confirmed: 'info',
            processing: 'info',
            shipped: 'primary',
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

    const statusOptions = [
        { value: 'pending', label: 'Pending' },
        { value: 'confirmed', label: 'Confirmed' },
        { value: 'processing', label: 'Processing' },
        { value: 'shipped', label: 'Shipped' },
        { value: 'delivered', label: 'Delivered' },
        { value: 'cancelled', label: 'Cancelled' }
    ]

    return (
        <div className="admin-orders">
            <div className="page-header">
                <div>
                    <h1>Orders</h1>
                    <p className="subtitle">Manage and track all orders</p>
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="filter-tabs">
                <button
                    className={`filter-tab ${statusFilter === '' ? 'active' : ''}`}
                    onClick={() => {
                        setStatusFilter('')
                        setSearchParams({})
                        setPage(1)
                    }}
                >
                    All Orders
                </button>
                {statusOptions.map(opt => (
                    <button
                        key={opt.value}
                        className={`filter-tab ${statusFilter === opt.value ? 'active' : ''}`}
                        onClick={() => {
                            setStatusFilter(opt.value)
                            setSearchParams({ status: opt.value })
                            setPage(1)
                        }}
                    >
                        {opt.label}
                    </button>
                ))}
            </div>

            {/* Orders Table */}
            {loading ? (
                <div className="loading-state">
                    <div className="spinner"></div>
                </div>
            ) : orders.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-icon">📋</div>
                    <h3>No orders found</h3>
                    <p>Orders will appear here once customers make purchases</p>
                </div>
            ) : (
                <div className="table-container">
                    <table className="admin-table orders-table">
                        <thead>
                            <tr>
                                <th>Order</th>
                                <th>Customer</th>
                                <th>Items</th>
                                <th>Total</th>
                                <th>Payment</th>
                                <th>Status</th>
                                <th>Date</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.map(order => (
                                <tr key={order.id}>
                                    <td>
                                        <span className="order-number">#{order.order_number}</span>
                                    </td>
                                    <td>
                                        <div className="customer-info">
                                            <span className="customer-name">{order.customer.name}</span>
                                            <span className="customer-email">{order.customer.email}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <span className="items-count">{order.items_count} items</span>
                                    </td>
                                    <td>
                                        <span className="order-total">{formatCurrency(order.total)}</span>
                                    </td>
                                    <td>
                                        <div className="payment-info">
                                            <span className={`payment-status badge-${getPaymentStatusColor(order.payment_status)}`}>
                                                {order.payment_status}
                                            </span>
                                            <span className="payment-method">{order.payment_method || 'N/A'}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <select
                                            className={`status-select status-${getStatusColor(order.status)}`}
                                            value={order.status}
                                            onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                                            disabled={updatingStatus === order.id}
                                        >
                                            {statusOptions.map(opt => (
                                                <option key={opt.value} value={opt.value}>
                                                    {opt.label}
                                                </option>
                                            ))}
                                        </select>
                                    </td>
                                    <td>
                                        <span className="order-date">{formatDate(order.created_at)}</span>
                                    </td>
                                    <td>
                                        <button
                                            className="btn btn-sm btn-ghost"
                                            onClick={() => setSelectedOrder(order)}
                                        >
                                            View
                                        </button>
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

            {/* Order Detail Modal */}
            {selectedOrder && (
                <div className="modal-overlay" onClick={() => setSelectedOrder(null)}>
                    <div className="modal-content order-detail-modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Order #{selectedOrder.order_number}</h3>
                            <button className="close-btn" onClick={() => setSelectedOrder(null)}>×</button>
                        </div>
                        <div className="modal-body">
                            <div className="order-detail-grid">
                                <div className="detail-section">
                                    <h4>Customer Information</h4>
                                    <p><strong>Name:</strong> {selectedOrder.customer.name}</p>
                                    <p><strong>Email:</strong> {selectedOrder.customer.email}</p>
                                    <p><strong>Phone:</strong> {selectedOrder.customer.phone}</p>
                                </div>

                                <div className="detail-section">
                                    <h4>Shipping Address</h4>
                                    <p>{selectedOrder.shipping_address}</p>
                                </div>

                                <div className="detail-section">
                                    <h4>Order Summary</h4>
                                    <p><strong>Subtotal:</strong> {formatCurrency(selectedOrder.subtotal)}</p>
                                    <p><strong>Shipping:</strong> {formatCurrency(selectedOrder.shipping_cost)}</p>
                                    <p><strong>Total:</strong> {formatCurrency(selectedOrder.total)}</p>
                                </div>

                                <div className="detail-section">
                                    <h4>Payment Information</h4>
                                    <p><strong>Method:</strong> {selectedOrder.payment_method || 'N/A'}</p>
                                    <p><strong>Status:</strong>
                                        <span className={`badge-${getPaymentStatusColor(selectedOrder.payment_status)}`}>
                                            {selectedOrder.payment_status}
                                        </span>
                                    </p>
                                </div>

                                {selectedOrder.notes && (
                                    <div className="detail-section full-width">
                                        <h4>Order Notes</h4>
                                        <p>{selectedOrder.notes}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={() => setSelectedOrder(null)}>
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default AdminOrders
