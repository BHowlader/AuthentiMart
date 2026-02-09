import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useToast } from './ToastContext'
import { cartAPI } from '../utils/api'

const CartContext = createContext(null)

export const useCart = () => {
    const context = useContext(CartContext)
    if (!context) {
        throw new Error('useCart must be used within a CartProvider')
    }
    return context
}

export const CartProvider = ({ children }) => {
    const [items, setItems] = useState([])
    const [loading, setLoading] = useState(false)
    const [initialized, setInitialized] = useState(false)
    const { showToast } = useToast()

    // Check if user is authenticated
    const isAuthenticated = () => {
        return !!localStorage.getItem('token')
    }

    // Fetch cart from API
    const fetchCart = useCallback(async () => {
        if (!isAuthenticated()) {
            setItems([])
            setInitialized(true)
            return
        }

        try {
            setLoading(true)
            const response = await cartAPI.get()
            const cartData = response.data

            // Map API response to frontend format
            const mappedItems = cartData.items.map(item => ({
                id: item.product.id,
                cartItemId: item.id,
                name: item.product.name,
                slug: item.product.slug,
                price: item.product.price,
                originalPrice: item.product.original_price,
                image: item.product.image || '/images/placeholder.png',
                stock: item.product.stock,
                quantity: item.quantity,
                discount: item.product.discount || 0
            }))

            setItems(mappedItems)
        } catch (error) {
            console.error('Error fetching cart:', error)
            // If unauthorized, clear items
            if (error.response?.status === 401) {
                setItems([])
            }
        } finally {
            setLoading(false)
            setInitialized(true)
        }
    }, [])

    // Fetch cart on mount and when token changes
    useEffect(() => {
        fetchCart()
    }, [fetchCart])

    // Listen for storage changes (login/logout)
    useEffect(() => {
        const handleStorageChange = (e) => {
            if (e.key === 'token') {
                fetchCart()
            }
        }

        window.addEventListener('storage', handleStorageChange)

        // Also listen for custom login event
        const handleLogin = () => {
            fetchCart()
        }
        window.addEventListener('userLogin', handleLogin)

        return () => {
            window.removeEventListener('storage', handleStorageChange)
            window.removeEventListener('userLogin', handleLogin)
        }
    }, [fetchCart])

    const addToCart = async (product, quantity = 1) => {
        if (!isAuthenticated()) {
            showToast('Please login to add items to cart', 'error')
            return
        }

        try {
            setLoading(true)
            await cartAPI.add(product.id, quantity)
            await fetchCart()
            showToast('Added to cart!', 'success')
        } catch (error) {
            console.error('Error adding to cart:', error)
            const message = error.response?.data?.detail || 'Failed to add to cart'
            showToast(message, 'error')
        } finally {
            setLoading(false)
        }
    }

    const removeFromCart = async (productId) => {
        if (!isAuthenticated()) {
            return
        }

        // Find the cart item ID
        const item = items.find(item => item.id === productId)
        if (!item) return

        try {
            setLoading(true)
            await cartAPI.remove(item.cartItemId)
            await fetchCart()
            showToast('Removed from cart', 'success')
        } catch (error) {
            console.error('Error removing from cart:', error)
            showToast('Failed to remove item', 'error')
        } finally {
            setLoading(false)
        }
    }

    const updateQuantity = async (productId, quantity) => {
        if (!isAuthenticated()) {
            return
        }

        if (quantity < 1) {
            removeFromCart(productId)
            return
        }

        // Find the cart item ID
        const item = items.find(item => item.id === productId)
        if (!item) return

        try {
            setLoading(true)
            await cartAPI.update(item.cartItemId, quantity)
            await fetchCart()
        } catch (error) {
            console.error('Error updating cart:', error)
            const message = error.response?.data?.detail || 'Failed to update quantity'
            showToast(message, 'error')
        } finally {
            setLoading(false)
        }
    }

    const clearCart = async () => {
        if (!isAuthenticated()) {
            setItems([])
            return
        }

        try {
            setLoading(true)
            await cartAPI.clear()
            setItems([])
            showToast('Cart cleared', 'success')
        } catch (error) {
            console.error('Error clearing cart:', error)
            showToast('Failed to clear cart', 'error')
        } finally {
            setLoading(false)
        }
    }

    const getItemCount = () => {
        return items.reduce((total, item) => total + item.quantity, 0)
    }

    const getSubtotal = () => {
        return items.reduce((total, item) => total + item.price * item.quantity, 0)
    }

    const getTotal = () => {
        const subtotal = getSubtotal()
        const shipping = subtotal > 5000 ? 0 : 60 // Free shipping over 5000 BDT
        return subtotal + shipping
    }

    const getShipping = () => {
        const subtotal = getSubtotal()
        return subtotal > 5000 ? 0 : 60
    }

    const value = {
        items,
        loading,
        initialized,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getItemCount,
        getSubtotal,
        getTotal,
        getShipping,
        refreshCart: fetchCart,
    }

    return (
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    )
}
