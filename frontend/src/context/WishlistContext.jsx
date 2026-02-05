import { createContext, useContext, useState, useEffect } from 'react'
import { useToast } from './ToastContext'

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
    const { showToast } = useToast()

    // Load wishlist from localStorage on mount
    useEffect(() => {
        const savedWishlist = localStorage.getItem('wishlist')
        if (savedWishlist) {
            setItems(JSON.parse(savedWishlist))
        }
    }, [])

    // Save wishlist to localStorage whenever it changes
    useEffect(() => {
        localStorage.setItem('wishlist', JSON.stringify(items))
    }, [items])

    const addToWishlist = (product) => {
        setItems((prevItems) => {
            const exists = prevItems.some((item) => item.id === product.id)
            if (exists) {
                showToast('Already in wishlist', 'info')
                return prevItems
            }
            showToast('Added to wishlist!', 'success')
            return [...prevItems, product]
        })
    }

    const removeFromWishlist = (productId) => {
        setItems((prevItems) => prevItems.filter((item) => item.id !== productId))
        showToast('Removed from wishlist', 'success')
    }

    const toggleWishlist = (product) => {
        const exists = items.some((item) => item.id === product.id)
        if (exists) {
            removeFromWishlist(product.id)
        } else {
            addToWishlist(product)
        }
    }

    const isInWishlist = (productId) => {
        return items.some((item) => item.id === productId)
    }

    const clearWishlist = () => {
        setItems([])
        showToast('Wishlist cleared', 'success')
    }

    const value = {
        items,
        addToWishlist,
        removeFromWishlist,
        toggleWishlist,
        isInWishlist,
        clearWishlist,
        itemCount: items.length,
    }

    return (
        <WishlistContext.Provider value={value}>
            {children}
        </WishlistContext.Provider>
    )
}
