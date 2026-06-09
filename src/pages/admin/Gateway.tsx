import React, { useState } from 'react'
import { AdminLayout } from '../../components/layouts/AdminLayout'
import { Card, CardContent } from '../../components/ui/card'
import { Button } from '../../components/ui/button'

export function Gateway() {
  const [provider, setProvider] = useState('mercadopago');

  return (
    <AdminLayout>
      <div className="space-y-6">
        <h2 className="text-xl font-light text-ml-dark mb-4">Configuração de Gateway de Pagamento</h2>

        <Card className="bg-white border-none shadow-sm rounded-md overflow-hidden max-w-2xl">
          <CardContent className="p-8">
            <h3 className="text-lg font-medium text-ml-dark mb-6">Provedor Ativo</h3>
            
            <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
              <div>
                <label className="block text-sm text-gray-600 mb-2">Selecione o Gateway Principal</label>
                <select 
                  value={provider}
                  onChange={(e) => setProvider(e.target.value)}
                  className="w-full h-12 px-4 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-ml-blue focus:border-transparent transition-all bg-white"
                >
                  <option value="mercadopago">Mercado Pago</option>
                  <option value="stripe">Stripe</option>
                  <option value="pagarme">Pagar.me</option>
                  <option value="asaas">Asaas</option>
                </select>
                <p className="text-xs text-gray-400 mt-2">Este será o processador oficial para cobrar as compras dos usuários e deduzir as taxas da plataforma.</p>
              </div>

              <div className="border-t border-gray-100 pt-6">
                <h4 className="text-md font-medium text-ml-dark mb-4">Credenciais de API ({provider === 'mercadopago' ? 'Mercado Pago' : provider === 'stripe' ? 'Stripe' : provider === 'pagarme' ? 'Pagar.me' : 'Asaas'})</h4>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Public Key / Chave Pública</label>
                    <input 
                      type="text" 
                      placeholder="Ex: APP_USR-..."
                      className="w-full h-12 px-4 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-ml-blue focus:border-transparent transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Access Token / Chave Privada</label>
                    <input 
                      type="password" 
                      placeholder="Ex: APP_USR-123456789..."
                      className="w-full h-12 px-4 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-ml-blue focus:border-transparent transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 flex gap-3">
                <Button className="bg-ml-blue text-white hover:bg-ml-hover font-semibold py-3 px-6 rounded-sm shadow-sm">
                  Salvar configurações
                </Button>
                <Button className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold py-3 px-6 rounded-sm shadow-sm">
                  Testar Conexão
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}
