import { createContext, useContext, useState, useEffect } from 'react'
import { authAPI } from '../utils/api'
import { useToast } from './ToastContext'

const AuthContext = createContext(null)

export const useAuth = () => {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}

export const AuthProvider = ({ children }) => {
    // Initialize from localStorage immediately for instant render
    const [user, setUser] = useState(() => {
        try {
            const stored = localStorage.getItem('user')
            return stored ? JSON.parse(stored) : null
        } catch {
            return null
        }
    })
    const [token, setToken] = useState(localStorage.getItem('token'))
    const [loading] = useState(false) // Start false - we have cached data
    const { showToast } = useToast()

    // Validate token in background (deferred)
    useEffect(() => {
        const validateAuth = async () => {
            const storedToken = localStorage.getItem('token')
            if (storedToken) {
                try {
                    // Validate and refresh user data in background
                    const response = await authAPI.getProfile()
                    setUser(response.data)
                    localStorage.setItem('user', JSON.stringify(response.data))
                } catch (error) {
                    // Token invalid - clear auth
                    localStorage.removeItem('token')
                    localStorage.removeItem('user')
                    setToken(null)
                    setUser(null)
                }
            }
        }
        // Defer validation to not block initial render
        const timeoutId = setTimeout(validateAuth, 50)
        return () => clearTimeout(timeoutId)
    }, [])

    const login = async (email, password) => {
        try {
            const response = await authAPI.login({ email, password })
            const { token: newToken, user: newUser } = response.data
            localStorage.setItem('token', newToken)
            localStorage.setItem('user', JSON.stringify(newUser))
            setToken(newToken)
            setUser(newUser)
            showToast('Welcome back!', 'success')
            // Dispatch event to refresh cart
            window.dispatchEvent(new Event('userLogin'))
            return { success: true }
        } catch (error) {
            const message = error.response?.data?.detail || error.message || 'Login failed'
            showToast(message, 'error')
            return { success: false, error: message }
        }
    }

    const register = async (data) => {
        try {
            const response = await authAPI.register(data)
            const { token: newToken, user: newUser } = response.data
            localStorage.setItem('token', newToken)
            localStorage.setItem('user', JSON.stringify(newUser))
            setToken(newToken)
            setUser(newUser)
            showToast('Account created successfully!', 'success')
            // Dispatch event to refresh cart
            window.dispatchEvent(new Event('userLogin'))
            return { success: true }
        } catch (error) {
            const message = error.response?.data?.detail || error.message || 'Registration failed'
            showToast(message, 'error')
            return { success: false, error: message }
        }
    }

    const socialLogin = async (provider, token) => {
        try {
            const response = await authAPI.socialLogin({ provider, token })
            const { token: accessToken, user: userData } = response.data

            localStorage.setItem('token', accessToken)
            localStorage.setItem('user', JSON.stringify(userData))

            setToken(accessToken)
            setUser(userData)
            showToast(`Welcome ${userData.name}!`, 'success')
            // Dispatch event to refresh cart
            window.dispatchEvent(new Event('userLogin'))
            return { success: true }
        } catch (error) {
            console.error('Social login error:', error)
            const message = error.response?.data?.detail || 'Social login failed'
            showToast(message, 'error')
            return { success: false, error: message }
        }
    }

    const logout = () => {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        setToken(null)
        setUser(null)
        showToast('Logged out successfully', 'success')
    }

    const updateProfile = async (data) => {
        try {
            const response = await authAPI.updateProfile(data)
            setUser(response.data)
            localStorage.setItem('user', JSON.stringify(response.data))
            showToast('Profile updated successfully', 'success')
            return { success: true }
        } catch (error) {
            const message = error.response?.data?.detail || 'Update failed'
            showToast(message, 'error')
            return { success: false, error: message }
        }
    }

    const uploadAvatar = async (formData) => {
        try {
            const response = await authAPI.uploadAvatar(formData)
            setUser(response.data)
            localStorage.setItem('user', JSON.stringify(response.data))
            showToast('Profile photo updated', 'success')
            return { success: true }
        } catch (error) {
            const message = error.response?.data?.detail || 'Upload failed'
            showToast(message, 'error')
            return { success: false, error: message }
        }
    }

    const value = {
        user,
        token,
        loading,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
        login,
        register,
        socialLogin,
        logout,
        updateProfile,
        uploadAvatar,
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}
