// src/components/ui/Button.jsx

import React from 'react';
import './Button.css'; // Bước 2: Import file CSS của bạn

/**
 * Component Button cơ bản
 * @param {object} props
 * @param {'default' | 'destructive' | 'outline'} [props.variant='default'] - Kiểu dáng của button
 * @param {'default' | 'sm' | 'lg'} [props.size='default'] - Kích thước của button
 * @param {string} [props.className] - Các class CSS tùy chỉnh thêm
 * @param {React.ReactNode} props.children - Nội dung bên trong button
 * @param {React.ButtonHTMLAttributes} props... - Các props khác của <button> (ví dụ: onClick, disabled, type)
 */
function Button({
  children,
  variant = 'default',
  size = 'default',
  className = '',
  ...props // Bắt các props còn lại như onClick, type, disabled
}) {

  // Xây dựng chuỗi class CSS
  // Ví dụ: "btn variant-default size-default my-custom-class"
  const buttonClasses = `
    btn
    variant-${variant}
    size-${size}
    ${className}
  `.trim(); // .trim() để xóa các khoảng trắng thừa

  // Render ra một <button> HTML bình thường
  return (
    <button
      className={buttonClasses}
      {...props} // Truyền tất cả các props còn lại (quan trọng nhất là onClick, disabled)
    >
      {children}
    </button>
  );
}

export { Button };