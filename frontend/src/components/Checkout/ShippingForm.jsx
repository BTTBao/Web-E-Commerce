// import { ChevronDownIcon } from "lucide-react"
// import React, { useState, useEffect } from "react"

// const InputField = ({ label, ...props }) => (
//     <div>
//         <label
//             htmlFor={props.id}
//             className="block text-sm font-medium text-gray-700 mb-1"
//         >
//             {label}
//         </label>
//         <input
//             {...props}
//             className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition-colors"
//         />
//     </div>
// )

// const SelectField = ({ label, children, ...props }) => (
//     <div className="relative">
//         <label
//             htmlFor={props.id}
//             className="block text-sm font-medium text-gray-700 mb-1"
//         >
//             {label}
//         </label>
//         <select
//             {...props}
//             className="appearance-none w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white pr-8"
//         >
//             {children}
//         </select>
//         <ChevronDownIcon className="w-5 h-5 text-gray-400 absolute right-3 top-9 pointer-events-none" />
//     </div>
// )
// const provinces = [
//     { id: "hcm", name: "TP. Hồ Chí Minh" },
//     { id: "hn", name: "Hà Nội" },
//     { id: "dn", name: "Đà Nẵng" }
// ]
// const districts = {
//     hcm: [
//         { id: "q1", name: "Quận 1" },
//         { id: "q3", name: "Quận 3" },
//         { id: "q_thu_duc", name: "Thành phố Thủ Đức" }
//     ],
//     hn: [
//         { id: "q_ba_dinh", name: "Quận Ba Đình" },
//         { id: "q_hoan_kiem", name: "Quận Hoàn Kiếm" },
//         { id: "q_cau_giay", name: "Quận Cầu Giấy" }
//     ],
//     dn: [
//         { id: "q_hai_chau", name: "Quận Hải Châu" },
//         { id: "q_thanh_khe", name: "Quận Thanh Khê" }
//     ]
// }
// const wards = {
//     q1: [
//         { id: "p_ben_nghe", name: "Phường Bến Nghé" },
//         { id: "p_ben_thanh", name: "Phường Bến Thành" }
//     ],
//     q3: [
//         { id: "p_vo_thi_sau", name: "Phường Võ Thị Sáu" },
//         { id: "p6_q3", name: "Phường 6" }
//     ],
//     q_thu_duc: [
//         { id: "p_thao_dien", name: "Phường Thảo Điền" },
//         { id: "p_an_phu", name: "Phường An Phú" }
//     ],
//     q_ba_dinh: [
//         { id: "p_truc_bach", name: "Phường Trúc Bạch" },
//         { id: "p_doi_can", name: "Phường Đội Cấn" }
//     ],
//     q_hoan_kiem: [
//         { id: "p_hang_trong", name: "Phường Hàng Trống" },
//         { id: "p_trang_tien", name: "Phường Tràng Tiền" }
//     ],
//     q_hai_chau: [
//         { id: "p_thach_thang", name: "Phường Thạch Thang" },
//         { id: "p_hoa_thuan_tay", name: "Phường Hòa Thuận Tây" }
//     ]
// }
// const ShippingForm = ({ onFormValidityChange }) => {
//     const [formData, setFormData] = useState({
//         email: "",
//         fullName: "",
//         phone: "",
//         address: "",
//         province: "",
//         district: "",
//         ward: "",
//         notes: ""
//     })

//     const [availableDistricts, setAvailableDistricts] = useState([])
//     const [availableWards, setAvailableWards] = useState([])

//     useEffect(() => {
//         if (formData.province) {
//             setAvailableDistricts(districts[formData.province] || [])
//             setFormData(f => ({ ...f, district: "", ward: "" }))
//         } else {
//             setAvailableDistricts([])
//         }
//     }, [formData.province])

//     useEffect(() => {
//         if (formData.district) {
//             setAvailableWards(wards[formData.district] || [])
//             setFormData(f => ({ ...f, ward: "" }))
//         } else {
//             setAvailableWards([])
//         }
//     }, [formData.district])

