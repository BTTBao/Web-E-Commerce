export function formatPrice(price){
  if(price == null) return "—";
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
}
