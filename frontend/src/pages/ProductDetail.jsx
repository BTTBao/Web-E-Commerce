import React, { useEffect } from 'react'
import ProductGallery from '../components/ProductDetails/ProductGallery/ProductGallery'
import ProductInfo from '../components/ProductDetails/ProductInfo/ProductInfo'
import ProductRelated from '../components/ProductDetails/ProductRelated/ProductRelated'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/thumbs'
import productApi from '../api/productApi'
import { useParams } from 'react-router-dom'
import { useState } from 'react'
import ProductGrid from '../components/ProductGrid/ProductGrid'

function ProductDetail() {
  const { id } = useParams()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true)
        const res = await productApi.getById(id)
        setProduct(res.data)
      } catch (err) {
        console.error(err)
        setError('Không thể tải sản phẩm')
      } finally {
        setLoading(false)
      }
    }
    fetchProduct()
  }, [id])

  if (loading) return <h3 className="text-center my-5">Đang tải...</h3>
  if (error) return <h3 className="text-center text-danger my-5">{error}</h3>
  if (!product) return null
  return (
    <>
      <div className="row mx-auto my-5">
        <div className="col-12 col-lg-7">
          <ProductGallery images={product.productImages} />
        </div>
        <div className="col-12 col-lg-5">
          <ProductInfo product={product}/>
        </div>
        <ProductRelated category = {product.categoryId}/>
      </div>
    </>
  )
}

export default ProductDetail