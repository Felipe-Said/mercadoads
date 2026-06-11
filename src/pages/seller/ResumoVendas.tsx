import React, { useEffect, useState } from 'react'
import { SellerLayout } from '../../components/layouts/SellerLayout'
import { Card, CardContent } from '../../components/ui/card'
import { Star, User } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { formatCurrency, getSales, type Sale } from '../../lib/data'

export function ResumoVendas() {
  const { user, profile } = useAuth()
  const [sales, setSales] = useState<Sale[]>([])

  useEffect(() => {
    if (!user) return
    getSales({ sellerId: user.id }).then(setSales).catch(console.error)
  }, [user])

  const total = sales.filter((sale) => sale.status === 'paid').reduce((sum, sale) => sum + sale.amount, 0)

  return (
    <SellerLayout>
      <div className="space-y-6">
        <Card className="bg-white border-none shadow-sm rounded-md overflow-hidden">
          <CardContent className="p-8 flex flex-col md:flex-row items-start md:items-center gap-6">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center text-4xl text-gray-400 font-light overflow-hidden flex-shrink-0">
              <User className="w-12 h-12 text-gray-400" />
            </div>
            <div className="flex-grow">
              <h1 className="text-2xl font-light text-ml-dark">{profile?.full_name ?? 'Vendedor'}</h1>
              <p className="text-gray-500 mt-1">Perfil conectado a plataforma</p>
            </div>

            <div className="bg-gray-50 p-4 rounded-md min-w-[200px] border border-gray-100 text-center">
              <p className="text-sm text-gray-500 font-medium mb-2">Reputacao</p>
              <div className="flex items-center justify-center gap-1 mb-1 text-green-500">
                {[1, 2, 3, 4, 5].map((star) => <Star key={star} className="w-5 h-5 fill-current" />)}
              </div>
              <p className="text-xs font-semibold text-green-600">{sales.length} vendas registradas</p>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-white border-none shadow-sm rounded-md">
            <CardContent className="p-6">
              <p className="text-sm font-medium text-gray-500 mb-1">Receita paga</p>
              <h3 className="text-2xl font-light text-ml-dark">{formatCurrency(total)}</h3>
            </CardContent>
          </Card>
          <Card className="bg-white border-none shadow-sm rounded-md">
            <CardContent className="p-6">
              <p className="text-sm font-medium text-gray-500 mb-1">Pedidos</p>
              <h3 className="text-2xl font-light text-ml-dark">{sales.length}</h3>
            </CardContent>
          </Card>
          <Card className="bg-white border-none shadow-sm rounded-md">
            <CardContent className="p-6">
              <p className="text-sm font-medium text-gray-500 mb-1">Pendentes</p>
              <h3 className="text-2xl font-light text-ml-dark">{sales.filter((sale) => sale.status === 'pending').length}</h3>
            </CardContent>
          </Card>
        </div>
      </div>
    </SellerLayout>
  )
}
