import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api/v1'

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
})

// Request interceptor to add auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token')
        // Don't attach token for auth endpoints
        const isAuthEndpoint = config.url?.includes('/auth/login') || config.url?.includes('/auth/register')
        if (token && !isAuthEndpoint) {
            config.headers.Authorization = `Bearer ${token}`
        }
        return config
    },
    (error) => {
        return Promise.reject(error)
    }
)

// Response interceptor for error handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // Don't redirect on 401 for login endpoints - let the login form handle it
        const isLoginRequest = error.config?.url?.includes('/auth/login')
        if (error.response?.status === 401 && !isLoginRequest) {
            localStorage.removeItem('token')
            localStorage.removeItem('user')
            window.location.href = '/login'
        }
        return Promise.reject(error)
    }
)

export default api

// Auth API
export const authAPI = {
    register: (data) => api.post('/auth/register', data),
    login: (data) => {
        // OAuth2 Password Flow requires form-encoded data with 'username' field
        const formData = new URLSearchParams()
        formData.append('username', data.email)
        formData.append('password', data.password)
        return api.post('/auth/login', formData, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        })
    },
    getProfile: () => api.get('/auth/me'),
    updateProfile: (data) => api.put('/auth/me', data),
    changePassword: (data) => api.post('/auth/change-password', data), // Changed from put to post as per backend
    forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
    resetPassword: (data) => api.post('/auth/reset-password', data),
    socialLogin: (data) => api.post('/auth/social-login', data),
}

// Products API
export const productsAPI = {
    getAll: (params) => api.get('/products', { params }),
    getById: (id) => api.get(`/products/${id}`),
    getByCategory: (category, params) => api.get(`/products/category/${category}`, { params }),
    search: (query) => api.get('/products/search', { params: { q: query } }),
    getFeatured: () => api.get('/products/featured'),
    getNewArrivals: () => api.get('/products/new-arrivals'),
    getBestSellers: () => api.get('/products/best-sellers'),
}

// Categories API
export const categoriesAPI = {
    getAll: () => api.get('/categories'),
    getById: (id) => api.get(`/categories/${id}`),
}

// Cart API
export const cartAPI = {
    get: () => api.get('/cart'),
    add: (productId, quantity) => api.post('/cart', { product_id: productId, quantity }),
    update: (itemId, quantity) => api.put(`/cart/${itemId}`, { quantity }),
    remove: (itemId) => api.delete(`/cart/${itemId}`),
    clear: () => api.delete('/cart'),
}

// Wishlist API
export const wishlistAPI = {
    get: () => api.get('/wishlist'),
    add: (productId) => api.post('/wishlist', { product_id: productId }),
    remove: (productId) => api.delete(`/wishlist/${productId}`),
}

// Orders API
export const ordersAPI = {
    create: (data) => api.post('/orders', data),
    getAll: () => api.get('/orders'),
    getById: (id) => api.get(`/orders/${id}`),
    cancel: (id) => api.put(`/orders/${id}/cancel`),
}

// Payment API
export const paymentAPI = {
    initiateBkash: (orderId) => api.post('/payments/bkash/init', { order_id: orderId }),
    executeBkash: (paymentId) => api.post('/payments/bkash/execute', { payment_id: paymentId }),
    initiateCard: (orderId, cardDetails) => api.post('/payments/card/init', { order_id: orderId, ...cardDetails }),
    verifyPayment: (orderId) => api.get(`/payments/verify/${orderId}`),
}

// Reviews API
export const reviewsAPI = {
    getByProduct: (productId) => api.get(`/reviews/product/${productId}`),
    create: (productId, data) => api.post(`/reviews/product/${productId}`, data),
    update: (reviewId, data) => api.put(`/reviews/${reviewId}`, data),
    delete: (reviewId) => api.delete(`/reviews/${reviewId}`),
}

// Address API
export const addressAPI = {
    getAll: () => api.get('/addresses'),
    create: (data) => api.post('/addresses', data),
    update: (id, data) => api.put(`/addresses/${id}`, data),
    delete: (id) => api.delete(`/addresses/${id}`),
    setDefault: (id) => api.put(`/addresses/${id}/default`),
}
