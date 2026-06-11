import React from 'react'
import { Stories } from '../components/Stories'
import { Banners } from '../components/Banners'
import { ProductGrid } from '../components/ProductCard'
import { HomeFeatures } from '../components/HomeFeatures'

export function Home() {
  return (
    <div className="min-h-screen w-full bg-[#f3f4f6] pb-16 font-sans text-gray-900">
      <div className="mx-auto max-w-[1240px] px-4 pt-4 lg:px-6">
        <Banners />
      </div>

      <div className="mx-auto max-w-[1240px] px-4 lg:px-6">
        <div className="mt-4">
          <Stories />
        </div>

        <div className="mt-5">
          <HomeFeatures />
        </div>

        <div className="mt-8">
          <ProductGrid title="Ofertas do dia" />
        </div>

        <div className="mt-8 hidden w-full md:block">
          <Banners position="home_middle" />
        </div>

        <div className="mt-8">
          <ProductGrid title="Mais vendidos da semana" linkText="Ver todos" shuffle={true} />
        </div>

        <div className="mt-8 mb-16">
          <ProductGrid title="Recomendados para voce" linkText="Descobrir mais" shuffle={true} />
        </div>
      </div>
    </div>
  )
}
