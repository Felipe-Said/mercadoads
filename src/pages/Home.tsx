import React from 'react'
import { Stories } from '../components/Stories'
import { Banners } from '../components/Banners'
import { ProductGrid } from '../components/ProductCard'
import { HomeFeatures } from '../components/HomeFeatures'

export function Home() {
  return (
    <div className="bg-[#ebebeb] min-h-screen pb-12 w-full overflow-hidden">
      <div className="max-w-[1200px] mx-auto pt-6 px-4">
        <Stories />
      </div>

      <div className="w-full">
        <Banners />
      </div>

      <div className="max-w-[1200px] mx-auto px-4">
        <div className="hidden md:block">
          <HomeFeatures />
        </div>

        <div className="mt-8">
          <ProductGrid />
        </div>
      </div>
    </div>
  )
}
