import React, { useEffect, useState } from 'react'
import { AdminLayout } from '../../components/layouts/AdminLayout'
import { Card, CardContent } from '../../components/ui/card'
import { Search, Filter, TrendingUp, Users } from 'lucide-react'
import { Button } from '../../components/ui/button'
import { supabase } from '../../lib/supabase'

type Affiliate = {
  id: string
  commission_percent: number
  status: string
  user?: { full_name: string | null; email: string | null } | null
  seller?: { full_name: string | null } | null
}

export function AfiliadosAdmin() {
  const [affiliates, setAffiliates] = useState<Affiliate[]>([])
  const activeAffiliates = affiliates.filter((affiliate) => affiliate.status === 'active')
  const affiliateSalesVolume = 0

  useEffect(() => {
    supabase
      .from('affiliates')
      .select('id, commission_percent, status, user:user_id(full_name, email), seller:seller_id(full_name)')
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (error) throw error
        setAffiliates((data ?? []) as Affiliate[])
      })
      .catch(console.error)
  }, [])

  return (
    <AdminLayout>
      <div className="space-y-6">
        <h2 className="text-xl font-light text-ml-dark mb-4">Todos os Afiliados (Admin)</h2>

        {/* Dashboard Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="bg-white border-none shadow-sm rounded-md">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Total de Afiliados</p>
                  <h3 className="text-2xl font-light text-ml-dark">{activeAffiliates.length} ativos</h3>
                </div>
                <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center text-ml-blue">
                  <Users className="w-5 h-5" />
                </div>
              </div>
              <p className="text-xs text-green-500 font-medium">Dados atualizados em tempo real</p>
            </CardContent>
          </Card>

          <Card className="bg-white border-none shadow-sm rounded-md">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Vendas por Afiliados (30 dias)</p>
                  <h3 className="text-2xl font-light text-ml-dark">
                    {affiliateSalesVolume.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </h3>
                </div>
                <div className="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center text-green-500">
                  <TrendingUp className="w-5 h-5" />
                </div>
              </div>
              <p className="text-xs text-gray-400">Sem vendas atribuidas a afiliados registradas</p>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-white border-none shadow-sm rounded-md overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row gap-4 justify-between bg-gray-50/50">
            <div className="relative w-full max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="text" 
                placeholder="Buscar por nome ou e-mail..." 
                className="w-full h-10 pl-9 pr-4 border border-gray-200 rounded-sm focus:outline-none focus:ring-1 focus:ring-ml-blue text-sm"
              />
            </div>
            <Button variant="outline" className="border-gray-200 text-gray-600 rounded-sm hover:bg-gray-100 flex items-center gap-2">
              <Filter className="w-4 h-4" /> Filtrar
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-white text-gray-500 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 font-medium">Afiliado</th>
                  <th className="px-6 py-4 font-medium">Vendedor (Parceiro)</th>
                  <th className="px-6 py-4 font-medium">Comissão Ajustada</th>
                  <th className="px-6 py-4 font-medium text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {affiliates.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-medium text-ml-dark">{item.user?.full_name || 'Usuário'}</p>
                      <p className="text-xs text-gray-500">{item.user?.email || '-'}</p>
                    </td>
                    <td className="px-6 py-4 text-gray-600 font-medium">{item.seller?.full_name || 'Vendedor'}</td>
                    <td className="px-6 py-4 font-medium text-green-500">{item.commission_percent}%</td>
                    <td className="px-6 py-4 text-right">
                      <span className={`px-2 py-1 rounded-sm text-xs font-semibold ${item.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {affiliates.length === 0 && (
                  <tr>
                    <td className="px-6 py-8 text-center text-gray-500" colSpan={4}>Nenhuma afiliação encontrada.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </AdminLayout>
  )
}
