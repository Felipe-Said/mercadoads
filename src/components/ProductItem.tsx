import React from "react"
import { Link } from "react-router-dom"
import { Card, CardContent } from "./ui/card"
import type { Product } from "../lib/data"

interface ProductItemProps {
  product: Product;
}

export function ProductItem({ product }: ProductItemProps) {
  return (
    <Link to={`/produto/${product.id}`} className="block outline-none">
      <Card className="overflow-hidden group flex flex-col justify-between bg-white border-none shadow-sm hover:shadow-lg transition-all duration-300 rounded-md h-full">
        <div>
          <div className="w-full h-52 bg-white flex items-center justify-center border-b border-gray-100 overflow-hidden relative">
            <img 
              src={product.image || '/favicon.svg'} 
              alt={product.title} 
              className="max-w-full max-h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-500 ease-out"
            />
          </div>
          <CardContent className="p-5 pt-4">
            {product.originalPrice ? (
              <div className="text-[13px] text-gray-400 line-through mb-0.5">
                R$ {product.originalPrice.toFixed(2).replace('.', ',')}
              </div>
            ) : (
              <div className="h-[19px] mb-0.5" />
            )}
            
            <div className="flex items-center gap-2 mb-1">
              <span className="text-2xl font-light tracking-tight text-ml-dark">
                R$ {product.price.toFixed(2).replace('.', ',')}
              </span>
              {product.originalPrice && (
                <span className="text-[13px] font-medium text-green-500 mt-1">
                  {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
                </span>
              )}
            </div>
            
            <div className="text-[13px] text-green-500 font-medium mb-3">
              Pagamento via PIX
            </div>
            
            <div className="text-[12px] font-semibold text-green-500 mb-3 flex items-center gap-1">
              <span className="font-bold text-green-500">✓</span>
              <span className="font-semibold">{product.shipping}</span>
            </div>
            
            <p className="text-[14px] text-gray-500 font-light leading-snug group-hover:text-ml-blue transition-colors line-clamp-2">
              {product.title}
            </p>
          </CardContent>
        </div>
        
        {/* We keep the visual button for effect, but the whole card is the link now */}
        <div className="p-5 pt-0 mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="w-full bg-ml-blue/10 text-ml-blue text-center font-semibold py-3 text-sm transition-colors rounded-sm">
            Ver detalhes
          </div>
        </div>
      </Card>
    </Link>
  )
}
