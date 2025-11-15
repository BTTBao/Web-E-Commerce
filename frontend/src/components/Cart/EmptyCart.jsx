import React from 'react'
import './css/EmptyCart.css'
import { ShoppingBagIcon } from 'lucide-react'

function EmptyCart() {
    return (
        <div className="empty-cart-container">
            <ShoppingBagIcon className="empty-cart-icon" />
            <h2 className="empty-cart-heading">Giỏ hàng của bạn đang trống</h2>
            <p className=".empty-cart-text">
                Trông có vẻ như bạn chưa thêm sản phẩm nào vào giỏ hàng. Hãy bắt đầu khám phá bộ sưu tập của chúng tôi!
            </p>
            <button
                onClick={() => {
                    window.location.href = "/shop";
                }}
                className="empty-cart-button">
                Tiếp tục mua sắm
            </button>
        </div>
    )
}

export default EmptyCart