// src/components/CategoryList.jsx
import React from 'react';
import CategoryItem from './CategoryItem';

export default function CategoryList({ categories }) {
  return (
    <ul className="category-list">
      {categories.map(cat => (
        <CategoryItem key={cat.categoryID} category={cat} />
      ))}
    </ul>
  );
}
