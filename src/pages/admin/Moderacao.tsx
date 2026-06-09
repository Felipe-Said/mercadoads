import React, { useEffect, useState } from 'react'
import { AdminLayout } from '../../components/layouts/AdminLayout'
import { Card } from '../../components/ui/card'
import { formatCurrency, formatDate } from '../../lib/data'
import { supabase } from '../../lib/supabase'

type PendingProduct = {
  id: string
  title: string
  price: number
  created_at: string
  profiles?: { full_name: string | null } | null
}

type SellerRequest = {
  id: string
  user_id: string | null
  full_name: string
  email: string
  phone: string | null
  asset_type: string | null
  status: 'pending' | 'approved' | 'rejected'
  created_at: string
}

export function Moderacao() {
  const [products, setProducts] = useState<PendingProduct[]>([])
  const [sellerRequests, setSellerRequests] = useState<SellerRequest[]>([])
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    const loadProducts = supabase
      .from('products')
      .select('id, title, price, created_at, profiles:seller_id(full_name)')
      .eq('status', 'draft')
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (error) throw error
        setProducts((data ?? []).map((item) => ({ ...item, price: Number(item.price) })) as PendingProduct[])
      })

    const loadSellerRequests = supabase
      .from('seller_requests')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (error) throw error
        setSellerRequests((data ?? []) as SellerRequest[])
      })

    Promise.all([loadProducts, loadSellerRequests]).catch((error) => {
      console.error(error)
      setMessage(error.message)
    })
  }, [])

  const updateStatus = async (id: string, status: 'active' | 'rejected') => {
    const { error } = await supabase.from('products').update({ status }).eq('id', id)
    if (error) throw error
    setProducts((current) => current.filter((product) => product.id !== id))
  }

  const updateSellerRequest = async (request: SellerRequest, status: 'approved' | 'rejected') => {
    setMessage(null)

    try {
      let profileId = request.user_id

      if (status === 'approved' && !profileId) {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('id')
          .eq('email', request.email)
          .maybeSingle()

        if (profileError) throw profileError
        profileId = profile?.id ?? null
      }

      if (status === 'approved') {
        if (!profileId) {
          setMessage('Nao encontrei uma conta de usuario com este e-mail. O usuario precisa criar/login na conta antes de virar vendedor.')
          return
        }

        const { error: profileUpdateError } = await supabase
          .from('profiles')
          .update({ role: 'seller' })
          .eq('id', profileId)

        if (profileUpdateError) throw profileUpdateError
      }

      const { error } = await supabase
        .from('seller_requests')
        .update({ status, user_id: profileId })
        .eq('id', request.id)

      if (error) throw error

      setSellerRequests((current) => current.filter((item) => item.id !== request.id))
      setMessage(status === 'approved' ? 'Solicitacao aprovada e vendedor liberado.' : 'Solicitacao rejeitada.')
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Nao foi possivel atualizar a solicitacao.')
    }
  }

  const totalPending = products.length + sellerRequests.length

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-light text-ml-dark">Fila de Moderacao</h2>
          <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-1 rounded-sm">{totalPending} pendentes</span>
        </div>

        {message && (
          <div className={`rounded-sm px-4 py-3 text-sm ${message.includes('aprovada') || message.includes('rejeitada') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
            {message}
          </div>
        )}

        <Card className="bg-white border-none shadow-sm rounded-md overflow-hidden">
          <div className="border-b border-gray-100 px-6 py-4">
            <h3 className="text-base font-medium text-ml-dark">Solicitacoes de vendedor</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50/50 text-gray-500 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 font-medium">Nome</th>
                  <th className="px-6 py-4 font-medium">E-mail</th>
                  <th className="px-6 py-4 font-medium">Ativos</th>
                  <th className="px-6 py-4 font-medium">Data</th>
                  <th className="px-6 py-4 font-medium text-right">Acoes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {sellerRequests.map((request) => (
                  <tr key={request.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-ml-dark">
                      <div>{request.full_name}</div>
                      {request.phone && <div className="text-xs font-normal text-gray-500 mt-1">{request.phone}</div>}
                    </td>
                    <td className="px-6 py-4 text-gray-500">{request.email}</td>
                    <td className="px-6 py-4">{request.asset_type ?? '-'}</td>
                    <td className="px-6 py-4 text-gray-500">{formatDate(request.created_at)}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => updateSellerRequest(request, 'approved')} className="text-green-600 bg-green-50 hover:bg-green-100 px-3 py-1.5 rounded-sm transition-colors">Aprovar</button>
                        <button onClick={() => updateSellerRequest(request, 'rejected')} className="text-red-600 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-sm transition-colors">Rejeitar</button>
                      </div>
                    </td>
                  </tr>
                ))}
                {sellerRequests.length === 0 && (
                  <tr>
                    <td className="px-6 py-8 text-center text-gray-500" colSpan={5}>Nenhuma solicitacao de vendedor pendente.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>

        <Card className="bg-white border-none shadow-sm rounded-md overflow-hidden">
          <div className="border-b border-gray-100 px-6 py-4">
            <h3 className="text-base font-medium text-ml-dark">Anuncios pendentes</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50/50 text-gray-500 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 font-medium">Vendedor</th>
                  <th className="px-6 py-4 font-medium">Ativo</th>
                  <th className="px-6 py-4 font-medium">Preco</th>
                  <th className="px-6 py-4 font-medium text-right">Acoes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {products.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-ml-dark">{product.profiles?.full_name ?? 'Vendedor'}</td>
                    <td className="px-6 py-4">{product.title}</td>
                    <td className="px-6 py-4">{formatCurrency(product.price)}</td>
                    <td className="px-6 py-4 text-right flex justify-end gap-2">
                      <button onClick={() => updateStatus(product.id, 'active')} className="text-green-600 bg-green-50 hover:bg-green-100 px-3 py-1.5 rounded-sm transition-colors">Aprovar</button>
                      <button onClick={() => updateStatus(product.id, 'rejected')} className="text-red-600 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-sm transition-colors">Rejeitar</button>
                    </td>
                  </tr>
                ))}
                {products.length === 0 && (
                  <tr>
                    <td className="px-6 py-8 text-center text-gray-500" colSpan={4}>Nenhum anuncio pendente.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </AdminLayout>
  )
}
