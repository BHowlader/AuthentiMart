import { useState, useEffect } from 'react'
import { useAdminAuth } from '../../context/AdminAuthContext'
import './AdminPanel.css'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'
const BASE_URL = API_URL.replace('/api/v1', '')

const AdminPredictions = () => {
    const { adminToken } = useAdminAuth()
    const [loading, setLoading] = useState(true)
    const [predictions, setPredictions] = useState([])
    const [filter, setFilter] = useState('all')

    useEffect(() => {
        fetchPredictions()
    }, [])

    const fetchPredictions = async () => {
        try {
            setLoading(true)
            const response = await fetch(`${API_URL}/admin/predictions`, {
                headers: { 'Authorization': `Bearer ${adminToken}` }
            })
            if (response.ok) {
                setPredictions(await response.json())
            }
        } catch (error) {
            console.error('Error fetching predictions:', error)
        } finally {
            setLoading(false)
        }
    }

    const filteredPredictions = predictions.filter(p => {
        if (filter === 'all') return true
        return p.urgency === filter
    })

    const getUrgencyInfo = (urgency) => {
        const info = {
            critical: { class: 'critical', label: 'Critical', icon: '🔴', description: 'Stock out in ≤3 days' },
            high: { class: 'high', label: 'High Priority', icon: '🟠', description: 'Stock out in ≤7 days' },
            medium: { class: 'medium', label: 'Medium', icon: '🟡', description: 'Stock out in ≤14 days' },
            low: { class: 'low', label: 'Low', icon: '🟢', description: 'Stock is healthy' }
        }
        return info[urgency] || info.low
    }

    const getTrendInfo = (trend, percentage) => {
        if (trend === 'rising') return { icon: '📈', label: `Rising +${Math.abs(percentage)}%`, class: 'trend-rising' }
        if (trend === 'declining') return { icon: '📉', label: `Declining ${percentage}%`, class: 'trend-declining' }
        return { icon: '➡️', label: 'Stable', class: 'trend-stable' }
    }

    const getConfidenceInfo = (confidence) => {
        if (confidence === 'high') return { icon: '✓✓', label: 'High Confidence', class: 'confidence-high' }
        if (confidence === 'medium') return { icon: '✓', label: 'Medium Confidence', class: 'confidence-medium' }
        return { icon: '?', label: 'Low Confidence', class: 'confidence-low' }
    }

    const stats = {
        critical: predictions.filter(p => p.urgency === 'critical').length,
        high: predictions.filter(p => p.urgency === 'high').length,
        medium: predictions.filter(p => p.urgency === 'medium').length,
        low: predictions.filter(p => p.urgency === 'low').length
    }

    if (loading) {
        return (
            <div className="admin-loading">
                <div className="spinner"></div>
                <p>Analyzing inventory predictions...</p>
            </div>
        )
    }

    return (
        <div className="admin-predictions">
            <div className="page-header">
                <div>
                    <h1>Demand Predictions</h1>
                    <p className="subtitle">AI-powered inventory forecasting based on sales trends</p>
                </div>
            </div>

            {/* Prediction Stats */}
            <div className="prediction-stats">
                <div
                    className={`pred-stat-card critical ${filter === 'critical' ? 'active' : ''}`}
                    onClick={() => setFilter(filter === 'critical' ? 'all' : 'critical')}
                >
                    <div className="pred-stat-icon">🔴</div>
                    <div className="pred-stat-content">
                        <span className="pred-stat-value">{stats.critical}</span>
                        <span className="pred-stat-label">Critical</span>
                    </div>
                </div>
                <div
                    className={`pred-stat-card high ${filter === 'high' ? 'active' : ''}`}
                    onClick={() => setFilter(filter === 'high' ? 'all' : 'high')}
                >
                    <div className="pred-stat-icon">🟠</div>
                    <div className="pred-stat-content">
                        <span className="pred-stat-value">{stats.high}</span>
                        <span className="pred-stat-label">High Priority</span>
                    </div>
                </div>
                <div
                    className={`pred-stat-card medium ${filter === 'medium' ? 'active' : ''}`}
                    onClick={() => setFilter(filter === 'medium' ? 'all' : 'medium')}
                >
                    <div className="pred-stat-icon">🟡</div>
                    <div className="pred-stat-content">
                        <span className="pred-stat-value">{stats.medium}</span>
                        <span className="pred-stat-label">Medium</span>
                    </div>
                </div>
                <div
                    className={`pred-stat-card low ${filter === 'low' ? 'active' : ''}`}
                    onClick={() => setFilter(filter === 'low' ? 'all' : 'low')}
                >
                    <div className="pred-stat-icon">🟢</div>
                    <div className="pred-stat-content">
                        <span className="pred-stat-value">{stats.low}</span>
                        <span className="pred-stat-label">Healthy</span>
                    </div>
                </div>
            </div>

            {/* Info Banner */}
            <div className="info-banner">
                <div className="info-icon">🤖</div>
                <div className="info-content">
                    <strong>AI-Powered Predictions:</strong>
                    <p>Our algorithm uses <b>weighted moving averages</b> (recent sales weighted 4x more),
                        <b>seasonal factors</b> for Bangladesh market (Eid, weekends, festivals),
                        <b>trend analysis</b>, and <b>category fallbacks</b> for new products.
                        Confidence levels indicate data quality.</p>
                </div>
            </div>

            {/* Predictions List */}
            {filteredPredictions.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-icon">📊</div>
                    <h3>No predictions to show</h3>
                    <p>All products have healthy stock levels for the selected filter</p>
                </div>
            ) : (
                <div className="predictions-grid">
                    {filteredPredictions.map(prediction => {
                        const urgencyInfo = getUrgencyInfo(prediction.urgency)
                        const trendInfo = getTrendInfo(prediction.trend, prediction.trend_percentage)
                        const confidenceInfo = getConfidenceInfo(prediction.confidence)
                        return (
                            <div key={prediction.id} className={`prediction-card ${urgencyInfo.class}`}>
                                <div className="prediction-header">
                                    <div className="product-image">
                                        {prediction.image ? (
                                            <img src={prediction.image.startsWith('http') ? prediction.image : `${BASE_URL}${prediction.image}`} alt={prediction.name} />
                                        ) : (
                                            <div className="no-image">📦</div>
                                        )}
                                    </div>
                                    <div className="product-info">
                                        <h3>{prediction.name}</h3>
                                        <div className="prediction-badges">
                                            <span className={`urgency-badge ${urgencyInfo.class}`}>
                                                {urgencyInfo.icon} {urgencyInfo.label}
                                            </span>
                                            <span className={`trend-badge ${trendInfo.class}`}>
                                                {trendInfo.icon} {trendInfo.label}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="prediction-stats">
                                    <div className="pred-stat">
                                        <span className="pred-stat-label">Current Stock</span>
                                        <span className={`pred-stat-value ${prediction.current_stock < 10 ? 'low' : ''}`}>
                                            {prediction.current_stock} units
                                        </span>
                                    </div>
                                    <div className="pred-stat">
                                        <span className="pred-stat-label">Avg Daily Sales</span>
                                        <span className="pred-stat-value">{prediction.avg_daily_sales} units/day</span>
                                    </div>
                                    <div className="pred-stat">
                                        <span className="pred-stat-label">Predicted Demand (30d)</span>
                                        <span className="pred-stat-value">{prediction.predicted_demand} units</span>
                                    </div>
                                    <div className="pred-stat">
                                        <span className="pred-stat-label">Days Until Stockout</span>
                                        <span className={`pred-stat-value ${prediction.days_until_stockout <= 7 ? 'danger' : prediction.days_until_stockout <= 14 ? 'warning' : ''}`}>
                                            {prediction.days_until_stockout >= 999 ? '∞' : `${prediction.days_until_stockout} days`}
                                        </span>
                                    </div>
                                    <div className="pred-stat">
                                        <span className="pred-stat-label">Seasonal Factor</span>
                                        <span className="pred-stat-value">
                                            {prediction.seasonal_factor > 1 ? `+${((prediction.seasonal_factor - 1) * 100).toFixed(0)}%` : 'Normal'}
                                        </span>
                                    </div>
                                    <div className="pred-stat recommended">
                                        <span className="pred-stat-label">Recommended Reorder</span>
                                        <span className="pred-stat-value highlight">
                                            {prediction.recommended_reorder > 0 ? `+${prediction.recommended_reorder} units` : 'No reorder needed'}
                                        </span>
                                    </div>
                                </div>

                                {/* Confidence & Data Quality */}
                                <div className="prediction-footer">
                                    <span className={`confidence-badge ${confidenceInfo.class}`}>
                                        {confidenceInfo.icon} {confidenceInfo.label}
                                    </span>
                                    <span className="data-points">
                                        {prediction.data_points} days of sales data
                                    </span>
                                </div>

                                {prediction.recommended_reorder > 0 && (
                                    <div className="prediction-action">
                                        <div className="stockout-timeline">
                                            <div className="timeline-bar">
                                                <div
                                                    className="timeline-fill"
                                                    style={{
                                                        width: `${Math.min(100, (prediction.days_until_stockout / 30) * 100)}%`
                                                    }}
                                                ></div>
                                                <div
                                                    className="timeline-marker"
                                                    style={{
                                                        left: `${Math.min(100, (prediction.days_until_stockout / 30) * 100)}%`
                                                    }}
                                                >
                                                    <span className="marker-label">
                                                        {prediction.days_until_stockout >= 999 ? 'Safe' : 'Stockout'}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="timeline-labels">
                                                <span>Now</span>
                                                <span>30 days</span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}

export default AdminPredictions
