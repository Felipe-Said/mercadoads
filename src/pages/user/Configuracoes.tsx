import React from 'react'
import { UserLayout } from '../../components/layouts/UserLayout'
import { Card, CardContent } from '../../components/ui/card'
import { Button } from '../../components/ui/button'

export function Configuracoes() {
  return (
    <UserLayout>
      <div className="space-y-6">
        <h2 className="text-xl font-light text-ml-dark mb-4">Configurações da Conta</h2>

        <Card className="bg-white border-none shadow-sm rounded-md overflow-hidden max-w-2xl">
          <CardContent className="p-8">
            <h3 className="text-lg font-medium text-ml-dark mb-6">Dados Pessoais</h3>
            
            <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
              <div>
                <label className="block text-sm text-gray-600 mb-2">Nome completo</label>
                <input 
                  type="text" 
                  defaultValue="Maria Antonieta"
                  className="w-full h-12 px-4 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-ml-blue focus:border-transparent transition-all"
                />
              </div>
              
              <div>
                <label className="block text-sm text-gray-600 mb-2">E-mail</label>
                <input 
                  type="email" 
                  defaultValue="maria@email.com"
                  className="w-full h-12 px-4 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-ml-blue focus:border-transparent transition-all bg-gray-50"
                  disabled
                />
                <p className="text-xs text-gray-400 mt-2">O e-mail não pode ser alterado por motivos de segurança.</p>
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
    </UserLayout>
  )
}
