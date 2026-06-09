import React, { useEffect, useState } from 'react'
import { AdminLayout } from '../../components/layouts/AdminLayout'
import { Card } from '../../components/ui/card'
import { Search, Filter, Package } from 'lucide-react'
import { Button } from '../../components/ui/button'
import { formatCurrency, formatDate, getSales, type Sale } from '../../lib/data'

export function VendasEntregasAdmin() {
  const [sales, setSales] = useState<Sale[]>([])

  useEffect(() => {
    getSales().then(setSales).catch(console.error)
  }, [])

  return (
    <AdminLayout>
      <div className="space-y-6">
        <h2 className="text-xl font-light text-ml-dark mb-4">Vendas e Entregas (Admin)</h2>

        <Card className="bg-white border-none shadow-sm rounded-md overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row gap-4 justify-between bg-gray-50/50">
            <div className="relative w-full max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="text" 
                placeholder="Buscar por comprador ou produto..." 
                className="w-full h-10 pl-9 pr-4 border border-gray-200 rounded-sm focus:outline-none focus:ring-1 focus:ring-ml-blue text-sm"
              />
            </div>
            <Button variant="outline" className="border-gray-200 text-gray-600 rounded-sm hover:bg-gray-100 flex items-center gap-2">
              <Filter className="w-4 h-4" /> Status
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-white text-gray-500 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 font-medium">Data</th>
                  <th className="px-6 py-4 font-medium">Produto</th>
                  <th className="px-6 py-4 font-medium">Comprador</th>
                  <th className="px-6 py-4 font-medium">Status do Envio</th>
                  <th className="px-6 py-4 font-medium text-right">Valor</th>
                  <th className="px-6 py-4 font-medium text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {sales.map((sale) => (
                  <tr key={sale.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 text-gray-500">{formatDate(sale.created_at)}</td>
                    <td className="px-6 py-4 font-medium text-ml-dark">{sale.products?.title ?? 'Produto removido'}</td>
                    <td className="px-6 py-4 text-gray-600">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs uppercase">
                          {sale.buyer?.full_name?.charAt(0) || 'C'}
                        </div>
                        {sale.buyer?.full_name ?? 'Comprador'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {sale.status === 'paid' ? (
                        <span className="flex items-center gap-1 text-green-600 bg-green-50 px-2 py-1 rounded-sm w-max text-xs font-semibold">
                          <Package className="w-3 h-3" /> Entregue (Automático)
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-yellow-600 bg-yellow-50 px-2 py-1 rounded-sm w-max text-xs font-semibold">
                          {sale.status}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right font-medium">{formatCurrency(sale.amount)}</td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-ml-blue hover:text-ml-hover font-medium text-sm transition-colors">
                        Ver detalhes
                      </button>
                    </td>
                  </tr>
                ))}
                {sales.length === 0 && (
                  <tr>
                    <td className="px-6 py-8 text-center text-gray-500" colSpan={6}>Nenhuma venda encontrada.</td>
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
