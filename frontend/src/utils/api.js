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
        // Don't attach token for auth endpoints
        const isAuthEndpoint = config.url?.includes('/auth/login') || config.url?.includes('/auth/register')

        // Check if we're on an admin route - use admin token if available
        const isAdminRoute = window.location.pathname.startsWith('/admin')
        const adminToken = localStorage.getItem('adminToken')
        const userToken = localStorage.getItem('token')

        // Use admin token for admin routes, otherwise use regular token
        const token = isAdminRoute && adminToken ? adminToken : userToken

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
    uploadAvatar: (formData) => api.post('/auth/upload-avatar', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    }),
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
    getHomepage: (limit = 12) => api.get('/categories/homepage', { params: { limit } }),
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
    cancel: (id) => api.post(`/orders/${id}/cancel`),
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

// Flash Sales API
export const flashSalesAPI = {
    getCurrent: () => api.get('/flash-sales/current'),
    getAll: () => api.get('/flash-sales'),
    getBySlug: (slug) => api.get(`/flash-sales/${slug}`),
}

// Vouchers API
export const vouchersAPI = {
    validate: (code, subtotal) => api.post('/vouchers/validate', { code, subtotal }),
}

// Product Comparison API
export const comparisonAPI = {
    compare: (productIds) => api.post('/products/compare', { product_ids: productIds }),
    getSpecifications: (productId) => api.get(`/products/${productId}/specifications`),
    getAccessories: (productId) => api.get(`/products/${productId}/accessories`),
}

// Admin Flash Sales API
export const adminFlashSalesAPI = {
    getAll: (params) => api.get('/flash-sales', { params }),
    getById: (id) => api.get(`/flash-sales/${id}`),
    create: (data) => api.post('/flash-sales', data),
    update: (id, data) => api.put(`/flash-sales/${id}`, data),
    delete: (id) => api.delete(`/flash-sales/${id}`),
    addItem: (flashSaleId, data) => api.post(`/flash-sales/${flashSaleId}/items`, data),
    removeItem: (flashSaleId, itemId) => api.delete(`/flash-sales/${flashSaleId}/items/${itemId}`),
}

// Admin Vouchers API
export const adminVouchersAPI = {
    getAll: (params) => api.get('/vouchers', { params }),
    getById: (id) => api.get(`/vouchers/${id}`),
    create: (data) => api.post('/vouchers', data),
    update: (id, data) => api.put(`/vouchers/${id}`, data),
    delete: (id) => api.delete(`/vouchers/${id}`),
}

// ============================================
// NEW FEATURE APIS
// ============================================

// Search Autocomplete API
export const searchAPI = {
    autocomplete: (query, limit = 8) => api.get('/products/search/autocomplete', { params: { q: query, limit } }),
}

// Newsletter API
export const newsletterAPI = {
    subscribe: (data) => api.post('/newsletter/subscribe', data),
    unsubscribe: (email) => api.post('/newsletter/unsubscribe', null, { params: { email } }),
}

// Recently Viewed API
export const recentlyViewedAPI = {
    get: (limit = 20, sessionId = null) => api.get('/recently-viewed', { params: { limit, session_id: sessionId } }),
    track: (productId, sessionId = null) => api.post('/recently-viewed', { product_id: productId, session_id: sessionId }),
    clear: (sessionId = null) => api.delete('/recently-viewed', { params: { session_id: sessionId } }),
}

// Stock Notifications API
export const stockNotificationsAPI = {
    subscribe: (productId, email = null) => api.post('/stock-notifications', { product_id: productId, email }),
    getMyNotifications: () => api.get('/stock-notifications'),
    unsubscribe: (id) => api.delete(`/stock-notifications/${id}`),
}

// Loyalty Points API
export const pointsAPI = {
    getBalance: () => api.get('/points/balance'),
    getHistory: (page = 1, limit = 20) => api.get('/points/history', { params: { page, limit } }),
    calculate: (subtotal) => api.post('/points/calculate', null, { params: { subtotal } }),
    validateRedemption: (points, orderSubtotal) => api.post('/points/validate-redemption', { points, order_subtotal: orderSubtotal }),
}

// Referral API
export const referralAPI = {
    getMyCode: () => api.get('/referrals/my-code'),
    getStats: () => api.get('/referrals/stats'),
    getHistory: () => api.get('/referrals/history'),
    sendInvite: (email) => api.post('/referrals/invite', { email }),
    validateCode: (code) => api.get(`/referrals/validate/${code}`),
}

// Product Bundles API
export const bundlesAPI = {
    getAll: (page = 1, limit = 20) => api.get('/bundles', { params: { page, limit } }),
    getBySlug: (slug) => api.get(`/bundles/${slug}`),
}

// Gift Cards API
export const giftCardsAPI = {
    purchase: (data) => api.post('/gift-cards/purchase', data),
    checkBalance: (code) => api.get(`/gift-cards/check/${code}`),
    validate: (code, amount = null) => api.post('/gift-cards/validate', null, { params: { code, amount } }),
    getMyCards: () => api.get('/gift-cards/my-cards'),
    getTransactions: (cardId) => api.get(`/gift-cards/my-cards/${cardId}/transactions`),
}

