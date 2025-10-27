import './Category.css'

export default function CategoryItem({ category }) {
  return (
    <li className="category-item">
      {category.categoryName}
    </li>
  );
}
