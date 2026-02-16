import { useState, useEffect } from 'react'
import { useAdminAuth } from '../../context/AdminAuthContext'
import { Users, Eye, Clock, TrendingUp, Globe, Monitor, Smartphone, Tablet } from 'lucide-react'
import './AdminPanel.css'

const API_URL = import.meta.env.VITE_API_URL || ''

const AdminVisitorAnalytics = () => {
    const { adminToken } = useAdminAuth()
    const [loading, setLoading] = useState(true)
    const [period, setPeriod] = useState('7d')
    const [data, setData] = useState(null)
    const [error, setError] = useState(null)
    const [realTime, setRealTime] = useState({ active_visitors: 0, active_sessions: 0, top_pages: [] })
    const [generating, setGenerating] = useState(false)

    useEffect(() => {
        if (adminToken) {
            fetchAnalytics()
        }
    }, [period, adminToken])

    useEffect(() => {
        if (adminToken) {
            fetchRealTime()
            const interval = setInterval(fetchRealTime, 30000)
            return () => clearInterval(interval)
        }
    }, [adminToken])

    const fetchAnalytics = async () => {
        try {
            setLoading(true)
            setError(null)
            const res = await fetch(`${API_URL}/api/v1/visitor-analytics/stats?period=${period}`, {
                headers: { 'Authorization': `Bearer ${adminToken}` }
            })
            if (res.ok) {
                const jsonData = await res.json()
                setData(jsonData)
            } else {
                const errText = await res.text()
                setError(`Failed to load analytics: ${res.status} - ${errText}`)
            }
        } catch (err) {
            setError(`Error fetching analytics: ${err.message}`)
            console.error('Error fetching analytics:', err)
        } finally {
            setLoading(false)
        }
    }

    const fetchRealTime = async () => {
        try {
            const res = await fetch(`${API_URL}/api/v1/visitor-analytics/real-time`, {
                headers: { 'Authorization': `Bearer ${adminToken}` }
            })
            if (res.ok) {
                setRealTime(await res.json())
            }
        } catch (err) {
            console.error('Error fetching real-time data:', err)
        }
    }

    const generateSampleData = async () => {
        try {
            setGenerating(true)
            setError(null)
            const res = await fetch(`${API_URL}/api/v1/visitor-analytics/generate-sample-data`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${adminToken}` }
            })
            if (res.ok) {
                await fetchAnalytics()
                await fetchRealTime()
            } else {
                const errText = await res.text()
                setError(`Failed to generate data: ${errText}`)
            }
        } catch (err) {
            setError(`Error generating sample data: ${err.message}`)
            console.error('Error generating sample data:', err)
        } finally {
            setGenerating(false)
        }
    }

    const formatNumber = (num) => {
        return new Intl.NumberFormat('en-US').format(num || 0)
    }

    const formatDuration = (seconds) => {
        if (!seconds) return '0s'
        if (seconds < 60) return `${Math.round(seconds)}s`
        const mins = Math.floor(seconds / 60)
        const secs = Math.round(seconds % 60)
        return `${mins}m ${secs}s`
    }

    const getSourceIcon = (source) => {
        const icons = {
            direct: '🔗',
            organic_search: '🔍',
            social: '📱',
            referral: '🌐',
            email: '📧',
            paid_search: '💰'
        }
        return icons[source] || '📊'
    }

    const getDeviceIcon = (device) => {
        if (device === 'mobile') return <Smartphone size={32} />
        if (device === 'tablet') return <Tablet size={32} />
        return <Monitor size={32} />
    }

    const getFlagEmoji = (countryCode) => {
        if (!countryCode) return '🌍'
        const codePoints = countryCode
            .toUpperCase()
            .split('')
            .map(char => 127397 + char.charCodeAt(0))
        return String.fromCodePoint(...codePoints)
    }

    if (loading && !data) {
        return (
            <div className="admin-loading">
                <div className="spinner"></div>
                <p>Loading visitor analytics...</p>
            </div>
        )
    }

    if (error && !data) {
        return (
            <div className="admin-page-content">
                <div className="page-header">
                    <div>
                        <h1>Visitor Analytics</h1>
                        <p className="subtitle">Track where your visitors come from</p>
                    </div>
                </div>
                <div className="error-banner" style={{ background: '#fee2e2', color: '#dc2626', padding: '1rem', borderRadius: '8px', marginTop: '1rem' }}>
                    <p>{error}</p>
                    <button className="btn btn-primary" onClick={fetchAnalytics} style={{ marginTop: '0.5rem' }}>
                        Retry
                    </button>
                </div>
            </div>
        )
    }

    // Calculate max values for chart scaling
    const maxViews = Math.max(...(data?.trends?.map(t => t.page_views) || [1]), 1)

    return (
        <div className="admin-page-content">
            <div className="page-header">
                <div>
                    <h1>Visitor Analytics</h1>
                    <p className="subtitle">Track where your visitors come from and how they interact</p>
                </div>
                <div className="header-actions">
                    <div className="period-selector">
                        {['7d', '30d', '90d'].map(p => (
                            <button
                                key={p}
                                className={`period-btn ${period === p ? 'active' : ''}`}
                                onClick={() => setPeriod(p)}
                            >
                                {p === '7d' ? '7 Days' : p === '30d' ? '30 Days' : '90 Days'}
                            </button>
                        ))}
                    </div>
                    <button
                        className="btn btn-secondary"
                        onClick={fetchAnalytics}
                        disabled={loading}
                        style={{ padding: '0.5rem 1rem' }}
                    >
                        {loading ? 'Refreshing...' : 'Refresh'}
                    </button>
                    {(!data?.summary?.total_page_views || data.summary.total_page_views === 0) && (
                        <button
                            className="btn btn-primary"
                            onClick={generateSampleData}
                            disabled={generating}
                        >
                            {generating ? 'Generating...' : 'Generate Sample Data'}
                        </button>
                    )}
                </div>
            </div>

            {error && (
                <div style={{ background: '#fee2e2', color: '#dc2626', padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '1rem' }}>
                    {error}
                </div>
            )}

            {/* Real-time indicator */}
            <div className="real-time-banner">
                <div className="real-time-dot"></div>
                <span><strong>{realTime.active_visitors}</strong> visitors active right now</span>
            </div>

            {/* Summary Stats */}
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #8B5CF6, #7C3AED)' }}>
                        <Users size={24} />
                    </div>
                    <div className="stat-content">
                        <span className="stat-label">Unique Visitors</span>
                        <span className="stat-value">{formatNumber(data?.summary?.unique_visitors)}</span>
                        <span className={`stat-change ${(data?.summary?.visitors_change || 0) >= 0 ? 'positive' : 'negative'}`}>
                            {(data?.summary?.visitors_change || 0) >= 0 ? '↑' : '↓'} {Math.abs(data?.summary?.visitors_change || 0)}%
                        </span>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #06B6D4, #0891B2)' }}>
                        <Eye size={24} />
                    </div>
                    <div className="stat-content">
                        <span className="stat-label">Page Views</span>
                        <span className="stat-value">{formatNumber(data?.summary?.total_page_views)}</span>
                        <span className={`stat-change ${(data?.summary?.page_views_change || 0) >= 0 ? 'positive' : 'negative'}`}>
                            {(data?.summary?.page_views_change || 0) >= 0 ? '↑' : '↓'} {Math.abs(data?.summary?.page_views_change || 0)}%
                        </span>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #10B981, #059669)' }}>
                        <Clock size={24} />
                    </div>
                    <div className="stat-content">
                        <span className="stat-label">Avg. Session Duration</span>
                        <span className="stat-value">{formatDuration(data?.summary?.avg_session_duration)}</span>
                        <span className="stat-secondary">{(data?.summary?.avg_pages_per_session || 0).toFixed(1)} pages/session</span>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #F59E0B, #D97706)' }}>
                        <TrendingUp size={24} />
                    </div>
                    <div className="stat-content">
                        <span className="stat-label">Bounce Rate</span>
                        <span className="stat-value">{(data?.summary?.bounce_rate || 0).toFixed(1)}%</span>
                        <span className="stat-secondary">Single page visits</span>
                    </div>
                </div>
            </div>

            <div className="analytics-grid">
                {/* Visitor Trends Chart */}
                <div className="analytics-card chart-card">
                    <h3>Visitor Trends</h3>
                    <div className="chart-container">
                        {data?.trends?.length > 0 ? (
                            <>
                                <svg viewBox="0 0 800 200" className="trend-chart">
                                    {/* Grid lines */}
                                    {[0, 1, 2, 3, 4].map(i => (
                                        <line key={i} x1="40" y1={40 + i * 35} x2="780" y2={40 + i * 35} stroke="rgba(255,255,255,0.1)" />
                                    ))}

                                    {/* Area fill */}
                                    <defs>
                                        <linearGradient id="viewsGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                            <stop offset="0%" stopColor="rgba(241, 126, 35, 0.4)" />
                                            <stop offset="100%" stopColor="rgba(241, 126, 35, 0)" />
                                        </linearGradient>
                                    </defs>

                                    {(() => {
                                        const points = data.trends.map((d, i) => {
                                            const x = 40 + (i / Math.max(data.trends.length - 1, 1)) * 740
                                            const y = 175 - (d.page_views / maxViews) * 135
                                            return `${x},${y}`
                                        }).join(' ')

                                        return (
                                            <>
                                                <polygon fill="url(#viewsGradient)" points={`40,175 ${points} 780,175`} />
                                                <polyline fill="none" stroke="var(--primary)" strokeWidth="3" points={points} />
                                                {data.trends.map((d, i) => {
                                                    const x = 40 + (i / Math.max(data.trends.length - 1, 1)) * 740
                                                    const y = 175 - (d.page_views / maxViews) * 135
                                                    return <circle key={i} cx={x} cy={y} r="4" fill="var(--primary)" />
                                                })}
                                            </>
                                        )
                                    })()}
                                </svg>
                                <div className="chart-labels">
                                    {data.trends.filter((_, i) => i % Math.ceil(data.trends.length / 7) === 0).map(d => (
                                        <span key={d.date}>{d.date}</span>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <div className="no-data">No trend data available yet</div>
                        )}
                    </div>
                </div>

                {/* Traffic Sources */}
                <div className="analytics-card">
                    <h3>Traffic Sources</h3>
                    <div className="source-list">
                        {data?.traffic_sources?.length > 0 ? (
                            data.traffic_sources.map((source, index) => {
                                const colors = ['#8B5CF6', '#10B981', '#F59E0B', '#EC4899', '#06B6D4']
                                return (
                                    <div key={source.source} className="source-item">
                                        <div className="source-info">
                                            <span className="source-icon">{getSourceIcon(source.source)}</span>
                                            <span className="source-name">{source.source.replace('_', ' ')}</span>
                                        </div>
                                        <div className="source-bar-container">
                                            <div
                                                className="source-bar"
                                                style={{ width: `${source.percentage}%`, background: colors[index % colors.length] }}
                                            ></div>
                                        </div>
                                        <span className="source-percent">{source.percentage}%</span>
                                    </div>
                                )
                            })
                        ) : (
                            <div className="no-data">No traffic data available yet</div>
                        )}
                    </div>
                </div>

                {/* Geographic Distribution */}
                <div className="analytics-card">
                    <h3><Globe size={20} /> Top Countries</h3>
                    <div className="geo-list">
                        {data?.geographic?.length > 0 ? (
                            data.geographic.slice(0, 5).map(country => (
                                <div key={country.country_code} className="geo-item">
                                    <span className="geo-flag">{getFlagEmoji(country.country_code)}</span>
                                    <span className="geo-name">{country.country_name}</span>
                                    <span className="geo-count">{formatNumber(country.count)}</span>
                                    <span className="geo-percent">{country.percentage}%</span>
                                </div>
                            ))
                        ) : (
                            <div className="no-data">No geographic data available yet</div>
                        )}
                    </div>
                </div>

                {/* Device Breakdown */}
                <div className="analytics-card">
                    <h3>Devices</h3>
                    <div className="device-grid">
                        {data?.devices?.length > 0 ? (
                            data.devices.map(device => (
                                <div key={device.device_type} className="device-card">
                                    <div className="device-icon">{getDeviceIcon(device.device_type)}</div>
                                    <span className="device-type">{device.device_type}</span>
                                    <span className="device-percent">{device.percentage}%</span>
                                    <span className="device-count">{formatNumber(device.count)} visitors</span>
                                </div>
                            ))
                        ) : (
                            <div className="no-data">No device data available yet</div>
                        )}
                    </div>
                </div>

                {/* Browser Breakdown */}
                <div className="analytics-card">
                    <h3>Browsers</h3>
                    <div className="browser-list">
                        {data?.browsers?.length > 0 ? (
                            data.browsers.map((browser, index) => {
                                const colors = ['#8B5CF6', '#10B981', '#F59E0B', '#EC4899', '#06B6D4']
                                return (
                                    <div key={browser.browser} className="browser-item">
                                        <span className="browser-name">{browser.browser}</span>
                                        <div className="browser-bar-container">
                                            <div
                                                className="browser-bar"
                                                style={{ width: `${browser.percentage}%`, background: colors[index % colors.length] }}
                                            ></div>
                                        </div>
                                        <span className="browser-percent">{browser.percentage}%</span>
                                    </div>
                                )
                            })
                        ) : (
                            <div className="no-data">No browser data available yet</div>
                        )}
                    </div>
                </div>

                {/* Top Pages */}
                <div className="analytics-card">
                    <h3>Top Pages</h3>
                    <div className="pages-list">
                        {data?.top_pages?.length > 0 ? (
                            data.top_pages.map((page, index) => (
                                <div key={page.page_path} className="page-item">
                                    <span className="page-rank">{index + 1}</span>
                                    <div className="page-info">
                                        <span className="page-path">{page.page_path}</span>
                                    </div>
                                    <div className="page-stats">
                                        <span className="page-views">{formatNumber(page.views)} views</span>
                                        <span className="page-visitors">{formatNumber(page.unique_visitors)} visitors</span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="no-data">No page data available yet</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AdminVisitorAnalytics
