import React, { useState, useEffect } from "react";
import { ChevronDownIcon } from "lucide-react";
import "./css/ShippingForm.css";
import provinces from '../../../data/provinces.json'
import districts from '../../../data/districts.json'
import wards from '../../../data/wards.json'

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

function ShippingForm({ onFormValidityChange }) {
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

    useEffect(() => {
        if (formData.province) {
            const filtered = districts.filter(
                (d) => d.province_code === Number(formData.province)
            );
            setAvailableDistricts(filtered);
            setFormData((f) => ({ ...f, district: "", ward: "" }));
        } else {
            setAvailableDistricts([]);
        }
    }, [formData.province]);

    useEffect(() => {
        if (formData.district) {
            const filtered = wards.filter(
                (d) => d.district_code === Number(formData.district)
            );
            setAvailableWards(filtered);
            setFormData(f => ({ ...f, ward: "" }));
        } else {
            setAvailableWards([]);
        }
    }, [formData.district]);

    useEffect(() => {
        const { email, fullName, phone, address, province, district, ward } = formData;
        const isValid = !!(
            email.includes("@") &&
            fullName &&
            phone.length >= 9 &&
            address &&
            province &&
            district &&
            ward
        );
        onFormValidityChange(isValid);
    }, [formData, onFormValidityChange]);

    const handleChange = e => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    return (
        <div className="shipping-form-box">
            <h2 className="shipping-title">Thông tin nhận hàng</h2>

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
                        {console.log("availableDistricts:", availableDistricts)}
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
                    ></textarea>
                </div>
            </div>
        </div>
    );
}

export default ShippingForm