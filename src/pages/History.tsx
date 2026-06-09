import React, { useEffect, useState } from 'react'
import { ProductItem } from '../components/ProductItem'
import { getProducts, type Product } from '../lib/data'

export function History() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getProducts()
      .then((items) => setProducts(items.slice(0, 5)))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 mb-16">
      <h1 className="text-2xl font-light text-ml-dark mb-6">Historico</h1>
      {loading && <p className="text-sm text-gray-500">Carregando historico...</p>}
      {!loading && products.length === 0 && <p className="bg-white rounded-md p-8 text-center text-gray-500 shadow-sm">Nenhum produto encontrado para exibir.</p>}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {products.map((product) => <ProductItem key={product.id} product={product} />)}
      </div>
    </div>
  )
}
