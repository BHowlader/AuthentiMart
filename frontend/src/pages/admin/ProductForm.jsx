import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import './AdminPanel.css'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'
const BASE_URL = API_URL.replace('/api/v1', '')

const ProductForm = () => {
    const { token } = useAuth()
    const navigate = useNavigate()
    const { id } = useParams()
    const isEditing = Boolean(id)

    const [categories, setCategories] = useState([])
    const [loading, setLoading] = useState(false)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        original_price: '',
        discount: 0,
        stock: 0,
        category_id: '',
        brand: '',
        sku: '',
        is_featured: false,
        is_new: true,
        is_active: true
    })

    const [images, setImages] = useState([])
    const [existingImages, setExistingImages] = useState([])
    const [primaryImageIndex, setPrimaryImageIndex] = useState(0)

    useEffect(() => {
        fetchCategories()
        if (isEditing) {
            fetchProduct()
        }
    }, [id])

    const fetchCategories = async () => {
        try {
            const response = await fetch(`${API_URL}/admin/categories`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            if (response.ok) {
                setCategories(await response.json())
            }
        } catch (error) {
            console.error('Error fetching categories:', error)
        }
    }

    const fetchProduct = async () => {
        try {
            setLoading(true)
            // First get from admin products list
            const response = await fetch(`${API_URL}/products/${id}`)
            if (response.ok) {
                const product = await response.json()
                setFormData({
                    name: product.name || '',
                    description: product.description || '',
                    price: product.price?.toString() || '',
                    original_price: product.original_price?.toString() || '',
                    discount: product.discount || 0,
                    stock: product.stock || 0,
                    category_id: product.category_id?.toString() || '',
                    brand: product.brand || '',
                    sku: product.sku || '',
                    is_featured: product.is_featured || false,
                    is_new: product.is_new || false,
                    is_active: product.is_active !== false
                })
                if (product.images) {
                    setExistingImages(product.images)
                }
            }
        } catch (error) {
            console.error('Error fetching product:', error)
            setError('Failed to load product')
        } finally {
            setLoading(false)
        }
    }

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }))
    }

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files)
        setImages(prev => [...prev, ...files])
    }

    const removeImage = (index) => {
        setImages(prev => prev.filter((_, i) => i !== index))
        if (primaryImageIndex === index) {
            setPrimaryImageIndex(0)
        } else if (primaryImageIndex > index) {
            setPrimaryImageIndex(prev => prev - 1)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setSuccess('')
        setSaving(true)

        try {
            // Validate required fields
            if (!formData.name || !formData.price || !formData.category_id) {
                setError('Please fill in all required fields')
                setSaving(false)
                return
            }

            const productData = {
                ...formData,
                price: parseFloat(formData.price),
                original_price: formData.original_price ? parseFloat(formData.original_price) : null,
                discount: parseInt(formData.discount) || 0,
                stock: parseInt(formData.stock) || 0,
                category_id: parseInt(formData.category_id)
            }

            const url = isEditing
                ? `${API_URL}/admin/products/${id}`
                : `${API_URL}/admin/products`

            const response = await fetch(url, {
                method: isEditing ? 'PUT' : 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(productData)
            })

            if (!response.ok) {
                throw new Error('Failed to save product')
            }

            const result = await response.json()
            const productId = isEditing ? id : result.product_id

            // Upload images if any
            for (let i = 0; i < images.length; i++) {
                const formDataImg = new FormData()
                formDataImg.append('file', images[i])
                formDataImg.append('is_primary', (i === primaryImageIndex).toString())

                await fetch(`${API_URL}/admin/products/${productId}/images`, {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}` },
                    body: formDataImg
                })
            }

            setSuccess('Product saved successfully!')
            setTimeout(() => {
                navigate('/admin/products')
            }, 1500)

        } catch (error) {
            console.error('Error saving product:', error)
            setError(error.message || 'Failed to save product')
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <div className="admin-loading">
                <div className="spinner"></div>
                <p>Loading product...</p>
            </div>
        )
    }

    return (
        <div className="product-form-page">
            <div className="page-header">
                <button className="back-btn" onClick={() => navigate('/admin/products')}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="m15 18-6-6 6-6" />
                    </svg>
                    Back
                </button>
                <h1>{isEditing ? 'Edit Product' : 'Add New Product'}</h1>
            </div>

            {error && (
                <div className="alert alert-error">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" y1="8" x2="12" y2="12" />
                        <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                    {error}
                </div>
            )}

            {success && (
                <div className="alert alert-success">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                        <polyline points="22 4 12 14.01 9 11.01" />
                    </svg>
                    {success}
                </div>
            )}

            <form onSubmit={handleSubmit} className="product-form">
                <div className="form-grid">
                    {/* Basic Info */}
                    <div className="form-section">
                        <h2>Basic Information</h2>

                        <div className="form-group">
                            <label htmlFor="name">Product Name *</label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="Enter product name"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="description">Description</label>
                            <textarea
                                id="description"
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                placeholder="Enter product description"
                                rows="4"
                            />
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="category_id">Category *</label>
                                <select
                                    id="category_id"
                                    name="category_id"
                                    value={formData.category_id}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="">Select category</option>
                                    {categories.map(cat => (
                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label htmlFor="brand">Brand</label>
                                <input
                                    type="text"
                                    id="brand"
                                    name="brand"
                                    value={formData.brand}
                                    onChange={handleChange}
                                    placeholder="Enter brand name"
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="sku">SKU</label>
                            <input
                                type="text"
                                id="sku"
                                name="sku"
                                value={formData.sku}
                                onChange={handleChange}
                                placeholder="Auto-generated if empty"
                            />
                        </div>
                    </div>

                    {/* Pricing */}
                    <div className="form-section">
                        <h2>Pricing & Inventory</h2>

                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="price">Price (BDT) *</label>
                                <input
                                    type="number"
                                    id="price"
                                    name="price"
                                    value={formData.price}
                                    onChange={handleChange}
                                    placeholder="0.00"
                                    step="0.01"
                                    min="0"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="original_price">Original Price (BDT)</label>
                                <input
                                    type="number"
                                    id="original_price"
                                    name="original_price"
                                    value={formData.original_price}
                                    onChange={handleChange}
                                    placeholder="0.00"
                                    step="0.01"
                                    min="0"
                                />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="discount">Discount (%)</label>
                                <input
                                    type="number"
                                    id="discount"
                                    name="discount"
                                    value={formData.discount}
                                    onChange={handleChange}
                                    min="0"
                                    max="100"
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="stock">Stock Quantity *</label>
                                <input
                                    type="number"
                                    id="stock"
                                    name="stock"
                                    value={formData.stock}
                                    onChange={handleChange}
                                    min="0"
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    {/* Images */}
                    <div className="form-section">
                        <h2>Product Images</h2>

                        {existingImages.length > 0 && (
                            <div className="existing-images">
                                <label>Current Images</label>
                                <div className="image-preview-grid">
                                    {existingImages.map((img, index) => (
                                        <div key={img.id} className={`image-preview ${img.is_primary ? 'primary' : ''}`}>
                                            <img src={`${BASE_URL}${img.url}`} alt="Product" />
                                            {img.is_primary && <span className="primary-badge">Primary</span>}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="image-upload">
                            <label>Add New Images</label>
                            <div className="upload-zone">
                                <input
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    onChange={handleImageChange}
                                    id="image-upload"
                                />
                                <label htmlFor="image-upload" className="upload-label">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                                        <circle cx="8.5" cy="8.5" r="1.5" />
                                        <polyline points="21 15 16 10 5 21" />
                                    </svg>
                                    <span>Click to upload images</span>
                                    <small>PNG, JPG up to 5MB</small>
                                </label>
                            </div>

                            {images.length > 0 && (
                                <div className="image-preview-grid">
                                    {images.map((img, index) => (
                                        <div
                                            key={index}
                                            className={`image-preview ${index === primaryImageIndex ? 'primary' : ''}`}
                                            onClick={() => setPrimaryImageIndex(index)}
                                        >
                                            <img src={URL.createObjectURL(img)} alt="Preview" />
                                            <button
                                                type="button"
                                                className="remove-image"
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    removeImage(index)
                                                }}
                                            >
                                                ×
                                            </button>
                                            {index === primaryImageIndex && (
                                                <span className="primary-badge">Primary</span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Status */}
                    <div className="form-section">
                        <h2>Status & Visibility</h2>

                        <div className="checkbox-group">
                            <label className="checkbox-label">
                                <input
                                    type="checkbox"
                                    name="is_active"
                                    checked={formData.is_active}
                                    onChange={handleChange}
                                />
                                <span className="checkmark"></span>
                                Active (visible on store)
                            </label>

                            <label className="checkbox-label">
                                <input
                                    type="checkbox"
                                    name="is_featured"
                                    checked={formData.is_featured}
                                    onChange={handleChange}
                                />
                                <span className="checkmark"></span>
                                Featured Product
                            </label>

                            <label className="checkbox-label">
                                <input
                                    type="checkbox"
                                    name="is_new"
                                    checked={formData.is_new}
                                    onChange={handleChange}
                                />
                                <span className="checkmark"></span>
                                Mark as New
                            </label>
                        </div>
                    </div>
                </div>

                <div className="form-actions">
                    <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => navigate('/admin/products')}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={saving}
                    >
                        {saving ? (
                            <>
                                <div className="btn-spinner"></div>
                                Saving...
                            </>
                        ) : (
                            isEditing ? 'Update Product' : 'Create Product'
                        )}
                    </button>
                </div>
            </form>
        </div>
    )
}

export default ProductForm
