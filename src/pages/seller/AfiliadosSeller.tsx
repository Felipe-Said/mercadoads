import React, { useCallback, useEffect, useState } from 'react'
import { SellerLayout } from '../../components/layouts/SellerLayout'
import { Card, CardContent } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'

type Affiliate = {
  id: string
  commission_percent: number
  status: string
  user?: { full_name: string | null; email: string | null } | null
}

export function AfiliadosSeller() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<'lista' | 'convidar'>('lista')
  const [affiliates, setAffiliates] = useState<Affiliate[]>([])
  const [affiliateEmail, setAffiliateEmail] = useState('')
  const [commission, setCommission] = useState('15')
  const [message, setMessage] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const loadAffiliates = useCallback(async () => {
    if (!user) return

    const { data, error } = await supabase
      .from('affiliates')
      .select('id, commission_percent, status, user:user_id(full_name,email)')
      .eq('seller_id', user.id)
      .order('created_at', { ascending: false })

    if (error) throw error
    setAffiliates((data ?? []) as Affiliate[])
  }, [user])

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      loadAffiliates().catch(console.error)
    }, 0)
    return () => window.clearTimeout(timeout)
  }, [loadAffiliates])

  const inviteAffiliate = async (event: React.FormEvent) => {
    event.preventDefault()
    setMessage(null)

    if (!user) {
      setMessage('Sessao nao encontrada. Entre novamente.')
      return
    }

    setLoading(true)

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, email')
      .ilike('email', affiliateEmail.trim())
      .maybeSingle()

    if (profileError || !profile) {
      setMessage(profileError?.message ?? 'Usuario nao encontrado pelo e-mail informado.')
      setLoading(false)
      return
    }

    if (profile.id === user.id) {
      setMessage('Voce nao pode convidar a propria conta como afiliado.')
      setLoading(false)
      return
    }

    const { data: existingAffiliate, error: existingError } = await supabase
      .from('affiliates')
      .select('id')
      .eq('user_id', profile.id)
      .eq('seller_id', user.id)
      .maybeSingle()

    if (existingError) {
      setMessage(existingError.message)
      setLoading(false)
      return
    }

    const payload = {
      user_id: profile.id,
      seller_id: user.id,
      commission_percent: Number(commission || 0),
      status: 'pending',
    }

    const { error } = existingAffiliate
      ? await supabase.from('affiliates').update(payload).eq('id', existingAffiliate.id)
      : await supabase.from('affiliates').insert(payload)

    if (error) {
      setMessage(error.message)
      setLoading(false)
      return
    }

    setAffiliateEmail('')
    setCommission('15')
    await loadAffiliates()
    setMessage('Convite enviado para o usuario.')
    setActiveTab('lista')
    setLoading(false)
  }

  const removeAffiliate = async (affiliateId: string) => {
    if (!user) return
    const confirmed = window.confirm('Remover este afiliado da sua rede? Ele nao podera usar o link ate ser convidado novamente.')
    if (!confirmed) return

    setMessage(null)
    const { error } = await supabase
      .from('affiliates')
      .update({ status: 'inactive' })
      .eq('id', affiliateId)
      .eq('seller_id', user.id)

    if (error) {
      setMessage(error.message)
      return
    }

    await loadAffiliates()
    setMessage('Afiliado removido da rede.')
  }

  const visibleAffiliates = affiliates.filter((item) => item.status !== 'inactive')

  return (
    <SellerLayout>
      <div className="space-y-6">
        <h2 className="text-xl font-light text-ml-dark">Meus Afiliados</h2>

        <div className="flex gap-1 bg-white p-1 rounded-md shadow-sm w-max border border-gray-100">
          <button
            onClick={() => setActiveTab('lista')}
            className={`px-6 py-2 text-sm font-medium rounded-sm transition-colors ${activeTab === 'lista' ? 'bg-ml-blue/10 text-ml-blue' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Rede de afiliados
          </button>
          <button
            onClick={() => setActiveTab('convidar')}
            className={`px-6 py-2 text-sm font-medium rounded-sm transition-colors ${activeTab === 'convidar' ? 'bg-ml-blue/10 text-ml-blue' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Convidar afiliado
          </button>
        </div>

        {activeTab === 'convidar' && (
          <Card className="bg-white border-none shadow-sm rounded-md max-w-2xl">
            <CardContent className="p-6">
              <h3 className="text-lg font-medium text-ml-dark mb-2">Convidar afiliado</h3>
              <p className="text-sm text-gray-500 mb-6">O convite sera vinculado automaticamente a sua conta de vendedor.</p>
              <form className="grid grid-cols-1 md:grid-cols-[1fr_140px] gap-4" onSubmit={inviteAffiliate}>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">E-mail do usuario</label>
                  <input
                    type="email"
                    value={affiliateEmail}
                    onChange={(event) => setAffiliateEmail(event.target.value)}
                    className="w-full h-10 px-3 border border-gray-300 rounded-sm focus:outline-none focus:border-ml-blue"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Comissao (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={commission}
                    onChange={(event) => setCommission(event.target.value)}
                    className="w-full h-10 px-3 border border-gray-300 rounded-sm focus:outline-none focus:border-ml-blue"
                    required
                  />
                </div>
                <div className="md:col-span-2 flex items-center justify-end gap-3">
                  {message && <span className={`text-sm ${message.includes('enviado') ? 'text-green-600' : 'text-red-600'}`}>{message}</span>}
                  <Button type="submit" disabled={loading} className="bg-ml-blue text-white hover:bg-ml-hover rounded-sm">
                    {loading ? 'Enviando...' : 'Enviar convite'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {activeTab === 'lista' && (
          <Card className="bg-white border-none shadow-sm rounded-md overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-500">
                <tr>
                  <th className="px-6 py-4">Afiliado</th>
                  <th className="px-6 py-4">Comissao</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Acoes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {visibleAffiliates.map((item) => (
                  <tr key={item.id}>
                    <td className="px-6 py-4">
                      <p className="font-medium text-ml-dark">{item.user?.full_name ?? 'Usuario'}</p>
                      <p className="text-xs text-gray-500">{item.user?.email ?? '-'}</p>
                    </td>
                    <td className="px-6 py-4">{item.commission_percent}%</td>
                    <td className="px-6 py-4">{item.status}</td>
                    <td className="px-6 py-4 text-right">
                      <button
                        type="button"
                        onClick={() => removeAffiliate(item.id)}
                        className="rounded-sm px-3 py-1.5 text-xs font-semibold text-red-600 transition-colors hover:bg-red-50 hover:text-red-700"
                      >
                        Remover
                      </button>
                    </td>
                  </tr>
                ))}
                {visibleAffiliates.length === 0 && <tr><td className="px-6 py-8 text-center text-gray-500" colSpan={4}>Nenhum afiliado encontrado.</td></tr>}
              </tbody>
            </table>
          </Card>
        )}
      </div>
    </SellerLayout>
  )
}
