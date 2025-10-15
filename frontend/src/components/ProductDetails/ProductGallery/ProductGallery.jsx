import React from 'react'
import './ProductGallery.css'
import { Swiper, SwiperSlide } from 'swiper/react';
import { useState } from 'react';
import { Navigation, Thumbs } from 'swiper/modules';

function ProductGallery() {
  const [activeThumb, setActiveThumb] = useState()

  const productImages = [
    'https://bizweb.dktcdn.net/100/369/010/products/1-766e4f7f-a950-45ec-a2e2-bf34a27e55a7.jpg?v=1758191321937',
    'https://bizweb.dktcdn.net/100/369/010/products/2-2acf9b5f-a28b-4252-b8ee-6174e0262b28.jpg?v=1758191324603',
    'https://bizweb.dktcdn.net/100/369/010/products/artboard-1-copy-de028d47-62f9-4d34-97aa-fc8ac9abc4aa.jpg?v=1758191333123',
    'https://bizweb.dktcdn.net/100/369/010/products/artboard-1-86a7ebdd-6013-4d8c-a9c3-f0ab9c406648.jpg?v=1758191333123',
    'https://bizweb.dktcdn.net/100/369/010/products/artboard-1-copy-2-36165807-eead-40e3-b89d-abc83fd98a5c.jpg?v=1758191330757'
  ];
  return (
    <>
      <div className="gallery">
        <Swiper
          loop={true}
          spaceBetween={10}
          navigation={true}
          modules={[Navigation, Thumbs]}
          grabCursor={true}
          thumbs={{ swiper: activeThumb }}
          className='product-images-slider'
        >
          {
            productImages.map((item, index) => (
              <SwiperSlide key={index}>
                <img id="mainImage" src={item} alt="Product" />
              </SwiperSlide>
            ))
          }
        </Swiper>

        {/* Thumbs */}
        <Swiper
          onSwiper={setActiveThumb}
          loop={true}
          spaceBetween={10}
          slidesPerView={4}
          modules={[Navigation, Thumbs]}
          className='product-images-slider-thumbs'
        >
          {
            productImages.map((item, index) => (
              <SwiperSlide key={index}>
                <div className="product-images-slider-thumbs-wrapper">
                  <img src={item} alt="product images" />
                </div>
              </SwiperSlide>
            ))
          }
        </Swiper>
      </div>
    </>
  )
}

export default ProductGallery