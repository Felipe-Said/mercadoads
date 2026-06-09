import React, { useEffect, useState } from 'react'
import { AdminLayout } from '../../components/layouts/AdminLayout'
import { Card, CardContent } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { supabase } from '../../lib/supabase'

export function Taxas() {
  const [platformFee, setPlatformFee] = useState(0)
  const [affiliateFee, setAffiliateFee] = useState(0)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    supabase.from('platform_settings').select('platform_fee_percent, affiliate_fee_percent').eq('id', 1).maybeSingle()
      .then(({ data, error }) => {
        if (error) throw error
        setPlatformFee(Number(data?.platform_fee_percent ?? 0))
        setAffiliateFee(Number(data?.affiliate_fee_percent ?? 0))
      })
      .catch(console.error)
  }, [])

  const save = async () => {
    const { error } = await supabase.from('platform_settings').update({ platform_fee_percent: platformFee, affiliate_fee_percent: affiliateFee }).eq('id', 1)
    if (error) throw error
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-2xl">
        <h2 className="text-xl font-light text-ml-dark">Taxas</h2>
        <Card className="bg-white border-none shadow-sm rounded-md"><CardContent className="p-6 space-y-4">
          <label className="block text-sm text-gray-600">Taxa da plataforma (%)</label>
          <input type="number" value={platformFee} onChange={(event) => setPlatformFee(Number(event.target.value))} className="w-full h-12 px-4 border border-gray-300 rounded-sm" />
          <label className="block text-sm text-gray-600">Taxa de afiliacao (%)</label>
          <input type="number" value={affiliateFee} onChange={(event) => setAffiliateFee(Number(event.target.value))} className="w-full h-12 px-4 border border-gray-300 rounded-sm" />
          <div className="flex items-center gap-3 pt-2"><Button onClick={save}>Salvar</Button>{saved && <span className="text-sm text-green-600">Salvo.</span>}</div>
        </CardContent></Card>
      </div>
    </AdminLayout>
  )
}
