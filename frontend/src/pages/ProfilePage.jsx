import { useState, useRef, useEffect } from 'react'
import { User, Mail, Phone, MapPin, Lock, Save, Camera, Loader2, Plus, Trash2, Edit2, Star } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { addressAPI, authAPI } from '../utils/api'
import './ProfilePage.css'

const ProfilePage = () => {
    const { user, updateProfile, uploadAvatar } = useAuth()
    const { showToast } = useToast()
    const fileInputRef = useRef(null)

    const [activeTab, setActiveTab] = useState('profile')
    const [loading, setLoading] = useState(false)
    const [avatarLoading, setAvatarLoading] = useState(false)

    // Addresses state
    const [addresses, setAddresses] = useState([])
    const [addressesLoading, setAddressesLoading] = useState(true)
    const [showAddressForm, setShowAddressForm] = useState(false)
    const [editingAddress, setEditingAddress] = useState(null)

    const handleAvatarClick = () => {
        fileInputRef.current?.click()
    }

    const handleAvatarChange = async (e) => {
        const file = e.target.files?.[0]
        if (!file) return

        if (!file.type.startsWith('image/')) {
            showToast('Please select an image file', 'error')
            return
        }

        if (file.size > 5 * 1024 * 1024) {
            showToast('Image size must be less than 5MB', 'error')
            return
        }

        setAvatarLoading(true)
        const formData = new FormData()
        formData.append('file', file)

        await uploadAvatar(formData)
        setAvatarLoading(false)
        e.target.value = ''
    }

    const [profileData, setProfileData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        phone: user?.phone || '',
    })

    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    })

    const [addressFormData, setAddressFormData] = useState({
        address: '',
        area: '',
        city: '',
        is_default: false
    })

    // Fetch addresses on component mount
    useEffect(() => {
        fetchAddresses()
    }, [])

    const fetchAddresses = async () => {
        try {
            setAddressesLoading(true)
            const response = await addressAPI.getAll()
            setAddresses(response.data)
        } catch (error) {
            console.error('Error fetching addresses:', error)
        } finally {
            setAddressesLoading(false)
        }
    }

    const handleProfileChange = (e) => {
        const { name, value } = e.target
        setProfileData(prev => ({ ...prev, [name]: value }))
    }

    const handlePasswordChange = (e) => {
        const { name, value } = e.target
        setPasswordData(prev => ({ ...prev, [name]: value }))
    }

    const handleAddressFormChange = (e) => {
        const { name, value, type, checked } = e.target
        setAddressFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }))
    }

    const handleProfileSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)

        await updateProfile({
            name: profileData.name,
            phone: profileData.phone
        })

        setLoading(false)
    }

    const handlePasswordSubmit = async (e) => {
        e.preventDefault()

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            showToast('Passwords do not match', 'error')
            return
        }

        if (passwordData.newPassword.length < 8) {
            showToast('Password must be at least 8 characters', 'error')
            return
        }

        setLoading(true)

        try {
            await authAPI.changePassword({
                current_password: passwordData.currentPassword,
                new_password: passwordData.newPassword
            })
            showToast('Password changed successfully!', 'success')
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
        } catch (error) {
            const message = error.response?.data?.detail || 'Failed to change password'
            showToast(message, 'error')
        } finally {
            setLoading(false)
        }
    }

    const resetAddressForm = () => {
        setAddressFormData({
            address: '',
            area: '',
            city: '',
            is_default: false
        })
        setEditingAddress(null)
        setShowAddressForm(false)
    }

    const handleAddAddress = () => {
        setAddressFormData({
            address: '',
            area: '',
            city: '',
            is_default: addresses.length === 0
        })
        setEditingAddress(null)
        setShowAddressForm(true)
    }

    const handleEditAddress = (addr) => {
        setAddressFormData({
            address: addr.address,
            area: addr.area || '',
            city: addr.city,
            is_default: addr.is_default
        })
        setEditingAddress(addr)
        setShowAddressForm(true)
    }

    const handleAddressSubmit = async (e) => {
        e.preventDefault()

        if (!addressFormData.address || !addressFormData.city) {
            showToast('Please fill in all required fields', 'error')
            return
        }

        setLoading(true)

        // Auto-fill name and phone from user profile for backend
        const dataToSubmit = {
            ...addressFormData,
            name: user?.name || 'User',
            phone: user?.phone || ''
        }

        try {
            if (editingAddress) {
                await addressAPI.update(editingAddress.id, dataToSubmit)
                showToast('Address updated successfully!', 'success')
            } else {
                await addressAPI.create(dataToSubmit)
                showToast('Address added successfully!', 'success')
            }
            await fetchAddresses()
            resetAddressForm()
        } catch (error) {
            showToast(error.response?.data?.detail || 'Failed to save address', 'error')
        } finally {
            setLoading(false)
        }
    }

    const handleDeleteAddress = async (addressId) => {
        if (!confirm('Are you sure you want to delete this address?')) return

        try {
            await addressAPI.delete(addressId)
            showToast('Address deleted successfully!', 'success')
            await fetchAddresses()
        } catch (error) {
            showToast('Failed to delete address', 'error')
        }
    }

    const handleSetDefault = async (addressId) => {
        try {
            await addressAPI.setDefault(addressId)
            showToast('Default address updated!', 'success')
            await fetchAddresses()
        } catch (error) {
            showToast('Failed to set default address', 'error')
        }
    }

    return (
        <div className="profile-page">
            <div className="container">
                <div className="page-header">
                    <h1>My Profile</h1>
                    <p className="text-secondary">Manage your account settings</p>
                </div>

                <div className="profile-layout">
                    {/* Sidebar */}
                    <aside className="profile-sidebar glass-card">
                        <div className="profile-avatar">
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleAvatarChange}
                                accept="image/*"
                                style={{ display: 'none' }}
                            />
                            <div className="avatar-image">
                                {avatarLoading ? (
                                    <div className="avatar-loading">
                                        <Loader2 size={24} className="spin" />
                                    </div>
                                ) : user?.picture ? (
                                    <img
                                        src={user.picture}
                                        alt={user.name}
                                        className="avatar-img-full"
                                        referrerPolicy="no-referrer"
                                    />
                                ) : (
                                    user?.name?.charAt(0).toUpperCase() || 'U'
                                )}
                            </div>
                            <button
                                className="avatar-edit"
                                onClick={handleAvatarClick}
                                disabled={avatarLoading}
                                title="Change profile photo"
                            >
                                <Camera size={16} />
                            </button>
                        </div>
                        <h3 className="profile-name">{user?.name || 'User'}</h3>
                        <p className="profile-email">{user?.email || 'user@example.com'}</p>

                        <nav className="profile-nav">
                            <button
                                className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`}
                                onClick={() => setActiveTab('profile')}
                            >
                                <User size={18} />
                                Profile Information
                            </button>
                            <button
                                className={`nav-item ${activeTab === 'address' ? 'active' : ''}`}
                                onClick={() => setActiveTab('address')}
                            >
                                <MapPin size={18} />
                                Saved Addresses
                            </button>
                            <button
                                className={`nav-item ${activeTab === 'password' ? 'active' : ''}`}
                                onClick={() => setActiveTab('password')}
                            >
                                <Lock size={18} />
                                Change Password
                            </button>
                        </nav>
                    </aside>

                    {/* Content */}
                    <div className="profile-content">
                        {activeTab === 'profile' && (
                            <div className="profile-section glass-card">
                                <h2>Profile Information</h2>
                                <form onSubmit={handleProfileSubmit}>
                                    <div className="form-grid">
                                        <div className="input-group">
                                            <label className="input-label">Full Name</label>
                                            <div className="input-wrapper">
                                                <User size={18} />
                                                <input
                                                    type="text"
                                                    name="name"
                                                    className="input-field"
                                                    value={profileData.name}
                                                    onChange={handleProfileChange}
                                                />
                                            </div>
                                        </div>

                                        <div className="input-group">
                                            <label className="input-label">Email Address</label>
                                            <div className="input-wrapper">
                                                <Mail size={18} />
                                                <input
                                                    type="email"
                                                    name="email"
                                                    className="input-field"
                                                    value={profileData.email}
                                                    disabled
                                                />
                                            </div>
                                        </div>

                                        <div className="input-group">
                                            <label className="input-label">Phone Number</label>
                                            <div className="input-wrapper">
                                                <Phone size={18} />
                                                <input
                                                    type="tel"
                                                    name="phone"
                                                    className="input-field"
                                                    placeholder="01XXXXXXXXX"
                                                    value={profileData.phone}
                                                    onChange={handleProfileChange}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <button type="submit" className="btn btn-primary" disabled={loading}>
                                        <Save size={18} />
                                        {loading ? 'Saving...' : 'Save Changes'}
                                    </button>
                                </form>
                            </div>
                        )}

                        {activeTab === 'address' && (
                            <div className="profile-section glass-card">
                                <div className="section-header">
                                    <h2>Saved Addresses</h2>
                                    {!showAddressForm && (
                                        <button className="btn btn-primary btn-sm" onClick={handleAddAddress}>
                                            <Plus size={16} />
                                            Add Address
                                        </button>
                                    )}
                                </div>

                                {showAddressForm ? (
                                    <form onSubmit={handleAddressSubmit} className="address-form">
                                        <h3>{editingAddress ? 'Edit Address' : 'Add New Address'}</h3>
                                        <div className="form-grid">
                                            <div className="input-group full-width">
                                                <label className="input-label">Address *</label>
                                                <div className="input-wrapper">
                                                    <MapPin size={18} />
                                                    <input
                                                        type="text"
                                                        name="address"
                                                        className="input-field"
                                                        placeholder="House/Flat, Road, Block"
                                                        value={addressFormData.address}
                                                        onChange={handleAddressFormChange}
                                                        required
                                                    />
                                                </div>
                                            </div>

                                            <div className="input-group">
                                                <label className="input-label">City *</label>
                                                <select
                                                    name="city"
                                                    className="input-field select-field"
                                                    value={addressFormData.city}
                                                    onChange={handleAddressFormChange}
                                                    required
                                                >
                                                    <option value="">Select City</option>
                                                    <option value="dhaka">Dhaka</option>
                                                    <option value="chittagong">Chittagong</option>
                                                    <option value="sylhet">Sylhet</option>
                                                    <option value="rajshahi">Rajshahi</option>
                                                    <option value="khulna">Khulna</option>
                                                    <option value="other">Other</option>
                                                </select>
                                            </div>

                                            <div className="input-group">
                                                <label className="input-label">Area</label>
                                                <input
                                                    type="text"
                                                    name="area"
                                                    className="input-field"
                                                    placeholder="Enter your area"
                                                    value={addressFormData.area}
                                                    onChange={handleAddressFormChange}
                                                />
                                            </div>

                                            <div className="input-group full-width">
                                                <label className="checkbox-label">
                                                    <input
                                                        type="checkbox"
                                                        name="is_default"
                                                        checked={addressFormData.is_default}
                                                        onChange={handleAddressFormChange}
                                                    />
                                                    Set as default address
                                                </label>
                                            </div>
                                        </div>

                                        <div className="form-actions">
                                            <button type="button" className="btn btn-secondary" onClick={resetAddressForm}>
                                                Cancel
                                            </button>
                                            <button type="submit" className="btn btn-primary" disabled={loading}>
                                                <Save size={18} />
                                                {loading ? 'Saving...' : (editingAddress ? 'Update Address' : 'Save Address')}
                                            </button>
                                        </div>
                                    </form>
                                ) : addressesLoading ? (
                                    <div className="loading-state">
                                        <Loader2 size={24} className="spin" />
                                    </div>
                                ) : addresses.length === 0 ? (
                                    <div className="empty-addresses">
                                        <MapPin size={48} />
                                        <p>No saved addresses yet</p>
                                        <span>Add an address to speed up checkout</span>
                                    </div>
                                ) : (
                                    <div className="addresses-list">
                                        {addresses.map(addr => (
                                            <div key={addr.id} className={`address-card ${addr.is_default ? 'default' : ''}`}>
                                                <div className="address-content">
                                                    <div className="address-header">
                                                        <span className="address-name">{addr.address}</span>
                                                        {addr.is_default && (
                                                            <span className="default-badge">
                                                                <Star size={12} /> Default
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="address-text">
                                                        {addr.area && `${addr.area}, `}
                                                        {addr.city}
                                                    </p>
                                                </div>
                                                <div className="address-actions">
                                                    {!addr.is_default && (
                                                        <button
                                                            className="btn btn-ghost btn-sm"
                                                            onClick={() => handleSetDefault(addr.id)}
                                                            title="Set as default"
                                                        >
                                                            <Star size={16} />
                                                        </button>
                                                    )}
                                                    <button
                                                        className="btn btn-ghost btn-sm"
                                                        onClick={() => handleEditAddress(addr)}
                                                        title="Edit"
                                                    >
                                                        <Edit2 size={16} />
                                                    </button>
                                                    <button
                                                        className="btn btn-ghost btn-sm btn-danger"
                                                        onClick={() => handleDeleteAddress(addr.id)}
                                                        title="Delete"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'password' && (
                            <div className="profile-section glass-card">
                                <h2>Change Password</h2>
                                <form onSubmit={handlePasswordSubmit}>
                                    <div className="form-grid single-column">
                                        <div className="input-group">
                                            <label className="input-label">Current Password</label>
                                            <div className="input-wrapper">
                                                <Lock size={18} />
                                                <input
                                                    type="password"
                                                    name="currentPassword"
                                                    className="input-field"
                                                    value={passwordData.currentPassword}
                                                    onChange={handlePasswordChange}
                                                />
                                            </div>
                                        </div>

                                        <div className="input-group">
                                            <label className="input-label">New Password</label>
                                            <div className="input-wrapper">
                                                <Lock size={18} />
                                                <input
                                                    type="password"
                                                    name="newPassword"
                                                    className="input-field"
                                                    value={passwordData.newPassword}
                                                    onChange={handlePasswordChange}
                                                />
                                            </div>
                                        </div>

                                        <div className="input-group">
                                            <label className="input-label">Confirm New Password</label>
                                            <div className="input-wrapper">
                                                <Lock size={18} />
                                                <input
                                                    type="password"
                                                    name="confirmPassword"
                                                    className="input-field"
                                                    value={passwordData.confirmPassword}
                                                    onChange={handlePasswordChange}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <button type="submit" className="btn btn-primary" disabled={loading}>
                                        <Save size={18} />
                                        {loading ? 'Updating...' : 'Update Password'}
                                    </button>
                                </form>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ProfilePage