//     useEffect(() => {
//         const {
//             email,
//             fullName,
//             phone,
//             address,
//             province,
//             district,
//             ward
//         } = formData
//         const isValid = !!(
//             email &&
//             fullName &&
//             phone &&
//             address &&
//             province &&
//             district &&
//             ward
//         )
//         onFormValidityChange(isValid)
//     }, [formData, onFormValidityChange])

//     const handleChange = e => {
//         const { name, value } = e.target
//         setFormData(prev => ({ ...prev, [name]: value }))
//     }

//     return (
//         <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
//             <h2 className="text-xl font-bold text-gray-800 mb-6">
//                 Thông tin nhận hàng
//             </h2>
//             <div className="space-y-4">
//                 <InputField
//                     label="Email"
//                     id="email"
//                     name="email"
//                     type="email"
//                     value={formData.email}
//                     onChange={handleChange}
//                     required
//                     placeholder="example@email.com"
//                 />
//                 <InputField
//                     label="Họ và tên"
//                     id="fullName"
//                     name="fullName"
//                     type="text"
//                     value={formData.fullName}
//                     onChange={handleChange}
//                     required
//                     placeholder="Nguyễn Văn A"
//                 />
//                 <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
//                     <div className="sm:col-span-1 relative">
//                         <label
//                             htmlFor="country-code"
//                             className="block text-sm font-medium text-gray-700 mb-1"
//                         >
//                             Mã vùng
//                         </label>
//                         <select
//                             id="country-code"
//                             className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-gray-50"
//                         >
//                             <option>VN +84</option>
//                         </select>
//                     </div>
//                     <div className="sm:col-span-2">
//                         <InputField
//                             label="Số điện thoại"
//                             id="phone"
//                             name="phone"
//                             type="tel"
//                             value={formData.phone}
//                             onChange={handleChange}
//                             required
//                             placeholder="09xxxxxxxx"
//                         />
//                     </div>
//                 </div>
//                 <InputField
//                     label="Địa chỉ"
//                     id="address"
//                     name="address"
//                     type="text"
//                     value={formData.address}
//                     onChange={handleChange}
//                     required
//                     placeholder="Số nhà, tên đường"
//                 />

//                 <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
//                     <SelectField
//                         label="Tỉnh / Thành phố"
//                         id="province"
//                         name="province"
//                         value={formData.province}
//                         onChange={handleChange}
//                         required
//                     >
//                         <option value="">Chọn Tỉnh / Thành</option>
//                         {provinces.map(p => (
//                             <option key={p.id} value={p.id}>
//                                 {p.name}
//                             </option>
//                         ))}
//                     </SelectField>
//                     <SelectField
//                         label="Quận / Huyện"
//                         id="district"
//                         name="district"
//                         value={formData.district}
//                         onChange={handleChange}
//                         required
//                         disabled={!formData.province}
//                     >
//                         <option value="">Chọn Quận / Huyện</option>
//                         {availableDistricts.map(d => (
//                             <option key={d.id} value={d.id}>
//                                 {d.name}
//                             </option>
//                         ))}
//                     </SelectField>
//                     <SelectField
//                         label="Phường / Xã"
//                         id="ward"
//                         name="ward"
//                         value={formData.ward}
//                         onChange={handleChange}
//                         required
//                         disabled={!formData.district}
//                     >
//                         <option value="">Chọn Phường / Xã</option>
//                         {availableWards.map(w => (
//                             <option key={w.id} value={w.id}>
//                                 {w.name}
//                             </option>
//                         ))}
//                     </SelectField>
//                 </div>

//                 <div>
//                     <label
//                         htmlFor="notes"
//                         className="block text-sm font-medium text-gray-700 mb-1"
//                     >
//                         Ghi chú (tùy chọn)
//                     </label>
//                     <textarea
//                         id="notes"
//                         name="notes"
//                         value={formData.notes}
//                         onChange={handleChange}
//                         rows={3}
//                         className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition-colors"
//                         placeholder="Ghi chú thêm về đơn hàng..."
//                     ></textarea>
//                 </div>
//             </div>
//         </div>
//     )
// }

// export default ShippingForm
