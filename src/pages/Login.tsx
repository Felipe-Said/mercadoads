import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Card, CardContent } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { useAuth } from '../contexts/AuthContext'

export function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const { signIn } = useAuth()
  const navigate = useNavigate()

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const profile = await signIn(email, password)
      if (profile?.role === 'admin') navigate('/painel/admin')
      else if (profile?.role === 'seller') navigate('/painel/vendedor')
      else navigate('/painel/usuario')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Nao foi possivel entrar.')
    } finally {
      setLoading(false)
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
            <h1 className="text-2xl font-semibold text-ml-dark mb-6">Entre na sua conta</h1>

            <form className="space-y-4" onSubmit={handleLogin}>
              <div>
                <label className="block text-sm text-gray-600 mb-1">E-mail</label>
                <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required className="w-full h-12 px-4 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-ml-blue focus:border-transparent transition-all" />
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-1">Senha</label>
                <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required className="w-full h-12 px-4 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-ml-blue focus:border-transparent transition-all" />
              </div>

              {error && <p className="text-sm text-red-500">{error}</p>}

              <Button disabled={loading} className="w-full bg-ml-blue text-white hover:bg-ml-hover font-semibold py-6 text-base rounded-sm shadow-sm">
                {loading ? 'Entrando...' : 'Entrar'}
              </Button>
            </form>

            <div className="mt-6 pt-6 border-t border-gray-100 text-center">
              <Link to="/cadastro" className="text-ml-blue text-sm hover:underline">Criar uma conta</Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
