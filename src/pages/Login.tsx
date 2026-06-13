import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Card, CardContent } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { useAuth } from '../contexts/AuthContext'
import { PlatformLogo } from '../components/PlatformLogo'

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
    <div className="min-h-screen px-4 py-16" style={{ backgroundColor: 'var(--layout-auth-page-bg)' }}>
      <div className="max-w-[420px] mx-auto">
        <div className="text-center mb-8 flex items-center justify-center">
          <PlatformLogo fallbackClassName="text-2xl" imageClassName="max-h-16" />
        </div>

        <Card className="overflow-hidden rounded-md border shadow-sm" style={{ backgroundColor: 'var(--layout-auth-card-bg)', borderColor: 'var(--layout-auth-card-border)', boxShadow: '0 1px 4px var(--layout-auth-card-shadow)' }}>
          <CardContent className="p-8">
            <h1 className="mb-6 text-2xl font-semibold" style={{ color: 'var(--layout-auth-title-text)' }}>Entre na sua conta</h1>

            <form className="space-y-4" onSubmit={handleLogin}>
              <div>
                <label className="mb-1 block text-sm" style={{ color: 'var(--layout-auth-label-text)' }}>E-mail</label>
                <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required className="h-12 w-full rounded-sm border px-4 transition-all focus:outline-none focus:ring-2" style={{ backgroundColor: 'var(--layout-auth-input-bg)', borderColor: 'var(--layout-auth-input-border)', color: 'var(--layout-auth-input-text)', '--tw-ring-color': 'var(--layout-auth-input-focus)' } as React.CSSProperties} />
              </div>

              <div>
                <label className="mb-1 block text-sm" style={{ color: 'var(--layout-auth-label-text)' }}>Senha</label>
                <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required className="h-12 w-full rounded-sm border px-4 transition-all focus:outline-none focus:ring-2" style={{ backgroundColor: 'var(--layout-auth-input-bg)', borderColor: 'var(--layout-auth-input-border)', color: 'var(--layout-auth-input-text)', '--tw-ring-color': 'var(--layout-auth-input-focus)' } as React.CSSProperties} />
              </div>

              {error && <p className="text-sm" style={{ color: 'var(--layout-auth-error-text)' }}>{error}</p>}

              <Button disabled={loading} className="auth-primary-button w-full rounded-sm py-6 text-base font-semibold shadow-sm">
                {loading ? 'Entrando...' : 'Entrar'}
              </Button>
            </form>

            <div className="mt-6 border-t pt-6 text-center" style={{ borderColor: 'var(--layout-auth-divider)' }}>
              <Link to="/cadastro" className="text-sm hover:underline" style={{ color: 'var(--layout-auth-link-text)' }}>Criar uma conta</Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
