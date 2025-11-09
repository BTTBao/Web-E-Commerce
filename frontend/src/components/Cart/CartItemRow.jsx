import { MinusIcon, PlusIcon, TrashIcon } from 'lucide-react'
import React from 'react'
import { formatPrice } from '../../utils/formatPrice'
import { useCart } from '../../hooks/useCart';
import './css/CartItemRow.css'

function CartItemRow({ item }) {
    const { updateQuantity, removeItem } = useCart();
    return (
        <div className="cart-item-row">
            {/* Thông tin sản phẩm */}
            <div className="cart-item-info">
                <img
                    src={item.image || item.imageUrl}
                    alt={item.name || item.productName}
                    className="cart-item-image"
                />
                <div>
                    <p className="cart-item-name">{item.name || item.productName}</p>
                    <p className="cart-item-variant">Kích cỡ: {item.variantName}</p>
                    {/* <p className="cart-item-variant">Size: {item.size}</p> */}
                    <button
                        onClick={() => removeItem((item.productId || item.id), item.variantId)}
                        className="cart-item-remove-mobile"
                        aria-label={`Xoá ${item.name}`}
                    >
                        <TrashIcon className="w-4 h-4" /> Xoá
                    </button>
                </div>
            </div>

            {/* Đơn giá */}
            <div className="cart-item-unit-price">
                <p className="cart-item-price-text">{formatPrice(item.price)}</p>
            </div>

            {/* Số lượng */}
            <div className="cart-item-quantity-wrapper">
                <div className="cart-item-quantity-control">
                    <button
                        onClick={() => updateQuantity(item.productId, item.variantId, item.quantity - 1)}
                        className="cart-item-quantity-btn minus-btn"
                        disabled={item.quantity <= 1}
                    >
                        <MinusIcon className="w-4 h-4" />
                    </button>
                    <span className="cart-item-quantity-value">
                        {item.quantity}
                    </span>
                    <button
                        onClick={() => updateQuantity(item.productId, item.variantId, item.quantity + 1)}
                        className="cart-item-quantity-btn plus-btn"
                    >
                        <PlusIcon className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Thành tiền */}
            <div className="cart-item-total-price">
                <p className="cart-item-total-price-text">
                    {formatPrice(item.price * item.quantity)}
                </p>
            </div>

            {/* Nút xóa */}
            <div className="cart-item-remove-desktop-wrapper">
                <button
                    onClick={() => removeItem((item.productId || item.id), item.variantId)}
                    className="cart-item-remove-desktop"
                    aria-label={`Xoá ${item.name}`}
                >
                    <TrashIcon/>
                </button>
            </div>
        </div>

    )
}

export default CartItemRow