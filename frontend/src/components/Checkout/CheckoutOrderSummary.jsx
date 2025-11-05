// import React from "react"
// import { useCart } from "../hooks/useCart"
// import { formatPrice } from "../../utils/formatPrice"

// const CheckoutOrderSummary = ({
//     shippingFee,
//     onPlaceOrder,
//     isCheckoutActive
// }) => {
//     const { cart, subtotal } = useCart()
//     const total = subtotal + shippingFee

//     return (
//         <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 sticky top-8">
//             <h2 className="text-xl font-bold text-gray-800 mb-4">
//                 Thông tin đơn hàng
//             </h2>

//             <div className="max-h-60 overflow-y-auto space-y-4 pr-2 mb-4 border-b pb-4">
//                 {cart.map(item => (
//                     <div key={item.id} className="flex items-center gap-4">
//                         <div className="relative">
//                             <img
//                                 src={item.image}
//                                 alt={item.name}
//                                 className="w-16 h-16 object-cover rounded-md"
//                             />
//                             <span className="absolute -top-2 -right-2 bg-gray-700 text-white text-xs font-semibold w-5 h-5 rounded-full flex items-center justify-center">
//                                 {item.quantity}
//                             </span>
//                         </div>
//                         <div className="flex-grow">
//                             <p className="font-medium text-sm text-gray-800">{item.name}</p>
//                             <p className="text-xs text-gray-500">
//                                 Size: {item.size} / Màu: {item.color}
//                             </p>
//                         </div>
//                         <p className="text-sm font-semibold text-gray-700">
//                             {formatPrice(item.price * item.quantity)}
//                         </p>
//                     </div>
//                 ))}
//             </div>

//             <div className="space-y-2 mb-6">
//                 <div className="flex">
//                     <input
//                         type="text"
//                         placeholder="Nhập mã giảm giá"
//                         className="flex-grow px-3 py-2 border border-gray-300 rounded-l-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm"
//                     />
//                     <button className="bg-gray-200 text-gray-700 font-semibold px-4 py-2 rounded-r-md hover:bg-gray-300 transition-colors text-sm">
//                         Áp dụng
//                     </button>
//                 </div>
//             </div>

//             <div className="space-y-3 text-gray-600">
//                 <div className="flex justify-between">
//                     <span>Tạm tính</span>
//                     <span className="font-medium text-gray-800">
//                         {formatPrice(subtotal)}
//                     </span>
//                 </div>
//                 <div className="flex justify-between">
//                     <span>Phí vận chuyển</span>
//                     <span className="font-medium text-gray-800">
//                         {formatPrice(shippingFee)}
//                     </span>
//                 </div>
//                 <div className="border-t pt-4 mt-2 flex justify-between font-bold text-lg text-gray-900">
//                     <span>Tổng cộng</span>
//                     <span>{formatPrice(total)}</span>
//                 </div>
//             </div>

//             <button
//                 onClick={onPlaceOrder}
//                 disabled={!isCheckoutActive}
//                 className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg mt-8 hover:bg-blue-700 transition-all duration-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
//             >
//                 Đặt hàng
//             </button>
//         </div>
//     )
// }

// export default CheckoutOrderSummary
