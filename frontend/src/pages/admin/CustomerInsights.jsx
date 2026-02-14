import { useState, useEffect } from 'react'
import { useAdminAuth } from '../../context/AdminAuthContext'
import { Users, TrendingUp, DollarSign, Repeat, Award, UserPlus, AlertCircle } from 'lucide-react'
import './AdminPanel.css'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'

const CustomerInsights = () => {
    const { adminToken } = useAdminAuth()
    const [insights, setInsights] = useState(null)
    const [topCustomers, setTopCustomers] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        fetchInsights()
    }, [])

    const fetchInsights = async () => {
        try {
            setLoading(true)

            // Fetch customer stats from existing dashboard endpoint
            const response = await fetch(`${API_URL}/admin/dashboard/stats`, {
                headers: { 'Authorization': `Bearer ${adminToken}` }
            })

            if (response.ok) {
                const data = await response.json()

                // Calculate insights from available data
                setInsights({
                    total_customers: data.total_customers || 0,
                    new_customers_30d: data.new_customers_30d || 0,
                    total_orders: data.total_orders || 0,
                    total_revenue: data.total_revenue || 0,
                    average_order_value: data.total_orders > 0
                        ? (data.total_revenue / data.total_orders)
                        : 0,
                    repeat_purchase_rate: 0, // Would need additional API
                })
            }

            // Fetch top customers
            const customersResponse = await fetch(`${API_URL}/admin/customers?limit=10`, {
                headers: { 'Authorization': `Bearer ${adminToken}` }
            })

            if (customersResponse.ok) {
                const customersData = await customersResponse.json()
                setTopCustomers(customersData.customers || [])
            }

        } catch (err) {
            console.error('Error fetching insights:', err)
            setError('Failed to load customer insights')
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="admin-loading">
                <div className="spinner"></div>
                <p>Loading insights...</p>
            </div>
        )
    }

    const segments = [
        { name: 'New Customers', count: insights?.new_customers_30d || 0, color: '#22c55e', icon: UserPlus },
        { name: 'Returning', count: Math.max(0, (insights?.total_customers || 0) - (insights?.new_customers_30d || 0)), color: '#3b82f6', icon: Repeat },
        { name: 'VIP', count: topCustomers.filter(c => c.total_spent > 10000).length, color: '#f59e0b', icon: Award },
    ]

    return (
        <div className="admin-page">
            <div className="page-header">
                <h1>Customer Insights</h1>
            </div>

            {error && (
                <div className="alert alert-error">
                    <AlertCircle size={20} />
                    {error}
                </div>
            )}

            {/* Overview Cards */}
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #8b5cf6, #6366f1)' }}>
                        <Users size={24} />
                    </div>
                    <div className="stat-info">
                        <span className="stat-label">Total Customers</span>
                        <span className="stat-value">{insights?.total_customers?.toLocaleString() || 0}</span>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #22c55e, #16a34a)' }}>
                        <UserPlus size={24} />
                    </div>
                    <div className="stat-info">
                        <span className="stat-label">New (30 Days)</span>
                        <span className="stat-value">{insights?.new_customers_30d?.toLocaleString() || 0}</span>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}>
                        <DollarSign size={24} />
                    </div>
                    <div className="stat-info">
                        <span className="stat-label">Avg. Order Value</span>
                        <span className="stat-value">৳{insights?.average_order_value?.toLocaleString(undefined, { maximumFractionDigits: 0 }) || 0}</span>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #ec4899, #db2777)' }}>
                        <TrendingUp size={24} />
                    </div>
                    <div className="stat-info">
                        <span className="stat-label">Total Revenue</span>
                        <span className="stat-value">৳{insights?.total_revenue?.toLocaleString(undefined, { maximumFractionDigits: 0 }) || 0}</span>
                    </div>
                </div>
            </div>

            {/* Customer Segments */}
            <div className="insights-section">
                <h2>Customer Segments</h2>
                <div className="segments-grid">
                    {segments.map((segment, index) => (
                        <div key={index} className="segment-card">
                            <div className="segment-icon" style={{ background: segment.color }}>
                                <segment.icon size={24} />
                            </div>
                            <div className="segment-info">
                                <span className="segment-name">{segment.name}</span>
                                <span className="segment-count">{segment.count} customers</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Top Customers */}
            <div className="insights-section">
                <h2>Top Customers</h2>
                <div className="admin-table-container">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Customer</th>
                                <th>Email</th>
                                <th>Orders</th>
                                <th>Total Spent</th>
                                <th>Points</th>
                                <th>Joined</th>
                            </tr>
                        </thead>
                        <tbody>
                            {topCustomers.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="no-data">No customers found</td>
                                </tr>
                            ) : (
                                topCustomers.map((customer) => (
                                    <tr key={customer.id}>
                                        <td>
                                            <div className="customer-name">
                                                <div className="customer-avatar">
                                                    {customer.name?.charAt(0)?.toUpperCase() || '?'}
                                                </div>
                                                {customer.name}
                                            </div>
                                        </td>
                                        <td>{customer.email}</td>
                                        <td>{customer.total_orders || 0}</td>
                                        <td className="amount">৳{(customer.total_spent || 0).toLocaleString()}</td>
                                        <td>{customer.points_balance || 0}</td>
                                        <td>{new Date(customer.created_at).toLocaleDateString()}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <style>{`
                .insights-section {
                    margin-top: 32px;
                }

                .insights-section h2 {
                    font-size: 20px;
                    margin-bottom: 16px;
                    color: var(--text);
                }

                .segments-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 16px;
                }

                .segment-card {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                    padding: 20px;
                    background: var(--card-bg);
                    border: 1px solid var(--border);
                    border-radius: 12px;
                }

                .segment-icon {
                    width: 48px;
                    height: 48px;
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                }

                .segment-info {
                    display: flex;
                    flex-direction: column;
                }

                .segment-name {
                    font-weight: 600;
                    color: var(--text);
                }

                .segment-count {
                    font-size: 14px;
                    color: var(--text-secondary);
                }

                .customer-name {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }

                .customer-avatar {
                    width: 36px;
                    height: 36px;
                    border-radius: 50%;
                    background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-weight: 600;
                    font-size: 14px;
                }

                .amount {
                    font-weight: 600;
                    color: var(--primary);
                }

                .no-data {
                    text-align: center;
                    padding: 40px;
                    color: var(--text-secondary);
                }
            `}</style>
        </div>
    )
}

export default CustomerInsights
