import React, { useEffect, useState } from 'react'
import { AdminLayout } from '../../components/layouts/AdminLayout'
import { Card } from '../../components/ui/card'
import { formatCurrency, formatDate, getSales, type Sale } from '../../lib/data'

export function VendasEntregasAdmin() {
  const [sales, setSales] = useState<Sale[]>([])

  useEffect(() => {
    getSales().then(setSales).catch(console.error)
  }, [])

  return (
    <AdminLayout>
      <div className="space-y-6">
        <h2 className="text-xl font-light text-ml-dark mb-4">Vendas e Entregas</h2>
        <Card className="bg-white border-none shadow-sm rounded-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50/50 text-gray-500 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 font-medium">Data</th>
                  <th className="px-6 py-4 font-medium">Produto</th>
                  <th className="px-6 py-4 font-medium">Comprador</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium text-right">Valor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {sales.map((sale) => (
                  <tr key={sale.id}>
                    <td className="px-6 py-4 text-gray-500">{formatDate(sale.created_at)}</td>
                    <td className="px-6 py-4 font-medium text-ml-dark">{sale.products?.title ?? 'Produto removido'}</td>
                    <td className="px-6 py-4 text-gray-600">{sale.buyer?.full_name ?? 'Comprador'}</td>
                    <td className="px-6 py-4">{sale.status}</td>
                    <td className="px-6 py-4 text-right">{formatCurrency(sale.amount)}</td>
                  </tr>
                ))}
                {sales.length === 0 && <tr><td className="px-6 py-8 text-center text-gray-500" colSpan={5}>Nenhuma venda encontrada.</td></tr>}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </AdminLayout>
  )
}
