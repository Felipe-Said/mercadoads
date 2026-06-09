import React from 'react'
import { Stories } from '../components/Stories'
import { Banners } from '../components/Banners'
import { ProductGrid } from '../components/ProductCard'

export function Home() {
  return (
    <>
      <Stories />
      <Banners />
      <ProductGrid />
    </>
  )
}
