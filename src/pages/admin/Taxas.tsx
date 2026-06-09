import React from 'react'
import { AdminLayout } from '../../components/layouts/AdminLayout'
import { Card, CardContent } from '../../components/ui/card'
import { Button } from '../../components/ui/button'

export function Taxas() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <h2 className="text-xl font-light text-ml-dark mb-4">Taxas e Configurações da Plataforma</h2>

        <Card className="bg-white border-none shadow-sm rounded-md overflow-hidden max-w-2xl">
          <CardContent className="p-8">
            <h3 className="text-lg font-medium text-ml-dark mb-6">Comissões</h3>
            
            <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
              <div>
                <label className="block text-sm text-gray-600 mb-2">Taxa base por venda (%)</label>
                <div className="relative">
                  <input 
                    type="number" 
                    defaultValue={10}
                    className="w-full h-12 px-4 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-ml-blue focus:border-transparent transition-all"
                  />
                  <span className="absolute right-4 top-3 text-gray-400">%</span>
                </div>
                <p className="text-xs text-gray-400 mt-2">Esta é a taxa que a Mercado Ads retém em cada venda de ativo.</p>
              </div>

              <div className="pt-4 border-t border-gray-100">
                <Button className="bg-ml-blue text-white hover:bg-ml-hover font-semibold py-3 px-6 rounded-sm shadow-sm">
                  Salvar alterações
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}
