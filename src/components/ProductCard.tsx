import React, { useEffect, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { ProductItem } from './ProductItem'
import { getProducts, type Product } from '../lib/data'

export type { Product }

interface ProductGridProps {
  title?: string
  linkText?: string
  linkUrl?: string
  shuffle?: boolean
}

export function ProductGrid({
  title = "Anuncios disponiveis",
  linkText = "Ver historico",
  linkUrl = "/painel/usuario/compras",
  shuffle = false
}: ProductGridProps) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showLeftBtn, setShowLeftBtn] = useState(false)
  const [showRightBtn, setShowRightBtn] = useState(true)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    getProducts()
      .then((data) => {
        let finalData = [...data]
        if (shuffle) finalData = finalData.sort(() => 0.5 - Math.random())
        setProducts(finalData)
        if (finalData.length <= 5) setShowRightBtn(false)
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false))
  }, [shuffle])

  const handleScroll = () => {
    if (!scrollRef.current) return
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current
    setShowLeftBtn(scrollLeft > 10)
    setShowRightBtn(scrollLeft < scrollWidth - clientWidth - 10)
  }

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return
    const scrollAmount = scrollRef.current.clientWidth * 0.85
    scrollRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth'
    })
  }

  return (
    <section className="group/carousel relative w-full rounded-md border border-gray-100 bg-white px-4 py-5 shadow-sm md:px-5">
      <div className="mb-4 flex items-end justify-between gap-4">
        <div>
          <h2 className="text-[22px] font-semibold tracking-tight text-gray-900">{title}</h2>
          <p className="mt-1 text-xs text-gray-500">Produtos digitais verificados e prontos para compra via Pix.</p>
        </div>
        <a href={linkUrl} className="shrink-0 text-[14px] font-semibold text-ml-blue transition-colors hover:text-ml-hover">
          {linkText}
        </a>
      </div>

      {loading && (
        <div className="flex gap-4 overflow-hidden">
          {[1, 2, 3, 4, 5].map((item) => (
            <div key={item} className="h-[330px] w-[216px] flex-shrink-0 animate-pulse rounded-md bg-gray-100" />
          ))}
        </div>
      )}
      {error && <p className="text-sm text-red-500">Erro ao carregar produtos: {error}</p>}
      {!loading && !error && products.length === 0 && (
        <div className="rounded-md border border-dashed border-gray-200 bg-gray-50 p-8 text-center text-gray-500">
          Nenhum produto ativo cadastrado no Supabase.
        </div>
      )}

      {products.length > 0 && (
        <div className="relative">
          {showLeftBtn && (
            <button
              onClick={() => scroll('left')}
              className="absolute -left-3 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white text-ml-blue opacity-0 shadow-[0_2px_8px_rgba(0,0,0,0.18)] transition-all hover:text-ml-hover group-hover/carousel:opacity-100"
              aria-label="Produtos anteriores"
            >
              <ChevronLeft className="h-7 w-7" />
            </button>
          )}

          <div
            ref={scrollRef}
            onScroll={handleScroll}
            className="-mx-1 flex snap-x snap-mandatory gap-4 overflow-x-auto px-1 pb-2 pt-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {products.map((product) => (
              <div key={product.id} className="w-[216px] flex-shrink-0 snap-start">
                <ProductItem product={product} />
              </div>
            ))}
          </div>

          {showRightBtn && (
            <button
              onClick={() => scroll('right')}
              className="absolute -right-3 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white text-ml-blue opacity-0 shadow-[0_2px_8px_rgba(0,0,0,0.18)] transition-all hover:text-ml-hover group-hover/carousel:opacity-100"
              aria-label="Proximos produtos"
            >
              <ChevronRight className="h-7 w-7" />
            </button>
          )}
        </div>
      )}
    </section>
  )
}
