import React, { useEffect, useState } from 'react'
import { AdminLayout } from '../../components/layouts/AdminLayout'
import { Card } from '../../components/ui/card'
import { supabase } from '../../lib/supabase'

type Affiliate = { id: string; commission_percent: number; status: string; user?: { full_name: string | null } | null; seller?: { full_name: string | null } | null }

export function AfiliadosAdmin() {
  const [affiliates, setAffiliates] = useState<Affiliate[]>([])

  useEffect(() => {
    supabase.from('affiliates').select('id, commission_percent, status, user:user_id(full_name), seller:seller_id(full_name)')
      .then(({ data, error }) => {
        if (error) throw error
        setAffiliates((data ?? []) as Affiliate[])
      })
      .catch(console.error)
  }, [])

  return (
    <AdminLayout>
      <div className="space-y-6">
        <h2 className="text-xl font-light text-ml-dark">Afiliados</h2>
        <Card className="bg-white border-none shadow-sm rounded-md overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-500"><tr><th className="px-6 py-4">Afiliado</th><th className="px-6 py-4">Vendedor</th><th className="px-6 py-4">Comissao</th><th className="px-6 py-4">Status</th></tr></thead>
            <tbody className="divide-y divide-gray-100">
              {affiliates.map((item) => <tr key={item.id}><td className="px-6 py-4">{item.user?.full_name ?? 'Usuario'}</td><td className="px-6 py-4">{item.seller?.full_name ?? 'Vendedor'}</td><td className="px-6 py-4">{item.commission_percent}%</td><td className="px-6 py-4">{item.status}</td></tr>)}
              {affiliates.length === 0 && <tr><td className="px-6 py-8 text-center text-gray-500" colSpan={4}>Nenhuma afiliacao encontrada.</td></tr>}
            </tbody>
          </table>
        </Card>
      </div>
    </AdminLayout>
  )
}
