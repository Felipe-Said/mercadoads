import React, { useEffect, useState } from 'react'
import { ProductItem } from '../components/ProductItem'
import { getProducts, type Product } from '../lib/data'

export function Offers() {
  const [offers, setOffers] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getProducts({ offersOnly: true })
      .then(setOffers)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 mb-16">
      <div className="flex items-center gap-3 mb-6">
        <h1 className="text-2xl font-light text-ml-dark">Ofertas do dia</h1>
        <span className="bg-ml-blue text-white text-[11px] font-bold uppercase px-2 py-0.5 rounded-sm">Promocao</span>
      </div>

      {loading && <p className="text-sm text-gray-500">Carregando ofertas...</p>}
      {!loading && offers.length === 0 && <p className="bg-white rounded-md p-8 text-center text-gray-500 shadow-sm">Nenhuma oferta ativa cadastrada.</p>}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {offers.map((product) => (
          <ProductItem key={product.id} product={product} />
        ))}
      </div>
    </div>
  )
}
