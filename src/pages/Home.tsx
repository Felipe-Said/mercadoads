import React from 'react'
import { Stories } from '../components/Stories'
import { Banners } from '../components/Banners'
import { ProductGrid } from '../components/ProductCard'
import { HomeFeatures } from '../components/HomeFeatures'

export function Home() {
  return (
    <>
      <Stories />
      <Banners />
      <HomeFeatures />
      <ProductGrid />
    </>
  )
}
