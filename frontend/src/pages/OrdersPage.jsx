import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Package, Eye, ChevronRight, ShoppingBag, ArrowRight } from 'lucide-react'
import { ordersAPI } from '../utils/api'
import './OrdersPage.css'

const statusConfig = {
    pending: { label: 'Placed', color: 'var(--accent-orange)' },
    confirmed: { label: 'Confirmed', color: 'var(--accent-blue)' },
    processing: { label: 'Processing', color: 'var(--accent-purple)' },
    shipped: { label: 'Shipped', color: 'var(--accent-cyan)' },
    delivered: { label: 'Delivered', color: 'var(--accent-green)' },
    cancelled: { label: 'Cancelled', color: 'var(--accent-red)' }
}

const OrdersPage = () => {
    const [orders, setOrders] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const response = await ordersAPI.getAll()
                // API returns { items: [...], total: ... }
                setOrders(response.data.items || [])
                setLoading(false)
            } catch (err) {
                console.error('Error fetching orders:', err)
                setError('Failed to load orders')
                setLoading(false)
            }
        }

        fetchOrders()
    }, [])

    if (loading) {
        return (
            <div className="orders-page">
                <div className="container" style={{ textAlign: 'center', paddingTop: '40px' }}>
                    <p>Loading orders...</p>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="orders-page">
                <div className="container" style={{ textAlign: 'center', paddingTop: '40px' }}>
                    <p className="text-danger">{error}</p>
                </div>
            </div>
        )
    }

    if (orders.length === 0) {
        return (
            <div className="orders-page">
                <div className="container">
                    <div className="empty-orders">
                        <ShoppingBag size={80} />
                        <h2>No orders yet</h2>
                        <p>Start shopping and your orders will appear here.</p>
                        <Link to="/products" className="btn btn-primary btn-lg">
                            Start Shopping
                            <ArrowRight size={20} />
                        </Link>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="orders-page">
            <div className="container">
                <div className="page-header">
                    <h1>My Orders</h1>
                    <p className="text-secondary">{orders.length} order{orders.length !== 1 ? 's' : ''}</p>
                </div>

                <div className="orders-list">
                    {orders.map((order) => (
                        <div key={order.id} className="order-card glass-card">
                            <div className="order-header">
                                <div className="order-info">
                                    <span className="order-id">
                                        <Package size={18} />
                                        {/* Display order_number if available, else id */}
                                        #{order.order_number || order.id}
                                    </span>
                                    <span className="order-date">
                                        Placed on {new Date(order.created_at).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'short',
                                            day: 'numeric'
                                        })}
                                    </span>
                                </div>
                                <span
                                    className="order-status"
                                    style={{
                                        background: statusConfig[order.status]?.color ? `${statusConfig[order.status].color}20` : '#ccc',
                                        color: statusConfig[order.status]?.color || '#666'
                                    }}
                                >
                                    {statusConfig[order.status]?.label || order.status}
                                </span>
                            </div>

                            <div className="order-items">
                                {order.items && order.items.slice(0, 2).map((item, index) => (
                                    <div key={index} className="order-item">
                                        <img
                                            src={item.product?.image || item.product?.images?.[0]?.url || 'https://via.placeholder.com/100'}
                                            alt={item.product?.name || 'Product'}
                                        />
                                        <div className="item-info">
                                            <span className="item-name">{item.product?.name || 'Unknown Product'}</span>
                                            <span className="item-qty">Qty: {item.quantity}</span>
                                        </div>
                                    </div>
                                ))}
                                {order.items && order.items.length > 2 && (
                                    <div className="more-items">
                                        +{order.items.length - 2} more item{order.items.length - 2 > 1 ? 's' : ''}
                                    </div>
                                )}
                            </div>

                            <div className="order-footer">
                                <div className="order-total">
                                    <span>Total:</span>
                                    <strong>৳{order.total.toLocaleString()}</strong>
                                </div>
                                {/* Use order.order_number for ID if that's what backend expects, but frontend routes use :id. 
                                    Depending on how OrderDetailPage gets it. 
                                    OrderDetailPage calls api.getById(id). If api accepts order_number, great.
                                    Assuming route is /orders/:id and api.getById expects what is passed.
                                    The get_order API accepts order_number.
                                */}
                                <Link to={`/orders/${order.order_number || order.id}`} className="btn btn-secondary btn-sm">
                                    <Eye size={16} />
                                    View Details
                                    <ChevronRight size={16} />
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default OrdersPage
