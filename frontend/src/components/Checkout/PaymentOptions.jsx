import { House } from 'lucide-react'
import React, { useState } from 'react'
import './css/PaymentOptions.css'

const paymentMethods = [
    {
        id: "cod",
        name: "Thanh toán khi nhận hàng (COD)",
        icon: <House />,
        description: "Thanh toán bằng tiền mặt khi shipper giao hàng."
    },
    {
        id: "vnpay",
        name: "VNPAY",
        icon: <House />,
        description: "Thanh toán qua cổng VNPAY, hỗ trợ nhiều ngân hàng."
    },
    {
        id: "momo",
        name: "MOMO",
        icon: <House />,
        description: "Thanh toán an toàn và nhanh chóng với ví điện tử MOMO."
    },
    {
        id: "zalopay",
        name: "ZaloPay",
        icon: <House />,
        description: "Sử dụng ví ZaloPay để hoàn tất thanh toán."
    }
]

function PaymentOptions({ disabled = false }) {
    const [selectedMethod, setSelectedMethod] = useState("cod")

    const handleSelectMethod = id => {
        if (disabled) return
        setSelectedMethod(id)
    }
    return (
        <div className={`payment-options ${disabled ? "disabled" : ""}`}>
            <h2 className="payment-options-title">
                Phương thức thanh toán
            </h2>
            {disabled ? (
                <p className="payment-options-disabled-text">
                    Vui lòng hoàn tất thông tin nhận hàng để chọn phương thức thanh toán.
                </p>
            ) : (
                <div className="payment-methods">
                    {paymentMethods.map(method => (
                        <div key={method.id} className="payment-method-item">
                            <div
                                onClick={() => handleSelectMethod(method.id)}
                                className={`payment-method-wrapper ${
                                    selectedMethod === method.id ? "selected" : ""
                                }`}
                            >
                                <input
                                    type="radio"
                                    id={method.id}
                                    name="paymentMethod"
                                    value={method.id}
                                    checked={selectedMethod === method.id}
                                    onChange={() => handleSelectMethod(method.id)}
                                    className="payment-method-radio"
                                />
                                <div className="payment-method-content">
                                    <span className="payment-method-name">
                                        {method.name}
                                    </span>
                                </div>
                                <div className="payment-method-icon">{method.icon}</div>
                            </div>
                            {selectedMethod === method.id && (
                                <div className="payment-method-description">
                                    {method.description}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

export default PaymentOptions