import React from "react"
import { Link } from "react-router-dom"
import { Zap, Package } from "lucide-react"
import type { Product } from "../lib/data"

interface ProductItemProps {
  product: Product;
}

export function ProductItem({ product }: ProductItemProps) {
  const price = product.price || 0;

  return (
    <Link to={`/produto/${product.id}`} className="block outline-none h-full group/card">
      <div className="bg-white rounded-2xl p-4 flex flex-col h-full shadow-sm border border-slate-100 hover:shadow-lg hover:border-blue-500 transition-all duration-300">
        <div className="w-full relative bg-gray-50 rounded-xl mb-4 overflow-hidden flex items-center justify-center aspect-square">
          {product.image ? (
            <img 
              src={product.image} 
              alt={product.title} 
              className="w-full h-full object-cover group-hover/card:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
              <Package className="w-12 h-12 mb-2 opacity-50" />
            </div>
          )}
        </div>
        
        <div className="flex flex-col flex-grow px-1">
          <p className="text-[15px] text-gray-700 font-medium leading-[1.3] mb-3 line-clamp-2">
            {product.title}
          </p>

          <div className="mt-auto">
            {product.originalPrice ? (
              <span className="text-[12px] text-gray-400 line-through block">
                R$ {product.originalPrice.toFixed(2).replace('.', ',')}
              </span>
            ) : (
              <div className="h-[18px]" />
            )}
            
            <div className="flex items-center gap-2">
              <span className="text-[22px] leading-none font-bold tracking-tight text-[#333]">
                R$ {price.toFixed(2).replace('.', ',')}
              </span>
              {product.originalPrice && (
                <span className="text-[13px] font-medium text-[#00a650]">
                  {Math.round(((product.originalPrice - price) / product.originalPrice) * 100)}% OFF
                </span>
              )}
            </div>
            
            <div className="inline-flex items-center gap-1.5 mt-2 bg-green-50 text-[#00a650] px-2.5 py-1 rounded-md text-[12px] font-bold">
              <Zap className="w-3 h-3 fill-current" /> Pagamento via PIX
            </div>
            
          </div>
        </div>
      </div>
    </Link>
  )
}
