import React, { useEffect, useState } from 'react'
import { AdminLayout } from '../../components/layouts/AdminLayout'
import { Card } from '../../components/ui/card'
import { formatCurrency } from '../../lib/data'
import { supabase } from '../../lib/supabase'

type PendingProduct = {
  id: string
  title: string
  price: number
  created_at: string
  profiles?: { full_name: string | null } | null
}

export function Moderacao() {
  const [products, setProducts] = useState<PendingProduct[]>([])

  useEffect(() => {
    supabase
      .from('products')
      .select('id, title, price, created_at, profiles:seller_id(full_name)')
      .eq('status', 'draft')
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (error) throw error
        setProducts((data ?? []).map((item) => ({ ...item, price: Number(item.price) })) as PendingProduct[])
      })
      .catch(console.error)
  }, [])

  const updateStatus = async (id: string, status: 'active' | 'rejected') => {
    const { error } = await supabase.from('products').update({ status }).eq('id', id)
    if (error) throw error
    setProducts((current) => current.filter((product) => product.id !== id))
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-light text-ml-dark">Fila de Moderacao</h2>
          <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-1 rounded-sm">{products.length} pendentes</span>
        </div>

        <Card className="bg-white border-none shadow-sm rounded-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50/50 text-gray-500 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 font-medium">Vendedor</th>
                  <th className="px-6 py-4 font-medium">Ativo</th>
                  <th className="px-6 py-4 font-medium">Preco</th>
                  <th className="px-6 py-4 font-medium text-right">Acoes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {products.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-ml-dark">{product.profiles?.full_name ?? 'Vendedor'}</td>
                    <td className="px-6 py-4">{product.title}</td>
                    <td className="px-6 py-4">{formatCurrency(product.price)}</td>
                    <td className="px-6 py-4 text-right flex justify-end gap-2">
                      <button onClick={() => updateStatus(product.id, 'active')} className="text-green-600 bg-green-50 hover:bg-green-100 px-3 py-1.5 rounded-sm transition-colors">Aprovar</button>
                      <button onClick={() => updateStatus(product.id, 'rejected')} className="text-red-600 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-sm transition-colors">Rejeitar</button>
                    </td>
                  </tr>
                ))}
                {products.length === 0 && (
                  <tr>
                    <td className="px-6 py-8 text-center text-gray-500" colSpan={4}>Nenhum anuncio pendente.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </AdminLayout>
  )
}
