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
  products?: { title: string } | null
  buyer?: { full_name: string | null } | null
}

export function FinanceiroAdmin() {
  const [activeTab, setActiveTab] = useState<'saques' | 'vendas'>('saques')
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([])
  const [adminSales, setAdminSales] = useState<AdminSale[]>([])
  const [totalPending, setTotalPending] = useState(0)

  useEffect(() => {
    // Load withdrawals
    supabase
      .from('withdrawals')
      .select('id, amount, pix_key, status, created_at, user:user_id(full_name, email)')
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (!error && data) {
          setWithdrawals(data as Withdrawal[])
          const pending = data.filter(w => w.status === 'pending').reduce((acc, curr) => acc + curr.amount, 0)
          setTotalPending(pending)
        }
      })

    // Load admin sales (simulated by fetching recent sales where seller would be admin)
    // For demo purposes we just fetch all recent sales
    supabase
      .from('sales')
      .select('id, amount, created_at, products:product_id(title), buyer:buyer_id(full_name)')
      .eq('status', 'paid')
      .order('created_at', { ascending: false })
      .limit(10)
      .then(({ data, error }) => {
        if (!error && data) {
          setAdminSales(data as AdminSale[])
        }
      })
  }, [])

  const handleApprove = async (id: number) => {
    const { error } = await supabase
      .from('withdrawals')
      .update({ status: 'paid' })
      .eq('id', id)
    
    if (!error) {
      setWithdrawals(prev => prev.map(w => w.id === id ? { ...w, status: 'paid' } : w))
      setTotalPending(prev => {
        const w = withdrawals.find(x => x.id === id)
        return w ? prev - w.amount : prev
      })
    }
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <h2 className="text-xl font-light text-ml-dark mb-4">Gestão Financeira</h2>

        <div className="flex gap-1 bg-white p-1 rounded-md shadow-sm w-max border border-gray-100">
          <button 
            onClick={() => setActiveTab('saques')}
            className={`px-6 py-2 text-sm font-medium rounded-sm transition-colors ${activeTab === 'saques' ? 'bg-ml-blue/10 text-ml-blue' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Aprovação de Saques (Vendedores)
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
            {/* Metric Cards */}
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
                  <p className="text-xs text-gray-400">Aguardando aprovação via Gateway (Cash out)</p>
                </CardContent>
              </Card>

              <Card className="bg-white border-none shadow-sm rounded-md">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500 mb-1">Total Pago (Geral)</p>
                      <h3 className="text-2xl font-light text-ml-dark">
                        {formatCurrency(withdrawals.filter(w => w.status === 'paid').reduce((a, b) => a + b.amount, 0))}
                      </h3>
                    </div>
                    <div className="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center text-green-500">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                  </div>
                  <p className="text-xs text-gray-400">Transferências bem sucedidas</p>
                </CardContent>
              </Card>
            </div>

            {/* Withdrawals Table */}
            <Card className="bg-white border-none shadow-sm rounded-md overflow-hidden">
              <div className="p-4 border-b border-gray-100">
                <h3 className="text-lg font-medium text-ml-dark">Fila de Saques (Moderação)</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50/50 text-gray-500 border-b border-gray-100">
                    <tr>
                      <th className="px-6 py-4 font-medium">Data</th>
                      <th className="px-6 py-4 font-medium">Usuário</th>
                      <th className="px-6 py-4 font-medium">Chave PIX (Destino)</th>
                      <th className="px-6 py-4 font-medium">Valor</th>
                      <th className="px-6 py-4 font-medium text-right">Ação</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {withdrawals.map((w) => (
                      <tr key={w.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4 text-gray-500">{formatDate(w.created_at)}</td>
                        <td className="px-6 py-4 font-medium text-ml-dark">{w.user?.full_name || w.user?.email || 'Usuário'}</td>
                        <td className="px-6 py-4 font-mono text-xs">{w.pix_key}</td>
                        <td className="px-6 py-4 font-medium">{formatCurrency(w.amount)}</td>
                        <td className="px-6 py-4 text-right">
                          {w.status === 'pending' ? (
                            <Button 
                              onClick={() => handleApprove(w.id)}
                              className="bg-green-500 hover:bg-green-600 text-white font-semibold py-1.5 px-4 h-auto text-xs transition-colors rounded-sm shadow-none"
                            >
                              Aprovar (Cash-out)
                            </Button>
                          ) : (
                            <span className="text-gray-500 text-xs font-medium uppercase">{w.status}</span>
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
            {/* Admin Financial Dashboard */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-gradient-to-r from-ml-blue to-blue-600 border-none shadow-md rounded-md text-white col-span-1 md:col-span-2">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <p className="text-sm text-blue-100 font-medium mb-1">Saldo Disponível no Gateway</p>
                      <h3 className="text-4xl font-bold">R$ 28.540,00</h3>
                    </div>
                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                      <Landmark className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-blue-100">Vendas próprias + Taxas da plataforma</p>
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
                      <h3 className="text-2xl font-light text-ml-dark">R$ 840,00</h3>
                    </div>
                    <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center text-ml-blue">
                      <DollarSign className="w-5 h-5" />
                    </div>
                  </div>
                  <p className="text-xs text-gray-400">Suas vendas diretas (Livre de taxas)</p>
                </CardContent>
              </Card>
            </div>

            {/* Admin Sales History */}
            <Card className="bg-white border-none shadow-sm rounded-md overflow-hidden">
              <div className="p-4 border-b border-gray-100">
                <h3 className="text-lg font-medium text-ml-dark">Histórico de Vendas Diretas (Admin)</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50/50 text-gray-500 border-b border-gray-100">
                    <tr>
                      <th className="px-6 py-4 font-medium">Data/Hora</th>
                      <th className="px-6 py-4 font-medium">Comprador</th>
                      <th className="px-6 py-4 font-medium">Produto</th>
                      <th className="px-6 py-4 font-medium text-right">Valor Líquido</th>
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
