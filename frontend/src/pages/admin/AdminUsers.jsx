import { useState, useEffect } from 'react'
import { useAdminAuth } from '../../context/AdminAuthContext'
import { Shield, ShieldOff, Search } from 'lucide-react'
import './AdminPanel.css'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'

const AdminUsers = () => {
    const { adminToken, admin } = useAdminAuth()

    const [users, setUsers] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [roleFilter, setRoleFilter] = useState('')
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [totalUsers, setTotalUsers] = useState(0)
    const [updatingRole, setUpdatingRole] = useState(null)

    useEffect(() => {
        fetchUsers()
    }, [page, roleFilter])

    const fetchUsers = async () => {
        try {
            setLoading(true)
            const params = new URLSearchParams({
                page: page.toString(),
                limit: '15'
            })
            if (roleFilter) params.append('role', roleFilter)
            if (searchQuery) params.append('search', searchQuery)

            const response = await fetch(`${API_URL}/admin/users?${params}`, {
                headers: { 'Authorization': `Bearer ${adminToken}` }
            })
            if (response.ok) {
                const data = await response.json()
                setUsers(data.users)
                setTotalPages(data.pages)
                setTotalUsers(data.total)
            }
        } catch (error) {
            console.error('Error fetching users:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleSearch = (e) => {
        e.preventDefault()
        setPage(1)
        fetchUsers()
    }

    const updateUserRole = async (userId, newRole) => {
        try {
            setUpdatingRole(userId)
            const response = await fetch(`${API_URL}/admin/users/${userId}/role?role=${newRole}`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${adminToken}` }
            })
            if (response.ok) {
                fetchUsers()
            } else {
                const error = await response.json()
                alert(error.detail || 'Failed to update role')
            }
        } catch (error) {
            console.error('Error updating user role:', error)
        } finally {
            setUpdatingRole(null)
        }
    }

    const formatDate = (dateStr) => {
        if (!dateStr) return 'N/A'
        return new Date(dateStr).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        })
    }

    const getRoleBadge = (role) => {
        return role === 'admin' ? (
            <span className="status-badge admin-role">
                <Shield size={14} />
                Admin
            </span>
        ) : (
            <span className="status-badge user-role">User</span>
        )
    }

    return (
        <div className="admin-users">
            <div className="page-header">
                <div>
                    <h1>User Management</h1>
                    <p className="subtitle">Manage user roles and permissions ({totalUsers} total users)</p>
                </div>
            </div>

            {/* Filters */}
            <div className="filters-bar">
                <form className="search-form" onSubmit={handleSearch}>
                    <div className="search-input-wrapper">
                        <Search size={20} />
                        <input
                            type="text"
                            placeholder="Search by name or email..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <button type="submit" className="btn btn-primary">Search</button>
                </form>

                <select
                    className="filter-select"
                    value={roleFilter}
                    onChange={(e) => {
                        setRoleFilter(e.target.value)
                        setPage(1)
                    }}
                >
                    <option value="">All Roles</option>
                    <option value="admin">Admins Only</option>
                    <option value="user">Users Only</option>
                </select>
            </div>

            {/* Users Table */}
            {loading ? (
                <div className="loading-state">
                    <div className="spinner"></div>
                </div>
            ) : users.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-icon">👥</div>
                    <h3>No users found</h3>
                    <p>Users will appear here once they register</p>
                </div>
            ) : (
                <div className="table-container">
                    <table className="admin-table users-table">
                        <thead>
                            <tr>
                                <th>User</th>
                                <th>Email</th>
                                <th>Phone</th>
                                <th>Role</th>
                                <th>Status</th>
                                <th>Joined</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(user => (
                                <tr key={user.id} className={user.id === admin?.id ? 'current-user-row' : ''}>
                                    <td>
                                        <div className="customer-cell">
                                            <div className="customer-avatar">
                                                {user.picture ? (
                                                    <img src={user.picture} alt={user.name} />
                                                ) : (
                                                    <span className="avatar-placeholder">
                                                        {user.name?.charAt(0).toUpperCase() || '?'}
                                                    </span>
                                                )}
                                            </div>
                                            <span className="customer-name">
                                                {user.name}
                                                {user.id === admin?.id && <span className="you-badge">(You)</span>}
                                            </span>
                                        </div>
                                    </td>
                                    <td>
                                        <span className="customer-email">{user.email}</span>
                                    </td>
                                    <td>
                                        <span className="customer-phone">{user.phone || 'N/A'}</span>
                                    </td>
                                    <td>
                                        {getRoleBadge(user.role)}
                                    </td>
                                    <td>
                                        <span className={`status-badge ${user.is_active ? 'active' : 'inactive'}`}>
                                            {user.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td>
                                        <span className="joined-date">{formatDate(user.created_at)}</span>
                                    </td>
                                    <td>
                                        <div className="action-buttons">
                                            {user.role === 'admin' ? (
                                                <button
                                                    className="btn btn-sm btn-warning"
                                                    onClick={() => updateUserRole(user.id, 'user')}
                                                    disabled={updatingRole === user.id || user.id === admin?.id}
                                                    title={user.id === admin?.id ? "Cannot demote yourself" : "Remove admin access"}
                                                >
                                                    <ShieldOff size={14} />
                                                    Demote
                                                </button>
                                            ) : (
                                                <button
                                                    className="btn btn-sm btn-success"
                                                    onClick={() => updateUserRole(user.id, 'admin')}
                                                    disabled={updatingRole === user.id}
                                                    title="Grant admin access"
                                                >
                                                    <Shield size={14} />
                                                    Make Admin
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="pagination">
                    <button
                        className="pagination-btn"
                        disabled={page === 1}
                        onClick={() => setPage(p => p - 1)}
                    >
                        Previous
                    </button>
                    <span className="pagination-info">
                        Page {page} of {totalPages}
                    </span>
                    <button
                        className="pagination-btn"
                        disabled={page === totalPages}
                        onClick={() => setPage(p => p + 1)}
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    )
}

export default AdminUsers
