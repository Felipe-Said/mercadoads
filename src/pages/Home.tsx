import React from 'react'
import { Stories } from '../components/Stories'
import { ProductGrid } from '../components/ProductCard'
import { HomeFeatures } from '../components/HomeFeatures'

export function Home() {
  return (
    <div className="bg-[#ebebeb] min-h-screen pb-12 w-full">
      <div className="w-full">
        <Stories />
      </div>
      <div className="max-w-[1200px] mx-auto mt-6">
        <HomeFeatures />
        <ProductGrid />
      </div>
    </div>
  )
}
