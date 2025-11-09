import React from 'react'
import OrderSummary from './OrderSummary';
import CartItemRow from './CartItemRow';
import { useCart } from '../../hooks/useCart';
import './css/CartView.css'

function CartView({ onOpenClearCartModal }) {
    const { cart } = useCart();
    return (
        <div className="cart-layout">
            {/* Bảng sản phẩm */}
            <div className="cart-table-container">
                <div className="cart-header-row">
                    <div className="cart-header-product">Sản phẩm</div>
                    <div className="cart-header-price">Đơn giá</div>
                    <div className="cart-header-quantity">Số lượng</div>
                    <div className="cart-header-total">Thành tiền</div>
                </div>

                {/* Áp dụng lớp .cart-item-list cho div cha 
          của các component CartItemRow 
        */}
                <div className="cart-item-list">
                    {cart.map((item, index) => (
                        <CartItemRow key={index} item={item} />
                    ))}
                </div>
            </div>

            {/* Tóm tắt đơn hàng */}
            <div className="order-summary-container">
                <OrderSummary onOpenClearCartModal={onOpenClearCartModal} />
            </div>
        </div>
    )
}

export default CartView