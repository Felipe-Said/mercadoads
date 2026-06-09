import React from 'react'
import { AdminLayout } from '../../components/layouts/AdminLayout'
import { Card, CardContent } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { TrendingUp } from 'lucide-react'

export function AdsManagerAdmin() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-light text-ml-dark">Ads Manager (Preços)</h2>
          <span className="bg-blue-100 text-ml-blue text-xs font-bold px-3 py-1.5 rounded-sm flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> Faturamento Ads Mês: R$ 1.250,00
          </span>
        </div>

        <Card className="bg-white border-none shadow-sm rounded-md overflow-hidden max-w-3xl">
          <CardContent className="p-8">
            <h3 className="text-lg font-medium text-ml-dark mb-2">Tabela de Preços (Custo Diário)</h3>
            <p className="text-sm text-gray-500 mb-8">Defina o valor cobrado por dia para cada tipo de impulsionamento. Contas marcadas como Admin são isentas dessas taxas automaticamente.</p>
            
            <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-b border-gray-100 pb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Produto Patrocinado</label>
                  <p className="text-xs text-gray-400 mb-3">Destaca o produto nas primeiras posições da página inicial.</p>
                  <div className="relative">
                    <span className="absolute left-4 top-3 text-gray-500">R$</span>
                    <input 
                      type="number" 
                      defaultValue={5}
                      className="w-full h-12 pl-10 pr-4 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-ml-blue transition-all"
                    />
                    <span className="absolute right-4 top-3 text-gray-400">/dia</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Grupo de WhatsApp</label>
                  <p className="text-xs text-gray-400 mb-3">Destaca o grupo com selo "Mais Acessado" nos stories.</p>
                  <div className="relative">
                    <span className="absolute left-4 top-3 text-gray-500">R$</span>
                    <input 
                      type="number" 
                      defaultValue={10}
                      className="w-full h-12 pl-10 pr-4 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-ml-blue transition-all"
                    />
                    <span className="absolute right-4 top-3 text-gray-400">/dia</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Flyer Lateral (Esquerdo)</label>
                  <p className="text-xs text-gray-400 mb-3">Banner vertical de altíssima conversão ao lado do carrossel.</p>
                  <div className="relative">
                    <span className="absolute left-4 top-3 text-gray-500">R$</span>
                    <input 
                      type="number" 
                      defaultValue={50}
                      className="w-full h-12 pl-10 pr-4 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-ml-blue transition-all"
                    />
                    <span className="absolute right-4 top-3 text-gray-400">/dia</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Flyer Lateral (Direito)</label>
                  <p className="text-xs text-gray-400 mb-3">Banner vertical de altíssima conversão ao lado do carrossel.</p>
                  <div className="relative">
                    <span className="absolute left-4 top-3 text-gray-500">R$</span>
                    <input 
                      type="number" 
                      defaultValue={50}
                      className="w-full h-12 pl-10 pr-4 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-ml-blue transition-all"
                    />
                    <span className="absolute right-4 top-3 text-gray-400">/dia</span>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <Button className="bg-ml-blue text-white hover:bg-ml-hover font-semibold py-3 px-8 rounded-sm shadow-sm">
                  Salvar Tabela de Preços
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}
