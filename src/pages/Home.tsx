import React from 'react'
import { Stories } from '../components/Stories'
import { Banners } from '../components/Banners'
import { ProductGrid } from '../components/ProductCard'
import { HomeFeatures } from '../components/HomeFeatures'

export function Home() {
  return (
    <div className="bg-[#ebebeb] min-h-screen pb-12 w-full overflow-hidden">
      {/* 1. Hero Banner no topo absoluto */}
      <div className="w-full">
        <Banners />
      </div>

      {/* Container principal para o conteúdo */}
      <div className="max-w-[1200px] mx-auto px-4 lg:px-0">
        
        {/* 2. Recursos flutuando sobre o banner */}
        <div className="relative z-20 hidden md:block">
          <HomeFeatures />
        </div>

        {/* 3. Categorias/Grupos logo abaixo */}
        <div className="mt-8 mb-12">
          <Stories />
        </div>

        {/* 4. Vitrine de Anúncios */}
        <div className="mb-10">
          <ProductGrid />
        </div>

      </div>
    </div>
  )
}
