import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Card, CardContent } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { useAuth } from '../contexts/AuthContext'

export function Login() {
  const [email, setEmail] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simulating role based on email input
    if (email.includes('admin')) {
      login('admin');
      navigate('/painel/admin');
    } else if (email.includes('vendedor') || email.includes('agencia')) {
      login('seller');
      navigate('/painel/vendedor');
    } else {
      login('user');
      navigate('/painel/usuario');
    }
  }
  return (
    <div className="bg-[#ededed] min-h-screen py-16 px-4">
      <div className="max-w-[420px] mx-auto">
        <div className="text-center mb-8 flex items-center justify-center font-bold text-2xl tracking-tight">
          <span className="text-ml-blue mr-1">Mercado</span>
          <span className="text-ml-dark">Ads</span>
        </div>
        
        <Card className="bg-white border-none shadow-sm rounded-md overflow-hidden">
          <CardContent className="p-8">
            <h1 className="text-2xl font-semibold text-ml-dark mb-6">Olá! Para continuar, digite o seu e-mail, telefone ou usuário</h1>
            
            <form className="space-y-4" onSubmit={handleLogin}>
              <div>
                <label className="block text-sm text-gray-600 mb-1">E-mail, telefone ou usuário</label>
                <input 
                  type="text" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Dica: digite 'admin' ou 'vendedor' para testar os painéis"
                  className="w-full h-12 px-4 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-ml-blue focus:border-transparent transition-all"
                />
              </div>
              
              <div>
                <label className="block text-sm text-gray-600 mb-1">Senha</label>
                <input 
                  type="password" 
                  className="w-full h-12 px-4 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-ml-blue focus:border-transparent transition-all"
                />
              </div>

              <div className="flex justify-end pt-1 mb-4">
                <a href="#" className="text-sm text-ml-blue hover:underline">Esqueci minha senha</a>
              </div>
              
              <Button className="w-full bg-ml-blue text-white hover:bg-ml-hover font-semibold py-6 text-base rounded-sm shadow-sm mb-4">
                Continuar
              </Button>
            </form>

            <div className="mt-8 text-center border-t border-gray-100 pt-6">
              <p className="text-sm text-gray-500 mb-4">É novo no Mercado Ads?</p>
              <Link to="/cadastro" className="block w-full py-3 text-ml-blue font-semibold bg-ml-blue/10 hover:bg-ml-blue/20 rounded-sm transition-colors">
                Criar conta
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
