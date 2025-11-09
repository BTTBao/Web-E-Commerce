import React from 'react'
import './ProductGallery.css'
import { Swiper, SwiperSlide } from 'swiper/react';
import { useState } from 'react';
import { Navigation, Thumbs } from 'swiper/modules';

function ProductGallery({ images = [] }) {
  const [activeThumb, setActiveThumb] = useState()

  if (!Array.isArray(images) || images.length === 0) {
    return <p>Không có hình ảnh sản phẩm</p>
  }

  return (
    <>
      <div className="gallery">
        <Swiper
          loop={images.length > 1}
          spaceBetween={10}
          navigation={true}
          modules={[Navigation, Thumbs]}
          grabCursor={true}
          thumbs={{ swiper: activeThumb }}
          className='product-images-slider'
        >
          {
            images.map((item, index) => (
              <SwiperSlide key={index}>
                <img id="mainImage" src={item.imageUrl} alt="Product" />
              </SwiperSlide>
            ))
          }
        </Swiper>

        {/* Thumbs */}
        {
          images.length > 1 &&
          <Swiper
            onSwiper={setActiveThumb}
            loop={images.length > 2}
            spaceBetween={10}
            slidesPerView={images.length}
            modules={[Navigation, Thumbs]}
            className='product-images-slider-thumbs'
          >
            {
              images.map((item, index) => (
                <SwiperSlide key={item.imageId}>
                  <div className="product-images-slider-thumbs-wrapper">
                    <img src={item.imageUrl} alt="product images" />
                  </div>
                </SwiperSlide>
              ))
            }
          </Swiper>
        }
      </div>
    </>
  )
}

export default ProductGallery