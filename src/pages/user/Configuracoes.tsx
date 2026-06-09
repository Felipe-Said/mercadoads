import React, { useEffect, useState } from 'react'
import { UserLayout } from '../../components/layouts/UserLayout'
import { Card, CardContent } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { useAuth } from '../../contexts/AuthContext'

export function Configuracoes() {
  const { user, profile, updateProfile } = useAuth()
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setFullName(profile?.full_name ?? '')
      setPhone(profile?.phone ?? '')
    }, 0)
    return () => window.clearTimeout(timeout)
  }, [profile])

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    await updateProfile({ full_name: fullName, phone })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <UserLayout>
      <div className="space-y-6">
        <h2 className="text-xl font-light text-ml-dark mb-4">Configuracoes da Conta</h2>

        <Card className="bg-white border-none shadow-sm rounded-md overflow-hidden max-w-2xl">
          <CardContent className="p-8">
            <h3 className="text-lg font-medium text-ml-dark mb-6">Dados Pessoais</h3>

            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label className="block text-sm text-gray-600 mb-2">Nome completo</label>
                <input type="text" value={fullName} onChange={(event) => setFullName(event.target.value)} className="w-full h-12 px-4 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-ml-blue focus:border-transparent transition-all" />
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-2">WhatsApp</label>
                <input type="tel" value={phone} onChange={(event) => setPhone(event.target.value)} className="w-full h-12 px-4 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-ml-blue focus:border-transparent transition-all" />
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-2">E-mail</label>
                <input type="email" value={user?.email ?? ''} className="w-full h-12 px-4 border border-gray-300 rounded-sm bg-gray-50" disabled />
                <p className="text-xs text-gray-400 mt-2">O e-mail nao pode ser alterado por motivos de seguranca.</p>
              </div>

              <div className="pt-4 border-t border-gray-100 flex items-center gap-3">
                <Button className="bg-ml-blue text-white hover:bg-ml-hover font-semibold py-3 px-6 rounded-sm shadow-sm">Salvar alteracoes</Button>
                {saved && <span className="text-sm text-green-600">Salvo.</span>}
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </UserLayout>
  )
}
