import React from 'react'
import { DashboardLayout, NavItem } from '../components/DashboardLayout'
import { Shield, Users, Activity, Settings, CheckCircle, XCircle } from 'lucide-react'
import { Card, CardContent } from '../components/ui/card'

const NAV_ITEMS: NavItem[] = [
  { title: "Dashboard Global", href: "/painel/admin", icon: Activity },
  { title: "Usuários", href: "/painel/admin/usuarios", icon: Users },
  { title: "Moderação de Ativos", href: "/painel/admin/moderacao", icon: Shield },
  { title: "Taxas e Plataforma", href: "/painel/admin/configuracoes", icon: Settings },
]

export function AdminPanel() {
  return (
    <DashboardLayout navItems={NAV_ITEMS} title="Painel de Administração">
      <div className="space-y-6">
        
        {/* Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-white border-none shadow-sm rounded-md">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Volume Transacionado (Mês)</p>
                  <h3 className="text-2xl font-light text-ml-dark">R$ 145.890,00</h3>
                </div>
                <div className="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center text-green-500">
                  <Activity className="w-5 h-5" />
                </div>
              </div>
              <p className="text-xs text-green-500 font-medium">+24% vs mês anterior</p>
            </CardContent>
          </Card>

          <Card className="bg-white border-none shadow-sm rounded-md">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Receita da Plataforma (Taxas)</p>
                  <h3 className="text-2xl font-light text-ml-dark">R$ 14.589,00</h3>
                </div>
                <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center text-ml-blue">
                  <Shield className="w-5 h-5" />
                </div>
              </div>
              <p className="text-xs text-gray-400 font-medium">Margem atual: 10%</p>
            </CardContent>
          </Card>

          <Card className="bg-white border-none shadow-sm rounded-md">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Usuários Ativos</p>
                  <h3 className="text-2xl font-light text-ml-dark">1.204</h3>
                </div>
                <div className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center text-gray-500">
                  <Users className="w-5 h-5" />
                </div>
              </div>
              <p className="text-xs text-gray-400 font-medium">18 novos hoje</p>
            </CardContent>
          </Card>
        </div>

        {/* Approval Queue */}
        <div className="flex items-center justify-between mt-8 mb-4">
          <h2 className="text-xl font-light text-ml-dark">Fila de Moderação (Anúncios Pendentes)</h2>
          <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-1 rounded-sm">2 pendentes</span>
        </div>

        <Card className="bg-white border-none shadow-sm rounded-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50/50 text-gray-500 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 font-medium">Vendedor</th>
                  <th className="px-6 py-4 font-medium">Ativo (Título)</th>
                  <th className="px-6 py-4 font-medium">Preço</th>
                  <th className="px-6 py-4 font-medium">Data</th>
                  <th className="px-6 py-4 font-medium text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                <tr className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-ml-dark">Agência XYZ</td>
                  <td className="px-6 py-4">BM Verificada Cnpj + 3 Perfis</td>
                  <td className="px-6 py-4">R$ 890,00</td>
                  <td className="px-6 py-4 text-gray-500">Há 2 horas</td>
                  <td className="px-6 py-4 text-right flex justify-end gap-2">
                    <button className="flex items-center gap-1 text-green-600 bg-green-50 hover:bg-green-100 px-3 py-1.5 rounded-sm transition-colors">
                      <CheckCircle className="w-4 h-4" /> Aprovar
                    </button>
                    <button className="flex items-center gap-1 text-red-600 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-sm transition-colors">
                      <XCircle className="w-4 h-4" /> Rejeitar
                    </button>
                  </td>
                </tr>
                <tr className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-ml-dark">DropKing BR</td>
                  <td className="px-6 py-4">Conta Google Ads Gasta ($350)</td>
                  <td className="px-6 py-4">R$ 450,00</td>
                  <td className="px-6 py-4 text-gray-500">Há 5 horas</td>
                  <td className="px-6 py-4 text-right flex justify-end gap-2">
                    <button className="flex items-center gap-1 text-green-600 bg-green-50 hover:bg-green-100 px-3 py-1.5 rounded-sm transition-colors">
                      <CheckCircle className="w-4 h-4" /> Aprovar
                    </button>
                    <button className="flex items-center gap-1 text-red-600 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-sm transition-colors">
                      <XCircle className="w-4 h-4" /> Rejeitar
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </Card>

      </div>
    </DashboardLayout>
  )
}
