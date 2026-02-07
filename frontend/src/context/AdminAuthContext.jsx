import { createContext, useContext, useState, useEffect } from 'react'
import { authAPI } from '../utils/api'

const AdminAuthContext = createContext(null)

// Use separate localStorage keys for admin authentication
const ADMIN_TOKEN_KEY = 'adminToken'
const ADMIN_USER_KEY = 'adminUser'

export const useAdminAuth = () => {
    const context = useContext(AdminAuthContext)
    if (!context) {
        throw new Error('useAdminAuth must be used within an AdminAuthProvider')
    }
    return context
}

export const AdminAuthProvider = ({ children }) => {
    const [admin, setAdmin] = useState(null)
    const [adminToken, setAdminToken] = useState(localStorage.getItem(ADMIN_TOKEN_KEY))
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const initAdminAuth = async () => {
            const storedToken = localStorage.getItem(ADMIN_TOKEN_KEY)
            if (storedToken) {
                setAdminToken(storedToken)
                try {
                    // Temporarily set the token for this request
                    const originalToken = localStorage.getItem('token')
                    localStorage.setItem('token', storedToken)

                    const response = await authAPI.getProfile()

                    // Restore original token
                    if (originalToken) {
                        localStorage.setItem('token', originalToken)
                    } else {
                        localStorage.removeItem('token')
                    }

                    // Verify user is actually an admin
                    if (response.data.role === 'admin') {
                        setAdmin(response.data)
                    } else {
                        // Not an admin, clear admin session
                        localStorage.removeItem(ADMIN_TOKEN_KEY)
                        localStorage.removeItem(ADMIN_USER_KEY)
                        setAdminToken(null)
                    }
                } catch (error) {
                    localStorage.removeItem(ADMIN_TOKEN_KEY)
                    localStorage.removeItem(ADMIN_USER_KEY)
                    setAdminToken(null)
                }
            }
            setLoading(false)
        }
        initAdminAuth()
    }, [])

    const adminLogin = async (email, password) => {
        try {
            const response = await authAPI.login({ email, password })
            const { token: newToken, user: newUser } = response.data

            // Verify user is an admin
            if (newUser.role !== 'admin') {
                return { success: false, error: 'Access denied. Admin credentials required.' }
            }

            // Store in admin-specific keys only
            localStorage.setItem(ADMIN_TOKEN_KEY, newToken)
            localStorage.setItem(ADMIN_USER_KEY, JSON.stringify(newUser))
            setAdminToken(newToken)
            setAdmin(newUser)

            return { success: true }
        } catch (error) {
            const message = error.response?.data?.detail || error.message || 'Login failed'
            return { success: false, error: message }
        }
    }

    const adminLogout = () => {
        localStorage.removeItem(ADMIN_TOKEN_KEY)
        localStorage.removeItem(ADMIN_USER_KEY)
        setAdminToken(null)
        setAdmin(null)
    }

    const value = {
        admin,
        adminToken,
        loading,
        isAuthenticated: !!admin,
        adminLogin,
        adminLogout,
    }

    return (
        <AdminAuthContext.Provider value={value}>
            {children}
        </AdminAuthContext.Provider>
    )
}
