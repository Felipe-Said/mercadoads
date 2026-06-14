import React, { useEffect, useMemo, useState } from 'react'
import { SellerLayout } from '../../components/layouts/SellerLayout'
import { Card, CardContent } from '../../components/ui/card'
import { Star, Trophy, User } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { formatCurrency, getSales, type Sale } from '../../lib/data'
import { supabase } from '../../lib/supabase'

type RankingPeriod = '7d' | '30d' | '90d' | 'all'

type AffiliateRecord = {
  id: string
  user_id: string
  commission_percent: number | null
  status: string | null
  user?: {
    full_name: string | null
    email: string | null
    avatar_url: string | null
  } | null
}

type RankingItem = {
  id: string
  userId: string
  name: string
  email: string
  avatarUrl: string | null
  sales: number
  revenue: number
  commission: number
}

function getPeriodStart(period: RankingPeriod) {
  if (period === 'all') return null

  const days = period === '7d' ? 7 : period === '30d' ? 30 : 90
  const start = new Date()
  start.setDate(start.getDate() - days)
  start.setHours(0, 0, 0, 0)
  return start
}

export function ResumoVendas() {
  const { user, profile } = useAuth()
  const [sales, setSales] = useState<Sale[]>([])
  const [affiliates, setAffiliates] = useState<AffiliateRecord[]>([])
  const [period, setPeriod] = useState<RankingPeriod>('30d')

  useEffect(() => {
    if (!user) return

    async function load() {
      if (!user) return

      const [{ data: affiliateData, error: affiliateError }, nextSales] = await Promise.all([
        supabase
          .from('affiliates')
          .select('id, user_id, commission_percent, status, user:user_id(full_name, email, avatar_url)')
          .eq('seller_id', user.id),
        getSales({ sellerId: user.id }),
      ])

      if (affiliateError) throw affiliateError

      setAffiliates((affiliateData ?? []) as unknown as AffiliateRecord[])
      setSales(nextSales)
    }

    load().catch(console.error)
  }, [user])

  const total = sales.filter((sale) => sale.status === 'paid').reduce((sum, sale) => sum + sale.amount, 0)

  const ranking = useMemo(() => {
    const start = getPeriodStart(period)
    const affiliateMap = new Map<string, RankingItem>()

    affiliates.forEach((affiliate) => {
      if (!affiliate.user_id || affiliate.status === 'rejected') return

      affiliateMap.set(affiliate.user_id, {
        id: affiliate.id,
        userId: affiliate.user_id,
        name: affiliate.user?.full_name ?? 'Afiliado',
        email: affiliate.user?.email ?? '',
        avatarUrl: affiliate.user?.avatar_url ?? null,
        sales: 0,
        revenue: 0,
        commission: 0,
      })
    })

    sales
      .filter((sale) => sale.status === 'paid' && sale.affiliate_user_id)
      .filter((sale) => !start || new Date(sale.created_at) >= start)
      .forEach((sale) => {
        const affiliateId = String(sale.affiliate_user_id)
        const current = affiliateMap.get(affiliateId) ?? {
          id: affiliateId,
          userId: affiliateId,
          name: 'Afiliado',
          email: '',
          avatarUrl: null,
          sales: 0,
          revenue: 0,
          commission: 0,
        }

        current.sales += 1
        current.revenue += sale.amount
        current.commission += Number(sale.affiliate_commission_amount ?? 0)
        affiliateMap.set(affiliateId, current)
      })

    return Array.from(affiliateMap.values())
      .filter((item) => item.sales > 0)
      .sort((a, b) => b.revenue - a.revenue || b.sales - a.sales)
      .slice(0, 10)
  }, [affiliates, period, sales])

  return (
    <SellerLayout>
      <div className="space-y-6">
        <Card className="bg-white border-none shadow-sm rounded-md overflow-hidden">
          <CardContent className="p-8 flex flex-col md:flex-row items-start md:items-center gap-6">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center text-4xl text-gray-400 font-light overflow-hidden flex-shrink-0">
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt={profile.full_name ?? 'Vendedor'} className="h-full w-full object-cover" />
              ) : (
                <User className="w-12 h-12 text-gray-400" />
              )}
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

        <Card className="bg-white border-none shadow-sm rounded-md overflow-hidden">
          <CardContent className="p-0">
            <div className="flex flex-col gap-3 border-b border-gray-100 p-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-green-50 text-green-600">
                  <Trophy className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-ml-dark">Ranking de afiliados</h2>
                  <p className="text-sm text-gray-500">Afiliados que mais venderam para sua loja.</p>
                </div>
              </div>
              <select
                value={period}
                onChange={(event) => setPeriod(event.target.value as RankingPeriod)}
                className="h-11 rounded-md border border-gray-200 bg-white px-3 text-sm font-medium text-ml-dark outline-none focus:border-green-500"
              >
                <option value="7d">Ultimos 7 dias</option>
                <option value="30d">Ultimos 30 dias</option>
                <option value="90d">Ultimos 90 dias</option>
                <option value="all">Todo periodo</option>
              </select>
            </div>

            {ranking.length === 0 ? (
              <div className="p-8 text-sm text-gray-500">Nenhuma venda de afiliado neste periodo.</div>
            ) : (
              <div className="divide-y divide-gray-100">
                {ranking.map((item, index) => (
                  <div key={item.userId} className="grid gap-4 p-5 md:grid-cols-[auto_1fr_auto_auto_auto] md:items-center">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-sm font-bold text-gray-500">
                      {index + 1}
                    </div>
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="h-11 w-11 overflow-hidden rounded-full bg-gray-100">
                        {item.avatarUrl ? (
                          <img src={item.avatarUrl} alt={item.name} className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-sm font-semibold text-gray-500">
                            {item.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-ml-dark">{item.name}</p>
                        {item.email && <p className="truncate text-xs text-gray-500">{item.email}</p>}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase text-gray-400">Vendas</p>
                      <p className="font-semibold text-ml-dark">{item.sales}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase text-gray-400">Receita</p>
                      <p className="font-semibold text-green-600">{formatCurrency(item.revenue)}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase text-gray-400">Comissao</p>
                      <p className="font-semibold text-ml-dark">{formatCurrency(item.commission)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </SellerLayout>
  )
}
