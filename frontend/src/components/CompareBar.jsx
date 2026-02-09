import { Link } from 'react-router-dom'
import { X, GitCompare, Trash2 } from 'lucide-react'
import { useCompare } from '../context/CompareContext'
import './CompareBar.css'

const CompareBar = () => {
    const {
        compareList,
        removeFromCompare,
        clearCompare,
        canCompare,
        maxItems
    } = useCompare()

    // Don't show if empty
    if (compareList.length === 0) {
        return null
    }

    return (
        <div className="compare-bar">
            <div className="compare-bar-content">
                <div className="compare-bar-header">
                    <GitCompare size={20} />
                    <span className="compare-bar-title">
                        Compare ({compareList.length}/{maxItems})
                    </span>
                </div>

                <div className="compare-bar-products">
                    {compareList.map((product) => (
                        <div key={product.id} className="compare-product-item">
                            <img
                                src={product.image || '/images/placeholder.png'}
                                alt={product.name}
                            />
                            <button
                                className="remove-compare-btn"
                                onClick={() => removeFromCompare(product.id)}
                                aria-label={`Remove ${product.name} from compare`}
                            >
                                <X size={14} />
                            </button>
                        </div>
                    ))}

                    {/* Empty slots */}
                    {[...Array(maxItems - compareList.length)].map((_, index) => (
                        <div key={`empty-${index}`} className="compare-product-item empty">
                            <span>+</span>
                        </div>
                    ))}
                </div>

                <div className="compare-bar-actions">
                    <button
                        className="clear-compare-btn"
                        onClick={clearCompare}
                        aria-label="Clear all"
                    >
                        <Trash2 size={16} />
                    </button>

                    <Link
                        to="/compare"
                        className={`compare-now-btn ${!canCompare ? 'disabled' : ''}`}
                        onClick={(e) => !canCompare && e.preventDefault()}
                    >
                        Compare Now
                    </Link>
                </div>
            </div>
        </div>
    )
}

export default CompareBar
