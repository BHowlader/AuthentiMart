import { useState } from 'react'
import { Tag, X, Check, Loader2 } from 'lucide-react'
import { useCart } from '../context/CartContext'
import './VoucherInput.css'

const VoucherInput = () => {
    const [code, setCode] = useState('')
    const [error, setError] = useState('')
    const {
        appliedVoucher,
        voucherLoading,
        applyVoucher,
        removeVoucher,
        getVoucherDiscount
    } = useCart()

    const handleApply = async (e) => {
        e.preventDefault()
        setError('')

        if (!code.trim()) {
            setError('Please enter a voucher code')
            return
        }

        const result = await applyVoucher(code.trim())
        if (result.success) {
            setCode('')
        } else {
            setError(result.message)
        }
    }

    const handleRemove = () => {
        removeVoucher()
        setError('')
    }

    // If voucher is applied, show the applied state
    if (appliedVoucher) {
        return (
            <div className="voucher-input-container">
                <div className="voucher-applied">
                    <div className="voucher-applied-info">
                        <div className="voucher-applied-icon">
                            <Check size={16} />
                        </div>
                        <div className="voucher-applied-details">
                            <span className="voucher-code">{appliedVoucher.code}</span>
                            <span className="voucher-name">{appliedVoucher.name}</span>
                        </div>
                    </div>
                    <div className="voucher-applied-right">
                        <span className="voucher-discount">
                            -৳{getVoucherDiscount().toLocaleString()}
                        </span>
                        <button
                            className="voucher-remove-btn"
                            onClick={handleRemove}
                            aria-label="Remove voucher"
                        >
                            <X size={16} />
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="voucher-input-container">
            <form className="voucher-form" onSubmit={handleApply}>
                <div className="voucher-input-wrapper">
                    <Tag size={18} className="voucher-icon" />
                    <input
                        type="text"
                        placeholder="Enter voucher code"
                        value={code}
                        onChange={(e) => {
                            setCode(e.target.value.toUpperCase())
                            setError('')
                        }}
                        className={error ? 'error' : ''}
                        disabled={voucherLoading}
                    />
                </div>
                <button
                    type="submit"
                    className="voucher-apply-btn"
                    disabled={voucherLoading || !code.trim()}
                >
                    {voucherLoading ? (
                        <Loader2 size={18} className="spin" />
                    ) : (
                        'Apply'
                    )}
                </button>
            </form>
            {error && <p className="voucher-error">{error}</p>}
        </div>
    )
}

export default VoucherInput
