import React from 'react'
import ProductGallery from '../components/ProductDetails/ProductGallery/ProductGallery'
import ProductInfo from '../components/ProductDetails/ProductInfo/ProductInfo'
import ProductRelated from '../components/ProductDetails/ProductRelated/ProductRelated'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/thumbs'

function ProductDetail() {
  return (
    <>
      <div className="container row mx-auto my-5">
        <div className="col-12 col-lg-7">
          <ProductGallery />
        </div>
        <div className="col-12 col-lg-5">
          <ProductInfo />
        </div>
        <ProductRelated />
      </div>
    </>
  )
}

export default ProductDetail