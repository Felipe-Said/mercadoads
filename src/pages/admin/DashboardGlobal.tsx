import React, { useEffect, useState } from 'react'
import { AdminLayout } from '../../components/layouts/AdminLayout'
import { Activity, Shield, Users } from 'lucide-react'
import { Card, CardContent } from '../../components/ui/card'
import { formatCurrency } from '../../lib/data'
import { supabase } from '../../lib/supabase'

export function DashboardGlobal() {
  const [stats, setStats] = useState({
    monthlyVolume: 0,
    previousMonthlyVolume: 0,
    platformRevenue: 0,
    platformFee: 10,
    activeUsers: 0,
    newUsersToday: 0,
  })

  useEffect(() => {
    const loadStats = async () => {
      const now = new Date()
      const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)
      const previousMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
      const todayStart = new Date()
      todayStart.setHours(0, 0, 0, 0)

      const [salesResult, usersResult, todayUsersResult, settingsResult] = await Promise.all([
        supabase
          .from('sales')
          .select('amount,status,created_at')
          .eq('status', 'paid')
          .gte('created_at', previousMonthStart.toISOString()),
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('profiles').select('id', { count: 'exact', head: true }).gte('created_at', todayStart.toISOString()),
        supabase.from('platform_settings').select('platform_fee_percent').eq('id', 1).maybeSingle(),
      ])

      if (salesResult.error) throw salesResult.error
      if (usersResult.error) throw usersResult.error
      if (todayUsersResult.error) throw todayUsersResult.error
      if (settingsResult.error) throw settingsResult.error

      const platformFee = Number(settingsResult.data?.platform_fee_percent ?? 10)
      const currentSales = (salesResult.data ?? []).filter((sale) => new Date(sale.created_at) >= currentMonthStart)
      const previousSales = (salesResult.data ?? []).filter((sale) => {
        const createdAt = new Date(sale.created_at)
        return createdAt >= previousMonthStart && createdAt < currentMonthStart
      })
      const monthlyVolume = currentSales.reduce((sum, sale) => sum + Number(sale.amount ?? 0), 0)
      const previousMonthlyVolume = previousSales.reduce((sum, sale) => sum + Number(sale.amount ?? 0), 0)

      setStats({
        monthlyVolume,
        previousMonthlyVolume,
        platformRevenue: monthlyVolume * (platformFee / 100),
        platformFee,
        activeUsers: usersResult.count ?? 0,
        newUsersToday: todayUsersResult.count ?? 0,
      })
    }

    loadStats().catch(console.error)
  }, [])

  const monthlyChange = stats.previousMonthlyVolume > 0
    ? ((stats.monthlyVolume - stats.previousMonthlyVolume) / stats.previousMonthlyVolume) * 100
    : null

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
              <p className={`text-xs font-medium ${monthlyChange == null || monthlyChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {monthlyChange == null ? 'Sem base do mes anterior' : `${monthlyChange >= 0 ? '+' : ''}${monthlyChange.toFixed(1)}% vs mes anterior`}
              </p>
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
              <p className="text-xs text-gray-400 font-medium">Margem atual: {stats.platformFee}%</p>
            </CardContent>
          </Card>

          <Card className="bg-white border-none shadow-sm rounded-md">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Usuarios Ativos</p>
                  <h3 className="text-2xl font-light text-ml-dark">{stats.activeUsers}</h3>
                </div>
                <div className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center text-gray-500">
                  <Users className="w-5 h-5" />
                </div>
              </div>
              <p className="text-xs text-gray-400 font-medium">{stats.newUsersToday} novos hoje</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  )
}
