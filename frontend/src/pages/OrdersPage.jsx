import { Link } from 'react-router-dom'
import { Package, Eye, ChevronRight, ShoppingBag, ArrowRight } from 'lucide-react'
import './OrdersPage.css'

// Sample orders data
const sampleOrders = [
    {
        id: 'ORD-2024-001',
        date: '2024-02-01',
        status: 'delivered',
        total: 5850,
        items: [
            { name: "L'Oreal Paris Revitalift Anti-Wrinkle Cream", quantity: 2, image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=100" },
            { name: "MAC Matte Lipstick - Ruby Woo", quantity: 1, image: "https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=100" }
        ]
    },
    {
        id: 'ORD-2024-002',
        date: '2024-01-28',
        status: 'shipped',
        total: 12999,
        items: [
            { name: "Samsung Galaxy Buds Pro", quantity: 1, image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=100" }
        ]
    },
    {
        id: 'ORD-2024-003',
        date: '2024-01-25',
        status: 'processing',
        total: 8500,
        items: [
            { name: "Philips Air Fryer HD9252", quantity: 1, image: "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=100" }
        ]
    },
    {
        id: 'ORD-2024-004',
        date: '2024-01-20',
        status: 'cancelled',
        total: 750,
        items: [
            { name: "Maybelline Fit Me Foundation", quantity: 1, image: "https://images.unsplash.com/photo-1631214524020-7e18db9a8f92?w=100" }
        ]
    }
]

const statusConfig = {
    processing: { label: 'Processing', color: 'var(--accent-orange)' },
    shipped: { label: 'Shipped', color: 'var(--accent-cyan)' },
    delivered: { label: 'Delivered', color: 'var(--accent-green)' },
    cancelled: { label: 'Cancelled', color: 'var(--accent-red)' }
}

const OrdersPage = () => {
    if (sampleOrders.length === 0) {
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
                    <p className="text-secondary">{sampleOrders.length} order{sampleOrders.length !== 1 ? 's' : ''}</p>
                </div>

                <div className="orders-list">
                    {sampleOrders.map((order) => (
                        <div key={order.id} className="order-card glass-card">
                            <div className="order-header">
                                <div className="order-info">
                                    <span className="order-id">
                                        <Package size={18} />
                                        {order.id}
                                    </span>
                                    <span className="order-date">
                                        Placed on {new Date(order.date).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'short',
                                            day: 'numeric'
                                        })}
                                    </span>
                                </div>
                                <span
                                    className="order-status"
                                    style={{
                                        background: `${statusConfig[order.status].color}20`,
                                        color: statusConfig[order.status].color
                                    }}
                                >
                                    {statusConfig[order.status].label}
                                </span>
                            </div>

                            <div className="order-items">
                                {order.items.slice(0, 2).map((item, index) => (
                                    <div key={index} className="order-item">
                                        <img src={item.image} alt={item.name} />
                                        <div className="item-info">
                                            <span className="item-name">{item.name}</span>
                                            <span className="item-qty">Qty: {item.quantity}</span>
                                        </div>
                                    </div>
                                ))}
                                {order.items.length > 2 && (
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
                                <Link to={`/orders/${order.id}`} className="btn btn-secondary btn-sm">
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
