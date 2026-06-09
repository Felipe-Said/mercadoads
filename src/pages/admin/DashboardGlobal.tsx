import React, { useEffect, useState } from 'react'
import { AdminLayout } from '../../components/layouts/AdminLayout'
import { Activity, Shield, Users } from 'lucide-react'
import { Card, CardContent } from '../../components/ui/card'
import { formatCurrency, getDashboardStats } from '../../lib/data'

export function DashboardGlobal() {
  const [stats, setStats] = useState({ monthlyVolume: 0, platformRevenue: 0, activeUsers: 0, paidSales: 0 })

  useEffect(() => {
    getDashboardStats().then(setStats).catch(console.error)
  }, [])

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-white border-none shadow-sm rounded-md">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Volume Transacionado (Mes)</p>
                  <h3 className="text-2xl font-light text-ml-dark">{formatCurrency(stats.monthlyVolume)}</h3>
                </div>
                <div className="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center text-green-500">
                  <Activity className="w-5 h-5" />
                </div>
              </div>
              <p className="text-xs text-gray-400 font-medium">{stats.paidSales} vendas pagas no mes</p>
            </CardContent>
          </Card>

          <Card className="bg-white border-none shadow-sm rounded-md">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Receita da Plataforma (Taxas)</p>
                  <h3 className="text-2xl font-light text-ml-dark">{formatCurrency(stats.platformRevenue)}</h3>
                </div>
                <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center text-ml-blue">
                  <Shield className="w-5 h-5" />
                </div>
              </div>
              <p className="text-xs text-gray-400 font-medium">Calculado pelas vendas pagas</p>
            </CardContent>
          </Card>

          <Card className="bg-white border-none shadow-sm rounded-md">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Usuarios Ativos</p>
                  <h3 className="text-2xl font-light text-ml-dark">{stats.activeUsers.toLocaleString('pt-BR')}</h3>
                </div>
                <div className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center text-gray-500">
                  <Users className="w-5 h-5" />
                </div>
              </div>
              <p className="text-xs text-gray-400 font-medium">Total de perfis no Supabase</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  )
}
