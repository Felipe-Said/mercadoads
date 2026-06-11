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
      <div className="layout-surface flex h-full flex-col overflow-hidden rounded-md shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-[var(--layout-link-color)] hover:shadow-md">
        <div className="relative flex aspect-square w-full items-center justify-center overflow-hidden bg-[var(--layout-subtle-background)]">
          {discount > 0 && (
            <span className="absolute left-3 top-3 z-10 rounded-sm bg-[var(--layout-success-color)] px-2 py-1 text-[11px] font-bold text-white shadow-sm">
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
            <div className="flex h-full w-full flex-col items-center justify-center text-[var(--layout-text-muted)]">
              <Package className="mb-2 h-12 w-12 opacity-50" />
            </div>
          )}
        </div>

        <div className="flex flex-grow flex-col p-4">
          <p className="mb-3 line-clamp-2 min-h-[40px] text-[14px] font-medium leading-tight text-[var(--layout-text-primary)] group-hover/card:text-[var(--layout-link-color)]">
            {product.title}
          </p>

          <div className="mt-auto">
            {product.originalPrice ? (
              <span className="block text-[12px] text-[var(--layout-text-muted)] line-through">
                R$ {product.originalPrice.toFixed(2).replace('.', ',')}
              </span>
            ) : (
              <div className="h-[18px]" />
            )}

            <div className="flex items-end gap-2">
              <span className="text-[23px] font-semibold leading-none tracking-tight text-[var(--layout-price-color)]">
                R$ {price.toFixed(2).replace('.', ',')}
              </span>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-sm bg-[var(--layout-subtle-background)] px-2 py-1 text-[11px] font-bold text-[var(--layout-success-color)]">
                <Zap className="h-3 w-3 fill-current" /> Pix imediato
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[var(--layout-text-muted)]">
                <BadgeCheck className="h-3.5 w-3.5 text-[var(--layout-link-color)]" /> Verificado
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}
