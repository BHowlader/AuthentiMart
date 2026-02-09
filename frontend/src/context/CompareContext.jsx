import { createContext, useContext, useState, useCallback } from 'react'
import { useToast } from './ToastContext'

const CompareContext = createContext(null)

const MAX_COMPARE_ITEMS = 4

export const useCompare = () => {
    const context = useContext(CompareContext)
    if (!context) {
        throw new Error('useCompare must be used within a CompareProvider')
    }
    return context
}

export const CompareProvider = ({ children }) => {
    const [compareList, setCompareList] = useState([])
    const { showToast } = useToast()

    const addToCompare = useCallback((product) => {
        setCompareList(prev => {
            // Check if already in list
            if (prev.find(p => p.id === product.id)) {
                showToast('Product already in compare list', 'info')
                return prev
            }

            // Check max items
            if (prev.length >= MAX_COMPARE_ITEMS) {
                showToast(`Maximum ${MAX_COMPARE_ITEMS} products can be compared`, 'warning')
                return prev
            }

            showToast('Added to compare', 'success')
            return [...prev, {
                id: product.id,
                name: product.name,
                slug: product.slug,
                price: product.price,
                image: product.image,
                category: product.category
            }]
        })
    }, [showToast])

    const removeFromCompare = useCallback((productId) => {
        setCompareList(prev => prev.filter(p => p.id !== productId))
        showToast('Removed from compare', 'info')
    }, [showToast])

    const clearCompare = useCallback(() => {
        setCompareList([])
    }, [])

    const isInCompare = useCallback((productId) => {
        return compareList.some(p => p.id === productId)
    }, [compareList])

    const toggleCompare = useCallback((product) => {
        if (isInCompare(product.id)) {
            removeFromCompare(product.id)
        } else {
            addToCompare(product)
        }
    }, [isInCompare, removeFromCompare, addToCompare])

    const value = {
        compareList,
        addToCompare,
        removeFromCompare,
        clearCompare,
        isInCompare,
        toggleCompare,
        compareCount: compareList.length,
        canCompare: compareList.length >= 2,
        maxItems: MAX_COMPARE_ITEMS
    }

    return (
        <CompareContext.Provider value={value}>
            {children}
        </CompareContext.Provider>
    )
}

export default CompareContext
