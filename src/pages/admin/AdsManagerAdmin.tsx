import React, { useEffect, useState } from 'react'
import { AdminLayout } from '../../components/layouts/AdminLayout'
import { Card, CardContent } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { supabase } from '../../lib/supabase'

export function AdsManagerAdmin() {
  const [budget, setBudget] = useState(0)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    supabase.from('platform_settings').select('ads_daily_budget').eq('id', 1).maybeSingle()
      .then(({ data, error }) => {
        if (error) throw error
        setBudget(Number(data?.ads_daily_budget ?? 0))
      })
      .catch(console.error)
  }, [])

  const save = async () => {
    const { error } = await supabase.from('platform_settings').update({ ads_daily_budget: budget }).eq('id', 1)
    if (error) throw error
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-2xl">
        <h2 className="text-xl font-light text-ml-dark">Ads Manager</h2>
        <Card className="bg-white border-none shadow-sm rounded-md"><CardContent className="p-6 space-y-4">
          <label className="block text-sm text-gray-600">Orcamento diario de anuncios</label>
          <input type="number" value={budget} onChange={(event) => setBudget(Number(event.target.value))} className="w-full h-12 px-4 border border-gray-300 rounded-sm" />
          <div className="flex items-center gap-3"><Button onClick={save}>Salvar</Button>{saved && <span className="text-sm text-green-600">Salvo.</span>}</div>
        </CardContent></Card>
      </div>
    </AdminLayout>
  )
}
