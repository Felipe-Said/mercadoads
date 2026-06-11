import React, { useEffect, useState, useRef } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { ProductItem } from './ProductItem'
import { getProducts, type Product } from '../lib/data'

export type { Product }

export function ProductGrid() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showLeftBtn, setShowLeftBtn] = useState(false)
  const [showRightBtn, setShowRightBtn] = useState(true)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    getProducts()
      .then((data) => {
        setProducts(data)
        if (data.length <= 5) setShowRightBtn(false)
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  const handleScroll = () => {
    if (!scrollRef.current) return
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current
    setShowLeftBtn(scrollLeft > 10)
    setShowRightBtn(scrollLeft < scrollWidth - clientWidth - 10)
  }

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return
    const scrollAmount = scrollRef.current.clientWidth * 0.8
    scrollRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth'
    })
  }

  return (
    <div className="w-full bg-transparent relative group/carousel">
      <div className="flex items-end gap-4 mb-4 px-2 lg:px-0">
        <h2 className="text-[26px] font-light text-[#666]">Anúncios disponíveis</h2>
        <a href="/painel/usuario/compras" className="text-[15px] font-semibold text-ml-blue hover:text-ml-hover mb-[3px] transition-colors">
          Ver histórico
        </a>
      </div>

      {loading && <p className="text-sm text-gray-500">Carregando produtos...</p>}
      {error && <p className="text-sm text-red-500">Erro ao carregar produtos: {error}</p>}
      {!loading && !error && products.length === 0 && (
        <div className="bg-white rounded-md p-8 text-center text-gray-500 shadow-sm">
          Nenhum produto ativo cadastrado no Supabase.
        </div>
      )}

      {products.length > 0 && (
        <div className="relative">
          {showLeftBtn && (
            <button 
              onClick={() => scroll('left')} 
              className="absolute -left-5 top-1/2 -translate-y-1/2 z-10 bg-white shadow-[0_2px_4px_0_rgba(0,0,0,0.19)] w-12 h-12 rounded-full flex items-center justify-center text-[#3483fa] hover:text-[#2968c8] hover:shadow-[0_4px_8px_0_rgba(0,0,0,0.19)] transition-all opacity-0 group-hover/carousel:opacity-100"
            >
              <ChevronLeft className="w-8 h-8" />
            </button>
          )}

          <div 
            ref={scrollRef}
            onScroll={handleScroll}
            className="flex overflow-x-auto gap-[16px] snap-x snap-mandatory pb-4 pt-1 px-1 -mx-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
          >
            {products.map((product) => (
              <div key={product.id} className="flex-shrink-0 snap-start w-[224px]">
                <ProductItem product={product} />
              </div>
            ))}
          </div>

          {showRightBtn && (
            <button 
              onClick={() => scroll('right')} 
              className="absolute -right-5 top-1/2 -translate-y-1/2 z-10 bg-white shadow-[0_2px_4px_0_rgba(0,0,0,0.19)] w-12 h-12 rounded-full flex items-center justify-center text-[#3483fa] hover:text-[#2968c8] hover:shadow-[0_4px_8px_0_rgba(0,0,0,0.19)] transition-all opacity-0 group-hover/carousel:opacity-100"
            >
              <ChevronRight className="w-8 h-8" />
            </button>
          )}
        </div>
      )}
    </div>
  )
}
