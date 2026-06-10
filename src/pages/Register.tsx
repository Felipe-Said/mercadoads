import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Card, CardContent } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { useAuth } from '../contexts/AuthContext'
import { PlatformLogo } from '../components/PlatformLogo'
import { supabase } from '../lib/supabase'

export function Register() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const { signUp } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError(null)

    if (!acceptedTerms) {
      setError('Aceite os termos para continuar.')
      return
    }

    setLoading(true)
    try {
      await signUp(fullName, email, password, 'user')
      const { data: sessionData } = await supabase.auth.getSession()
      if (!sessionData.session?.user) {
        setError('Conta criada. Confirme seu e-mail para entrar.')
        return
      }

      navigate('/painel/usuario')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Nao foi possivel criar a conta.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-[#ededed] min-h-screen py-16 px-4">
      <div className="max-w-[420px] mx-auto">
        <div className="text-center mb-8 flex items-center justify-center">
          <PlatformLogo fallbackClassName="text-2xl" imageClassName="max-h-16" />
        </div>

        <Card className="bg-white border-none shadow-sm rounded-md overflow-hidden">
          <CardContent className="p-8">
            <h1 className="text-2xl font-semibold text-ml-dark mb-2">Complete seus dados</h1>
            <p className="text-sm text-gray-500 mb-6">Crie sua conta para comprar e gerenciar ativos digitais.</p>

            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Nome completo</label>
                <input type="text" value={fullName} onChange={(event) => setFullName(event.target.value)} required className="w-full h-12 px-4 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-ml-blue focus:border-transparent transition-all" />
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-1">E-mail</label>
                <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required className="w-full h-12 px-4 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-ml-blue focus:border-transparent transition-all" />
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-1">Crie sua senha</label>
                <input type="password" minLength={6} value={password} onChange={(event) => setPassword(event.target.value)} required className="w-full h-12 px-4 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-ml-blue focus:border-transparent transition-all" />
              </div>

              <div className="flex items-start gap-2 pt-2 pb-2">
                <input type="checkbox" id="terms" checked={acceptedTerms} onChange={(event) => setAcceptedTerms(event.target.checked)} className="mt-1" />
                <label htmlFor="terms" className="text-sm text-gray-500 leading-snug">
                  Aceito os termos e autorizo o uso dos meus dados conforme a politica de privacidade.
                </label>
              </div>

              {error && <p className="text-sm text-red-500">{error}</p>}

              <Button disabled={loading} className="w-full bg-ml-blue text-white hover:bg-ml-hover font-semibold py-6 text-base rounded-sm shadow-sm">
                {loading ? 'Criando conta...' : 'Criar conta'}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <Link to="/login" className="text-ml-blue text-sm hover:underline">Ja tenho conta</Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
