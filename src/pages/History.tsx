import React from 'react'
import { PRODUCTS } from '../components/ProductCard'
import { ProductItem } from '../components/ProductItem'

export function History() {
  const viewed = PRODUCTS.slice(0, 3);
  const bought = PRODUCTS.slice(3, 5);

  const renderGrid = (items: typeof PRODUCTS) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
      {items.map((product) => (
        <ProductItem key={product.id} product={product} />
      ))}
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 mb-16 space-y-12">
      <div>
        <h2 className="text-2xl font-light text-ml-dark mb-6">Últimas compras</h2>
        {renderGrid(bought)}
      </div>
      
      <div>
        <h2 className="text-2xl font-light text-ml-dark mb-6">Últimos produtos acessados</h2>
        {renderGrid(viewed)}
      </div>
    </div>
  )
}
