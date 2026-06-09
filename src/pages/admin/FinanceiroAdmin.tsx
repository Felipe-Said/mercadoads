import React, { useEffect, useState } from 'react'
import { AdminLayout } from '../../components/layouts/AdminLayout'
import { Card, CardContent } from '../../components/ui/card'
import { formatCurrency, getDashboardStats } from '../../lib/data'

export function FinanceiroAdmin() {
  const [stats, setStats] = useState({ monthlyVolume: 0, platformRevenue: 0, activeUsers: 0, paidSales: 0 })

  useEffect(() => {
    getDashboardStats().then(setStats).catch(console.error)
  }, [])

  return (
    <AdminLayout>
      <div className="space-y-6">
        <h2 className="text-xl font-light text-ml-dark">Financeiro</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-white border-none shadow-sm rounded-md"><CardContent className="p-6"><p className="text-sm text-gray-500">Volume do mes</p><h3 className="text-2xl font-light text-ml-dark">{formatCurrency(stats.monthlyVolume)}</h3></CardContent></Card>
          <Card className="bg-white border-none shadow-sm rounded-md"><CardContent className="p-6"><p className="text-sm text-gray-500">Receita da plataforma</p><h3 className="text-2xl font-light text-ml-dark">{formatCurrency(stats.platformRevenue)}</h3></CardContent></Card>
          <Card className="bg-white border-none shadow-sm rounded-md"><CardContent className="p-6"><p className="text-sm text-gray-500">Vendas pagas</p><h3 className="text-2xl font-light text-ml-dark">{stats.paidSales}</h3></CardContent></Card>
        </div>
      </div>
    </AdminLayout>
  )
}
