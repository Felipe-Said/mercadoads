import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { ProductItem } from '../components/ProductItem'
import { getDailyOfferProducts, getProducts, type Product } from '../lib/data'

export function Offers() {
  const [offers, setOffers] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const { name } = useParams()
  const categoryName = name ? decodeURIComponent(name) : null
  const isCategoryPage = Boolean(categoryName)

  useEffect(() => {
    setLoading(true)
    getProducts(isCategoryPage ? { category: categoryName === 'all' ? undefined : categoryName ?? undefined } : {})
      .then(async (products) => {
        if (isCategoryPage) {
          setOffers(products)
          return
        }

        setOffers(await getDailyOfferProducts(products, 60))
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [categoryName, isCategoryPage])

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 mb-16">
      <div className="flex items-center gap-3 mb-6">
        <h1 className="text-2xl font-light text-ml-dark">{isCategoryPage ? categoryName === 'all' ? 'Todas as categorias' : categoryName : 'Ofertas do dia'}</h1>
        <span className="bg-ml-blue text-white text-[11px] font-bold uppercase px-2 py-0.5 rounded-sm">{isCategoryPage ? 'Categoria' : 'Promocao'}</span>
      </div>

      {loading && <p className="text-sm text-gray-500">Carregando produtos...</p>}
      {!loading && offers.length === 0 && <p className="bg-white rounded-md p-8 text-center text-gray-500 shadow-sm">Nenhum produto ativo encontrado.</p>}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {offers.map((product) => (
          <ProductItem key={product.id} product={product} />
        ))}
      </div>
    </div>
  )
}
