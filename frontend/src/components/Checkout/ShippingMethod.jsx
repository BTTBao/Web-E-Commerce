import { CheckCircleIcon, TruckIcon } from 'lucide-react'
import React, { useState } from 'react'
import { formatPrice } from '../../utils/formatPrice'
import './css/ShippingMethod.css'

const shippingOptions = [
    {
        id: "standard",
        name: "Giao hàng miễn phí",
        duration: "Dự kiến 2-4 ngày",
        price: 0
    },
    // {
    //     id: "express",
    //     name: "Giao hàng nhanh",
    //     duration: "Dự kiến 1-2 ngày",
    //     price: 50000
    // }
]

function ShippingMethod({ onShippingChange, disabled = false }) {
    const [selectedMethod, setSelectedMethod] = useState("standard")

    const handleSelectMethod = option => {
        if (disabled) return
        setSelectedMethod(option.id)
        onShippingChange(option.price)
    }
    return (
        <div className={`shipping-method ${disabled ? "disabled" : ""}`}>
            <h2 className="shipping-method-title">
                Phương thức vận chuyển
            </h2>
            {disabled ? (
                <p className="shipping-method-disabled-text">
                    Vui lòng điền thông tin nhận hàng để chọn phương thức vận chuyển.
                </p>
            ) : (
                <div className="shipping-options">
                    {shippingOptions.map(option => (
                        <div
                            key={option.id}
                            onClick={() => handleSelectMethod(option)}
                            className={`shipping-option ${
                                selectedMethod === option.id ? "selected" : ""
                            }`}
                        >
                            <TruckIcon className="shipping-option-icon" />
                            <div className="shipping-option-content">
                                <p className="shipping-option-name">{option.name}</p>
                                <p className="shipping-option-duration">{option.duration}</p>
                            </div>
                            <p className="shipping-option-price">
                                {formatPrice(option.price)}
                            </p>
                            {selectedMethod === option.id && (
                                <CheckCircleIcon className="shipping-option-check" />
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

export default ShippingMethod