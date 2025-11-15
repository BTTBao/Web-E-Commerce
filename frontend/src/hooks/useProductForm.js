// src/hooks/useProductForm.js

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';

// --- SỬA 1: Bỏ config Cloudinary ---
const API_BASE_URL = 'https://localhost:7132/api';
// const CLOUD_NAME = "YOUR_CLOUD_NAME"; // <-- Bỏ
// const UPLOAD_PRESET = "YOUR_UPLOAD_PRESET"; // <-- Bỏ

const makeLocalId = () =>
  (typeof crypto !== 'undefined' && crypto.randomUUID)
    ? crypto.randomUUID()
    : 'v-' + Date.now() + '-' + Math.random().toString(36).slice(2);

// 2. Đây chính là "Controller" của bạn
export function useProductForm(productId) {
  const navigate = useNavigate();

  // --- State chung ---
  const [loading, setLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  // (State isUploading đã được chuyển vào ProductImageManager.jsx)
  const [categories, setCategories] = useState([]);

  // --- State Form chính ---
  const [name, setName] = useState('');
  // ... (các state khác giữ nguyên)
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [status, setStatus] = useState('Active');
  const [basePrice, setBasePrice] = useState(0);
  const [baseStock, setBaseStock] = useState(0);

  // --- SỬA 2: State 'images' giờ là object ---
  const [images, setImages] = useState([]); // Sẽ là: { imageUrl, imagePublicId }[]
  const [primaryImageIndex, setPrimaryImageIndex] = useState(0);

  // --- State Biến thể ---
  const [variants, setVariants] = useState([]);

  // --- 3. Logic Fetch Dữ liệu (Cập nhật) ---
  useEffect(() => {
    // Luôn tải danh mục
    axios.get(`${API_BASE_URL}/category`)
      .then(res => setCategories(res.data || []))
      .catch(err => console.error('Lỗi fetch danh mục:', err));

    // Nếu là trang "Sửa", tải chi tiết sản phẩm
    if (productId) {
      setLoading(true);
      fetch(`${API_BASE_URL}/product/${productId}`)
        .then((res) => { if (!res.ok) throw new Error('Lỗi tải sản phẩm'); return res.json(); })
        .then((data) => {
          const p = data.data;
          setName(p?.name || '');
          setDescription(p?.description || '');
          setCategoryId(p?.categoryId || '');
          setStatus(p?.status || 'Active');
          
          // --- SỬA 2.1: Cập nhật logic load ảnh ---
          // const imgs = (p?.productImages || []).map(img => img?.imageUrl || ''); <-- CŨ
          const imgs = (p?.productImages || []).map(img => ({
            imageUrl: img?.imageUrl || '',
            imagePublicId: img?.imagePublicId || null
          }));
          setImages(imgs);
          // --- Hết sửa ---

          const primaryIdx = Math.max(0, (p?.productImages || []).findIndex(img => img?.isPrimary));
          setPrimaryImageIndex(primaryIdx === -1 ? 0 : primaryIdx);
          setVariants((p?.productVariants || []).map(v => ({
            LocalId: makeLocalId(),
            VariantID: v.variantId ?? v.variantID ?? v.id ?? 0,
            Size: v.size ?? v.Size ?? '',
            Color: v.color ?? v.Color ?? '',
            SKU: v.sku ?? v.SKU ?? '',
            Price: Number(v.price ?? v.Price ?? 0),
            StockQuantity: Number(v.stockQuantity ?? v.StockQuantity ?? 0),
          })));
          setBasePrice(Number(p?.price || 0));
          setBaseStock(Number(p?.stockQuantity || 0));
          setLoading(false);
        })
        .catch((err) => { console.error(err); setLoading(false); });
    }
  }, [productId]);

  // --- 4. Logic Xử lý Ảnh (SỬA LẠI HOÀN TOÀN) ---
  const handleImageUpload = async (file) => {
    if (!file) return;

    // Tạo FormData để gửi file
    const formData = new FormData();
    formData.append('file', file); // 'file' phải khớp với [ApiController] C#

    // (setIsUploading đã nằm trong component con)
    try {
      // Gọi API C# của bạn (UploadController)
      const res = await axios.post(`${API_BASE_URL}/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data' // Quan trọng
        }
      });

      if (res.data.status === 'success') {
        // 4.1. Lấy object { imageUrl, imagePublicId } từ C#
        const newImage = {
          imageUrl: res.data.imageUrl,
          imagePublicId: res.data.imagePublicId
        };
        
        // 4.2. Thêm object này vào state
        setImages((prev) => [...prev, newImage]);
        
        if (images.length === 0) setPrimaryImageIndex(0);
      } else {
        throw new Error(res.data.message || 'Tải ảnh thất bại');
      }
    } catch (err) {
      console.error(err);
      const errorMsg = err.response?.data?.message || err.message || "Lỗi khi tải ảnh lên server.";
      toast.error(errorMsg);
    } 
    // (finally: setIsUploading đã nằm trong component con)
  };

  const removeImage = (idx) => {
    // (Nâng cao: bạn có thể gọi API C# để xóa ảnh khỏi Cloudinary
    // bằng imagePublicId tại đây nếu muốn)
    setImages((prev) => prev.filter((_, i) => i !== idx));
  };

  // --- 5. Logic Xử lý Biến thể (Giữ nguyên) ---
  const saveVariant = (form, editingLocalId) => {
    // ... (Giữ nguyên logic của bạn) ...
    const isDuplicateSKU = variants.some((v) =>
      v.SKU.trim().toLowerCase() === form.SKU.trim().toLowerCase() &&
      v.LocalId !== editingLocalId
    );
    if (isDuplicateSKU) {
      toast.error('SKU đã tồn tại trong danh sách.');
      return false;
    }
    if (editingLocalId) {
      setVariants((prev) =>
        prev.map((v) =>
          v.LocalId === editingLocalId ? { ...v, ...form } : v
        )
      );
    } else {
      setVariants((prev) => [
        ...prev,
        { ...form, LocalId: makeLocalId(), VariantID: 0 }
      ]);
    }
    return true; 
  };

  const removeVariant = (localId) => setVariants((prev) => prev.filter((v) => v.LocalId !== localId));

  // --- 6. Logic Submit chính (CẬP NHẬT) ---
  const handleSubmit = async () => {
    if (!name.trim()) { toast.error('Vui lòng nhập tên sản phẩm'); return; }
    if (!variants.length && (basePrice ?? 0) < 0) { toast.error('Giá không hợp lệ'); return; }

    setIsSaving(true);

    // --- SỬA 6.1: Cập nhật payload ảnh ---
    // 'images' bây giờ là mảng object
    const productImagesPayload = images.map((img, idx) => ({
      imageUrl: img.imageUrl,
      imagePublicId: img.imagePublicId, // <-- Gửi PublicId về C#
      isPrimary: idx === primaryImageIndex
    }));
    // --- Hết sửa ---
    
    const productVariantsPayload = variants.map(v => ({
      variantId: v.VariantID ? Number(v.VariantID) : 0,
      size: v.Size || null,
      color: v.Color || null,
      sku: (v.SKU || '').trim(),
      price: v.Price != null ? Number(v.Price) : null,
      stockQuantity: v.StockQuantity != null ? Number(v.StockQuantity) : null,
    }));

    const buildPayload = (pid) => ({
      // (Giữ nguyên logic buildPayload của bạn)
      productId: pid || 0,
      categoryId: categoryId ? Number(categoryId) : null,
      name,
      description,
      price: variants.length ? null : (basePrice != null ? Number(basePrice) : null),
      stockQuantity: variants.length ? null : (baseStock != null ? Number(baseStock) : null),
      status,
      productImages: productImagesPayload.map(x => ({ ...x, productId: pid || 0 })),
      productVariants: productVariantsPayload.map(x => ({ ...x, productId: pid || 0 })),
    });

    try {
      // (Logic POST 2 bước và PUT 1 bước của bạn giữ nguyên)
      if (!productId) { 
        const payloadCreate = buildPayload(0);
        payloadCreate.productImages = [];
        payloadCreate.productVariants = [];

        const resCreate = await axios.post(`${API_BASE_URL}/product`, payloadCreate);
        const newId = resCreate?.data?.data?.productId || resCreate?.data?.data?.ProductId;
        if (!newId) throw new Error('Không nhận được ProductId khi tạo sản phẩm');

        const payloadFull = buildPayload(Number(newId));
        await axios.put(`${API_BASE_URL}/product/${newId}`, payloadFull);
        toast.success('Tạo sản phẩm thành công');

      } else { 
        const payloadFull = buildPayload(Number(productId));
        await axios.put(`${API_BASE_URL}/product/${productId}`, payloadFull);
        toast.success('Cập nhật sản phẩm thành công');
      }
      navigate('/admin/products');
    } catch (err) {
      console.error('Lỗi lưu sản phẩm:', err?.response?.data || err);
      toast.success(err?.response?.data?.message || 'Có lỗi xảy ra khi lưu sản phẩm');
    } finally {
      setIsSaving(false);
    }
  };

  // --- 7. Trả về mọi thứ cho View (Giữ nguyên) ---
  return {
    // Trạng thái
    loading,
    isSaving,
    // isUploading (đã chuyển vào component con)
    
    // Dữ liệu
    states: {
      name,
      description,
      categoryId,
      status,
      basePrice,
      baseStock,
      images, // <- Sẽ là mảng object
      primaryImageIndex,
      variants,
      categories,
    },

    // Hàm set (cho input)
    setters: {
      setName,
      setDescription,
      setCategoryId,
      setStatus,
      setBasePrice,
      setBaseStock,
      setPrimaryImageIndex,
    },

    // Hàm xử lý
    handlers: {
      handleBack: () => navigate('/admin/products'),
      handleSubmit,
      handleImageUpload, // <- Hàm này đã thay đổi
      removeImage,
      saveVariant,
      removeVariant,
    }
  };
}