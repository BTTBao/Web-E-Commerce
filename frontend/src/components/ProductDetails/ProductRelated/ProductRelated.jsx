import React, { useEffect, useState } from 'react'
import './ProductRelated.css'
import productApi from '../../../api/productApi';
import ProductGrid from '../../ProductGrid/ProductGrid';

function ProductRelated({ category }) {
  const [products, setProducts] = useState([]);
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await productApi.getAll();
        setProducts(res.data.data);
      } catch (err) {
        console.error(err)
      } 
    }
    fetchProducts()
  }, [])
  return (
    <div class="related-products">
      <h2>CÁC SẢN PHẨM KHÁC</h2>
      {<ProductGrid products = {products}/>}
    </div>
  )
}

export default ProductRelated