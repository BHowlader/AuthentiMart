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
    Download
} from 'lucide-react'
import './OrderDetailPage.css'

// Sample order data
const sampleOrder = {
    id: 'ORD-2024-001',
    date: '2024-02-01',
    status: 'delivered',
    paymentMethod: 'bKash',
    shippingAddress: {
        name: 'John Doe',
        phone: '01712345678',
        email: 'john@example.com',
        address: 'House 10, Road 5, Block C',
        area: 'Banani',
        city: 'Dhaka'
    },
    items: [
        {
            id: 1,
            name: "L'Oreal Paris Revitalift Anti-Wrinkle Cream",
            price: 1850,
            quantity: 2,
            image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=100"
        },
        {
            id: 2,
            name: "MAC Matte Lipstick - Ruby Woo",
            price: 2150,
            quantity: 1,
            image: "https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=100"
        }
    ],
    subtotal: 5850,
    shipping: 0,
    total: 5850,
    timeline: [
        { status: 'ordered', date: '2024-02-01 10:30 AM', completed: true },
        { status: 'confirmed', date: '2024-02-01 11:00 AM', completed: true },
        { status: 'shipped', date: '2024-02-02 09:00 AM', completed: true },
        { status: 'delivered', date: '2024-02-03 02:30 PM', completed: true }
    ]
}

const statusLabels = {
    ordered: 'Order Placed',
    confirmed: 'Order Confirmed',
    shipped: 'Shipped',
    delivered: 'Delivered'
}

const OrderDetailPage = () => {
    const { id } = useParams()

    // In real app, fetch order by ID
    const order = sampleOrder

    const getStatusIcon = (status, completed) => {
        if (completed) {
            return <CheckCircle size={20} />
        }
        switch (status) {
            case 'shipped':
                return <Truck size={20} />
            case 'delivered':
                return <CheckCircle size={20} />
            default:
                return <Clock size={20} />
        }
    }

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
                            Order {order.id}
                        </h1>
                        <p className="text-secondary">
                            Placed on {new Date(order.date).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
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
                        <div className="order-timeline">
                            {order.timeline.map((step, index) => (
                                <div
                                    key={step.status}
                                    className={`timeline-step ${step.completed ? 'completed' : ''}`}
                                >
                                    <div className="timeline-icon">
                                        {getStatusIcon(step.status, step.completed)}
                                    </div>
                                    <div className="timeline-content">
                                        <span className="timeline-label">{statusLabels[step.status]}</span>
                                        <span className="timeline-date">{step.date}</span>
                                    </div>
                                    {index < order.timeline.length - 1 && (
                                        <div className={`timeline-line ${step.completed ? 'completed' : ''}`}></div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Order Items */}
                    <div className="order-section glass-card">
                        <h2>Order Items</h2>
                        <div className="order-items-list">
                            {order.items.map((item) => (
                                <div key={item.id} className="order-item-detail">
                                    <img src={item.image} alt={item.name} />
                                    <div className="item-info">
                                        <Link to={`/product/${item.id}`} className="item-name">
                                            {item.name}
                                        </Link>
                                        <span className="item-qty">Quantity: {item.quantity}</span>
                                    </div>
                                    <div className="item-price">
                                        <span className="unit-price">৳{item.price.toLocaleString()} × {item.quantity}</span>
                                        <strong>৳{(item.price * item.quantity).toLocaleString()}</strong>
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
                                <span>{order.shipping === 0 ? 'FREE' : `৳${order.shipping}`}</span>
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
                                <p className="address-name">{order.shippingAddress.name}</p>
                                <p>{order.shippingAddress.address}</p>
                                <p>{order.shippingAddress.area}, {order.shippingAddress.city}</p>
                                <p className="address-contact">
                                    <Phone size={14} />
                                    {order.shippingAddress.phone}
                                </p>
                                <p className="address-contact">
                                    <Mail size={14} />
                                    {order.shippingAddress.email}
                                </p>
                            </div>
                        </div>

                        {/* Payment Info */}
                        <div className="sidebar-card glass-card">
                            <h3>
                                <Package size={18} />
                                Payment Method
                            </h3>
                            <p className="payment-method">{order.paymentMethod}</p>
                            <span className="payment-status paid">Paid</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default OrderDetailPage
