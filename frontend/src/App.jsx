import { useEffect, lazy, Suspense } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import ProtectedRoute from './components/ProtectedRoute'
import CompareBar from './components/CompareBar'
import { GoogleOAuthProvider } from '@react-oauth/google'
import usePageTracking from './hooks/usePageTracking'

// Critical pages - loaded eagerly for fast initial render
import HomePage from './pages/HomePage'
import ProductsPage from './pages/ProductsPage'
import LoginPage from './pages/LoginPage'

// Lazy loaded pages - split into separate chunks
const ProductDetailPage = lazy(() => import('./pages/ProductDetailPage'))
const CartPage = lazy(() => import('./pages/CartPage'))
const CheckoutPage = lazy(() => import('./pages/CheckoutPage'))
const WishlistPage = lazy(() => import('./pages/WishlistPage'))
const RegisterPage = lazy(() => import('./pages/RegisterPage'))
const ProfilePage = lazy(() => import('./pages/ProfilePage'))
const OrdersPage = lazy(() => import('./pages/OrdersPage'))
const OrderDetailPage = lazy(() => import('./pages/OrderDetailPage'))
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage'))
const ResetPasswordPage = lazy(() => import('./pages/ResetPasswordPage'))
const ComparePage = lazy(() => import('./pages/ComparePage'))
const FlashSalePage = lazy(() => import('./pages/FlashSalePage'))

// Admin pages - loaded only when accessing /admin routes
const AdminAuthWrapper = lazy(() => import('./components/AdminAuthWrapper'))
const AdminLayout = lazy(() => import('./pages/admin/AdminLayout'))
const AdminLoginPage = lazy(() => import('./pages/admin/AdminLoginPage'))
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'))
const AdminProducts = lazy(() => import('./pages/admin/AdminProducts'))
const ProductForm = lazy(() => import('./pages/admin/ProductForm'))
const AdminInventory = lazy(() => import('./pages/admin/AdminInventory'))
const AdminOrders = lazy(() => import('./pages/admin/AdminOrders'))
const AdminCustomers = lazy(() => import('./pages/admin/AdminCustomers'))
const AdminAnalytics = lazy(() => import('./pages/admin/AdminAnalytics'))
const AdminPredictions = lazy(() => import('./pages/admin/AdminPredictions'))
const AdminFlashSales = lazy(() => import('./pages/admin/AdminFlashSales'))
const AdminVouchers = lazy(() => import('./pages/admin/AdminVouchers'))
const AdminUsers = lazy(() => import('./pages/admin/AdminUsers'))
const AdminVisitorAnalytics = lazy(() => import('./pages/admin/AdminVisitorAnalytics'))

// Loading fallback component
const PageLoader = () => (
    <div className="page-loader">
        <div className="loader-spinner"></div>
    </div>
)

import { ADMIN_PATH } from './config/adminConfig'

function App() {
    const location = useLocation()
    const isAdminRoute = location.pathname.startsWith(ADMIN_PATH)
    const hideNavFooterPaths = ['/login', '/register', '/forgot-password', '/reset-password', ADMIN_PATH, `${ADMIN_PATH}/login`]
    const showNavbar = !isAdminRoute && !hideNavFooterPaths.includes(location.pathname)
    const showFooter = !isAdminRoute && !hideNavFooterPaths.includes(location.pathname)
    const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || "YOUR_GOOGLE_CLIENT_ID"

    // Track page views for analytics
    usePageTracking()

    useEffect(() => {
        window.scrollTo(0, 0)
    }, [location.pathname])

    return (
        <GoogleOAuthProvider clientId={googleClientId}>
            <div className="app">
                {showNavbar && <Navbar />}
                <main className={`main-content ${isAdminRoute ? 'admin-page' : ''}`}>
                    <Suspense fallback={<PageLoader />}>
                        <Routes>
                            {/* Critical routes - eagerly loaded */}
                            <Route path="/" element={<HomePage />} />
                            <Route path="/products" element={<ProductsPage />} />
                            <Route path="/products/:category" element={<ProductsPage />} />
                            <Route path="/login" element={<LoginPage />} />

                            {/* Lazy loaded user routes */}
                            <Route path="/product/:slug" element={<ProductDetailPage />} />
                            <Route path="/cart" element={<CartPage />} />
                            <Route path="/wishlist" element={<WishlistPage />} />
                            <Route path="/compare" element={<ComparePage />} />
                            <Route path="/flash-sale/:slug" element={<FlashSalePage />} />
                            <Route path="/register" element={<RegisterPage />} />
                            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                            <Route path="/reset-password" element={<ResetPasswordPage />} />
                            <Route
                                path="/checkout"
                                element={
                                    <ProtectedRoute>
                                        <CheckoutPage />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/profile"
                                element={
                                    <ProtectedRoute>
                                        <ProfilePage />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/orders"
                                element={
                                    <ProtectedRoute>
                                        <OrdersPage />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/orders/:id"
                                element={
                                    <ProtectedRoute>
                                        <OrderDetailPage />
                                    </ProtectedRoute>
                                }
                            />

                            {/* Admin Routes - Obscure URL for security */}
                            <Route element={<AdminAuthWrapper />}>
                                <Route path={`${ADMIN_PATH}/login`} element={<AdminLoginPage />} />
                                <Route path={ADMIN_PATH} element={<AdminLayout />}>
                                    <Route index element={<AdminDashboard />} />
                                    <Route path="products" element={<AdminProducts />} />
                                    <Route path="products/new" element={<ProductForm />} />
                                    <Route path="products/:id/edit" element={<ProductForm />} />
                                    <Route path="inventory" element={<AdminInventory />} />
                                    <Route path="flash-sales" element={<AdminFlashSales />} />
                                    <Route path="vouchers" element={<AdminVouchers />} />
                                    <Route path="orders" element={<AdminOrders />} />
                                    <Route path="customers" element={<AdminCustomers />} />
                                    <Route path="analytics" element={<AdminAnalytics />} />
                                    <Route path="visitor-analytics" element={<AdminVisitorAnalytics />} />
                                    <Route path="predictions" element={<AdminPredictions />} />
                                    <Route path="users" element={<AdminUsers />} />
                                </Route>
                            </Route>
                        </Routes>
                    </Suspense>
                </main>
                {showFooter && <Footer />}
                {!isAdminRoute && <CompareBar />}
            </div>
        </GoogleOAuthProvider>
    )
}

export default App
