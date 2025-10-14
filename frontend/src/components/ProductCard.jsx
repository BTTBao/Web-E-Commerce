import React from 'react';
import { Link } from 'react-router-dom';
import { formatPrice } from '../utils/formatPrice';

export default function ProductCard({ product }){
  return (
    <div className="card h-100">
      <img src={product.imageURL || '/src/assets/logo.png'} className="card-img-top" alt={product.name} />
      <div className="card-body d-flex flex-column">
        <h5 className="card-title">{product.name}</h5>
        <p className="card-text mt-auto">{formatPrice(product.price)}</p>
        <Link to={`/product/${product.productID}`} className="btn btn-primary mt-2">View</Link>
      </div>
    </div>
  );
}
