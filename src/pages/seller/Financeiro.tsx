import React, { useEffect, useState } from 'react'
import { SellerLayout } from '../../components/layouts/SellerLayout'
import { Card, CardContent } from '../../components/ui/card'
import { Clock } from 'lucide-react'
import { formatCurrency, formatDate, getSales, type Sale } from '../../lib/data'
import { useAuth } from '../../contexts/AuthContext'

export function Financeiro() {
  const { user } = useAuth()
  const [sales, setSales] = useState<Sale[]>([])

  useEffect(() => {
    if (!user) return
    getSales({ sellerId: user.id }).then(setSales).catch(console.error)
  }, [user])

  const paid = sales.filter((sale) => sale.status === 'paid')
  const now = Date.now()
  const available = paid.filter((sale) => !sale.claim_until || new Date(sale.claim_until).getTime() <= now)
  const held = paid.filter((sale) => sale.claim_until && new Date(sale.claim_until).getTime() > now)
  const availableTotal = available.reduce((sum, sale) => sum + sale.amount, 0)
  const heldTotal = held.reduce((sum, sale) => sum + sale.amount, 0)

  return (
    <SellerLayout>
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-white border-none shadow-sm rounded-md"><CardContent className="p-6"><p className="text-sm text-gray-500">Saldo liberado</p><h3 className="text-2xl font-light text-ml-dark">{formatCurrency(availableTotal)}</h3></CardContent></Card>
          <Card className="bg-white border-none shadow-sm rounded-md"><CardContent className="p-6"><p className="text-sm text-gray-500">Vendas pagas</p><h3 className="text-2xl font-light text-ml-dark">{paid.length}</h3></CardContent></Card>
          <Card className="bg-white border-none shadow-sm rounded-md"><CardContent className="p-6"><p className="text-sm text-gray-500">Em retenção 24h</p><h3 className="text-2xl font-light text-ml-dark">{formatCurrency(heldTotal)}</h3></CardContent></Card>
        </div>

        <Card className="bg-white border-none shadow-sm rounded-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50/50 text-gray-500 border-b border-gray-100"><tr><th className="px-6 py-4 font-medium">Data</th><th className="px-6 py-4 font-medium">Produto</th><th className="px-6 py-4 font-medium">Status</th><th className="px-6 py-4 font-medium text-right">Valor</th></tr></thead>
              <tbody className="divide-y divide-gray-100">
                {sales.map((sale) => (
                  <tr key={sale.id}>
                    <td className="px-6 py-4 text-gray-500">{formatDate(sale.created_at)}</td>
                    <td className="px-6 py-4">{sale.products?.title ?? 'Produto removido'}</td>
                    <td className="px-6 py-4">
                      {sale.status === 'paid' && sale.claim_until && new Date(sale.claim_until).getTime() > now ? (
                        <span className="inline-flex items-center gap-1 bg-yellow-50 text-yellow-700 px-2 py-1 rounded-sm text-xs font-semibold">
                          <Clock className="w-3 h-3" /> Aguardando 24h
                        </span>
                      ) : (
                        sale.status
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">{formatCurrency(sale.amount)}</td>
                  </tr>
                ))}
                {sales.length === 0 && <tr><td className="px-6 py-8 text-center text-gray-500" colSpan={4}>Nenhuma movimentacao encontrada.</td></tr>}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </SellerLayout>
  )
}
