import React, { useEffect, useState } from 'react';
import productApi from '../api/productApi';
import ProductCard from '../components/ProductCard';
import Loader from '../components/Loader';

export default function Home(){
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(()=>{
    productApi.getAll().then(res=>{
      setProducts(res.data || []);
    }).catch(()=>{}).finally(()=>setLoading(false));
  },[]);

  if(loading) return <Loader />;

  return (
    <div>
      <h1>Featured products</h1>
      <div className="row g-3">
        {products.map(p=>(
          <div className="col-md-3" key={p.productID}>
            <ProductCard product={p} />
          </div>
        ))}
      </div>
    </div>
  );
}
