import { useState, useEffect } from "react";
import { ChevronDownIcon, Pencil, PlusCircle } from "lucide-react";
import "./css/ShippingForm.css";
import provinces from '../../../data/provinces.json';
import districts from '../../../data/districts.json';
import wards from '../../../data/wards.json';
import axiosClient from "../../api/axiosClient";
import { useOrder } from "../../hooks/useOrder";
import { useNavigate } from "react-router-dom";

const InputField = ({ label, ...props }) => (
    <div className="form-group-custom">
        <label htmlFor={props.id} className="form-label-custom">
            {label}
        </label>
        <input {...props} className="form-input" />
    </div>
);

const SelectField = ({ label, children, ...props }) => (
    <div className="form-group-custom select-wrapper">
        <label htmlFor={props.id} className="form-label-custom">
            {label}
        </label>
        <select {...props} className="form-select">
            {children}
        </select>
        <ChevronDownIcon className="select-icon" size={18} />
    </div>
);

function ShippingForm({ onFormValidityChange, account }) {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: "",
        fullName: "",
        phone: "",
        address: "",
        province: "",
        district: "",
        ward: "",
        notes: ""
    });
    const [availableDistricts, setAvailableDistricts] = useState([]);
    const [availableWards, setAvailableWards] = useState([]);
    const [hasAddress, setHasAddress] = useState(true);
    const { updateOrderData } = useOrder();

    // Lấy địa chỉ mặc định
    useEffect(() => {
        const fetchAddress = async () => {
            try {
                const res = await axiosClient.get(`/Address/get?accountId=${account.accountId}`);
                const addresses = res.data || [];

                if (addresses.length === 0) {
                    setHasAddress(false);
                    return;
                }
                setHasAddress(true);
                const defaultAddress = addresses.find(a => a.isDefault) || addresses[0];

                // Find codes from names
                const provinceCode = provinces.find(p => p.name === defaultAddress.province)?.code || "";
                const filteredDistricts = districts.filter(d => d.province_code === Number(provinceCode));
                const districtCode = filteredDistricts.find(d => d.name === defaultAddress.district)?.code || "";
                const filteredWards = wards.filter(w => w.district_code === Number(districtCode));
                const wardCode = filteredWards.find(w => w.name === defaultAddress.ward)?.code || "";

                // Update form data
                setFormData({
                    email: account.email,
                    fullName: defaultAddress.receiverFullName || "",
                    phone: defaultAddress.receiverPhone || "",
                    address: defaultAddress.addressLine || "",
                    province: provinceCode,
                    district: districtCode,
                    ward: wardCode,
                    notes: ""
                });

                // Update available options
                setAvailableDistricts(filteredDistricts);
                setAvailableWards(filteredWards);

                // Update order data
                updateOrderData("accountId", account.accountId);
                updateOrderData("addressId", defaultAddress.addressId);
            } catch (error) {
                console.error("Failed to fetch address:", error);
            }
        };

        if (account?.accountId) {
            fetchAddress();
        }
    }, [account, updateOrderData]);

    // Cập nhật các huyện khi tỉnh thay đổi
    useEffect(() => {
        if (!formData.province) {
            setAvailableDistricts([]);
            setAvailableWards([]);
            return;
        }

        const filtered = districts.filter(d => d.province_code === Number(formData.province));
        setAvailableDistricts(filtered);

        // Reset district and ward if province changed
        setFormData(prev => ({ ...prev, district: "", ward: "" }));
    }, [formData.province]);

    // Cập nhật phường khi quận thay đổi
    useEffect(() => {
        if (!formData.district) {
            setAvailableWards([]);
            return;
        }

        const filtered = wards.filter(w => w.district_code === Number(formData.district));
        setAvailableWards(filtered);

        // Reset ward if district changed
        setFormData(prev => ({ ...prev, ward: "" }));
    }, [formData.district]);

    // Validate form
    useEffect(() => {
        const { email, fullName, phone, address, province, district, ward } = formData;
        const isValid =
            email.includes("@") &&
            fullName.trim() !== "" &&
            phone.length >= 9 &&
            address.trim() !== "" &&
            province &&
            district &&
            ward;

        onFormValidityChange(isValid);
    }, [formData, onFormValidityChange]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    return (
        <div className="shipping-form-box">
            <div className="my-3 d-flex justify-content-between">
                <h2 className="shipping-title">Thông tin nhận hàng</h2>
                {!hasAddress ? (
                    <button
                        onClick={() => navigate('/profile')}
                        className="btn-address add">
                        <PlusCircle size={18} />
                        <span>Thêm địa chỉ</span>
                    </button>
                ) : (
                    <button
                        onClick={() => navigate('/profile')}
                        className="btn-address edit">
                        <Pencil size={18} />
                        <span>Chỉnh sửa địa chỉ</span>
                    </button>
                )}
            </div>

            {hasAddress && (
                <div className="row gy-3">
                    <div className="col-12">
                        <InputField
                            label="Email"
                            id="email"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            placeholder="example@email.com"
                        />
                    </div>

                    <div className="col-12 col-md-6">
                        <InputField
                            label="Họ và tên"
                            id="fullName"
                            name="fullName"
                            type="text"
                            value={formData.fullName}
                            onChange={handleChange}
                            required
                            placeholder="Nguyễn Văn A"
                        />
                    </div>

                    <div className="col-12 col-md-6">
                        <InputField
                            label="Số điện thoại"
                            id="phone"
                            name="phone"
                            type="tel"
                            value={formData.phone}
                            onChange={handleChange}
                            required
                            placeholder="09xxxxxxxx"
                        />
                    </div>

                    <div className="col-12">
                        <InputField
                            label="Địa chỉ"
                            id="address"
                            name="address"
                            type="text"
                            value={formData.address}
                            onChange={handleChange}
                            required
                            placeholder="Số nhà, tên đường"
                        />
                    </div>

                    <div className="col-12 col-md-4">
                        <SelectField
                            label="Tỉnh / Thành phố"
                            id="province"
                            name="province"
                            value={formData.province}
                            onChange={handleChange}
                            required
                        >
                            <option value="">Chọn Tỉnh / Thành</option>
                            {provinces.map(p => (
                                <option key={p.code} value={p.code}>{p.name}</option>
                            ))}
                        </SelectField>
                    </div>

                    <div className="col-12 col-md-4">
                        <SelectField
                            label="Quận / Huyện"
                            id="district"
                            name="district"
                            value={formData.district}
                            onChange={handleChange}
                            required
                            disabled={!formData.province}
                        >
                            <option value="">Chọn Quận / Huyện</option>
                            {availableDistricts.map(d => (
                                <option key={d.code} value={d.code}>{d.name}</option>
                            ))}
                        </SelectField>
                    </div>

                    <div className="col-12 col-md-4">
                        <SelectField
                            label="Phường / Xã"
                            id="ward"
                            name="ward"
                            value={formData.ward}
                            onChange={handleChange}
                            required
                            disabled={!formData.district}
                        >
                            <option value="">Chọn Phường / Xã</option>
                            {availableWards.map(w => (
                                <option key={w.code} value={w.code}>{w.name}</option>
                            ))}
                        </SelectField>
                    </div>

                    <div className="col-12">
                        <label htmlFor="notes" className="form-label-custom">
                            Ghi chú (tùy chọn)
                        </label>
                        <textarea
                            id="notes"
                            name="notes"
                            value={formData.notes}
                            onChange={handleChange}
                            rows={3}
                            className="form-input"
                            placeholder="Ghi chú thêm về đơn hàng..."
                        />
                    </div>
                </div>
            )}
        </div>
    );
}

export default ShippingForm;