import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
    Package,
    Truck,
    CheckCircle,
    Clock,
    MapPin,
    Phone,
    Mail,
    ArrowLeft,
    Download,
    AlertCircle
} from 'lucide-react'
import { ordersAPI } from '../utils/api'
import './OrderDetailPage.css'

const statusLabels = {
    pending: 'Order Placed',
    confirmed: 'Order Confirmed',
    processing: 'Processing',
    shipped: 'Shipped',
    delivered: 'Delivered',
    cancelled: 'Cancelled'
}

const statusSteps = ['pending', 'confirmed', 'shipped', 'delivered']

const OrderDetailPage = () => {
    const { id } = useParams()
    const [order, setOrder] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const response = await ordersAPI.getById(id)
                setOrder(response.data)
                setLoading(false)
            } catch (err) {
                console.error('Error fetching order:', err)
                setError('Failed to load order details')
                setLoading(false)
            }
        }

        fetchOrder()
    }, [id])

    const getStatusIcon = (stepStatus, currentStatus) => {
        const stepIndex = statusSteps.indexOf(stepStatus)
        const currentIndex = statusSteps.indexOf(currentStatus)

        if (order.status === 'cancelled') {
            return <AlertCircle size={20} />
        }

        if (currentIndex >= stepIndex) {
            return <CheckCircle size={20} />
        }

        switch (stepStatus) {
            case 'shipped':
                return <Truck size={20} />
            case 'delivered':
                return <Package size={20} />
            default:
                return <Clock size={20} />
        }
    }

    const isStepCompleted = (stepStatus) => {
        if (order.status === 'cancelled') return false
        const stepIndex = statusSteps.indexOf(stepStatus)
        const currentIndex = statusSteps.indexOf(order.status)
        return currentIndex >= stepIndex
    }

    if (loading) return <div className="loading-spinner">Loading...</div>
    if (error) return <div className="error-message">{error}</div>
    if (!order) return <div className="error-message">Order not found</div>

    return (
        <div className="order-detail-page">
            <div className="container">
                {/* Back Link */}
                <Link to="/orders" className="back-link">
                    <ArrowLeft size={18} />
                    Back to Orders
                </Link>

                {/* Header */}
                <div className="order-detail-header">
                    <div>
                        <h1>
                            <Package size={28} />
                            Order #{order.order_number}
                        </h1>
                        <p className="text-secondary">
                            Placed on {new Date(order.created_at).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                            })}
                        </p>
                    </div>
                    <button className="btn btn-secondary">
                        <Download size={18} />
                        Invoice
                    </button>
                </div>

                <div className="order-detail-layout">
                    {/* Order Progress */}
                    <div className="order-section glass-card">
                        <h2>Order Status</h2>
                        <div className="order-status-badge">
                            <span className={`status-badge ${order.status}`}>
                                {statusLabels[order.status]}
                            </span>
                        </div>

                        {order.status !== 'cancelled' && (
                            <div className="order-timeline">
                                {statusSteps.map((step, index) => (
                                    <div
                                        key={step}
                                        className={`timeline-step ${isStepCompleted(step) ? 'completed' : ''}`}
                                    >
                                        <div className="timeline-icon">
                                            {getStatusIcon(step, order.status)}
                                        </div>
                                        <div className="timeline-content">
                                            <span className="timeline-label">{statusLabels[step]}</span>
                                        </div>
                                        {index < statusSteps.length - 1 && (
                                            <div className={`timeline-line ${isStepCompleted(step) ? 'completed' : ''}`}></div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Dynamic Tracking History */}
                    {order.tracking && order.tracking.length > 0 && (
                        <div className="order-section glass-card">
                            <h2>Tracking History</h2>
                            <div className="tracking-history">
                                {[...order.tracking].reverse().map((track) => (
                                    <div key={track.id} className="tracking-item">
                                        <div className="tracking-icon">
                                            <div className="dot"></div>
                                            <div className="line"></div>
                                        </div>
                                        <div className="tracking-content">
                                            <div className="tracking-header">
                                                <span className="tracking-status">{track.status}</span>
                                                <span className="tracking-date">
                                                    {new Date(track.created_at).toLocaleString()}
                                                </span>
                                            </div>
                                            <p className="tracking-desc">{track.description}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Order Items */}
                    <div className="order-section glass-card">
                        <h2>Order Items</h2>
                        <div className="order-items-list">
                            {order.items.map((item) => (
                                <div key={item.id} className="order-item-detail">
                                    {/* Assuming item.product.image or similar structure. 
                                        Since we use OrderResponse, items are OrderItemResponse which has 'product' field 
                                    */}
                                    <img
                                        src={item.product?.image || item.product?.images?.[0]?.url || 'https://via.placeholder.com/100'}
                                        alt={item.product?.name || 'Product'}
                                    />
                                    <div className="item-info">
                                        <Link to={`/product/${item.product_id}`} className="item-name">
                                            {item.product?.name || `Product #${item.product_id}`}
                                        </Link>
                                        <span className="item-qty">Quantity: {item.quantity}</span>
                                    </div>
                                    <div className="item-price">
                                        <span className="unit-price">৳{item.price.toLocaleString()} × {item.quantity}</span>
                                        <strong>৳{item.total.toLocaleString()}</strong>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="order-totals">
                            <div className="total-row">
                                <span>Subtotal</span>
                                <span>৳{order.subtotal.toLocaleString()}</span>
                            </div>
                            <div className="total-row">
                                <span>Shipping</span>
                                <span>{order.shipping_cost === 0 ? 'FREE' : `৳${order.shipping_cost}`}</span>
                            </div>
                            <div className="total-row final">
                                <span>Total</span>
                                <strong>৳{order.total.toLocaleString()}</strong>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="order-sidebar">
                        {/* Shipping Address */}
                        <div className="sidebar-card glass-card">
                            <h3>
                                <MapPin size={18} />
                                Shipping Address
                            </h3>
                            <div className="address-info">
                                <p className="address-name">{order.shipping_name}</p>
                                <p>{order.shipping_address}</p>
                                <p>{order.shipping_area}, {order.shipping_city}</p>
                                <p className="address-contact">
                                    <Phone size={14} />
                                    {order.shipping_phone}
                                </p>
                                {order.shipping_email && (
                                    <p className="address-contact">
                                        <Mail size={14} />
                                        {order.shipping_email}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Payment Info */}
                        <div className="sidebar-card glass-card">
                            <h3>
                                <Package size={18} />
                                Payment Info
                            </h3>
                            <p className="payment-method">
                                Method: {order.payment_method?.toUpperCase()}
                            </p>
                            <span className={`payment-status ${order.payment_status}`}>
                                {order.payment_status?.replace('_', ' ').toUpperCase()}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default OrderDetailPage
