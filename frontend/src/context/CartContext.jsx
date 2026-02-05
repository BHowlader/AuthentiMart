import { createContext, useContext, useState, useEffect } from 'react'
import { useToast } from './ToastContext'

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
    const { showToast } = useToast()

    // Load cart from localStorage on mount
    useEffect(() => {
        const savedCart = localStorage.getItem('cart')
        if (savedCart) {
            setItems(JSON.parse(savedCart))
        }
    }, [])

    // Save cart to localStorage whenever it changes
    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(items))
    }, [items])

    const addToCart = (product, quantity = 1) => {
        setItems((prevItems) => {
            const existingItem = prevItems.find((item) => item.id === product.id)

            if (existingItem) {
                const newQuantity = existingItem.quantity + quantity
                if (newQuantity > product.stock) {
                    showToast('Not enough stock available', 'error')
                    return prevItems
                }
                showToast('Cart updated!', 'success')
                return prevItems.map((item) =>
                    item.id === product.id
                        ? { ...item, quantity: newQuantity }
                        : item
                )
            }

            if (quantity > product.stock) {
                showToast('Not enough stock available', 'error')
                return prevItems
            }

            showToast('Added to cart!', 'success')
            return [...prevItems, { ...product, quantity }]
        })
    }

    const removeFromCart = (productId) => {
        setItems((prevItems) => prevItems.filter((item) => item.id !== productId))
        showToast('Removed from cart', 'success')
    }

    const updateQuantity = (productId, quantity) => {
        if (quantity < 1) {
            removeFromCart(productId)
            return
        }

        setItems((prevItems) => {
            const item = prevItems.find((item) => item.id === productId)
            if (item && quantity > item.stock) {
                showToast('Not enough stock available', 'error')
                return prevItems
            }
            return prevItems.map((item) =>
                item.id === productId ? { ...item, quantity } : item
            )
        })
    }

    const clearCart = () => {
        setItems([])
        showToast('Cart cleared', 'success')
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
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getItemCount,
        getSubtotal,
        getTotal,
        getShipping,
    }

    return (
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    )
}
