import React, { useCallback, useEffect, useState } from 'react'
import { SellerLayout } from '../../components/layouts/SellerLayout'
import { PlusCircle } from 'lucide-react'
import { Card } from '../../components/ui/card'
import { formatCurrency, getProducts, type Product } from '../../lib/data'
import { useAuth } from '../../contexts/AuthContext'
import { ProductForm } from '../../components/ProductForm'

export function MeusAnuncios() {
  const { user } = useAuth()
  const [products, setProducts] = useState<Product[]>([])
  const [showForm, setShowForm] = useState(false)

  const loadProducts = useCallback(async () => {
    if (!user) return
    const data = await getProducts({ sellerId: user.id, includeInactive: true })
    setProducts(data)
  }, [user])

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      loadProducts().catch(console.error)
    }, 0)
    return () => window.clearTimeout(timeout)
  }, [loadProducts])

  return (
    <SellerLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-light text-ml-dark">Meus Anuncios</h2>
          <button onClick={() => setShowForm((current) => !current)} className="flex items-center gap-2 bg-ml-blue text-white px-4 py-2 rounded-sm text-sm font-semibold hover:bg-ml-hover transition-colors shadow-sm">
            <PlusCircle className="w-4 h-4" /> {showForm ? 'Fechar' : 'Novo Anuncio'}
          </button>
        </div>

        {showForm && user && (
          <Card className="bg-white border-none shadow-sm rounded-md">
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-lg font-medium text-ml-dark">Cadastrar novo anuncio</h3>
              <p className="text-sm text-gray-500 mt-1">Anuncios de vendedores entram como rascunho para moderacao.</p>
            </div>
            <div className="p-6">
              <ProductForm sellerId={user.id} defaultStatus="draft" onCreated={loadProducts} />
            </div>
          </Card>
        )}

        <Card className="bg-white border-none shadow-sm rounded-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50/50 text-gray-500 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 font-medium">Produto</th>
                  <th className="px-6 py-4 font-medium">Preco</th>
                  <th className="px-6 py-4 font-medium">Estoque</th>
                  <th className="px-6 py-4 font-medium">Vendas</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {products.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-ml-dark">{product.title}</td>
                    <td className="px-6 py-4">{formatCurrency(product.price)}</td>
                    <td className="px-6 py-4">{product.stock ?? 0} unidades</td>
                    <td className="px-6 py-4">{product.sales_count}</td>
                    <td className="px-6 py-4">{product.status}</td>
                  </tr>
                ))}
                {products.length === 0 && (
                  <tr>
                    <td className="px-6 py-8 text-center text-gray-500" colSpan={5}>Nenhum anuncio cadastrado.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </SellerLayout>
  )
}
