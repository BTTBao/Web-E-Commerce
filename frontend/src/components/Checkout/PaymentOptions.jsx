// import { Landmark, Truck } from "lucide-react"
// import React, { useState } from "react"

// const paymentMethods = [
//     { id: "cod", name: "Thanh toán khi nhận hàng (COD)", icon: <Truck /> },
//     { id: "vnpay", name: "VNPAY", icon: <Landmark /> },
// ]

// const PaymentOptions = () => {
//     const [selectedMethod, setSelectedMethod] = useState("cod")

//     return (
//         <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
//             <h2 className="text-xl font-bold text-gray-800 mb-6">
//                 Phương thức thanh toán
//             </h2>
//             <div className="space-y-4">
//                 {paymentMethods.map(method => (
//                     <label
//                         key={method.id}
//                         htmlFor={method.id}
//                         className={`flex items-center p-4 border rounded-lg cursor-pointer transition-all duration-200 ${selectedMethod === method.id
//                                 ? "border-blue-500 bg-blue-50 ring-2 ring-blue-200"
//                                 : "border-gray-300 bg-white hover:border-gray-400"
//                             }`}
//                     >
//                         <input
//                             type="radio"
//                             id={method.id}
//                             name="paymentMethod"
//                             value={method.id}
//                             checked={selectedMethod === method.id}
//                             onChange={() => setSelectedMethod(method.id)}
//                             className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
//                         />
//                         <span className="ml-4 flex-grow text-sm font-medium text-gray-800">
//                             {method.name}
//                         </span>
//                         <div className="ml-auto">{method.icon}</div>
//                     </label>
//                 ))}
//             </div>
//         </div>
//     )
// }

// export default PaymentOptions
