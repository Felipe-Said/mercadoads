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
        if (!error && data) {
          setPlatformFee(Number(data.platform_fee_percent ?? 0))
          setAffiliateFee(Number(data.affiliate_fee_percent ?? 0))
        }
      })
      .catch(console.error)
  }, [])

  const save = async (e: React.FormEvent) => {
    e.preventDefault()
    const { error } = await supabase.from('platform_settings').update({ platform_fee_percent: platformFee, affiliate_fee_percent: affiliateFee }).eq('id', 1)
    if (!error) {
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    }
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <h2 className="text-xl font-light text-ml-dark mb-4">Taxas e Configurações da Plataforma</h2>

        <Card className="bg-white border-none shadow-sm rounded-md overflow-hidden max-w-2xl">
          <CardContent className="p-8">
            <h3 className="text-lg font-medium text-ml-dark mb-6">Comissões</h3>
            
            <form className="space-y-6" onSubmit={save}>
              <div>
                <label className="block text-sm text-gray-600 mb-2">Taxa base da plataforma (%)</label>
                <div className="relative">
                  <input 
                    type="number" 
                    value={platformFee}
                    onChange={(e) => setPlatformFee(Number(e.target.value))}
                    className="w-full h-12 px-4 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-ml-blue focus:border-transparent transition-all"
                  />
                  <span className="absolute right-4 top-3 text-gray-400">%</span>
                </div>
                <p className="text-xs text-gray-400 mt-2">Esta é a taxa que a Mercado Ads retém em cada venda de ativo.</p>
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-2">Taxa de afiliados (%)</label>
                <div className="relative">
                  <input 
                    type="number" 
                    value={affiliateFee}
                    onChange={(e) => setAffiliateFee(Number(e.target.value))}
                    className="w-full h-12 px-4 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-ml-blue focus:border-transparent transition-all"
                  />
                  <span className="absolute right-4 top-3 text-gray-400">%</span>
                </div>
                <p className="text-xs text-gray-400 mt-2">Porcentagem repassada aos afiliados em vendas recomendadas.</p>
              </div>

              <div className="pt-4 border-t border-gray-100 flex items-center gap-4">
                <Button type="submit" className="bg-ml-blue text-white hover:bg-ml-hover font-semibold py-3 px-6 rounded-sm shadow-sm">
                  Salvar alterações
                </Button>
                {saved && <span className="text-sm text-green-600 font-medium">Configurações salvas com sucesso!</span>}
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}
