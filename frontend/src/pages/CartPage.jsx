import { Link } from 'react-router-dom'
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react'
import { useCart } from '../context/CartContext'
import './CartPage.css'

const CartPage = () => {
    const {
        items,
        loading,
        initialized,
        updateQuantity,
        removeFromCart,
        clearCart,
        getSubtotal,
        getShipping,
        getTotal
    } = useCart()

    if (!initialized || loading) {
        return (
            <div className="cart-page">
                <div className="container">
                    <div className="empty-cart">
                        <div className="spinner"></div>
                        <p>Loading cart...</p>
                    </div>
                </div>
            </div>
        )
    }

    if (items.length === 0) {
        return (
            <div className="cart-page">
                <div className="container">
                    <div className="empty-cart">
                        <ShoppingBag size={80} />
                        <h2>Your cart is empty</h2>
                        <p>Looks like you haven't added anything to your cart yet.</p>
                        <Link to="/products" className="btn btn-primary btn-lg">
                            Start Shopping
                            <ArrowRight size={20} />
                        </Link>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="cart-page">
            <div className="container">
                <div className="page-header">
                    <h1>Shopping Cart</h1>
                    <p className="text-secondary">{items.length} item{items.length !== 1 ? 's' : ''} in cart</p>
                </div>

                <div className="cart-layout">
                    {/* Cart Items */}
                    <div className="cart-items">
                        <div className="cart-header">
                            <span>Product</span>
                            <span>Price</span>
                            <span>Quantity</span>
                            <span>Total</span>
                            <span></span>
                        </div>

                        {items.map((item) => (
                            <div key={item.id} className="cart-item glass-card">
                                <div className="cart-item-product">
                                    <Link to={`/product/${item.slug}`} className="cart-item-image">
                                        <img src={item.image} alt={item.name} />
                                    </Link>
                                    <div className="cart-item-details">
                                        <Link to={`/product/${item.slug}`} className="cart-item-name">
                                            {item.name}
                                        </Link>
                                        <span className="cart-item-category">{item.category}</span>
                                    </div>
                                </div>

                                <div className="cart-item-price">
                                    ৳{item.price.toLocaleString()}
                                </div>

                                <div className="cart-item-quantity">
                                    <div className="quantity-selector">
                                        <button
                                            className="quantity-btn"
                                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                            disabled={item.quantity <= 1}
                                        >
                                            <Minus size={16} />
                                        </button>
                                        <span className="quantity-value">{item.quantity}</span>
                                        <button
                                            className="quantity-btn"
                                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                            disabled={item.quantity >= item.stock}
                                        >
                                            <Plus size={16} />
                                        </button>
                                    </div>
                                </div>

                                <div className="cart-item-total">
                                    ৳{(item.price * item.quantity).toLocaleString()}
                                </div>

                                <button
                                    className="cart-item-remove"
                                    onClick={() => removeFromCart(item.id)}
                                    aria-label="Remove item"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        ))}

                        <div className="cart-actions">
                            <button className="btn btn-ghost" onClick={clearCart}>
                                Clear Cart
                            </button>
                            <Link to="/products" className="btn btn-secondary">
                                Continue Shopping
                            </Link>
                        </div>
                    </div>

                    {/* Cart Summary */}
                    <div className="cart-summary glass-card">
                        <h3>Order Summary</h3>

                        <div className="summary-row">
                            <span>Subtotal</span>
                            <span>৳{getSubtotal().toLocaleString()}</span>
                        </div>

                        <div className="summary-row">
                            <span>Shipping</span>
                            <span>
                                {getShipping() === 0 ? (
                                    <span className="free-shipping">FREE</span>
                                ) : (
                                    `৳${getShipping()}`
                                )}
                            </span>
                        </div>

                        {getSubtotal() < 5000 && (
                            <div className="shipping-notice">
                                Add ৳{(5000 - getSubtotal()).toLocaleString()} more for free shipping!
                            </div>
                        )}

                        <div className="summary-divider"></div>

                        <div className="summary-row total">
                            <span>Total</span>
                            <span>৳{getTotal().toLocaleString()}</span>
                        </div>

                        <Link to="/checkout" className="btn btn-primary btn-lg checkout-btn">
                            Proceed to Checkout
                            <ArrowRight size={20} />
                        </Link>

                        {/* Payment Methods */}
                        <div className="payment-methods">
                            <p>We Accept</p>
                            <div className="payment-icons">
                                <div className="payment-icon bkash" title="bKash">
                                    <img src="/images/payment/Bkash.wine.svg" alt="bKash" />
                                </div>
                                <div className="payment-icon visa" title="Visa">
                                    <img src="/images/payment/Unknown.png" alt="Visa" />
                                </div>
                                <div className="payment-icon mastercard" title="Mastercard">
                                    <svg viewBox="10 8 132 84" xmlns="http://www.w3.org/2000/svg">
                                        <circle cx="52" cy="50" r="36" fill="#EB001B" />
                                        <circle cx="100" cy="50" r="36" fill="#F79E1B" />
                                        <path d="M76 22.8A35.9 35.9 0 0 0 63.1 50c0 11.1 5 21 12.9 27.2A35.9 35.9 0 0 0 88.9 50c0-11.1-5-21-12.9-27.2z" fill="#FF5F00" />
                                    </svg>
                                </div>
                                <div className="payment-icon amex" title="American Express">
                                    <img src="/images/payment/images.png" alt="American Express" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default CartPage
