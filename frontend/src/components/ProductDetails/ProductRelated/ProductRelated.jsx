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
        setProducts(res.data);
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
      <div class="related-grid">
        <div class="related-item">
          <div class="related-image">
            <img src="https://bizweb.dktcdn.net/thumb/large/100/369/010/products/1-4bb3ead8-d129-409e-b305-6d3f484908b4.jpg?v=1751531642017" alt="Product 1" />
          </div>
          <h3 class="related-name">DirtyCoins Patch In Heart White</h3>
          <p class="related-price">450.000₫</p>
        </div>
        <div class="related-item">
          <div class="related-image">
            <img src="https://bizweb.dktcdn.net/thumb/large/100/369/010/products/1-76a596b0-832b-4030-ac28-a66f28a3eee5.jpg?v=1751532231967" alt="Product 2" />
          </div>
          <h3 class="related-name">DirtyCoins Basic Tee Black</h3>
          <p class="related-price">350.000₫</p>
        </div>
        <div class="related-item">
          <div class="related-image">
            <img src="https://bizweb.dktcdn.net/thumb/large/100/369/010/products/1-ba73d6eb-672b-4d72-a452-69b05e954578.jpg?v=1752488786040" alt="Product 3" />
          </div>
          <h3 class="related-name">DirtyCoins Logo Tee Grey</h3>
          <p class="related-price">390.000₫</p>
        </div>
        <div class="related-item">
          <div class="related-image">
            <img src="https://bizweb.dktcdn.net/thumb/large/100/369/010/products/2-395b12fd-5269-4c05-beb9-db499d73d79e.jpg?v=1752489000513" alt="Product 4" />
          </div>
          <h3 class="related-name">DirtyCoins Vintage Tee Navy</h3>
          <p class="related-price">420.000₫</p>
        </div>
      </div>
    </div>
  )
}

export default ProductRelated