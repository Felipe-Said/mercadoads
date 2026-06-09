import React, { useEffect, useState } from 'react'
import { AdminLayout } from '../../components/layouts/AdminLayout'
import { CheckCircle, XCircle } from 'lucide-react'
import { Card } from '../../components/ui/card'
import { supabase } from '../../lib/supabase'
import { formatCurrency, formatDate, type Product } from '../../lib/data'

export function Moderacao() {
  const [pendingProducts, setPendingProducts] = useState<Product[]>([])

  useEffect(() => {
    loadPendingProducts()
  }, [])

  const loadPendingProducts = async () => {
    const { data, error } = await supabase
      .from('products')
      .select('*, seller:seller_id(full_name)')
      .eq('status', 'draft')
      .order('created_at', { ascending: false })
    
    if (!error && data) {
      setPendingProducts(data as Product[])
    }
  }

  const handleApprove = async (id: string) => {
    await supabase.from('products').update({ status: 'active' }).eq('id', id)
    await loadPendingProducts()
  }

  const handleReject = async (id: string) => {
    await supabase.from('products').update({ status: 'rejected' }).eq('id', id)
    await loadPendingProducts()
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-light text-ml-dark">Fila de Moderação</h2>
          {pendingProducts.length > 0 && (
            <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-1 rounded-sm">{pendingProducts.length} pendentes</span>
          )}
        </div>

        <Card className="bg-white border-none shadow-sm rounded-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50/50 text-gray-500 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 font-medium">Vendedor</th>
                  <th className="px-6 py-4 font-medium">Ativo (Título)</th>
                  <th className="px-6 py-4 font-medium">Preço</th>
                  <th className="px-6 py-4 font-medium">Data</th>
                  <th className="px-6 py-4 font-medium text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {pendingProducts.map(product => (
                  <tr key={product.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-ml-dark">{product.seller?.full_name || 'Usuário'}</td>
                    <td className="px-6 py-4">{product.title}</td>
                    <td className="px-6 py-4">{formatCurrency(product.price)}</td>
                    <td className="px-6 py-4 text-gray-500">{formatDate(product.created_at)}</td>
                    <td className="px-6 py-4 text-right flex justify-end gap-2">
                      <button 
                        onClick={() => handleApprove(product.id)}
                        className="flex items-center gap-1 text-green-600 bg-green-50 hover:bg-green-100 px-3 py-1.5 rounded-sm transition-colors"
                      >
                        <CheckCircle className="w-4 h-4" /> Aprovar
                      </button>
                      <button 
                        onClick={() => handleReject(product.id)}
                        className="flex items-center gap-1 text-red-600 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-sm transition-colors"
                      >
                        <XCircle className="w-4 h-4" /> Rejeitar
                      </button>
                    </td>
                  </tr>
                ))}
                {pendingProducts.length === 0 && (
                  <tr>
                    <td className="px-6 py-8 text-center text-gray-500" colSpan={5}>Nenhum produto pendente de moderação.</td>
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
