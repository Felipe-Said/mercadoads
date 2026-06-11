import React from 'react'
import { Stories } from '../components/Stories'
import { Banners } from '../components/Banners'
import { ProductGrid } from '../components/ProductCard'
import { HomeFeatures } from '../components/HomeFeatures'

export function Home() {
  return (
    <div className="bg-[#ebebeb] min-h-screen pb-12 w-full">
      <div className="w-full">
        <Banners />
      </div>

      <div className="max-w-[1200px] mx-auto mt-6 px-4">
        {/* HomeFeatures uses negative margin internally to overlap the banner */}
        <div className="hidden md:block">
          <HomeFeatures />
        </div>
        
        <div className="mt-8">
          <Stories />
        </div>

        <div className="mt-8">
          <ProductGrid />
        </div>
      </div>
    </div>
  )
}
