import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

export function SellerRegistration() {
  const { user } = useAuth()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [assetType, setAssetType] = useState('')
  const [status, setStatus] = useState<string | null>(null)

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setStatus(null)

    const { error } = await supabase.from('seller_requests').insert({
      user_id: user?.id ?? null,
      full_name: fullName,
      email,
      phone,
      asset_type: assetType,
    })

    if (error) {
      setStatus(error.message)
      return
    }

    setFullName('')
    setEmail('')
    setPhone('')
    setAssetType('')
    setStatus('Solicitacao enviada para analise.')
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-16 mb-16">
      <Card className="bg-white border-none shadow-sm rounded-md">
        <CardHeader className="text-center pb-2 border-b border-gray-100">
          <CardTitle className="text-2xl font-light text-ml-dark">Comece a vender hoje mesmo</CardTitle>
          <p className="text-gray-500 text-sm mt-2">Cadastre-se como vendedor na Cookie market e alcance compradores reais.</p>
        </CardHeader>
        <CardContent className="pt-8 px-8 pb-8">
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome completo</label>
              <input type="text" value={fullName} onChange={(event) => setFullName(event.target.value)} required className="w-full h-12 px-4 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-ml-blue focus:border-transparent transition-all" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">E-mail corporativo</label>
              <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required className="w-full h-12 px-4 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-ml-blue focus:border-transparent transition-all" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp</label>
              <input type="tel" value={phone} onChange={(event) => setPhone(event.target.value)} className="w-full h-12 px-4 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-ml-blue focus:border-transparent transition-all" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Quais ativos voce pretende vender?</label>
              <select value={assetType} onChange={(event) => setAssetType(event.target.value)} required className="w-full h-12 px-4 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-ml-blue focus:border-transparent transition-all bg-white text-gray-700">
                <option value="">Selecione uma opcao</option>
                <option value="meta">Contas / BMs (Meta Ads)</option>
                <option value="google">Contas Google Ads</option>
                <option value="tiktok">Contas TikTok Ads</option>
                <option value="shopify">Shopify Payments / Temas</option>
                <option value="outros">Outros</option>
              </select>
            </div>

            {status && <p className={`text-sm ${status.includes('enviada') ? 'text-green-600' : 'text-red-500'}`}>{status}</p>}

            <div className="pt-4">
              <Button className="w-full bg-ml-blue text-white hover:bg-ml-hover font-semibold py-6 text-base rounded-sm shadow-sm">Enviar Solicitacao</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
