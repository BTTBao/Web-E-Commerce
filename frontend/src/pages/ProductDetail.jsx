import React, { useEffect, useState, useContext } from 'react';
import { useParams } from 'react-router-dom';
import productApi from '../api/productApi';
import Loader from '../components/Loader';
import { CartContext } from '../context/CartContext';
import { formatPrice } from '../utils/formatPrice';

export default function ProductDetail(){
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading,setLoading] = useState(true);
  const { addToCart } = useContext(CartContext);

  useEffect(()=>{
    productApi.getById(id).then(res=>setProduct(res.data)).catch(()=>{}).finally(()=>setLoading(false));
  },[id]);

  if(loading) return <Loader />;
  if(!product) return <div>Not found</div>;

  return (
    <div className="row">
      <div className="col-md-6">
        <img src={product.imageURL || '/src/assets/logo.png'} alt={product.name} className="img-fluid" />
      </div>
      <div className="col-md-6">
        <h2>{product.name}</h2>
        <p>{formatPrice(product.price)}</p>
        <p>{product.description}</p>
        <button className="btn btn-success" onClick={()=>addToCart({productID:product.productID, name:product.name, price:product.price, imageURL:product.imageURL})}>Add to cart</button>
      </div>
    </div>
  );
}
