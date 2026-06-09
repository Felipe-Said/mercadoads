import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'

export function SellerRegistration() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-16 mb-16">
      <Card className="bg-white border-none shadow-sm rounded-md">
        <CardHeader className="text-center pb-2 border-b border-gray-100">
          <CardTitle className="text-2xl font-light text-ml-dark">Comece a vender hoje mesmo</CardTitle>
          <p className="text-gray-500 text-sm mt-2">
            Cadastre-se como vendedor na Mercado Ads e alcance milhares de compradores.
          </p>
        </CardHeader>
        <CardContent className="pt-8 px-8 pb-8 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nome completo</label>
            <input 
              type="text" 
              className="w-full h-12 px-4 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-ml-blue focus:border-transparent transition-all"
              placeholder="Ex: João da Silva"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">E-mail corporativo</label>
            <input 
              type="email" 
              className="w-full h-12 px-4 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-ml-blue focus:border-transparent transition-all"
              placeholder="Ex: contato@empresa.com.br"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp</label>
            <input 
              type="tel" 
              className="w-full h-12 px-4 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-ml-blue focus:border-transparent transition-all"
              placeholder="(00) 00000-0000"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Quais ativos você pretende vender?</label>
            <select className="w-full h-12 px-4 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-ml-blue focus:border-transparent transition-all bg-white text-gray-700">
              <option value="">Selecione uma opção</option>
              <option value="meta">Contas / BMs (Meta Ads)</option>
              <option value="google">Contas Google Ads</option>
              <option value="tiktok">Contas TikTok Ads</option>
              <option value="outros">Outros</option>
            </select>
          </div>
          
          <div className="pt-4">
            <Button className="w-full bg-ml-blue text-white hover:bg-ml-hover font-semibold py-6 text-base rounded-sm shadow-sm">
              Enviar Solicitação
            </Button>
            <p className="text-center text-[12px] text-gray-400 mt-4">
              Ao continuar, você concorda com os <a href="#" className="text-ml-blue hover:underline">Termos e Condições</a>.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
