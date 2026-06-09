import React, { useEffect, useState } from 'react'
import { ProductItem } from './ProductItem'
import { getProducts, type Product } from '../lib/data'

export type { Product }

export function ProductGrid() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getProducts()
      .then(setProducts)
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="max-w-7xl mx-auto px-4 mb-16">
      <div className="flex items-center gap-4 mb-6">
        <h2 className="text-2xl font-light text-[#666]">Anuncios disponiveis</h2>
      </div>

      {loading && <p className="text-sm text-gray-500">Carregando produtos...</p>}
      {error && <p className="text-sm text-red-500">Erro ao carregar produtos: {error}</p>}
      {!loading && !error && products.length === 0 && (
        <div className="bg-white rounded-md p-8 text-center text-gray-500 shadow-sm">
          Nenhum produto ativo cadastrado no Supabase.
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {products.map((product) => (
          <ProductItem key={product.id} product={product} />
        ))}
      </div>
    </div>
  )
}
