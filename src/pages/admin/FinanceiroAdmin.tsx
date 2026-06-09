import React, { useEffect, useState } from 'react'
import { AdminLayout } from '../../components/layouts/AdminLayout'
import { Card, CardContent } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { DollarSign, CheckCircle2, Clock, Landmark, ArrowRightLeft } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { formatCurrency, formatDate } from '../../lib/data'

type Withdrawal = {
  id: number
  amount: number
  pix_key: string
  status: string
  created_at: string
  user?: { full_name: string | null; email: string | null } | null
}

type AdminSale = {
  id: number
  amount: number
  created_at: string
  seller_id: string | null
  products?: { title: string } | null
  buyer?: { full_name: string | null } | null
}

export function FinanceiroAdmin() {
  const [activeTab, setActiveTab] = useState<'saques' | 'vendas'>('saques')
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([])
  const [adminSales, setAdminSales] = useState<AdminSale[]>([])
  const [totalPending, setTotalPending] = useState(0)
  const [gatewayBalance, setGatewayBalance] = useState(0)
  const [todayAdminSales, setTodayAdminSales] = useState(0)

  const loadWithdrawals = async () => {
    const { data, error } = await supabase
      .from('withdrawals')
      .select('id, amount, pix_key, status, created_at, user:user_id(full_name, email)')
      .order('created_at', { ascending: false })

    if (error) throw error
    const nextWithdrawals = (data ?? []) as Withdrawal[]
    setWithdrawals(nextWithdrawals)
    setTotalPending(nextWithdrawals
      .filter((withdrawal) => withdrawal.status === 'pending')
      .reduce((sum, withdrawal) => sum + Number(withdrawal.amount ?? 0), 0))
  }

  const loadAdminSales = async () => {
    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)

    const [adminsResult, salesResult, settingsResult] = await Promise.all([
      supabase.from('profiles').select('id').eq('role', 'admin'),
      supabase
        .from('sales')
        .select('id, amount, created_at, seller_id, products:product_id(title), buyer:buyer_id(full_name)')
        .eq('status', 'paid')
        .order('created_at', { ascending: false }),
      supabase.from('platform_settings').select('platform_fee_percent').eq('id', 1).maybeSingle(),
    ])

    if (adminsResult.error) throw adminsResult.error
    if (salesResult.error) throw salesResult.error
    if (settingsResult.error) throw settingsResult.error

    const adminIds = new Set((adminsResult.data ?? []).map((admin) => admin.id))
    const paidSales = (salesResult.data ?? []) as AdminSale[]
    const directAdminSales = paidSales.filter((sale) => sale.seller_id && adminIds.has(sale.seller_id))
    const platformFee = Number(settingsResult.data?.platform_fee_percent ?? 10) / 100
    const platformRevenue = paidSales.reduce((sum, sale) => sum + Number(sale.amount ?? 0) * platformFee, 0)

    setAdminSales(directAdminSales.slice(0, 10))
    setGatewayBalance(platformRevenue + directAdminSales.reduce((sum, sale) => sum + Number(sale.amount ?? 0), 0))
    setTodayAdminSales(directAdminSales
      .filter((sale) => new Date(sale.created_at) >= todayStart)
      .reduce((sum, sale) => sum + Number(sale.amount ?? 0), 0))
  }

  useEffect(() => {
    loadWithdrawals().catch(console.error)
    loadAdminSales().catch(console.error)
  }, [])

  const handleApprove = async (id: number) => {
    const { error } = await supabase
      .from('withdrawals')
      .update({ status: 'paid' })
      .eq('id', id)

    if (!error) {
      await loadWithdrawals()
    }
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <h2 className="text-xl font-light text-ml-dark mb-4">Gestao Financeira</h2>

        <div className="flex gap-1 bg-white p-1 rounded-md shadow-sm w-max border border-gray-100">
          <button
            onClick={() => setActiveTab('saques')}
            className={`px-6 py-2 text-sm font-medium rounded-sm transition-colors ${activeTab === 'saques' ? 'bg-ml-blue/10 text-ml-blue' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Aprovacao de Saques (Vendedores)
          </button>
          <button
            onClick={() => setActiveTab('vendas')}
            className={`px-6 py-2 text-sm font-medium rounded-sm transition-colors ${activeTab === 'vendas' ? 'bg-ml-blue/10 text-ml-blue' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Minhas Vendas & Saque (Admin)
          </button>
        </div>

        {activeTab === 'saques' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="bg-white border-none shadow-sm rounded-md">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500 mb-1">Saques Pendentes</p>
                      <h3 className="text-2xl font-light text-ml-dark">{formatCurrency(totalPending)}</h3>
                    </div>
                    <div className="w-10 h-10 bg-orange-50 rounded-full flex items-center justify-center text-orange-500">
                      <Clock className="w-5 h-5" />
                    </div>
                  </div>
                  <p className="text-xs text-gray-400">Aguardando aprovacao via Gateway (Cash out)</p>
                </CardContent>
              </Card>

              <Card className="bg-white border-none shadow-sm rounded-md">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500 mb-1">Total Pago (Geral)</p>
                      <h3 className="text-2xl font-light text-ml-dark">
                        {formatCurrency(withdrawals.filter((withdrawal) => withdrawal.status === 'paid').reduce((sum, withdrawal) => sum + Number(withdrawal.amount ?? 0), 0))}
                      </h3>
                    </div>
                    <div className="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center text-green-500">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                  </div>
                  <p className="text-xs text-gray-400">Transferencias bem sucedidas</p>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-white border-none shadow-sm rounded-md overflow-hidden">
              <div className="p-4 border-b border-gray-100">
                <h3 className="text-lg font-medium text-ml-dark">Fila de Saques (Moderacao)</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50/50 text-gray-500 border-b border-gray-100">
                    <tr>
                      <th className="px-6 py-4 font-medium">Data</th>
                      <th className="px-6 py-4 font-medium">Usuario</th>
                      <th className="px-6 py-4 font-medium">Chave PIX (Destino)</th>
                      <th className="px-6 py-4 font-medium">Valor</th>
                      <th className="px-6 py-4 font-medium text-right">Acao</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {withdrawals.map((withdrawal) => (
                      <tr key={withdrawal.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4 text-gray-500">{formatDate(withdrawal.created_at)}</td>
                        <td className="px-6 py-4 font-medium text-ml-dark">{withdrawal.user?.full_name || withdrawal.user?.email || 'Usuario'}</td>
                        <td className="px-6 py-4 font-mono text-xs">{withdrawal.pix_key}</td>
                        <td className="px-6 py-4 font-medium">{formatCurrency(withdrawal.amount)}</td>
                        <td className="px-6 py-4 text-right">
                          {withdrawal.status === 'pending' ? (
                            <Button
                              onClick={() => handleApprove(withdrawal.id)}
                              className="bg-green-500 hover:bg-green-600 text-white font-semibold py-1.5 px-4 h-auto text-xs transition-colors rounded-sm shadow-none"
                            >
                              Aprovar (Cash-out)
                            </Button>
                          ) : (
                            <span className="text-gray-500 text-xs font-medium uppercase">{withdrawal.status}</span>
                          )}
                        </td>
                      </tr>
                    ))}
                    {withdrawals.length === 0 && (
                      <tr>
                        <td className="px-6 py-8 text-center text-gray-500" colSpan={5}>Nenhum saque solicitado.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}

        {activeTab === 'vendas' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-gradient-to-r from-ml-blue to-blue-600 border-none shadow-md rounded-md text-white col-span-1 md:col-span-2">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <p className="text-sm text-blue-100 font-medium mb-1">Saldo Disponivel no Gateway</p>
                      <h3 className="text-4xl font-bold">{formatCurrency(gatewayBalance)}</h3>
                    </div>
                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                      <Landmark className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-blue-100">Vendas proprias + taxas da plataforma</p>
                    <Button className="bg-white text-ml-blue hover:bg-gray-100 font-bold px-6 py-2 h-auto text-sm transition-colors rounded-sm shadow-lg flex items-center gap-2">
                      <ArrowRightLeft className="w-4 h-4" /> Transferir para Conta
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white border-none shadow-sm rounded-md">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500 mb-1">Minhas Vendas (Hoje)</p>
                      <h3 className="text-2xl font-light text-ml-dark">{formatCurrency(todayAdminSales)}</h3>
                    </div>
                    <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center text-ml-blue">
                      <DollarSign className="w-5 h-5" />
                    </div>
                  </div>
                  <p className="text-xs text-gray-400">Suas vendas diretas (livre de taxas)</p>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-white border-none shadow-sm rounded-md overflow-hidden">
              <div className="p-4 border-b border-gray-100">
                <h3 className="text-lg font-medium text-ml-dark">Historico de Vendas Diretas (Admin)</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50/50 text-gray-500 border-b border-gray-100">
                    <tr>
                      <th className="px-6 py-4 font-medium">Data/Hora</th>
                      <th className="px-6 py-4 font-medium">Comprador</th>
                      <th className="px-6 py-4 font-medium">Produto</th>
                      <th className="px-6 py-4 font-medium text-right">Valor Liquido</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {adminSales.map((sale) => (
                      <tr key={sale.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4 text-gray-500">{formatDate(sale.created_at)}</td>
                        <td className="px-6 py-4 font-medium text-ml-dark">{sale.buyer?.full_name || 'Comprador'}</td>
                        <td className="px-6 py-4">{sale.products?.title || 'Produto'}</td>
                        <td className="px-6 py-4 text-right font-medium text-green-500">+ {formatCurrency(sale.amount)}</td>
                      </tr>
                    ))}
                    {adminSales.length === 0 && (
                      <tr>
                        <td className="px-6 py-8 text-center text-gray-500" colSpan={4}>Nenhuma venda recente.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
