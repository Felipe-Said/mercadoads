import React, { useEffect, useState } from 'react'
import { UserLayout } from '../../components/layouts/UserLayout'
import { Card } from '../../components/ui/card'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'

type Affiliate = {
  id: string
  commission_percent: number
  status: string
  created_at: string
  seller?: { full_name: string | null } | null
}

export function AfiliacoesUser() {
  const { user } = useAuth()
  const [affiliates, setAffiliates] = useState<Affiliate[]>([])

  useEffect(() => {
    if (!user) return
    supabase
      .from('affiliates')
      .select('id, commission_percent, status, created_at, seller:seller_id(full_name)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (error) throw error
        setAffiliates((data ?? []) as Affiliate[])
      })
      .catch(console.error)
  }, [user])

  return (
    <UserLayout>
      <div className="space-y-6">
        <h2 className="text-xl font-light text-ml-dark mb-4">Minhas Afiliacoes</h2>
        <Card className="bg-white border-none shadow-sm rounded-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50/50 text-gray-500 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 font-medium">Vendedor</th>
                  <th className="px-6 py-4 font-medium">Comissao</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {affiliates.map((affiliate) => (
                  <tr key={affiliate.id}>
                    <td className="px-6 py-4 font-medium text-ml-dark">{affiliate.seller?.full_name ?? 'Vendedor'}</td>
                    <td className="px-6 py-4">{affiliate.commission_percent}%</td>
                    <td className="px-6 py-4">{affiliate.status}</td>
                  </tr>
                ))}
                {affiliates.length === 0 && (
                  <tr>
                    <td className="px-6 py-8 text-center text-gray-500" colSpan={3}>Nenhuma afiliacao encontrada.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </UserLayout>
  )
}
