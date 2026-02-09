import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ShoppingCart, X, ChevronRight, Star, ArrowLeft } from 'lucide-react'
import { useCompare } from '../context/CompareContext'
import { useCart } from '../context/CartContext'
import { comparisonAPI } from '../utils/api'
import './ComparePage.css'

const ComparePage = () => {
    const { compareList, removeFromCompare, clearCompare, canCompare } = useCompare()
    const { addToCart } = useCart()
    const navigate = useNavigate()

    const [comparisonData, setComparisonData] = useState(null)
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (canCompare) {
            fetchComparisonData()
        }
    }, [compareList])

    const fetchComparisonData = async () => {
        if (compareList.length < 2) return

        try {
            setLoading(true)
            const productIds = compareList.map(p => p.id)
            const response = await comparisonAPI.compare(productIds)
            setComparisonData(response.data)
        } catch (error) {
            console.error('Error fetching comparison data:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleAddToCart = (product) => {
        addToCart({
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            slug: product.slug
        })
    }

    // Find the lowest price for "Best Value" badge
    const lowestPriceId = comparisonData?.products?.reduce((lowest, product) =>
        product.price < (comparisonData.products.find(p => p.id === lowest)?.price || Infinity)
            ? product.id
            : lowest
        , comparisonData?.products?.[0]?.id)

    if (!canCompare) {
        return (
            <div className="compare-page">
                <div className="container">
                    <div className="compare-empty-state">
                        <h2>Not enough products to compare</h2>
                        <p>Please add at least 2 products to compare them side by side.</p>
                        <Link to="/products" className="btn btn-primary">
                            Browse Products
                        </Link>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="compare-page">
            <div className="container">
                {/* Header */}
                <div className="compare-header">
                    <button className="back-btn" onClick={() => navigate(-1)}>
                        <ArrowLeft size={20} />
                        Back
                    </button>
                    <h1>Compare Products</h1>
                    <button className="clear-all-btn" onClick={clearCompare}>
                        Clear All
                    </button>
                </div>

                {loading ? (
                    <div className="loading-state">
                        <div className="spinner"></div>
                        <p>Loading comparison...</p>
                    </div>
                ) : (
                    <div className="compare-table-wrapper">
                        <table className="compare-table">
                            {/* Product Header Row */}
                            <thead>
                                <tr className="product-header-row">
                                    <th className="spec-label-cell"></th>
                                    {(comparisonData?.products || compareList).map((product) => (
                                        <th key={product.id} className="product-cell">
                                            <div className="compare-product-card">
                                                <button
                                                    className="remove-btn"
                                                    onClick={() => removeFromCompare(product.id)}
                                                >
                                                    <X size={16} />
                                                </button>

                                                {product.id === lowestPriceId && (
                                                    <span className="best-value-badge">Best Value</span>
                                                )}

                                                <Link to={`/product/${product.slug}`} className="product-image">
                                                    <img
                                                        src={product.image || '/images/placeholder.png'}
                                                        alt={product.name}
                                                    />
                                                </Link>

                                                <Link to={`/product/${product.slug}`} className="product-name">
                                                    {product.name}
                                                </Link>

                                                <div className="product-price">
                                                    ৳{product.price?.toLocaleString()}
                                                </div>

                                                {product.rating !== undefined && (
                                                    <div className="product-rating">
                                                        <Star size={14} fill="#F59E0B" color="#F59E0B" />
                                                        <span>{product.rating}</span>
                                                    </div>
                                                )}

                                                <button
                                                    className="add-to-cart-btn"
                                                    onClick={() => handleAddToCart(product)}
                                                >
                                                    <ShoppingCart size={16} />
                                                    Add to Cart
                                                </button>
                                            </div>
                                        </th>
                                    ))}
                                </tr>
                            </thead>

                            {/* Specifications Body */}
                            <tbody>
                                {/* Basic Info */}
                                <tr className="spec-group-header">
                                    <td colSpan={compareList.length + 1}>Basic Information</td>
                                </tr>

                                <tr>
                                    <td className="spec-label">Brand</td>
                                    {(comparisonData?.products || compareList).map((product) => (
                                        <td key={product.id} className="spec-value">
                                            {product.brand || '-'}
                                        </td>
                                    ))}
                                </tr>

                                <tr>
                                    <td className="spec-label">Category</td>
                                    {(comparisonData?.products || compareList).map((product) => (
                                        <td key={product.id} className="spec-value">
                                            {product.category || '-'}
                                        </td>
                                    ))}
                                </tr>

                                <tr>
                                    <td className="spec-label">In Stock</td>
                                    {(comparisonData?.products || compareList).map((product) => (
                                        <td key={product.id} className="spec-value">
                                            {product.stock > 0 ? (
                                                <span className="in-stock">Yes ({product.stock})</span>
                                            ) : (
                                                <span className="out-of-stock">No</span>
                                            )}
                                        </td>
                                    ))}
                                </tr>

                                {/* Dynamic Specifications from API */}
                                {comparisonData?.specifications && Object.entries(comparisonData.specifications).map(([groupName, specs]) => (
                                    <>
                                        <tr key={`group-${groupName}`} className="spec-group-header">
                                            <td colSpan={compareList.length + 1}>{groupName}</td>
                                        </tr>

                                        {Object.entries(specs).map(([specName, values]) => (
                                            <tr key={`${groupName}-${specName}`}>
                                                <td className="spec-label">{specName}</td>
                                                {compareList.map((product) => {
                                                    const value = values[product.id]
                                                    const allSame = Object.values(values).every(v => v === value)
                                                    return (
                                                        <td
                                                            key={product.id}
                                                            className={`spec-value ${!allSame && value ? 'highlighted' : ''}`}
                                                        >
                                                            {value || '-'}
                                                        </td>
                                                    )
                                                })}
                                            </tr>
                                        ))}
                                    </>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    )
}

export default ComparePage
