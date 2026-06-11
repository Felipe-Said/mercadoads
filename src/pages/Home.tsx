import React from 'react'
import { Stories } from '../components/Stories'
import { Banners } from '../components/Banners'
import { ProductGrid } from '../components/ProductCard'
import { HomeFeatures } from '../components/HomeFeatures'

export function Home() {
  return (
    <div className="bg-[#f8fafc] min-h-screen pb-16 w-full font-sans text-gray-900">
      
      {/* 1. Hero Banner (Centered, Rounded, Premium) */}
      <div className="max-w-[1200px] mx-auto pt-6 px-4 lg:px-0">
        <Banners />
      </div>

      <div className="max-w-[1200px] mx-auto px-4 lg:px-0">
        {/* 2. Categorias Rápidas / Grupos de Network */}
        <div className="mt-6">
          <Stories />
        </div>

        {/* 3. Recursos de Confiança Limpos */}
        <div className="mt-8">
          <HomeFeatures />
        </div>

        {/* 4. Vitrine Premium */}
        <div className="mt-12">
          <ProductGrid />
        </div>
      </div>
    </div>
  )
}
