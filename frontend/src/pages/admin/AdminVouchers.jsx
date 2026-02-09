import { useState, useEffect } from 'react'
import { useAdminAuth } from '../../context/AdminAuthContext'
import './AdminPanel.css'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'

const AdminVouchers = () => {
    const { adminToken } = useAdminAuth()

    const [vouchers, setVouchers] = useState([])
    const [loading, setLoading] = useState(true)
    const [showModal, setShowModal] = useState(false)
    const [editingVoucher, setEditingVoucher] = useState(null)
    const [showDeleteModal, setShowDeleteModal] = useState(null)
    const [formData, setFormData] = useState({
        code: '',
        name: '',
        description: '',
        discount_type: 'percentage',
        discount_value: '',
        min_order_amount: 0,
        max_discount_amount: '',
        usage_limit: '',
        per_user_limit: 1,
        start_date: '',
        end_date: '',
        is_active: true
    })

    useEffect(() => {
        fetchVouchers()
    }, [])

    const fetchVouchers = async () => {
        try {
            setLoading(true)
            const response = await fetch(`${API_URL}/vouchers`, {
                headers: { 'Authorization': `Bearer ${adminToken}` }
            })
            if (response.ok) {
                const data = await response.json()
                setVouchers(data.items || data)
            }
        } catch (error) {
            console.error('Error fetching vouchers:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            const url = editingVoucher
                ? `${API_URL}/vouchers/${editingVoucher.id}`
                : `${API_URL}/vouchers`
            const method = editingVoucher ? 'PUT' : 'POST'

            const payload = {
                ...formData,
                code: formData.code.toUpperCase(),
                discount_value: parseFloat(formData.discount_value),
                min_order_amount: parseFloat(formData.min_order_amount) || 0,
                max_discount_amount: formData.max_discount_amount ? parseFloat(formData.max_discount_amount) : null,
                usage_limit: formData.usage_limit ? parseInt(formData.usage_limit) : null,
                per_user_limit: parseInt(formData.per_user_limit) || 1,
                start_date: formData.start_date || null,
                end_date: formData.end_date || null
            }

            const response = await fetch(url, {
                method,
                headers: {
                    'Authorization': `Bearer ${adminToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            })

            if (response.ok) {
                setShowModal(false)
                setEditingVoucher(null)
                resetForm()
                fetchVouchers()
            }
        } catch (error) {
            console.error('Error saving voucher:', error)
        }
    }

    const handleDelete = async (id) => {
        try {
            const response = await fetch(`${API_URL}/vouchers/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${adminToken}` }
            })
            if (response.ok) {
                setShowDeleteModal(null)
                fetchVouchers()
            }
        } catch (error) {
            console.error('Error deleting voucher:', error)
        }
    }

    const openEditModal = (voucher) => {
        setEditingVoucher(voucher)
        setFormData({
            code: voucher.code,
            name: voucher.name,
            description: voucher.description || '',
            discount_type: voucher.discount_type,
            discount_value: voucher.discount_value.toString(),
            min_order_amount: voucher.min_order_amount || 0,
            max_discount_amount: voucher.max_discount_amount?.toString() || '',
            usage_limit: voucher.usage_limit?.toString() || '',
            per_user_limit: voucher.per_user_limit || 1,
            start_date: formatDateTimeLocal(voucher.start_date),
            end_date: formatDateTimeLocal(voucher.end_date),
            is_active: voucher.is_active
        })
        setShowModal(true)
    }

    const resetForm = () => {
        setFormData({
            code: '',
            name: '',
            description: '',
            discount_type: 'percentage',
            discount_value: '',
            min_order_amount: 0,
            max_discount_amount: '',
            usage_limit: '',
            per_user_limit: 1,
            start_date: '',
            end_date: '',
            is_active: true
        })
    }

    const formatDateTimeLocal = (dateString) => {
        if (!dateString) return ''
        const date = new Date(dateString)
        return date.toISOString().slice(0, 16)
    }

    const formatDate = (dateString) => {
        if (!dateString) return 'No limit'
        return new Date(dateString).toLocaleDateString()
    }

    const getVoucherStatus = (voucher) => {
        const now = new Date()
        const start = voucher.start_date ? new Date(voucher.start_date) : null
        const end = voucher.end_date ? new Date(voucher.end_date) : null

        if (!voucher.is_active) return { class: 'inactive', label: 'Inactive' }
        if (start && now < start) return { class: 'upcoming', label: 'Scheduled' }
        if (end && now > end) return { class: 'expired', label: 'Expired' }
        if (voucher.usage_limit && voucher.usage_count >= voucher.usage_limit) {
            return { class: 'expired', label: 'Exhausted' }
        }
        return { class: 'active', label: 'Active' }
    }

    const generateCode = () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
        let code = ''
        for (let i = 0; i < 8; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length))
        }
        setFormData({ ...formData, code })
    }

    const formatDiscount = (voucher) => {
        if (voucher.discount_type === 'percentage') {
            return `${voucher.discount_value}%`
        }
        return `&#2547;${voucher.discount_value.toLocaleString()}`
    }

    return (
        <div className="admin-vouchers">
            <div className="page-header">
                <div>
                    <h1>Vouchers</h1>
                    <p className="subtitle">Manage discount codes and promotional vouchers</p>
                </div>
                <button
                    className="btn btn-primary"
                    onClick={() => {
                        setEditingVoucher(null)
                        resetForm()
                        setShowModal(true)
                    }}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="12" y1="5" x2="12" y2="19" />
                        <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                    Create Voucher
                </button>
            </div>

            {loading ? (
                <div className="loading-state">
                    <div className="spinner"></div>
                </div>
            ) : vouchers.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-icon">&#127915;</div>
                    <h3>No vouchers yet</h3>
                    <p>Create discount codes to attract more customers</p>
                    <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                        Create Voucher
                    </button>
                </div>
            ) : (
                <div className="table-container">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Code</th>
                                <th>Discount</th>
                                <th>Usage</th>
                                <th>Valid Period</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {vouchers.map(voucher => {
                                const status = getVoucherStatus(voucher)
                                return (
                                    <tr key={voucher.id}>
                                        <td>
                                            <div className="voucher-cell">
                                                <span className="voucher-code">{voucher.code}</span>
                                                <span className="voucher-name">{voucher.name}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="discount-cell">
                                                <span
                                                    className="discount-value"
                                                    dangerouslySetInnerHTML={{ __html: formatDiscount(voucher) }}
                                                />
                                                {voucher.min_order_amount > 0 && (
                                                    <span className="min-order">
                                                        Min: &#2547;{voucher.min_order_amount.toLocaleString()}
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td>
                                            <div className="usage-cell">
                                                <span className="usage-count">
                                                    {voucher.usage_count || 0}
                                                    {voucher.usage_limit ? ` / ${voucher.usage_limit}` : ''}
                                                </span>
                                                <span className="per-user">
                                                    {voucher.per_user_limit} per user
                                                </span>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="period-cell">
                                                <span>{formatDate(voucher.start_date)}</span>
                                                <span className="period-separator">to</span>
                                                <span>{formatDate(voucher.end_date)}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <span className={`status-badge ${status.class}`}>
                                                {status.label}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="action-buttons">
                                                <button
                                                    className="action-btn edit"
                                                    title="Edit"
                                                    onClick={() => openEditModal(voucher)}
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                                    </svg>
                                                </button>
                                                <button
                                                    className="action-btn delete"
                                                    title="Delete"
                                                    onClick={() => setShowDeleteModal(voucher)}
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                        <polyline points="3 6 5 6 21 6" />
                                                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Create/Edit Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-content wide" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>{editingVoucher ? 'Edit Voucher' : 'Create Voucher'}</h3>
                            <button className="close-btn" onClick={() => setShowModal(false)}>x</button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="modal-body">
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Voucher Code</label>
                                        <div className="input-with-button">
                                            <input
                                                type="text"
                                                value={formData.code}
                                                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                                placeholder="SUMMER2024"
                                                required
                                                style={{ textTransform: 'uppercase' }}
                                            />
                                            <button type="button" className="btn btn-secondary" onClick={generateCode}>
                                                Generate
                                            </button>
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label>Name</label>
                                        <input
                                            type="text"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            placeholder="Summer Sale Discount"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label>Description (Optional)</label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        placeholder="Get 20% off on all products..."
                                        rows="2"
                                    />
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Discount Type</label>
                                        <select
                                            value={formData.discount_type}
                                            onChange={(e) => setFormData({ ...formData, discount_type: e.target.value })}
                                        >
                                            <option value="percentage">Percentage (%)</option>
                                            <option value="fixed">Fixed Amount (&#2547;)</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>
                                            Discount Value
                                            {formData.discount_type === 'percentage' ? ' (%)' : ' (&#2547;)'}
                                        </label>
                                        <input
                                            type="number"
                                            value={formData.discount_value}
                                            onChange={(e) => setFormData({ ...formData, discount_value: e.target.value })}
                                            placeholder={formData.discount_type === 'percentage' ? '20' : '500'}
                                            min="0"
                                            max={formData.discount_type === 'percentage' ? '100' : undefined}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Minimum Order Amount</label>
                                        <input
                                            type="number"
                                            value={formData.min_order_amount}
                                            onChange={(e) => setFormData({ ...formData, min_order_amount: e.target.value })}
                                            placeholder="0"
                                            min="0"
                                        />
                                    </div>
                                    {formData.discount_type === 'percentage' && (
                                        <div className="form-group">
                                            <label>Max Discount Amount (Optional)</label>
                                            <input
                                                type="number"
                                                value={formData.max_discount_amount}
                                                onChange={(e) => setFormData({ ...formData, max_discount_amount: e.target.value })}
                                                placeholder="1000"
                                                min="0"
                                            />
                                        </div>
                                    )}
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Total Usage Limit (Optional)</label>
                                        <input
                                            type="number"
                                            value={formData.usage_limit}
                                            onChange={(e) => setFormData({ ...formData, usage_limit: e.target.value })}
                                            placeholder="Unlimited"
                                            min="1"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Per User Limit</label>
                                        <input
                                            type="number"
                                            value={formData.per_user_limit}
                                            onChange={(e) => setFormData({ ...formData, per_user_limit: e.target.value })}
                                            placeholder="1"
                                            min="1"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Start Date (Optional)</label>
                                        <input
                                            type="datetime-local"
                                            value={formData.start_date}
                                            onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>End Date (Optional)</label>
                                        <input
                                            type="datetime-local"
                                            value={formData.end_date}
                                            onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="form-group checkbox-group">
                                    <label>
                                        <input
                                            type="checkbox"
                                            checked={formData.is_active}
                                            onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                                        />
                                        Active
                                    </label>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    {editingVoucher ? 'Update' : 'Create'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Modal */}
            {showDeleteModal && (
                <div className="modal-overlay" onClick={() => setShowDeleteModal(null)}>
                    <div className="modal-content delete-modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Delete Voucher</h3>
                            <button className="close-btn" onClick={() => setShowDeleteModal(null)}>x</button>
                        </div>
                        <div className="modal-body">
                            <p>Are you sure you want to delete voucher <strong>{showDeleteModal.code}</strong>?</p>
                            <p className="warning-text">This action cannot be undone.</p>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={() => setShowDeleteModal(null)}>
                                Cancel
                            </button>
                            <button className="btn btn-danger" onClick={() => handleDelete(showDeleteModal.id)}>
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default AdminVouchers
