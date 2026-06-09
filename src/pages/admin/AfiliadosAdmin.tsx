import React, { useCallback, useEffect, useState } from 'react'
import { AdminLayout } from '../../components/layouts/AdminLayout'
import { Card, CardContent } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { supabase } from '../../lib/supabase'

type ProfileOption = {
  id: string
  full_name: string | null
  email: string | null
  role: string
}

type Affiliate = {
  id: string
  commission_percent: number
  status: string
  user?: { full_name: string | null; email: string | null } | null
  seller?: { full_name: string | null; email: string | null } | null
}

export function AfiliadosAdmin() {
  const [affiliates, setAffiliates] = useState<Affiliate[]>([])
  const [sellers, setSellers] = useState<ProfileOption[]>([])
  const [affiliateEmail, setAffiliateEmail] = useState('')
  const [sellerId, setSellerId] = useState('')
  const [commission, setCommission] = useState('15')
  const [message, setMessage] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const loadData = useCallback(async () => {
    const [affiliateResult, sellersResult] = await Promise.all([
      supabase
        .from('affiliates')
        .select('id, commission_percent, status, user:user_id(full_name,email), seller:seller_id(full_name,email)')
        .order('created_at', { ascending: false }),
      supabase
        .from('profiles')
        .select('id, full_name, email, role')
        .eq('role', 'seller')
        .order('full_name', { ascending: true }),
    ])

    if (affiliateResult.error) throw affiliateResult.error
    if (sellersResult.error) throw sellersResult.error

    setAffiliates((affiliateResult.data ?? []) as Affiliate[])
    setSellers((sellersResult.data ?? []) as ProfileOption[])
    setSellerId((current) => current || sellersResult.data?.[0]?.id || '')
  }, [])

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      loadData().catch(console.error)
    }, 0)
    return () => window.clearTimeout(timeout)
  }, [loadData])

  const inviteAffiliate = async (event: React.FormEvent) => {
    event.preventDefault()
    setMessage(null)

    if (!sellerId) {
      setMessage('Selecione um vendedor.')
      return
    }

    setLoading(true)

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, email, role')
      .ilike('email', affiliateEmail.trim())
      .maybeSingle()

    if (profileError || !profile) {
      setMessage(profileError?.message ?? 'Usuario nao encontrado pelo e-mail informado.')
      setLoading(false)
      return
    }

    if (profile.id === sellerId) {
      setMessage('O afiliado nao pode ser o mesmo perfil do vendedor.')
      setLoading(false)
      return
    }

    const { data: existingAffiliate, error: existingError } = await supabase
      .from('affiliates')
      .select('id')
      .eq('user_id', profile.id)
      .eq('seller_id', sellerId)
      .maybeSingle()

    if (existingError) {
      setMessage(existingError.message)
      setLoading(false)
      return
    }

    const payload = {
      user_id: profile.id,
      seller_id: sellerId,
      commission_percent: Number(commission || 0),
      status: 'active',
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
    await loadData()
    setMessage('Afiliado convidado e ativado.')
    setLoading(false)
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <h2 className="text-xl font-light text-ml-dark">Afiliados</h2>

        <Card className="bg-white border-none shadow-sm rounded-md">
          <CardContent className="p-6">
            <h3 className="text-lg font-medium text-ml-dark mb-4">Convidar afiliado</h3>
            <form className="grid grid-cols-1 md:grid-cols-4 gap-4" onSubmit={inviteAffiliate}>
              <div className="md:col-span-2">
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Vendedor</label>
                <select
                  value={sellerId}
                  onChange={(event) => setSellerId(event.target.value)}
                  className="w-full h-10 px-3 border border-gray-300 rounded-sm bg-white focus:outline-none focus:border-ml-blue"
                  required
                >
                  {sellers.map((seller) => (
                    <option key={seller.id} value={seller.id}>{seller.full_name || seller.email || 'Vendedor'}</option>
                  ))}
                </select>
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
              <div className="md:col-span-4 flex items-center justify-end gap-3">
                {message && <span className={`text-sm ${message.includes('convidado') ? 'text-green-600' : 'text-red-600'}`}>{message}</span>}
                <Button type="submit" disabled={loading} className="bg-ml-blue text-white hover:bg-ml-hover rounded-sm">
                  {loading ? 'Enviando...' : 'Convidar afiliado'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card className="bg-white border-none shadow-sm rounded-md overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-500">
              <tr>
                <th className="px-6 py-4">Afiliado</th>
                <th className="px-6 py-4">Vendedor</th>
                <th className="px-6 py-4">Comissao</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {affiliates.map((item) => (
                <tr key={item.id}>
                  <td className="px-6 py-4">
                    <p className="font-medium text-ml-dark">{item.user?.full_name ?? 'Usuario'}</p>
                    <p className="text-xs text-gray-500">{item.user?.email ?? '-'}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-medium text-ml-dark">{item.seller?.full_name ?? 'Vendedor'}</p>
                    <p className="text-xs text-gray-500">{item.seller?.email ?? '-'}</p>
                  </td>
                  <td className="px-6 py-4">{item.commission_percent}%</td>
                  <td className="px-6 py-4">{item.status}</td>
                </tr>
              ))}
              {affiliates.length === 0 && <tr><td className="px-6 py-8 text-center text-gray-500" colSpan={4}>Nenhuma afiliacao encontrada.</td></tr>}
            </tbody>
          </table>
        </Card>
      </div>
    </AdminLayout>
  )
}
