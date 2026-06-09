import React from 'react'
import { DashboardLayout, NavItem } from '../components/DashboardLayout'
import { Store, DollarSign, PackageOpen, Tag, PlusCircle } from 'lucide-react'
import { Card, CardContent } from '../components/ui/card'

const NAV_ITEMS: NavItem[] = [
  { title: "Resumo de Vendas", href: "/painel/vendedor", icon: Store },
  { title: "Meus Anúncios", href: "/painel/vendedor/anuncios", icon: Tag },
  { title: "Vendas e Entregas", href: "/painel/vendedor/vendas", icon: PackageOpen },
  { title: "Financeiro", href: "/painel/vendedor/financeiro", icon: DollarSign },
]

export function SellerPanel() {
  return (
    <DashboardLayout navItems={NAV_ITEMS} title="Painel do Vendedor">
      <div className="space-y-6">
        
        {/* Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-white border-none shadow-sm rounded-md">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">A receber</p>
                  <h3 className="text-2xl font-light text-ml-dark">R$ 4.590,00</h3>
                </div>
                <div className="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center text-green-500">
                  <DollarSign className="w-5 h-5" />
                </div>
              </div>
              <p className="text-xs text-gray-400">Liberação em 2 dias úteis</p>
            </CardContent>
          </Card>

          <Card className="bg-white border-none shadow-sm rounded-md">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Vendas no mês</p>
                  <h3 className="text-2xl font-light text-ml-dark">142</h3>
                </div>
                <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center text-ml-blue">
                  <PackageOpen className="w-5 h-5" />
                </div>
              </div>
              <p className="text-xs text-green-500 font-medium">+12% vs mês anterior</p>
            </CardContent>
          </Card>

          <Card className="bg-white border-none shadow-sm rounded-md">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Anúncios ativos</p>
                  <h3 className="text-2xl font-light text-ml-dark">12</h3>
                </div>
                <div className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center text-gray-500">
                  <Tag className="w-5 h-5" />
                </div>
              </div>
              <p className="text-xs text-ml-blue font-medium cursor-pointer hover:underline">Ver todos os anúncios</p>
            </CardContent>
          </Card>
        </div>

        {/* Header for list */}
        <div className="flex items-center justify-between mt-8 mb-4">
          <h2 className="text-xl font-light text-ml-dark">Anúncios de Alta Performance</h2>
          <button className="flex items-center gap-2 bg-ml-blue text-white px-4 py-2 rounded-sm text-sm font-semibold hover:bg-ml-hover transition-colors shadow-sm">
            <PlusCircle className="w-4 h-4" /> Novo Anúncio
          </button>
        </div>

        {/* Products List Mock */}
        <Card className="bg-white border-none shadow-sm rounded-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50/50 text-gray-500 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 font-medium">Produto</th>
                  <th className="px-6 py-4 font-medium">Preço</th>
                  <th className="px-6 py-4 font-medium">Estoque</th>
                  <th className="px-6 py-4 font-medium">Vendas</th>
                  <th className="px-6 py-4 font-medium text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                <tr className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-ml-dark">BM Infinita Facebook Ads</td>
                  <td className="px-6 py-4">R$ 349,90</td>
                  <td className="px-6 py-4 text-green-500 font-medium">Ilimitado</td>
                  <td className="px-6 py-4">84</td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-ml-blue hover:underline font-medium">Editar</button>
                  </td>
                </tr>
                <tr className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-ml-dark">Perfil Aquecido Facebook BR</td>
                  <td className="px-6 py-4">R$ 89,90</td>
                  <td className="px-6 py-4">42 unidades</td>
                  <td className="px-6 py-4">31</td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-ml-blue hover:underline font-medium">Editar</button>
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
