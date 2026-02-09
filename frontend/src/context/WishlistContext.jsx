import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useToast } from './ToastContext'
import { wishlistAPI } from '../utils/api'

const WishlistContext = createContext(null)

export const useWishlist = () => {
    const context = useContext(WishlistContext)
    if (!context) {
        throw new Error('useWishlist must be used within a WishlistProvider')
    }
    return context
}

export const WishlistProvider = ({ children }) => {
    const [items, setItems] = useState([])
    const [loading, setLoading] = useState(false)
    const [initialized, setInitialized] = useState(false)
    const { showToast } = useToast()

    // Check if user is authenticated
    const isAuthenticated = () => {
        return !!localStorage.getItem('token')
    }

    // Fetch wishlist from API
    const fetchWishlist = useCallback(async () => {
        if (!isAuthenticated()) {
            setItems([])
            setInitialized(true)
            return
        }

        try {
            setLoading(true)
            const response = await wishlistAPI.get()
            const wishlistData = response.data

            // Map API response to frontend format
            const mappedItems = wishlistData.map(item => ({
                id: item.product.id,
                wishlistItemId: item.id,
                name: item.product.name,
                slug: item.product.slug,
                price: item.product.price,
                originalPrice: item.product.original_price,
                image: item.product.image || '/images/placeholder.png',
                stock: item.product.stock,
                discount: item.product.discount || 0,
                rating: item.product.rating || 0,
                reviewCount: item.product.review_count || 0,
                brand: item.product.brand,
                category: item.product.category
            }))

            setItems(mappedItems)
        } catch (error) {
            console.error('Error fetching wishlist:', error)
            if (error.response?.status === 401) {
                setItems([])
            }
        } finally {
            setLoading(false)
            setInitialized(true)
        }
    }, [])

    // Fetch wishlist on mount
    useEffect(() => {
        fetchWishlist()
    }, [fetchWishlist])

    // Listen for login events
    useEffect(() => {
        const handleStorageChange = (e) => {
            if (e.key === 'token') {
                fetchWishlist()
            }
        }

        window.addEventListener('storage', handleStorageChange)

        const handleLogin = () => {
            fetchWishlist()
        }
        window.addEventListener('userLogin', handleLogin)

        return () => {
            window.removeEventListener('storage', handleStorageChange)
            window.removeEventListener('userLogin', handleLogin)
        }
    }, [fetchWishlist])

    const addToWishlist = async (product) => {
        if (!isAuthenticated()) {
            showToast('Please login to add items to wishlist', 'error')
            return
        }

        // Check if already in wishlist
        if (items.some(item => item.id === product.id)) {
            showToast('Already in wishlist', 'info')
            return
        }

        try {
            setLoading(true)
            await wishlistAPI.add(product.id)
            await fetchWishlist()
            showToast('Added to wishlist!', 'success')
        } catch (error) {
            console.error('Error adding to wishlist:', error)
            const message = error.response?.data?.detail || 'Failed to add to wishlist'
            showToast(message, 'error')
        } finally {
            setLoading(false)
        }
    }

    const removeFromWishlist = async (productId) => {
        if (!isAuthenticated()) {
            return
        }

        try {
            setLoading(true)
            await wishlistAPI.remove(productId)
            await fetchWishlist()
            showToast('Removed from wishlist', 'success')
        } catch (error) {
            console.error('Error removing from wishlist:', error)
            showToast('Failed to remove from wishlist', 'error')
        } finally {
            setLoading(false)
        }
    }

    const toggleWishlist = async (product) => {
        if (!isAuthenticated()) {
            showToast('Please login to manage wishlist', 'error')
            return
        }

        const exists = items.some((item) => item.id === product.id)
        if (exists) {
            await removeFromWishlist(product.id)
        } else {
            await addToWishlist(product)
        }
    }

    const isInWishlist = (productId) => {
        return items.some((item) => item.id === productId)
    }

    const clearWishlist = async () => {
        if (!isAuthenticated()) {
            setItems([])
            return
        }

        try {
            setLoading(true)
            // Remove all items one by one (no bulk delete endpoint)
            for (const item of items) {
                await wishlistAPI.remove(item.id)
            }
            setItems([])
            showToast('Wishlist cleared', 'success')
        } catch (error) {
            console.error('Error clearing wishlist:', error)
            showToast('Failed to clear wishlist', 'error')
        } finally {
            setLoading(false)
        }
    }

    const value = {
        items,
        loading,
        initialized,
        addToWishlist,
        removeFromWishlist,
        toggleWishlist,
        isInWishlist,
        clearWishlist,
        refreshWishlist: fetchWishlist,
        itemCount: items.length,
    }

    return (
        <WishlistContext.Provider value={value}>
            {children}
        </WishlistContext.Provider>
    )
}
