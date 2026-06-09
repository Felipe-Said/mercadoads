import React, { useEffect, useState } from 'react'
import { SellerLayout } from '../../components/layouts/SellerLayout'
import { Card } from '../../components/ui/card'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'

type Affiliate = { id: string; commission_percent: number; status: string; user?: { full_name: string | null } | null }

export function AfiliadosSeller() {
  const { user } = useAuth()
  const [affiliates, setAffiliates] = useState<Affiliate[]>([])

  useEffect(() => {
    if (!user) return
    supabase.from('affiliates').select('id, commission_percent, status, user:user_id(full_name)').eq('seller_id', user.id)
      .then(({ data, error }) => {
        if (error) throw error
        setAffiliates((data ?? []) as Affiliate[])
      })
      .catch(console.error)
  }, [user])

  return (
    <SellerLayout>
      <div className="space-y-6">
        <h2 className="text-xl font-light text-ml-dark">Afiliados</h2>
        <Card className="bg-white border-none shadow-sm rounded-md overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-500"><tr><th className="px-6 py-4">Afiliado</th><th className="px-6 py-4">Comissao</th><th className="px-6 py-4">Status</th></tr></thead>
            <tbody className="divide-y divide-gray-100">
              {affiliates.map((item) => <tr key={item.id}><td className="px-6 py-4">{item.user?.full_name ?? 'Usuario'}</td><td className="px-6 py-4">{item.commission_percent}%</td><td className="px-6 py-4">{item.status}</td></tr>)}
              {affiliates.length === 0 && <tr><td className="px-6 py-8 text-center text-gray-500" colSpan={3}>Nenhum afiliado encontrado.</td></tr>}
            </tbody>
          </table>
        </Card>
      </div>
    </SellerLayout>
  )
}
