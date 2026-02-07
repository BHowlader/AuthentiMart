import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAdminAuth } from '../../context/AdminAuthContext'
import './AdminPanel.css'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'
const BASE_URL = API_URL.replace('/api/v1', '')

const AdminDashboard = () => {
    const { adminToken } = useAdminAuth()
    const [stats, setStats] = useState(null)
    const [salesData, setSalesData] = useState([])
    const [recentOrders, setRecentOrders] = useState([])
    const [topProducts, setTopProducts] = useState([])
    const [loading, setLoading] = useState(true)
    const [salesPeriod, setSalesPeriod] = useState('7d')

    useEffect(() => {
        fetchDashboardData()
    }, [salesPeriod])

    const fetchDashboardData = async () => {
        try {
            const headers = { 'Authorization': `Bearer ${adminToken}` }

            const [statsRes, salesRes, ordersRes, topRes] = await Promise.all([
                fetch(`${API_URL}/admin/dashboard/stats`, { headers }),
                fetch(`${API_URL}/admin/dashboard/sales?period=${salesPeriod}`, { headers }),
                fetch(`${API_URL}/admin/dashboard/recent-orders?limit=5`, { headers }),
                fetch(`${API_URL}/admin/products/top-selling?limit=5`, { headers })
            ])

            if (statsRes.ok) setStats(await statsRes.json())
            if (salesRes.ok) setSalesData(await salesRes.json())
            if (ordersRes.ok) setRecentOrders(await ordersRes.json())
            if (topRes.ok) setTopProducts(await topRes.json())
        } catch (error) {
            console.error('Error fetching dashboard data:', error)
        } finally {
            setLoading(false)
        }
    }

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-BD', {
            style: 'currency',
            currency: 'BDT',
            minimumFractionDigits: 0
        }).format(amount)
    }

    const getStatusColor = (status) => {
        const colors = {
            pending: 'badge-warning',
            confirmed: 'badge-info',
            processing: 'badge-info',
            shipped: 'badge-primary',
            delivered: 'badge-success',
            cancelled: 'badge-error'
        }
        return colors[status] || 'badge-default'
    }

    const maxSale = Math.max(...salesData.map(d => d.sales), 1)

    if (loading) {
        return (
            <div className="admin-loading">
                <div className="spinner"></div>
                <p>Loading dashboard...</p>
            </div>
        )
    }

    return (
        <div className="admin-dashboard">
            <div className="dashboard-header">
                <div>
                    <h1>Dashboard</h1>
                    <p className="subtitle">Welcome back! Here's what's happening with your store.</p>
                </div>
                <div className="header-actions">
                    <Link to="/admin/products/new" className="btn btn-primary">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="12" y1="5" x2="12" y2="19" />
                            <line x1="5" y1="12" x2="19" y2="12" />
                        </svg>
                        Add Product
                    </Link>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon revenue">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="12" y1="1" x2="12" y2="23" />
                            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                        </svg>
                    </div>
                    <div className="stat-content">
                        <span className="stat-label">Total Revenue</span>
                        <span className="stat-value">{formatCurrency(stats?.total_revenue || 0)}</span>
                        <span className={`stat-change ${(stats?.revenue_change || 0) >= 0 ? 'positive' : 'negative'}`}>
                            {(stats?.revenue_change || 0) >= 0 ? '↑' : '↓'} {Math.abs(stats?.revenue_change || 0).toFixed(1)}%
                            <span className="change-period">vs last period</span>
                        </span>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon orders">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="9" cy="21" r="1" />
                            <circle cx="20" cy="21" r="1" />
                            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                        </svg>
                    </div>
                    <div className="stat-content">
                        <span className="stat-label">Total Orders</span>
                        <span className="stat-value">{stats?.total_orders || 0}</span>
                        <span className={`stat-change ${(stats?.orders_change || 0) >= 0 ? 'positive' : 'negative'}`}>
                            {(stats?.orders_change || 0) >= 0 ? '↑' : '↓'} {Math.abs(stats?.orders_change || 0).toFixed(1)}%
                            <span className="change-period">vs last period</span>
                        </span>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon products">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                        </svg>
                    </div>
                    <div className="stat-content">
                        <span className="stat-label">Active Products</span>
                        <span className="stat-value">{stats?.total_products || 0}</span>
                        <Link to="/admin/products" className="stat-link">Manage products →</Link>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon customers">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                            <circle cx="9" cy="7" r="4" />
                            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                        </svg>
                    </div>
                    <div className="stat-content">
                        <span className="stat-label">Total Customers</span>
                        <span className="stat-value">{stats?.total_customers || 0}</span>
                        <Link to="/admin/analytics" className="stat-link">View analytics →</Link>
                    </div>
                </div>
            </div>

            {/* Alert Cards */}
            <div className="alert-cards">
                {(stats?.pending_orders || 0) > 0 && (
                    <div className="alert-card warning">
                        <div className="alert-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="10" />
                                <line x1="12" y1="8" x2="12" y2="12" />
                                <line x1="12" y1="16" x2="12.01" y2="16" />
                            </svg>
                        </div>
                        <div className="alert-content">
                            <strong>{stats?.pending_orders}</strong> orders pending
                        </div>
                        <Link to="/admin/orders?status=pending" className="alert-action">View orders</Link>
                    </div>
                )}

                {(stats?.low_stock_products || 0) > 0 && (
                    <div className="alert-card error">
                        <div className="alert-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                                <line x1="12" y1="9" x2="12" y2="13" />
                                <line x1="12" y1="17" x2="12.01" y2="17" />
                            </svg>
                        </div>
                        <div className="alert-content">
                            <strong>{stats?.low_stock_products}</strong> products low on stock
                        </div>
                        <Link to="/admin/inventory?filter=low" className="alert-action">Check inventory</Link>
                    </div>
                )}
            </div>

            {/* Charts and Tables */}
            <div className="dashboard-grid">
                {/* Sales Chart */}
                <div className="dashboard-card chart-card">
                    <div className="card-header">
                        <h2>Sales Overview</h2>
                        <div className="period-selector">
                            {['7d', '30d', '90d', '1y'].map(period => (
                                <button
                                    key={period}
                                    className={`period-btn ${salesPeriod === period ? 'active' : ''}`}
                                    onClick={() => setSalesPeriod(period)}
                                >
                                    {period === '7d' ? '7 Days' :
                                        period === '30d' ? '30 Days' :
                                            period === '90d' ? '90 Days' : '1 Year'}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="chart-container">
                        <div className="bar-chart">
                            {salesData.map((item, index) => (
                                <div key={index} className="bar-group">
                                    <div className="bar-wrapper">
                                        <div
                                            className="bar"
                                            style={{ height: `${(item.sales / maxSale) * 100}%` }}
                                        >
                                            <span className="bar-tooltip">
                                                {formatCurrency(item.sales)}
                                                <br />
                                                <small>{item.orders} orders</small>
                                            </span>
                                        </div>
                                    </div>
                                    <span className="bar-label">{item.date}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Recent Orders */}
                <div className="dashboard-card">
                    <div className="card-header">
                        <h2>Recent Orders</h2>
                        <Link to="/admin/orders" className="card-link">View all →</Link>
                    </div>
                    <div className="orders-list">
                        {recentOrders.length === 0 ? (
                            <div className="empty-state">
                                <p>No orders yet</p>
                            </div>
                        ) : (
                            recentOrders.map(order => (
                                <div key={order.id} className="order-item">
                                    <div className="order-info">
                                        <span className="order-number">#{order.order_number}</span>
                                        <span className="order-customer">{order.customer_name}</span>
                                    </div>
                                    <div className="order-details">
                                        <span className="order-amount">{formatCurrency(order.total)}</span>
                                        <span className={`badge ${getStatusColor(order.status)}`}>
                                            {order.status}
                                        </span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Top Products */}
                <div className="dashboard-card">
                    <div className="card-header">
                        <h2>Top Selling Products</h2>
                        <Link to="/admin/products" className="card-link">View all →</Link>
                    </div>
                    <div className="products-list">
                        {topProducts.length === 0 ? (
                            <div className="empty-state">
                                <p>No sales data yet</p>
                            </div>
                        ) : (
                            topProducts.map((product, index) => (
                                <div key={product.id} className="product-item">
                                    <span className="product-rank">{index + 1}</span>
                                    <div className="product-image">
                                        {product.image ? (
                                            <img src={product.image.startsWith('http') ? product.image : `${BASE_URL}${product.image}`} alt={product.name} />
                                        ) : (
                                            <div className="no-image">📦</div>
                                        )}
                                    </div>
                                    <div className="product-info">
                                        <span className="product-name">{product.name}</span>
                                        <span className="product-category">{product.category}</span>
                                    </div>
                                    <div className="product-stats">
                                        <span className="product-sold">{product.total_sold} sold</span>
                                        <span className="product-revenue">{formatCurrency(product.total_revenue)}</span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="dashboard-card quick-actions">
                    <h2>Quick Actions</h2>
                    <div className="actions-grid">
                        <Link to="/admin/products/new" className="action-btn">
                            <div className="action-icon new-product">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="12" y1="5" x2="12" y2="19" />
                                    <line x1="5" y1="12" x2="19" y2="12" />
                                </svg>
                            </div>
                            <span>Add Product</span>
                        </Link>
                        <Link to="/admin/inventory" className="action-btn">
                            <div className="action-icon inventory">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M12 12H5a2 2 0 0 0-2 2v5" />
                                    <circle cx="13" cy="19" r="2" />
                                    <circle cx="5" cy="19" r="2" />
                                    <path d="M8 19h3m5-17v17h6M6 12V7a3 3 0 0 1 3-3h2" />
                                    <rect x="13" y="2" width="8" height="7" rx="1" />
                                </svg>
                            </div>
                            <span>Update Stock</span>
                        </Link>
                        <Link to="/admin/predictions" className="action-btn">
                            <div className="action-icon predictions">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="12" cy="12" r="10" />
                                    <path d="M12 6v6l4 2" />
                                </svg>
                            </div>
                            <span>View Predictions</span>
                        </Link>
                        <Link to="/admin/analytics" className="action-btn">
                            <div className="action-icon analytics">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M3 3v18h18" />
                                    <path d="m19 9-5 5-4-4-3 3" />
                                </svg>
                            </div>
                            <span>View Analytics</span>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AdminDashboard
