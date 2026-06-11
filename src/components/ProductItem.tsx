import React from "react"
import { Link } from "react-router-dom"
import { BadgeCheck, Package, Zap } from "lucide-react"
import type { Product } from "../lib/data"

interface ProductItemProps {
  product: Product
}

export function ProductItem({ product }: ProductItemProps) {
  const price = product.price || 0
  const discount = product.originalPrice
    ? Math.max(0, Math.round(((product.originalPrice - price) / product.originalPrice) * 100))
    : 0

  return (
    <Link to={`/produto/${product.id}`} className="group/card block h-full outline-none">
      <div className="flex h-full flex-col overflow-hidden rounded-md border border-gray-100 bg-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-ml-blue/40 hover:shadow-md">
        <div className="relative flex aspect-square w-full items-center justify-center overflow-hidden bg-gray-50">
          {discount > 0 && (
            <span className="absolute left-3 top-3 z-10 rounded-sm bg-[#00a650] px-2 py-1 text-[11px] font-bold text-white shadow-sm">
              {discount}% OFF
            </span>
          )}
          {product.image ? (
            <img
              src={product.image}
              alt={product.title}
              className="h-full w-full object-cover transition-transform duration-500 group-hover/card:scale-105"
            />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center text-gray-400">
              <Package className="mb-2 h-12 w-12 opacity-50" />
            </div>
          )}
        </div>

        <div className="flex flex-grow flex-col p-4">
          <p className="mb-3 line-clamp-2 min-h-[40px] text-[14px] font-medium leading-tight text-gray-700 group-hover/card:text-ml-blue">
            {product.title}
          </p>

          <div className="mt-auto">
            {product.originalPrice ? (
              <span className="block text-[12px] text-gray-400 line-through">
                R$ {product.originalPrice.toFixed(2).replace('.', ',')}
              </span>
            ) : (
              <div className="h-[18px]" />
            )}

            <div className="flex items-end gap-2">
              <span className="text-[23px] font-semibold leading-none tracking-tight text-gray-900">
                R$ {price.toFixed(2).replace('.', ',')}
              </span>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-sm bg-green-50 px-2 py-1 text-[11px] font-bold text-[#00a650]">
                <Zap className="h-3 w-3 fill-current" /> Pix imediato
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-gray-500">
                <BadgeCheck className="h-3.5 w-3.5 text-ml-blue" /> Verificado
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}
