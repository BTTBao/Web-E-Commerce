import React, { useMemo, useState } from "react";
import { useCart } from "../../hooks/useCart";
import { formatPrice } from "../../utils/formatPrice";
import { ChevronDownIcon, ChevronUpIcon } from "lucide-react";
import "./css/CheckoutOrderSummary.css";
import { toast } from "sonner";
import axiosClient from "../../api/axiosClient";
import { useOrder } from "../../hooks/useOrder";
import { useNavigate } from "react-router-dom";

function CheckoutOrderSummary({ shippingFee, onPlaceOrder, isCheckoutActive, items }) {
    const [isItemListVisible, setIsItemListVisible] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const { clearCart } = useCart();
    const { orderData, clearOrder } = useOrder();

    const updatedItems = items.map(item => ({
        productId: item.productId || item.id,
        variantId: item.variantId,
        quantity: item.quantity,
        unitPrice: item.price, // đổi tên price → unitPrice
    }));
    const newOrderData = { ...orderData, items: updatedItems }; // tạo object mới với items

    //Tính tổng tiền
    const subtotal = useMemo(() => {
        return items.reduce((acc, item) => acc + item.price * item.quantity, 0);
    }, [items]);
    const total = subtotal + shippingFee;

    const handleCheckout = async () => {
        console.log(newOrderData)
        try {
            setIsLoading(true);
            const resOrder = await axiosClient.post("/Orders", newOrderData);
            const getId = () => Number(resOrder?.data.orderId?.replace("DH", "") ?? 0);
            // Nếu thanh toán qua VNPAY
            if (newOrderData.paymentMethod.toLowerCase() === "vnpay") {
                const res = await axiosClient.post("/Payment/create-payment", {
                    amount: total,
                    orderId: getId(),
                });

                const paymentUrl = res.data.paymentUrl;
                if (paymentUrl) {
                    console.log("Tạo đơn hàng" + resOrder.data)
                    clearCart();
                    clearOrder();
                    window.location.href = paymentUrl;
                    return;
                } else {
                    toast.error("Không lấy được URL thanh toán VNPAY!");
                    return;
                }
            }
            setTimeout(() => {
                setIsLoading(false);
                navigate(`/order-success/DH${getId()}`)
                clearCart();
                clearOrder();
                // navigate(`/order-success/DH${getId()}`, { replace: true, state: { resOrder.data } });
            }, 3000);
        } catch (err) {
            console.error("Checkout error:" + err);
            toast.error("Không thể đặt hàng !!");
            setIsLoading(false);
        }
    };

    return (
        <div className="order-summary-box">
            {isLoading && (
                <div className="checkout-loading-overlay">
                    <div className="spinner"></div>
                </div>
            )}
            <h2 className="order-title">Thông tin đơn hàng</h2>

            <button
                onClick={() => setIsItemListVisible(!isItemListVisible)}
                className="toggle-item-btn"
            >
                <span>
                    {isItemListVisible ? "Ẩn" : "Hiển thị"} thông tin sản phẩm
                </span>
                {isItemListVisible ? (
                    <ChevronUpIcon width={18} height={18} />
                ) : (
                    <ChevronDownIcon width={18} height={18} />
                )}
            </button>

            <div className={`item-list ${isItemListVisible ? "show" : "hide"}`}>
                {items.map(item => (
                    <div key={item.id} className="cart-item">
                        <div className="item-thumb">
                            <img src={item.image || item.imageUrl} alt={item.name} />
                            <span className="item-qty">{item.quantity}</span>
                        </div>

                        <div className="item-info">
                            <p className="item-name">{item.name || item.productName}</p>
                            <p className="item-desc">
                                {item.variantName ? `Biến thể: ${item.variantName}` : ""}
                            </p>
                        </div>

                        <p className="item-price">
                            {item.price ? `${formatPrice(item.price * item.quantity)}` : ""}
                            {/* {formatPrice(item.price * item.quantity)} */}
                        </p>
                    </div>
                ))}
            </div>

            <div className="coupon-box">
                <input type="text" placeholder="Nhập mã giảm giá" />
                <button>Áp dụng</button>
            </div>

            <div className="summary-prices">
                <div className="summary-row">
                    <span>Tạm tính</span>
                    <span>{formatPrice(subtotal || 0)}</span>
                </div>

                <div className="summary-row">
                    <span>Phí vận chuyển</span>
                    <span>{formatPrice(shippingFee)}</span>
                </div>

                <div className="summary-total">
                    <span>Tổng cộng</span>
                    <span>{formatPrice(total || 0)}</span>
                </div>
            </div>

            <button
                onClick={() => {
                    onPlaceOrder
                    handleCheckout()
                }}
                disabled={!isCheckoutActive}
                className={`place-order-btn ${!isCheckoutActive ? "disabled" : ""}`}
            >
                Đặt hàng
            </button>
        </div>
    );
}

export default CheckoutOrderSummary;
