import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
    CreditCard,
    Smartphone,
    MapPin,
    User,
    Phone,
    Mail,
    Check,
    ChevronRight,
    Star,
    Plus
} from 'lucide-react'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { addressAPI, ordersAPI } from '../utils/api'
import VoucherInput from '../components/VoucherInput'
import './CheckoutPage.css'

const CheckoutPage = () => {
    const { items, getSubtotal, getShipping, getTotal, clearCart, appliedVoucher, getVoucherDiscount } = useCart()
    const { user } = useAuth()
    const { showToast } = useToast()
    const navigate = useNavigate()

    const [step, setStep] = useState(1)
    const [paymentMethod, setPaymentMethod] = useState('bkash')
    const [loading, setLoading] = useState(false)

    // Saved addresses
    const [savedAddresses, setSavedAddresses] = useState([])
    const [addressesLoading, setAddressesLoading] = useState(true)
    const [selectedAddressId, setSelectedAddressId] = useState(null)
    const [useNewAddress, setUseNewAddress] = useState(false)

    const [shippingInfo, setShippingInfo] = useState({
        name: user?.name || '',
        email: user?.email || '',
        phone: user?.phone || '',
        address: '',
        city: '',
        area: '',
        notes: ''
    })

    const [cardInfo, setCardInfo] = useState({
        number: '',
        name: '',
        expiry: '',
        cvv: ''
    })

    // Fetch saved addresses on mount
    useEffect(() => {
        fetchAddresses()
    }, [])

    // Update shipping info when user data changes
    useEffect(() => {
        if (user) {
            setShippingInfo(prev => ({
                ...prev,
                name: user.name || prev.name,
                email: user.email || prev.email,
                phone: user.phone || prev.phone
            }))
        }
    }, [user])

    // Redirect to cart if empty
    useEffect(() => {
        if (items.length === 0) {
            navigate('/cart')
        }
    }, [items, navigate])

    const fetchAddresses = async () => {
        try {
            setAddressesLoading(true)
            const response = await addressAPI.getAll()
            const addresses = response.data
            setSavedAddresses(addresses)

            // Auto-select default address if available
            const defaultAddress = addresses.find(addr => addr.is_default)
            if (defaultAddress) {
                setSelectedAddressId(defaultAddress.id)
                applyAddress(defaultAddress)
            } else if (addresses.length > 0) {
                setSelectedAddressId(addresses[0].id)
                applyAddress(addresses[0])
            } else {
                setUseNewAddress(true)
            }
        } catch (error) {
            console.error('Error fetching addresses:', error)
            setUseNewAddress(true)
        } finally {
            setAddressesLoading(false)
        }
    }

    const applyAddress = (address) => {
        setShippingInfo(prev => ({
            ...prev,
            // Keep name and phone from user profile, only update address fields
            address: address.address,
            city: address.city,
            area: address.area || ''
        }))
    }

    const handleAddressSelect = (addressId) => {
        setSelectedAddressId(addressId)
        setUseNewAddress(false)
        const address = savedAddresses.find(a => a.id === addressId)
        if (address) {
            applyAddress(address)
        }
    }

    const handleUseNewAddress = () => {
        setSelectedAddressId(null)
        setUseNewAddress(true)
        setShippingInfo({
            name: user?.name || '',
            email: user?.email || '',
            phone: user?.phone || '',
            address: '',
            city: '',
            area: '',
            notes: shippingInfo.notes
        })
    }

    const handleShippingChange = (e) => {
        const { name, value } = e.target
        setShippingInfo(prev => ({ ...prev, [name]: value }))
    }

    const handleCardChange = (e) => {
        const { name, value } = e.target
        setCardInfo(prev => ({ ...prev, [name]: value }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (step === 1) {
            // Validate shipping info
            if (!shippingInfo.name || !shippingInfo.phone || !shippingInfo.address || !shippingInfo.city) {
                showToast('Please fill in all required fields', 'error')
                return
            }
            setStep(2)
            return
        }

        // Process order
        setLoading(true)

        // Prepare order data
        const orderData = {
            items: items.map(item => ({
                product_id: item.id,
                quantity: item.quantity
            })),
            payment_method: paymentMethod,
            shipping_name: shippingInfo.name,
            shipping_phone: shippingInfo.phone,
            shipping_email: shippingInfo.email || null,
            shipping_address: shippingInfo.address,
            shipping_area: shippingInfo.area || null,
            shipping_city: shippingInfo.city,
            notes: shippingInfo.notes || null,
            voucher_code: appliedVoucher?.code || null
        }

        console.log('Submitting order:', orderData)
        console.log('Cart items:', items)

        try {
            // Create order via API
            const response = await ordersAPI.create(orderData)

            if (response.data) {
                clearCart()
                showToast('Order placed successfully!', 'success')
                navigate(`/orders/${response.data.order_number}`)
            }
        } catch (error) {
            console.error('Error creating order:', error)
            console.error('Order data sent:', orderData)
            console.error('Error response:', error.response?.data)
            let errorMessage = 'Failed to place order. Please try again.'
            if (error.response?.data?.detail) {
                errorMessage = typeof error.response.data.detail === 'string'
                    ? error.response.data.detail
                    : JSON.stringify(error.response.data.detail)
            }
            showToast(errorMessage, 'error')
        } finally {
            setLoading(false)
        }
    }

    if (items.length === 0) {
        return null
    }

    return (
        <div className="checkout-page">
            <div className="container">
                <div className="page-header">
                    <h1>Checkout</h1>
                </div>

                {/* Progress Steps */}
                <div className="checkout-steps">
                    <div className={`step ${step >= 1 ? 'active' : ''} ${step > 1 ? 'completed' : ''}`}>
                        <div className="step-number">
                            {step > 1 ? <Check size={16} /> : '1'}
                        </div>
                        <span>Shipping</span>
                    </div>
                    <div className="step-line"></div>
                    <div className={`step ${step >= 2 ? 'active' : ''}`}>
                        <div className="step-number">2</div>
                        <span>Payment</span>
                    </div>
                </div>

                <div className="checkout-layout">
                    {/* Checkout Form */}
                    <div className="checkout-form-section">
                        <form onSubmit={handleSubmit}>
                            {step === 1 && (
                                <div className="form-section glass-card">
                                    <h2>
                                        <MapPin size={24} />
                                        Shipping Information
                                    </h2>

                                    {/* Saved Addresses Section */}
                                    {!addressesLoading && savedAddresses.length > 0 && (
                                        <div className="saved-addresses-section">
                                            <h3>Select a saved address</h3>
                                            <div className="saved-addresses-list">
                                                {savedAddresses.map(addr => (
                                                    <label
                                                        key={addr.id}
                                                        className={`saved-address-option ${selectedAddressId === addr.id && !useNewAddress ? 'selected' : ''}`}
                                                    >
                                                        <input
                                                            type="radio"
                                                            name="savedAddress"
                                                            checked={selectedAddressId === addr.id && !useNewAddress}
                                                            onChange={() => handleAddressSelect(addr.id)}
                                                        />
                                                        <div className="address-option-content">
                                                            <div className="address-option-header">
                                                                <span className="address-option-name">{addr.address}</span>
                                                                {addr.is_default && (
                                                                    <span className="default-tag">
                                                                        <Star size={12} /> Default
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <p className="address-option-text">
                                                                {addr.area && `${addr.area}, `}{addr.city}
                                                            </p>
                                                        </div>
                                                        <div className="address-option-check">
                                                            <Check size={18} />
                                                        </div>
                                                    </label>
                                                ))}

                                                {/* New Address Option */}
                                                <label className={`saved-address-option new-address-option ${useNewAddress ? 'selected' : ''}`}>
                                                    <input
                                                        type="radio"
                                                        name="savedAddress"
                                                        checked={useNewAddress}
                                                        onChange={handleUseNewAddress}
                                                    />
                                                    <div className="address-option-content">
                                                        <div className="new-address-label">
                                                            <Plus size={18} />
                                                            <span>Use a different address</span>
                                                        </div>
                                                    </div>
                                                    <div className="address-option-check">
                                                        <Check size={18} />
                                                    </div>
                                                </label>
                                            </div>
                                        </div>
                                    )}

                                    {/* Address Form - show if using new address or no saved addresses */}
                                    {(useNewAddress || savedAddresses.length === 0) && (
                                        <div className="form-grid">
                                            <div className="input-group">
                                                <label className="input-label">Full Name *</label>
                                                <div className="input-wrapper">
                                                    <User size={18} />
                                                    <input
                                                        type="text"
                                                        name="name"
                                                        className="input-field"
                                                        placeholder="Enter your full name"
                                                        value={shippingInfo.name}
                                                        onChange={handleShippingChange}
                                                        required
                                                    />
                                                </div>
                                            </div>

                                            <div className="input-group">
                                                <label className="input-label">Phone Number *</label>
                                                <div className="input-wrapper">
                                                    <Phone size={18} />
                                                    <input
                                                        type="tel"
                                                        name="phone"
                                                        className="input-field"
                                                        placeholder="01XXXXXXXXX"
                                                        value={shippingInfo.phone}
                                                        onChange={handleShippingChange}
                                                        required
                                                    />
                                                </div>
                                            </div>

                                            <div className="input-group full-width">
                                                <label className="input-label">Email</label>
                                                <div className="input-wrapper">
                                                    <Mail size={18} />
                                                    <input
                                                        type="email"
                                                        name="email"
                                                        className="input-field"
                                                        placeholder="Enter your email"
                                                        value={shippingInfo.email}
                                                        onChange={handleShippingChange}
                                                    />
                                                </div>
                                            </div>

                                            <div className="input-group full-width">
                                                <label className="input-label">Address *</label>
                                                <div className="input-wrapper">
                                                    <MapPin size={18} />
                                                    <input
                                                        type="text"
                                                        name="address"
                                                        className="input-field"
                                                        placeholder="House/Flat, Road, Block"
                                                        value={shippingInfo.address}
                                                        onChange={handleShippingChange}
                                                        required
                                                    />
                                                </div>
                                            </div>

                                            <div className="input-group">
                                                <label className="input-label">City *</label>
                                                <select
                                                    name="city"
                                                    className="input-field select-field"
                                                    value={shippingInfo.city}
                                                    onChange={handleShippingChange}
                                                    required
                                                >
                                                    <option value="">Select City</option>
                                                    <option value="dhaka">Dhaka</option>
                                                    <option value="chittagong">Chittagong</option>
                                                    <option value="sylhet">Sylhet</option>
                                                    <option value="rajshahi">Rajshahi</option>
                                                    <option value="khulna">Khulna</option>
                                                    <option value="other">Other</option>
                                                </select>
                                            </div>

                                            <div className="input-group">
                                                <label className="input-label">Area</label>
                                                <input
                                                    type="text"
                                                    name="area"
                                                    className="input-field"
                                                    placeholder="Enter your area"
                                                    value={shippingInfo.area}
                                                    onChange={handleShippingChange}
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {/* Order Notes - always visible */}
                                    <div className="form-grid">
                                        <div className="input-group full-width">
                                            <label className="input-label">Order Notes (Optional)</label>
                                            <textarea
                                                name="notes"
                                                className="input-field textarea-field"
                                                placeholder="Special instructions for delivery..."
                                                value={shippingInfo.notes}
                                                onChange={handleShippingChange}
                                                rows={3}
                                            />
                                        </div>
                                    </div>

                                    <button type="submit" className="btn btn-primary btn-lg continue-btn">
                                        Continue to Payment
                                        <ChevronRight size={20} />
                                    </button>
                                </div>
                            )}

                            {step === 2 && (
                                <div className="form-section glass-card">
                                    <h2>
                                        <CreditCard size={24} />
                                        Payment Method
                                    </h2>

                                    <div className="payment-methods">
                                        <label className={`payment-option ${paymentMethod === 'bkash' ? 'selected' : ''}`}>
                                            <input
                                                type="radio"
                                                name="payment"
                                                value="bkash"
                                                checked={paymentMethod === 'bkash'}
                                                onChange={(e) => setPaymentMethod(e.target.value)}
                                            />
                                            <div className="payment-icon bkash">
                                                <Smartphone size={24} />
                                            </div>
                                            <div className="payment-info">
                                                <span className="payment-name">bKash</span>
                                                <span className="payment-desc">Pay with bKash mobile wallet</span>
                                            </div>
                                            <div className="payment-check">
                                                <Check size={18} />
                                            </div>
                                        </label>

                                        <label className={`payment-option ${paymentMethod === 'card' ? 'selected' : ''}`}>
                                            <input
                                                type="radio"
                                                name="payment"
                                                value="card"
                                                checked={paymentMethod === 'card'}
                                                onChange={(e) => setPaymentMethod(e.target.value)}
                                            />
                                            <div className="payment-icon card">
                                                <CreditCard size={24} />
                                            </div>
                                            <div className="payment-info">
                                                <span className="payment-name">Credit/Debit Card</span>
                                                <span className="payment-desc">Visa, Mastercard, American Express</span>
                                            </div>
                                            <div className="payment-check">
                                                <Check size={18} />
                                            </div>
                                        </label>

                                        <label className={`payment-option ${paymentMethod === 'cod' ? 'selected' : ''}`}>
                                            <input
                                                type="radio"
                                                name="payment"
                                                value="cod"
                                                checked={paymentMethod === 'cod'}
                                                onChange={(e) => setPaymentMethod(e.target.value)}
                                            />
                                            <div className="payment-icon cod">
                                                💵
                                            </div>
                                            <div className="payment-info">
                                                <span className="payment-name">Cash on Delivery</span>
                                                <span className="payment-desc">Pay when you receive your order</span>
                                            </div>
                                            <div className="payment-check">
                                                <Check size={18} />
                                            </div>
                                        </label>
                                    </div>

                                    {paymentMethod === 'card' && (
                                        <div className="card-form">
                                            <div className="input-group">
                                                <label className="input-label">Card Number</label>
                                                <input
                                                    type="text"
                                                    name="number"
                                                    className="input-field"
                                                    placeholder="1234 5678 9012 3456"
                                                    value={cardInfo.number}
                                                    onChange={handleCardChange}
                                                />
                                            </div>
                                            <div className="input-group">
                                                <label className="input-label">Cardholder Name</label>
                                                <input
                                                    type="text"
                                                    name="name"
                                                    className="input-field"
                                                    placeholder="Name on card"
                                                    value={cardInfo.name}
                                                    onChange={handleCardChange}
                                                />
                                            </div>
                                            <div className="card-row">
                                                <div className="input-group">
                                                    <label className="input-label">Expiry Date</label>
                                                    <input
                                                        type="text"
                                                        name="expiry"
                                                        className="input-field"
                                                        placeholder="MM/YY"
                                                        value={cardInfo.expiry}
                                                        onChange={handleCardChange}
                                                    />
                                                </div>
                                                <div className="input-group">
                                                    <label className="input-label">CVV</label>
                                                    <input
                                                        type="text"
                                                        name="cvv"
                                                        className="input-field"
                                                        placeholder="123"
                                                        value={cardInfo.cvv}
                                                        onChange={handleCardChange}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <div className="checkout-actions">
                                        <button
                                            type="button"
                                            className="btn btn-secondary"
                                            onClick={() => setStep(1)}
                                        >
                                            Back
                                        </button>
                                        <button
                                            type="submit"
                                            className="btn btn-primary btn-lg"
                                            disabled={loading}
                                        >
                                            {loading ? 'Processing...' : `Pay ৳${(getTotal() - getVoucherDiscount()).toLocaleString()}`}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </form>
                    </div>

                    {/* Order Summary */}
                    <div className="order-summary glass-card">
                        <h3>Order Summary</h3>

                        <div className="summary-items">
                            {items.map((item) => (
                                <div key={item.id} className="summary-item">
                                    <div className="item-image">
                                        <img src={item.image} alt={item.name} />
                                        <span className="item-quantity">{item.quantity}</span>
                                    </div>
                                    <div className="item-details">
                                        <span className="item-name">{item.name}</span>
                                        <span className="item-price">৳{item.price.toLocaleString()}</span>
                                    </div>
                                    <span className="item-total">
                                        ৳{(item.price * item.quantity).toLocaleString()}
                                    </span>
                                </div>
                            ))}
                        </div>

                        <div className="summary-divider"></div>

                        {/* Voucher Input */}
                        <VoucherInput />

                        <div className="summary-divider"></div>

                        <div className="summary-row">
                            <span>Subtotal</span>
                            <span>৳{getSubtotal().toLocaleString()}</span>
                        </div>
                        <div className="summary-row">
                            <span>Shipping</span>
                            <span>{getShipping() === 0 ? 'FREE' : `৳${getShipping()}`}</span>
                        </div>
                        {getVoucherDiscount() > 0 && (
                            <div className="summary-row discount">
                                <span>Voucher Discount</span>
                                <span className="discount-amount">-৳{getVoucherDiscount().toLocaleString()}</span>
                            </div>
                        )}
                        <div className="summary-divider"></div>
                        <div className="summary-row total">
                            <span>Total</span>
                            <span>৳{(getTotal() - getVoucherDiscount()).toLocaleString()}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default CheckoutPage
