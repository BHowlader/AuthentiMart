import { useEffect } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import HomePage from './pages/HomePage'
import ProductsPage from './pages/ProductsPage'
import ProductDetailPage from './pages/ProductDetailPage'
import CartPage from './pages/CartPage'
import CheckoutPage from './pages/CheckoutPage'
import WishlistPage from './pages/WishlistPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ProfilePage from './pages/ProfilePage'
import OrdersPage from './pages/OrdersPage'
import OrderDetailPage from './pages/OrderDetailPage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import ResetPasswordPage from './pages/ResetPasswordPage'
import ProtectedRoute from './components/ProtectedRoute'

// Admin Pages
import AdminLayout from './pages/admin/AdminLayout'
import AdminLoginPage from './pages/admin/AdminLoginPage'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminProducts from './pages/admin/AdminProducts'
import ProductForm from './pages/admin/ProductForm'
import AdminInventory from './pages/admin/AdminInventory'
import AdminOrders from './pages/admin/AdminOrders'
import AdminAnalytics from './pages/admin/AdminAnalytics'
import AdminPredictions from './pages/admin/AdminPredictions'

import { GoogleOAuthProvider } from '@react-oauth/google'

function App() {
    const location = useLocation()
    const hideNavFooterPaths = ['/login', '/register', '/admin', '/admin/login', '/forgot-password', '/reset-password']
    const isAdminRoute = location.pathname.startsWith('/admin')
    const showNavbar = !isAdminRoute && !hideNavFooterPaths.includes(location.pathname)
    const showFooter = !isAdminRoute && !hideNavFooterPaths.includes(location.pathname)
    const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || "YOUR_GOOGLE_CLIENT_ID"

    useEffect(() => {
        window.scrollTo(0, 0)
    }, [location.pathname])

    return (
        <GoogleOAuthProvider clientId={googleClientId}>
            <div className="app">
                {showNavbar && <Navbar />}
                <main className={`main-content ${isAdminRoute ? 'admin-page' : ''}`}>
                    <Routes>
                        <Route path="/" element={<HomePage />} />
                        <Route path="/products" element={<ProductsPage />} />
                        <Route path="/products/:category" element={<ProductsPage />} />
                        <Route path="/product/:id" element={<ProductDetailPage />} />
                        <Route path="/cart" element={<CartPage />} />
                        <Route path="/wishlist" element={<WishlistPage />} />
                        <Route path="/login" element={<LoginPage />} />
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

                        {/* Admin Login - Separate from Admin Routes */}
                        <Route path="/admin/login" element={<AdminLoginPage />} />

                        {/* Admin Routes */}
                        <Route path="/admin" element={<AdminLayout />}>
                            <Route index element={<AdminDashboard />} />
                            <Route path="products" element={<AdminProducts />} />
                            <Route path="products/new" element={<ProductForm />} />
                            <Route path="products/:id/edit" element={<ProductForm />} />
                            <Route path="inventory" element={<AdminInventory />} />
                            <Route path="orders" element={<AdminOrders />} />
                            <Route path="analytics" element={<AdminAnalytics />} />
                            <Route path="predictions" element={<AdminPredictions />} />
                        </Route>
                    </Routes>
                </main>
                {showFooter && <Footer />}
            </div>
        </GoogleOAuthProvider>
    )
}

export default App
