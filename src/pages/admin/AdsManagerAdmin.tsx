import React, { useEffect, useState } from 'react'
import { AdminLayout } from '../../components/layouts/AdminLayout'
import { Card, CardContent } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { supabase } from '../../lib/supabase'

export function AdsManagerAdmin() {
  const [productPrice, setProductPrice] = useState(5)
  const [groupPrice, setGroupPrice] = useState(10)
  const [leftFlyerPrice, setLeftFlyerPrice] = useState(50)
  const [rightFlyerPrice, setRightFlyerPrice] = useState(50)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    supabase
      .from('platform_settings')
      .select('ads_product_daily_price, ads_group_daily_price, ads_left_flyer_daily_price, ads_right_flyer_daily_price')
      .eq('id', 1)
      .maybeSingle()
      .then(({ data, error }) => {
        if (error) throw error
        setProductPrice(Number(data?.ads_product_daily_price ?? 5))
        setGroupPrice(Number(data?.ads_group_daily_price ?? 10))
        setLeftFlyerPrice(Number(data?.ads_left_flyer_daily_price ?? 50))
        setRightFlyerPrice(Number(data?.ads_right_flyer_daily_price ?? 50))
      })
      .catch(console.error)
  }, [])

  const save = async () => {
    const { error } = await supabase.from('platform_settings').update({
      ads_product_daily_price: productPrice,
      ads_group_daily_price: groupPrice,
      ads_left_flyer_daily_price: leftFlyerPrice,
      ads_right_flyer_daily_price: rightFlyerPrice,
    }).eq('id', 1)

    if (error) throw error
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-3xl">
        <h2 className="text-xl font-light text-ml-dark">Ads Manager</h2>
        <Card className="bg-white border-none shadow-sm rounded-md">
          <CardContent className="p-8">
            <h3 className="text-lg font-medium text-ml-dark mb-2">Tabela de Precos</h3>
            <p className="text-sm text-gray-500 mb-8">Defina o valor cobrado por dia para cada tipo de impulsionamento.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <PriceInput label="Produto patrocinado" helper="Destaca o produto nas primeiras posicoes da home." value={productPrice} onChange={setProductPrice} />
              <PriceInput label="Grupo de WhatsApp" helper="Destaca o grupo nos stories e na pagina de grupos." value={groupPrice} onChange={setGroupPrice} />
              <PriceInput label="Flyer lateral esquerdo" helper="Banner vertical ao lado esquerdo do carrossel." value={leftFlyerPrice} onChange={setLeftFlyerPrice} />
              <PriceInput label="Flyer lateral direito" helper="Banner vertical ao lado direito do carrossel." value={rightFlyerPrice} onChange={setRightFlyerPrice} />
            </div>

            <div className="flex items-center justify-end gap-3 pt-8">
              {saved && <span className="text-sm text-green-600">Salvo.</span>}
              <Button onClick={save} className="bg-ml-blue text-white hover:bg-ml-hover rounded-sm">Salvar tabela de precos</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}

function PriceInput({ label, helper, value, onChange }: { label: string; helper: string; value: number; onChange: (value: number) => void }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <p className="text-xs text-gray-400 mb-3">{helper}</p>
      <div className="relative">
        <span className="absolute left-4 top-3 text-gray-500">R$</span>
        <input
          type="number"
          min="0"
          step="0.01"
          value={value}
          onChange={(event) => onChange(Number(event.target.value))}
          className="w-full h-12 pl-10 pr-14 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-ml-blue transition-all"
        />
        <span className="absolute right-4 top-3 text-gray-400">/dia</span>
      </div>
    </div>
  )
}
