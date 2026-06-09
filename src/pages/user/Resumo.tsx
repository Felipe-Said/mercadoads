import React from 'react'
import { UserLayout } from '../../components/layouts/UserLayout'
import { Card, CardContent } from '../../components/ui/card'
import { useAuth } from '../../contexts/AuthContext'

export function Resumo() {
  const { profile } = useAuth()
  const name = profile?.full_name || 'Usuario'
  const initial = name.charAt(0).toUpperCase()

  return (
    <UserLayout>
      <div className="space-y-6">
        <Card className="bg-white border-none shadow-sm rounded-md overflow-hidden">
          <CardContent className="p-8 flex items-center gap-6">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center text-3xl text-gray-400 font-light">{initial}</div>
            <div>
              <h1 className="text-2xl font-light text-ml-dark">Ola, {name}</h1>
              <p className="text-gray-500 mt-1">Conta {profile?.role ?? 'user'}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-none shadow-sm rounded-md">
          <CardContent className="p-6">
            <h2 className="text-lg font-medium text-ml-dark mb-2">Bem-vindo(a) a Mercado Ads</h2>
            <p className="text-sm text-gray-500">Navegue pelo painel lateral para acessar compras, afiliacoes ou atualizar suas informacoes.</p>
          </CardContent>
        </Card>
      </div>
    </UserLayout>
  )
}
