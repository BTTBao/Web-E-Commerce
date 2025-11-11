import { House } from 'lucide-react'
import React, { useState } from 'react'
import './css/PaymentOptions.css'
import VNPAY from "../../assets/VNPAY.webp";
import { toast } from 'sonner';
import { useOrder } from '../../hooks/useOrder';

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
        icon: <img src={VNPAY} alt="VNPAY" style={{ width: "25px" }} />,
        description: "Thanh toán qua cổng VNPAY, hỗ trợ nhiều ngân hàng."
    }
]

function PaymentOptions({ disabled = false }) {
    const [selectedMethod, setSelectedMethod] = useState("cod")
    const { updateOrderData } = useOrder();
    
    const handleSelectMethod = id => {
        if (disabled) return
        if (id == 'vnpay') {
            setSelectedMethod('cod');
            toast.warning("Đang cập nhật ...");
        } else {
            setSelectedMethod(id);
        }
        updateOrderData("paymentMethod", selectedMethod)
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
                                className={`payment-method-wrapper ${selectedMethod === method.id ? "selected" : ""
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