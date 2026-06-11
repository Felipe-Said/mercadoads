import React from "react"
import { Link } from "react-router-dom"
import { Card, CardContent } from "./ui/card"
import { Zap } from "lucide-react"
import type { Product } from "../lib/data"

interface ProductItemProps {
  product: Product;
}

export function ProductItem({ product }: ProductItemProps) {
  const price = product.price || 0;

  return (
    <Link to={`/produto/${product.id}`} className="block outline-none h-full">
      <Card className="overflow-hidden group flex flex-col justify-between bg-white border border-gray-100 hover:border-transparent shadow-sm hover:shadow-[0_7px_16px_0_rgba(0,0,0,0.1)] transition-all duration-300 rounded-md h-full cursor-pointer">
        <div>
          <div className="w-full h-[224px] bg-white flex items-center justify-center border-b border-gray-50 overflow-hidden relative">
            <img 
              src={product.image || '/favicon.svg'} 
              alt={product.title} 
              className="max-w-full max-h-full object-contain"
            />
          </div>
          <CardContent className="p-4 pt-3 flex flex-col gap-0.5">
            {product.originalPrice ? (
              <span className="text-[12px] text-gray-400 line-through">
                R$ {product.originalPrice.toFixed(2).replace('.', ',')}
              </span>
            ) : (
              <div className="h-[18px]" />
            )}
            
            <div className="flex items-center gap-2">
              <span className="text-[22px] leading-none font-light tracking-tight text-[#333]">
                R$ {price.toFixed(2).replace('.', ',')}
              </span>
              {product.originalPrice && (
                <span className="text-[13px] font-medium text-[#00a650]">
                  {Math.round(((product.originalPrice - price) / product.originalPrice) * 100)}% OFF
                </span>
              )}
            </div>
            
            <div className="text-[13px] text-[#00a650] font-semibold flex items-center gap-1 mt-1">
              Pagamento via PIX <Zap className="w-3 h-3 fill-current" /> <span className="font-black italic text-[11px] ml-[-2px]">AUTO</span>
            </div>
            
            <p className="text-[14px] text-[#666] font-light leading-[1.25] mt-2 line-clamp-2">
              {product.title}
            </p>
          </CardContent>
        </div>
      </Card>
    </Link>
  )
}
