import React, { useCallback, useEffect, useState } from 'react'
import { AdminLayout } from '../../components/layouts/AdminLayout'
import { Card } from '../../components/ui/card'
import { formatCurrency } from '../../lib/data'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { ProductForm } from '../../components/ProductForm'

type AdminProduct = {
  id: string
  title: string
  price: number
  stock: number | null
  status: string
}

export function MeusAnunciosAdmin() {
  const { user } = useAuth()
  const [products, setProducts] = useState<AdminProduct[]>([])
  const [showForm, setShowForm] = useState(false)

  const loadProducts = useCallback(async () => {
    const { data, error } = await supabase.from('products').select('id, title, price, stock, status').order('created_at', { ascending: false })
    if (error) throw error
    setProducts((data ?? []).map((item) => ({ ...item, price: Number(item.price) })) as AdminProduct[])
  }, [])

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      loadProducts().catch(console.error)
    }, 0)
    return () => window.clearTimeout(timeout)
  }, [loadProducts])

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-xl font-light text-ml-dark">Anuncios</h2>
          <button onClick={() => setShowForm((current) => !current)} className="bg-ml-blue text-white px-4 py-2 rounded-sm text-sm font-semibold hover:bg-ml-hover transition-colors shadow-sm">
            {showForm ? 'Fechar' : 'Novo Anuncio'}
          </button>
        </div>

        {showForm && user && (
          <Card className="bg-white border-none shadow-sm rounded-md">
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-lg font-medium text-ml-dark">Cadastrar anuncio como admin</h3>
              <p className="text-sm text-gray-500 mt-1">Anuncios criados pelo admin podem entrar ativos imediatamente.</p>
            </div>
            <div className="p-6">
              <ProductForm sellerId={user.id} defaultStatus="active" showStatus onCreated={loadProducts} />
            </div>
          </Card>
        )}

        <Card className="bg-white border-none shadow-sm rounded-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-white text-gray-500 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 font-medium">Produto</th>
                  <th className="px-6 py-4 font-medium">Preco</th>
                  <th className="px-6 py-4 font-medium">Estoque</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {products.map((product) => (
                  <tr key={product.id}>
                    <td className="px-6 py-4 font-medium text-ml-dark">{product.title}</td>
                    <td className="px-6 py-4">{formatCurrency(product.price)}</td>
                    <td className="px-6 py-4">{product.stock ?? 0}</td>
                    <td className="px-6 py-4">{product.status}</td>
                  </tr>
                ))}
                {products.length === 0 && <tr><td className="px-6 py-8 text-center text-gray-500" colSpan={4}>Nenhum anuncio encontrado.</td></tr>}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </AdminLayout>
  )
}
