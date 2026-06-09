import React, { useEffect, useState } from 'react'
import { UserLayout } from '../../components/layouts/UserLayout'
import { Package } from 'lucide-react'
import { Card, CardContent } from '../../components/ui/card'
import { formatCurrency, formatDate, getSales, type Sale } from '../../lib/data'
import { useAuth } from '../../contexts/AuthContext'

export function Compras() {
  const { user } = useAuth()
  const [sales, setSales] = useState<Sale[]>([])

  useEffect(() => {
    if (!user) return
    getSales({ buyerId: user.id }).then(setSales).catch(console.error)
  }, [user])

  return (
    <UserLayout>
      <div className="space-y-6">
        <h2 className="text-xl font-light text-ml-dark mb-4">Minhas Compras</h2>

        <div className="space-y-4">
          {sales.map((sale) => (
            <Card key={sale.id} className="bg-white border-none shadow-sm rounded-md overflow-hidden hover:shadow-md transition-shadow group">
              <div className="border-b border-gray-100 px-6 py-3 flex justify-between items-center bg-gray-50/50">
                <span className="text-sm font-semibold text-green-500">{sale.status}</span>
                <span className="text-sm text-gray-400">{formatDate(sale.created_at)}</span>
              </div>
              <CardContent className="p-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gray-100 rounded-sm flex items-center justify-center overflow-hidden">
                    {sale.products?.image_url ? <img src={sale.products.image_url} alt="" className="w-full h-full object-cover" /> : <Package className="w-8 h-8 text-gray-400" />}
                  </div>
                  <div>
                    <p className="text-ml-dark font-medium group-hover:text-ml-blue transition-colors">{sale.products?.title ?? 'Produto removido'}</p>
                    <p className="text-sm text-gray-500 mt-1">{formatCurrency(sale.amount)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          {sales.length === 0 && <p className="bg-white rounded-md p-8 text-center text-gray-500 shadow-sm">Nenhuma compra encontrada.</p>}
        </div>
      </div>
    </UserLayout>
  )
}
