import { createContext, useContext, useState, useEffect } from 'react'
import axios from 'axios'

const AdminAuthContext = createContext(null)

// Use separate localStorage keys for admin authentication
const ADMIN_TOKEN_KEY = 'adminToken'
const ADMIN_USER_KEY = 'adminUser'

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api/v1'

// Create a dedicated admin API instance that doesn't share state with user API
const adminApi = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
})

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
                    // Use dedicated admin API with explicit token header
                    // This prevents contamination of the regular user auth
                    const response = await adminApi.get('/auth/me', {
                        headers: {
                            Authorization: `Bearer ${storedToken}`
                        }
                    })

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
            // Use dedicated admin API to prevent token contamination with user auth
            const formData = new URLSearchParams()
            formData.append('username', email)
            formData.append('password', password)

            const response = await adminApi.post('/auth/login', formData, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            })
            const { token: newToken, user: newUser } = response.data

            // Verify user is an admin
            if (newUser.role !== 'admin') {
                return { success: false, error: 'Access denied. Admin credentials required.' }
            }

            // Store in admin-specific keys only - never touch 'token' key
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
