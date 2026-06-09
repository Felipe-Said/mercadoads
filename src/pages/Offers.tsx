import React from 'react'
import { PRODUCTS } from '../components/ProductCard'
import { ProductItem } from '../components/ProductItem'

export function Offers() {
  const offers = PRODUCTS.filter(p => p.originalPrice);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 mb-16">
      <div className="flex items-center gap-3 mb-6">
        <h1 className="text-2xl font-light text-ml-dark">Ofertas do dia</h1>
        <span className="bg-ml-blue text-white text-[11px] font-bold uppercase px-2 py-0.5 rounded-sm">
          Promoção
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {offers.map((product) => (
          <ProductItem key={product.id} product={product} />
        ))}
      </div>
    </div>
  )
}
