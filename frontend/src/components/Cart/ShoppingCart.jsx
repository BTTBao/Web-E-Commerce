import React from 'react'
import { useState } from 'react';
import { useCart } from '../../hooks/useCart';
import ConfirmationModal from '../ui/ConfirmationModal';
import EmptyCart from './EmptyCart';
import './css/ShoppingCart.css'
import CartView from './CartView';
import { ArrowLeft } from 'lucide-react';

function ShoppingCart() {
    const { cart, clearCart, itemCount } = useCart();
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleClearCart = () => {
        clearCart();
        setIsModalOpen(false);
    };
    return (
        <div className="page-container">
            <div className="page-header">
                <div className="page-title-group">
                    <h1 className="page-title">
                        Giỏ hàng
                    </h1>
                    {cart.length > 0 && (
                        <span className="item-count-text">{itemCount} sản phẩm</span>
                    )}
                </div>

                {cart.length > 0 && (
                    <button
                        className="continue-shopping-link"
                        onClick={() => {
                            window.location.href = "/";
                        }}
                    >
                        <ArrowLeft /> Tiếp tục mua sắm
                    </button>
                )}
            </div>

            {cart && cart.length === 0 ? (
                <EmptyCart />
            ) : (
                <CartView onOpenClearCartModal={() => setIsModalOpen(true)} />
            )}

            <ConfirmationModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onConfirm={handleClearCart}
                title="Xác nhận dọn dẹp giỏ hàng"
                description="Hành động này sẽ xoá tất cả sản phẩm khỏi giỏ hàng của bạn. Bạn có chắc chắn muốn tiếp tục?"
            />
        </div>
    )
}

export default ShoppingCart