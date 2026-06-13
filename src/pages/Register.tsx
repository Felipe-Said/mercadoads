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
    <div className="min-h-screen px-4 py-16" style={{ backgroundColor: 'var(--layout-auth-page-bg)' }}>
      <div className="max-w-[420px] mx-auto">
        <div className="text-center mb-8 flex items-center justify-center">
          <PlatformLogo fallbackClassName="text-2xl" imageClassName="max-h-16" />
        </div>

        <Card className="overflow-hidden rounded-md border shadow-sm" style={{ backgroundColor: 'var(--layout-auth-card-bg)', borderColor: 'var(--layout-auth-card-border)', boxShadow: '0 1px 4px var(--layout-auth-card-shadow)' }}>
          <CardContent className="p-8">
            <h1 className="mb-2 text-2xl font-semibold" style={{ color: 'var(--layout-auth-title-text)' }}>Complete seus dados</h1>
            <p className="mb-6 text-sm" style={{ color: 'var(--layout-auth-body-text)' }}>Crie sua conta para comprar e gerenciar ativos digitais.</p>

            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label className="mb-1 block text-sm" style={{ color: 'var(--layout-auth-label-text)' }}>Nome completo</label>
                <input type="text" value={fullName} onChange={(event) => setFullName(event.target.value)} required className="h-12 w-full rounded-sm border px-4 transition-all focus:outline-none focus:ring-2" style={{ backgroundColor: 'var(--layout-auth-input-bg)', borderColor: 'var(--layout-auth-input-border)', color: 'var(--layout-auth-input-text)', '--tw-ring-color': 'var(--layout-auth-input-focus)' } as React.CSSProperties} />
              </div>

              <div>
                <label className="mb-1 block text-sm" style={{ color: 'var(--layout-auth-label-text)' }}>E-mail</label>
                <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required className="h-12 w-full rounded-sm border px-4 transition-all focus:outline-none focus:ring-2" style={{ backgroundColor: 'var(--layout-auth-input-bg)', borderColor: 'var(--layout-auth-input-border)', color: 'var(--layout-auth-input-text)', '--tw-ring-color': 'var(--layout-auth-input-focus)' } as React.CSSProperties} />
              </div>

              <div>
                <label className="mb-1 block text-sm" style={{ color: 'var(--layout-auth-label-text)' }}>Crie sua senha</label>
                <input type="password" minLength={6} value={password} onChange={(event) => setPassword(event.target.value)} required className="h-12 w-full rounded-sm border px-4 transition-all focus:outline-none focus:ring-2" style={{ backgroundColor: 'var(--layout-auth-input-bg)', borderColor: 'var(--layout-auth-input-border)', color: 'var(--layout-auth-input-text)', '--tw-ring-color': 'var(--layout-auth-input-focus)' } as React.CSSProperties} />
              </div>

              <div className="flex items-start gap-2 pt-2 pb-2">
                <input type="checkbox" id="terms" checked={acceptedTerms} onChange={(event) => setAcceptedTerms(event.target.checked)} className="mt-1" />
                <label htmlFor="terms" className="text-sm leading-snug" style={{ color: 'var(--layout-auth-body-text)' }}>
                  Aceito os termos e autorizo o uso dos meus dados conforme a politica de privacidade.
                </label>
              </div>

              {error && <p className="text-sm" style={{ color: 'var(--layout-auth-error-text)' }}>{error}</p>}

              <Button disabled={loading} className="auth-primary-button w-full rounded-sm py-6 text-base font-semibold shadow-sm">
                {loading ? 'Criando conta...' : 'Criar conta'}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <Link to="/login" className="text-sm hover:underline" style={{ color: 'var(--layout-auth-link-text)' }}>Ja tenho conta</Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
