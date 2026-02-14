import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { searchAPI } from '../utils/api'
import { Search, X, Package, Grid3X3 } from 'lucide-react'
import './SearchAutocomplete.css'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'
const BASE_URL = API_URL.replace('/api/v1', '')

const SearchAutocomplete = ({ onClose }) => {
    const [query, setQuery] = useState('')
    const [suggestions, setSuggestions] = useState([])
    const [loading, setLoading] = useState(false)
    const [showDropdown, setShowDropdown] = useState(false)
    const [selectedIndex, setSelectedIndex] = useState(-1)
    const inputRef = useRef(null)
    const dropdownRef = useRef(null)
    const debounceTimer = useRef(null)
    const navigate = useNavigate()

    useEffect(() => {
        inputRef.current?.focus()
    }, [])

    useEffect(() => {
        if (query.length < 2) {
            setSuggestions([])
            setShowDropdown(false)
            return
        }

        // Debounce the search
        if (debounceTimer.current) {
            clearTimeout(debounceTimer.current)
        }

        debounceTimer.current = setTimeout(async () => {
            setLoading(true)
            try {
                const response = await searchAPI.autocomplete(query)
                setSuggestions(response.data.suggestions || [])
                setShowDropdown(true)
                setSelectedIndex(-1)
            } catch (error) {
                console.error('Search error:', error)
            } finally {
                setLoading(false)
            }
        }, 300)

        return () => {
            if (debounceTimer.current) {
                clearTimeout(debounceTimer.current)
            }
        }
    }, [query])

    const handleKeyDown = (e) => {
        if (!showDropdown || suggestions.length === 0) {
            if (e.key === 'Enter' && query.length >= 2) {
                handleSearch()
            }
            return
        }

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault()
                setSelectedIndex(prev =>
                    prev < suggestions.length - 1 ? prev + 1 : prev
                )
                break
            case 'ArrowUp':
                e.preventDefault()
                setSelectedIndex(prev => prev > 0 ? prev - 1 : -1)
                break
            case 'Enter':
                e.preventDefault()
                if (selectedIndex >= 0) {
                    handleSelect(suggestions[selectedIndex])
                } else {
                    handleSearch()
                }
                break
            case 'Escape':
                setShowDropdown(false)
                break
        }
    }

    const handleSelect = (item) => {
        navigate(item.url)
        setShowDropdown(false)
        setQuery('')
        onClose?.()
    }

    const handleSearch = () => {
        if (query.length >= 2) {
            navigate(`/products?search=${encodeURIComponent(query)}`)
            setShowDropdown(false)
            setQuery('')
            onClose?.()
        }
    }

    const clearSearch = () => {
        setQuery('')
        setSuggestions([])
        setShowDropdown(false)
        inputRef.current?.focus()
    }

    return (
        <div className="search-autocomplete">
            <div className="search-input-wrapper">
                <Search className="search-icon" size={20} />
                <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Search products, categories..."
                    className="search-input"
                />
                {query && (
                    <button className="clear-btn" onClick={clearSearch}>
                        <X size={18} />
                    </button>
                )}
                {loading && <div className="search-spinner" />}
            </div>

            {showDropdown && suggestions.length > 0 && (
                <div className="search-dropdown" ref={dropdownRef}>
                    {suggestions.map((item, index) => (
                        <div
                            key={`${item.type}-${item.id}`}
                            className={`search-item ${selectedIndex === index ? 'selected' : ''}`}
                            onClick={() => handleSelect(item)}
                            onMouseEnter={() => setSelectedIndex(index)}
                        >
                            {item.type === 'product' ? (
                                <>
                                    <div className="search-item-image">
                                        {item.image ? (
                                            <img src={`${BASE_URL}${item.image}`} alt={item.name} />
                                        ) : (
                                            <Package size={24} />
                                        )}
                                    </div>
                                    <div className="search-item-info">
                                        <span className="search-item-name">{item.name}</span>
                                        <span className="search-item-price">৳{item.price?.toLocaleString()}</span>
                                    </div>
                                    <span className="search-item-type product">Product</span>
                                </>
                            ) : (
                                <>
                                    <div className="search-item-image category">
                                        <Grid3X3 size={24} />
                                    </div>
                                    <div className="search-item-info">
                                        <span className="search-item-name">{item.name}</span>
                                        <span className="search-item-meta">Browse category</span>
                                    </div>
                                    <span className="search-item-type category">Category</span>
                                </>
                            )}
                        </div>
                    ))}

                    <button className="search-all-btn" onClick={handleSearch}>
                        <Search size={16} />
                        See all results for "{query}"
                    </button>
                </div>
            )}

            {showDropdown && query.length >= 2 && suggestions.length === 0 && !loading && (
                <div className="search-dropdown">
                    <div className="search-no-results">
                        No results found for "{query}"
                    </div>
                    <button className="search-all-btn" onClick={handleSearch}>
                        <Search size={16} />
                        Search all products
                    </button>
                </div>
            )}
        </div>
    )
}

export default SearchAutocomplete
