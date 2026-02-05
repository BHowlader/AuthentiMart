import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import './AdminPanel.css'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'
const BASE_URL = API_URL.replace('/api/v1', '')

const AdminAnalytics = () => {
    const { token } = useAuth()
    const [loading, setLoading] = useState(true)
    const [period, setPeriod] = useState('30d')
    const [revenueData, setRevenueData] = useState(null)
    const [customerData, setCustomerData] = useState(null)
    const [topProducts, setTopProducts] = useState([])
    const [leastProducts, setLeastProducts] = useState([])

    useEffect(() => {
        fetchAnalytics()
    }, [period])

    const fetchAnalytics = async () => {
        try {
            setLoading(true)
            const headers = { 'Authorization': `Bearer ${token}` }

            const [revenueRes, customerRes, topRes, leastRes] = await Promise.all([
                fetch(`${API_URL}/admin/analytics/revenue?period=${period}`, { headers }),
                fetch(`${API_URL}/admin/analytics/customers`, { headers }),
                fetch(`${API_URL}/admin/products/top-selling?limit=10`, { headers }),
                fetch(`${API_URL}/admin/products/least-selling?limit=10`, { headers })
            ])

            if (revenueRes.ok) setRevenueData(await revenueRes.json())
            if (customerRes.ok) setCustomerData(await customerRes.json())
            if (topRes.ok) setTopProducts(await topRes.json())
            if (leastRes.ok) setLeastProducts(await leastRes.json())
        } catch (error) {
            console.error('Error fetching analytics:', error)
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

    const totalCategoryRevenue = revenueData?.by_category?.reduce((sum, c) => sum + c.revenue, 0) || 1

    if (loading) {
        return (
            <div className="admin-loading">
                <div className="spinner"></div>
                <p>Loading analytics...</p>
            </div>
        )
    }

    return (
        <div className="admin-analytics">
            <div className="page-header">
                <div>
                    <h1>Analytics</h1>
                    <p className="subtitle">Detailed insights about your store performance</p>
                </div>
                <div className="period-selector">
                    {['7d', '30d', '90d', '1y'].map(p => (
                        <button
                            key={p}
                            className={`period-btn ${period === p ? 'active' : ''}`}
                            onClick={() => setPeriod(p)}
                        >
                            {p === '7d' ? '7 Days' : p === '30d' ? '30 Days' : p === '90d' ? '90 Days' : '1 Year'}
                        </button>
                    ))}
                </div>
            </div>

            <div className="analytics-grid">
                {/* Revenue Chart */}
                <div className="analytics-card chart-card">
                    <h2>Revenue Trend</h2>
                    <div className="line-chart">
                        {revenueData?.daily_trend?.length > 0 ? (
                            <div className="chart-wrapper">
                                <svg viewBox="0 0 800 200" preserveAspectRatio="xMidYMid meet">
                                    {/* Grid lines */}
                                    <g className="grid-lines">
                                        {[0, 1, 2, 3, 4].map(i => (
                                            <line
                                                key={i}
                                                x1="40"
                                                y1={40 + i * 35}
                                                x2="780"
                                                y2={40 + i * 35}
                                                stroke="rgba(255,255,255,0.1)"
                                            />
                                        ))}
                                    </g>

                                    {/* Line chart */}
                                    {(() => {
                                        const data = revenueData.daily_trend
                                        const maxVal = Math.max(...data.map(d => d.revenue), 1)
                                        const points = data.map((d, i) => {
                                            const x = 40 + (i / (data.length - 1 || 1)) * 740
                                            const y = 175 - (d.revenue / maxVal) * 135
                                            return `${x},${y}`
                                        }).join(' ')

                                        const areaPoints = `40,175 ${points} 780,175`

                                        return (
                                            <>
                                                <defs>
                                                    <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                                        <stop offset="0%" stopColor="rgba(139, 92, 246, 0.4)" />
                                                        <stop offset="100%" stopColor="rgba(139, 92, 246, 0)" />
                                                    </linearGradient>
                                                </defs>
                                                <polygon fill="url(#chartGradient)" points={areaPoints} />
                                                <polyline
                                                    fill="none"
                                                    stroke="var(--primary)"
                                                    strokeWidth="3"
                                                    points={points}
                                                />
                                                {data.map((d, i) => {
                                                    const x = 40 + (i / (data.length - 1 || 1)) * 740
                                                    const y = 175 - (d.revenue / maxVal) * 135
                                                    return (
                                                        <g key={i}>
                                                            <circle
                                                                cx={x}
                                                                cy={y}
                                                                r="4"
                                                                fill="var(--primary)"
                                                            />
                                                            <title>{d.date}: {formatCurrency(d.revenue)}</title>
                                                        </g>
                                                    )
                                                })}
                                            </>
                                        )
                                    })()}
                                </svg>
                                <div className="chart-labels">
                                    {revenueData.daily_trend.filter((_, i) => i % Math.ceil(revenueData.daily_trend.length / 7) === 0).map(d => (
                                        <span key={d.date}>{d.date}</span>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="no-data">No revenue data available</div>
                        )}
                    </div>
                </div>

                {/* Revenue by Category */}
                <div className="analytics-card">
                    <h2>Revenue by Category</h2>
                    <div className="category-breakdown">
                        {revenueData?.by_category?.length > 0 ? (
                            [...revenueData.by_category]
                                .sort((a, b) => b.revenue - a.revenue)
                                .map((cat, index) => {
                                    const percentage = (cat.revenue / totalCategoryRevenue) * 100
                                    const colors = ['#8B5CF6', '#EC4899', '#06B6D4', '#10B981', '#F59E0B']
                                    return (
                                        <div key={cat.name} className="category-item">
                                            <div className="category-top-row">
                                                <div className="category-label">
                                                    <span
                                                        className="category-color"
                                                        style={{ background: colors[index % colors.length] }}
                                                    ></span>
                                                    <span className="category-name">{cat.name}</span>
                                                </div>
                                                <div className="category-values">
                                                    <span className="category-amount">{formatCurrency(cat.revenue)}</span>
                                                    <span className="category-percent">({percentage.toFixed(1)}%)</span>
                                                </div>
                                            </div>
                                            <div className="category-bar">
                                                <div
                                                    className="category-fill"
                                                    style={{
                                                        width: `${percentage}%`,
                                                        background: colors[index % colors.length]
                                                    }}
                                                ></div>
                                            </div>
                                        </div>
                                    )
                                })
                        ) : (
                            <div className="no-data">No category data available</div>
                        )}
                    </div>
                </div>

                {/* Payment Methods */}
                <div className="analytics-card">
                    <h2>Payment Methods</h2>
                    <div className="payment-breakdown">
                        {revenueData?.by_payment_method?.length > 0 ? (
                            <div className="payment-grid">
                                {revenueData.by_payment_method.map(method => {
                                    const getPaymentInfo = (type) => {
                                        switch (type.toLowerCase()) {
                                            case 'bkash': return { icon: '📱', label: 'bKash', color: '#E2136E' }
                                            case 'nagad': return { icon: '💸', label: 'Nagad', color: '#F79E1B' }
                                            case 'rocket': return { icon: '🚀', label: 'Rocket', color: '#8C3494' }
                                            case 'card': return { icon: '💳', label: 'Credit/Debit Card', color: '#006FCF' }
                                            case 'cod': return { icon: '💵', label: 'Cash on Delivery', color: '#10B981' }
                                            default: return { icon: '💰', label: type, color: '#6B7280' }
                                        }
                                    }
                                    const info = getPaymentInfo(method.method)

                                    return (
                                        <div key={method.method} className="payment-card">
                                            <div className="payment-icon" style={{ backgroundColor: `${info.color}20`, color: info.color }}>
                                                {info.icon}
                                            </div>
                                            <div className="payment-details">
                                                <span className="payment-name">{info.label}</span>
                                                <span className="payment-amount">{formatCurrency(method.revenue)}</span>
                                                <span className="payment-count">{method.count} orders</span>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        ) : (
                            <div className="no-data">No payment data available</div>
                        )}
                    </div>
                </div>

                {/* Customer Stats */}
                <div className="analytics-card">
                    <h2>Customer Analytics</h2>
                    <div className="customer-stats">
                        <div className="stat-highlight">
                            <span className="highlight-value">{customerData?.new_this_month || 0}</span>
                            <span className="highlight-label">New Customers This Month</span>
                        </div>

                        <h3>Top Customers</h3>
                        <div className="top-customers">
                            {customerData?.top_customers?.length > 0 ? (
                                customerData.top_customers.slice(0, 5).map((customer, index) => (
                                    <div key={customer.id} className="customer-item">
                                        <span className="customer-rank">{index + 1}</span>
                                        <div className="customer-info">
                                            <span className="customer-name">{customer.name}</span>
                                            <span className="customer-email">{customer.email}</span>
                                        </div>
                                        <div className="customer-stats-right">
                                            <span className="customer-spent">{formatCurrency(customer.total_spent)}</span>
                                            <span className="customer-orders">{customer.order_count} orders</span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="no-data">No customer data available</div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Top Selling Products */}
                <div className="analytics-card">
                    <h2>Top Selling Products</h2>
                    <div className="products-list">
                        {topProducts.length > 0 ? (
                            topProducts.map((product, index) => (
                                <div key={product.id} className="product-item">
                                    <span className="product-rank success">{index + 1}</span>
                                    <div className="product-image">
                                        {product.image ? (
                                            <img src={`${BASE_URL}${product.image}`} alt={product.name} />
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
                        ) : (
                            <div className="no-data">No sales data available</div>
                        )}
                    </div>
                </div>

                {/* Least Selling Products */}
                <div className="analytics-card">
                    <h2>Least Selling Products</h2>
                    <p className="card-subtitle">Products that may need marketing attention</p>
                    <div className="products-list">
                        {leastProducts.length > 0 ? (
                            leastProducts.map((product, index) => (
                                <div key={product.id} className="product-item">
                                    <span className="product-rank warning">{index + 1}</span>
                                    <div className="product-image">
                                        {product.image ? (
                                            <img src={`${BASE_URL}${product.image}`} alt={product.name} />
                                        ) : (
                                            <div className="no-image">📦</div>
                                        )}
                                    </div>
                                    <div className="product-info">
                                        <span className="product-name">{product.name}</span>
                                        <span className="product-category">{product.category}</span>
                                    </div>
                                    <div className="product-stats">
                                        <span className="product-sold low">{product.total_sold} sold</span>
                                        <span className="product-stock">Stock: {product.stock}</span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="no-data">All products are selling well</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AdminAnalytics
