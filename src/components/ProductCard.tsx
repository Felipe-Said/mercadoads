import React from "react"
import { ProductItem } from "./ProductItem"

export interface Product {
  id: string
  title: string
  price: number
  originalPrice?: number
  installments?: string
  shipping: string
  image: string
}

export const PRODUCTS: Product[] = [
  {
    id: "1",
    title: "BM Infinita Facebook Ads c/ 5 Contas - Pronta para Escalar",
    price: 349.90,
    originalPrice: 499.90,
    installments: "12x R$ 33,24",
    shipping: "Entrega Automática",
    image: "https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=500&q=80"
  },
  {
    id: "2",
    title: "Perfil Aquecido Facebook BR (30 dias+) + RG + Cookies",
    price: 89.90,
    installments: "3x R$ 29,96",
    shipping: "Entrega Automática",
    image: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=500&q=80"
  },
  {
    id: "3",
    title: "Conta Google Ads Gasta (Threshold $350) c/ Histórico",
    price: 450.00,
    installments: "10x R$ 45,00 sem juros",
    shipping: "Entrega Automática",
    image: "https://images.unsplash.com/photo-1573804633927-bfcbcd909acd?w=500&q=80"
  },
  {
    id: "4",
    title: "BM Verificada Cnpj + 3 Perfis Restabelecidos",
    price: 890.00,
    originalPrice: 1200.00,
    installments: "12x R$ 84,55",
    shipping: "Entrega Automática",
    image: "https://images.unsplash.com/photo-1557838923-2985c318be48?w=500&q=80"
  },
  {
    id: "5",
    title: "Proxy Residencial BR 4G - Pacote 10GB Mensal",
    price: 120.00,
    installments: "12x R$ 11,40",
    shipping: "Entrega Automática",
    image: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=500&q=80"
  }
]

export function ProductGrid() {

  return (
    <div className="max-w-7xl mx-auto px-4 mb-16">
      <div className="flex items-center gap-4 mb-6">
        <h2 className="text-2xl font-light text-[#666]">Baseado na sua última visita</h2>
        <a href="#" className="text-ml-blue text-sm font-medium hover:underline">Ver histórico</a>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {PRODUCTS.map((product) => (
          <ProductItem key={product.id} product={product} />
        ))}
      </div>
    </div>
  )
}
