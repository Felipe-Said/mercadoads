import React from 'react'
import { Link } from 'react-router-dom'
import { Card, CardContent } from '../components/ui/card'
import { Button } from '../components/ui/button'

export function Register() {
  return (
    <div className="bg-[#ededed] min-h-screen py-16 px-4">
      <div className="max-w-[420px] mx-auto">
        <div className="text-center mb-8 flex items-center justify-center font-bold text-2xl tracking-tight">
          <span className="text-ml-blue mr-1">Mercado</span>
          <span className="text-ml-dark">Ads</span>
        </div>
        
        <Card className="bg-white border-none shadow-sm rounded-md overflow-hidden">
          <CardContent className="p-8">
            <h1 className="text-2xl font-semibold text-ml-dark mb-2">Complete seus dados</h1>
            <p className="text-sm text-gray-500 mb-6">Crie sua conta para comprar e gerenciar ativos digitais.</p>
            
            <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Nome completo</label>
                <input 
                  type="text" 
                  className="w-full h-12 px-4 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-ml-blue focus:border-transparent transition-all"
                  placeholder="Ex: Maria Antonieta"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-1">E-mail</label>
                <input 
                  type="email" 
                  className="w-full h-12 px-4 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-ml-blue focus:border-transparent transition-all"
                  placeholder="Ex: maria@email.com"
                />
              </div>
              
              <div>
                <label className="block text-sm text-gray-600 mb-1">Crie sua senha</label>
                <input 
                  type="password" 
                  className="w-full h-12 px-4 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-ml-blue focus:border-transparent transition-all"
                />
              </div>

              <div className="flex items-start gap-2 pt-2 pb-4">
                <input type="checkbox" id="terms" className="mt-1" />
                <label htmlFor="terms" className="text-sm text-gray-500 leading-snug">
                  Aceito os <a href="#" className="text-ml-blue hover:underline">Termos e Condições</a> e autorizo o uso de meus dados de acordo com a <a href="#" className="text-ml-blue hover:underline">Declaração de Privacidade</a>.
                </label>
              </div>
              
              <Button className="w-full bg-ml-blue text-white hover:bg-ml-hover font-semibold py-6 text-base rounded-sm shadow-sm mb-4">
                Criar conta
              </Button>
            </form>

            <div className="mt-6 text-center border-t border-gray-100 pt-6">
              <p className="text-sm text-gray-500 mb-2">Já tem uma conta?</p>
              <Link to="/login" className="text-ml-blue hover:underline font-medium">
                Entrar
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
