import React from 'react'
import { DashboardLayout, NavItem } from '../components/DashboardLayout'
import { ShoppingBag, User, Settings, Package, ChevronRight } from 'lucide-react'
import { Card, CardContent } from '../components/ui/card'

const NAV_ITEMS: NavItem[] = [
  { title: "Resumo", href: "/painel/usuario", icon: User },
  { title: "Compras", href: "/painel/usuario/compras", icon: ShoppingBag },
  { title: "Configurações", href: "/painel/usuario/configuracoes", icon: Settings },
]

export function UserPanel() {
  return (
    <DashboardLayout navItems={NAV_ITEMS} title="Meu Perfil">
      <div className="space-y-6">
        
        {/* Welcome Card */}
        <Card className="bg-white border-none shadow-sm rounded-md overflow-hidden">
          <CardContent className="p-8 flex items-center gap-6">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center text-3xl text-gray-400 font-light">
              M
            </div>
            <div>
              <h1 className="text-2xl font-light text-ml-dark">Olá, Maria Antonieta</h1>
              <p className="text-gray-500 mt-1">Nível 3 - Mercado Pontos</p>
            </div>
          </CardContent>
        </Card>

        {/* Recent Purchases */}
        <h2 className="text-xl font-light text-ml-dark mt-8 mb-4">Suas últimas compras</h2>
        
        <div className="space-y-4">
          {[1, 2].map((item) => (
            <Card key={item} className="bg-white border-none shadow-sm rounded-md overflow-hidden hover:shadow-md transition-shadow cursor-pointer group">
              <div className="border-b border-gray-100 px-6 py-3 flex justify-between items-center bg-gray-50/50">
                <span className="text-sm font-semibold text-green-500">Entregue via E-mail</span>
                <span className="text-sm text-gray-400">12 de Outubro</span>
              </div>
              <CardContent className="p-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gray-100 rounded-sm flex items-center justify-center">
                    <Package className="w-8 h-8 text-gray-400" />
                  </div>
                  <div>
                    <p className="text-ml-dark font-medium group-hover:text-ml-blue transition-colors">
                      {item === 1 ? 'BM Infinita Facebook Ads c/ 5 Contas' : 'Conta Google Ads Gasta (Threshold $350)'}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">1 unidade</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Button variant="outline" className="text-ml-blue border-ml-blue/30 hover:bg-ml-blue/5 h-10 px-6 rounded-sm">
                    Ver detalhes
                  </Button>
                  <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-ml-blue" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
      </div>
    </DashboardLayout>
  )
}

function Button({ children, className, variant }: { children: React.ReactNode, className?: string, variant?: string }) {
  return <button className={`font-semibold transition-colors ${className}`}>{children}</button>
}