// Product Q&A API
export const questionsAPI = {
    getByProduct: (productId, page = 1, limit = 10) => api.get(`/questions/product/${productId}`, { params: { page, limit } }),
    askQuestion: (productId, question) => api.post(`/questions/product/${productId}`, { question }),
    answerQuestion: (questionId, answer) => api.post(`/questions/${questionId}/answer`, { answer }),
    markHelpful: (answerId) => api.post(`/questions/answers/${answerId}/helpful`),
}

// Push Notifications API
export const pushAPI = {
    getVapidKey: () => api.get('/push/vapid-key'),
    subscribe: (subscription) => api.post('/push/subscribe', {
        endpoint: subscription.endpoint,
        p256dh_key: btoa(String.fromCharCode.apply(null, new Uint8Array(subscription.getKey('p256dh')))),
        auth_key: btoa(String.fromCharCode.apply(null, new Uint8Array(subscription.getKey('auth')))),
    }),
    unsubscribe: (endpoint) => api.delete('/push/unsubscribe', { params: { endpoint } }),
    getStatus: () => api.get('/push/status'),
}

// Product Variants API
export const variantsAPI = {
    getTypes: () => api.get('/variants/types'),
    getProductVariants: (productId) => api.get(`/variants/product/${productId}`),
    getAvailableOptions: (productId) => api.get(`/variants/product/${productId}/available-options`),
}

// ============================================
// ADMIN NEW FEATURE APIS
// ============================================

// Admin Newsletter
export const adminNewsletterAPI = {
    getSubscribers: (params) => api.get('/newsletter/admin/subscribers', { params }),
    exportSubscribers: (isActive = true) => api.get('/newsletter/admin/subscribers/export', { params: { is_active: isActive } }),
}

// Admin Points
export const adminPointsAPI = {
    getSettings: () => api.get('/points/admin/settings'),
    updateSettings: (data) => api.put('/points/admin/settings', data),
    getStats: () => api.get('/points/admin/stats'),
}

// Admin Referrals
export const adminReferralsAPI = {
    getStats: () => api.get('/referrals/admin/stats'),
}

// Admin Bundles
export const adminBundlesAPI = {
    create: (data) => api.post('/bundles/admin', data),
    update: (id, data) => api.put(`/bundles/admin/${id}`, data),
    uploadImage: (id, formData) => api.post(`/bundles/admin/${id}/upload-image`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    }),
    addItem: (bundleId, data) => api.post(`/bundles/admin/${bundleId}/items`, data),
    removeItem: (bundleId, itemId) => api.delete(`/bundles/admin/${bundleId}/items/${itemId}`),
    delete: (id) => api.delete(`/bundles/admin/${id}`),
}

// Admin Gift Cards
export const adminGiftCardsAPI = {
    getAll: (params) => api.get('/gift-cards/admin', { params }),
    deactivate: (id) => api.put(`/gift-cards/admin/${id}/deactivate`),
    getStats: () => api.get('/gift-cards/admin/stats'),
}

// Admin Questions
export const adminQuestionsAPI = {
    getPendingQuestions: (params) => api.get('/questions/admin/pending', { params }),
    approveQuestion: (id) => api.put(`/questions/admin/${id}/approve`),
    deleteQuestion: (id) => api.delete(`/questions/admin/${id}`),
    getPendingAnswers: (params) => api.get('/questions/admin/pending-answers', { params }),
    approveAnswer: (id) => api.put(`/questions/admin/answers/${id}/approve`),
}

// Admin Push Notifications
export const adminPushAPI = {
    getSubscriptions: (params) => api.get('/push/admin/subscriptions', { params }),
    send: (data) => api.post('/push/admin/send', null, { params: data }),
}

// Admin Variants
export const adminVariantsAPI = {
    createType: (data) => api.post('/variants/types', data),
    deleteType: (id) => api.delete(`/variants/types/${id}`),
    createVariant: (productId, data) => api.post(`/variants/product/${productId}`, data),
    updateVariant: (productId, variantId, data) => api.put(`/variants/product/${productId}/${variantId}`, null, { params: data }),
    deleteVariant: (productId, variantId) => api.delete(`/variants/product/${productId}/${variantId}`),
}

// Admin Exports
export const adminExportsAPI = {
    exportOrders: (params) => api.get('/admin/exports/orders', { params, responseType: 'blob' }),
    exportProducts: (params) => api.get('/admin/exports/products', { params, responseType: 'blob' }),
    exportCustomers: (params) => api.get('/admin/exports/customers', { params, responseType: 'blob' }),
    exportInventory: (params) => api.get('/admin/exports/inventory', { params, responseType: 'blob' }),
    exportSalesReport: (params) => api.get('/admin/exports/sales-report', { params, responseType: 'blob' }),
}
