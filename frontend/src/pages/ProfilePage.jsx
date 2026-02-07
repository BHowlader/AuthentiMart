import { useState } from 'react'
import { User, Mail, Phone, MapPin, Lock, Save, Camera } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import './ProfilePage.css'

const ProfilePage = () => {
    const { user, updateProfile } = useAuth()
    const { showToast } = useToast()

    const [activeTab, setActiveTab] = useState('profile')
    const [loading, setLoading] = useState(false)

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

    const [addressData, setAddressData] = useState({
        address: '',
        city: '',
        area: ''
    })

    const handleProfileChange = (e) => {
        const { name, value } = e.target
        setProfileData(prev => ({ ...prev, [name]: value }))
    }

    const handlePasswordChange = (e) => {
        const { name, value } = e.target
        setPasswordData(prev => ({ ...prev, [name]: value }))
    }

    const handleAddressChange = (e) => {
        const { name, value } = e.target
        setAddressData(prev => ({ ...prev, [name]: value }))
    }

    const handleProfileSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)

        // Simulate API call
        setTimeout(() => {
            showToast('Profile updated successfully!', 'success')
            setLoading(false)
        }, 1000)
    }

    const handlePasswordSubmit = async (e) => {
        e.preventDefault()

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            showToast('Passwords do not match', 'error')
            return
        }

        setLoading(true)

        setTimeout(() => {
            showToast('Password changed successfully!', 'success')
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
            setLoading(false)
        }, 1000)
    }

    const handleAddressSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)

        setTimeout(() => {
            showToast('Address updated successfully!', 'success')
            setLoading(false)
        }, 1000)
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
                            <div className="avatar-image">
                                {user?.picture ? (
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
                            <button className="avatar-edit">
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
                                Address
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
                                                    onChange={handleProfileChange}
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
                                <h2>Shipping Address</h2>
                                <form onSubmit={handleAddressSubmit}>
                                    <div className="form-grid">
                                        <div className="input-group full-width">
                                            <label className="input-label">Address</label>
                                            <div className="input-wrapper">
                                                <MapPin size={18} />
                                                <input
                                                    type="text"
                                                    name="address"
                                                    className="input-field"
                                                    placeholder="House/Flat, Road, Block"
                                                    value={addressData.address}
                                                    onChange={handleAddressChange}
                                                />
                                            </div>
                                        </div>

                                        <div className="input-group">
                                            <label className="input-label">City</label>
                                            <select
                                                name="city"
                                                className="input-field select-field"
                                                value={addressData.city}
                                                onChange={handleAddressChange}
                                            >
                                                <option value="">Select City</option>
                                                <option value="dhaka">Dhaka</option>
                                                <option value="chittagong">Chittagong</option>
                                                <option value="sylhet">Sylhet</option>
                                                <option value="rajshahi">Rajshahi</option>
                                                <option value="khulna">Khulna</option>
                                            </select>
                                        </div>

                                        <div className="input-group">
                                            <label className="input-label">Area</label>
                                            <input
                                                type="text"
                                                name="area"
                                                className="input-field"
                                                placeholder="Enter your area"
                                                value={addressData.area}
                                                onChange={handleAddressChange}
                                            />
                                        </div>
                                    </div>

                                    <button type="submit" className="btn btn-primary" disabled={loading}>
                                        <Save size={18} />
                                        {loading ? 'Saving...' : 'Save Address'}
                                    </button>
                                </form>
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
