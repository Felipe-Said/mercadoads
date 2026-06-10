import React, { useEffect, useMemo, useState } from 'react'
import { AdminLayout } from '../../components/layouts/AdminLayout'
import { Card, CardContent } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { supabase } from '../../lib/supabase'
import { westPayBalance } from '../../lib/westpay'

type GatewaySettings = {
  id: number
  active: boolean
  westpay_api_key: string | null
  westpay_public_key: string | null
  westpay_user_agent: string | null
  westpay_webhook_secret: string | null
}

const defaultUserAgent = 'Mercado Ads/1.0 (+suporte@mercadoads.com)'

export function Gateway() {
  const [active, setActive] = useState(true)
  const [apiKey, setApiKey] = useState('')
  const [publicKey, setPublicKey] = useState('')
  const [userAgent, setUserAgent] = useState(defaultUserAgent)
  const [webhookSecret, setWebhookSecret] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [testMessage, setTestMessage] = useState<string | null>(null)

  const functionBaseUrl = useMemo(() => {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined
    return supabaseUrl ? supabaseUrl.replace('.supabase.co', '.functions.supabase.co') : ''
  }, [])

  const webhookUrl = useMemo(() => {
    if (!functionBaseUrl) return ''
    const token = webhookSecret.trim()
    return `${functionBaseUrl}/westpay?action=webhook${token ? `&token=${encodeURIComponent(token)}` : ''}`
  }, [functionBaseUrl, webhookSecret])

  useEffect(() => {
    let mounted = true

    supabase
      .from('payment_gateway_settings')
      .select('id, active, westpay_api_key, westpay_public_key, westpay_user_agent, westpay_webhook_secret')
      .eq('id', 1)
      .maybeSingle()
      .then(({ data, error }) => {
        if (!mounted) return
        if (error) throw error

        const settings = data as GatewaySettings | null
        setActive(settings?.active ?? true)
        setApiKey(settings?.westpay_api_key ?? '')
        setPublicKey(settings?.westpay_public_key ?? '')
        setUserAgent(settings?.westpay_user_agent ?? defaultUserAgent)
        setWebhookSecret(settings?.westpay_webhook_secret ?? '')
      })
      .catch((error) => setMessage(error instanceof Error ? error.message : 'Nao foi possivel carregar o gateway.'))
      .finally(() => {
        if (mounted) setLoading(false)
      })

    return () => {
      mounted = false
    }
  }, [])

  const save = async () => {
    setSaving(true)
    setMessage(null)

    const { error } = await supabase.from('payment_gateway_settings').upsert({
      id: 1,
      provider: 'westpay',
      active,
      westpay_api_key: apiKey.trim() || null,
      westpay_public_key: publicKey.trim() || null,
      westpay_user_agent: userAgent.trim() || defaultUserAgent,
      westpay_webhook_secret: webhookSecret.trim() || null,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'id' })

    if (error) {
      setMessage(error.message)
      setSaving(false)
      return
    }

    setMessage('Gateway salvo com sucesso.')
    setSaving(false)
  }

  const testConnection = async () => {
    setTestMessage('Testando conexao...')
    const result = await westPayBalance()
    if (!result) {
      setTestMessage('Nao foi possivel validar a conexao. Verifique as credenciais e se o gateway esta ativo.')
      return
    }

    setTestMessage('Conexao com WestPay validada.')
  }

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-4xl">
        <h2 className="text-xl font-light text-ml-dark mb-4">Gateway de Pagamento</h2>

        <Card className="bg-white border-none shadow-sm rounded-md">
          <CardContent className="p-6 space-y-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-medium text-ml-dark">WestPay</h3>
                <p className="text-sm text-gray-500">Pix in para compras e Pix out para saques.</p>
              </div>
              <label className="flex items-center gap-2 text-sm text-gray-600">
                <input
                  type="checkbox"
                  checked={active}
                  onChange={(event) => setActive(event.target.checked)}
                  className="h-4 w-4 accent-ml-blue"
                />
                Ativo
              </label>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">API Key</label>
                <input
                  type="password"
                  value={apiKey}
                  onChange={(event) => setApiKey(event.target.value)}
                  placeholder="Chave privada da WestPay"
                  className="w-full h-12 px-4 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-ml-blue focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Public Key</label>
                <input
                  type="password"
                  value={publicKey}
                  onChange={(event) => setPublicKey(event.target.value)}
                  placeholder="Chave publica da WestPay"
                  className="w-full h-12 px-4 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-ml-blue focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">User-Agent</label>
                <input
                  type="text"
                  value={userAgent}
                  onChange={(event) => setUserAgent(event.target.value)}
                  placeholder={defaultUserAgent}
                  className="w-full h-12 px-4 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-ml-blue focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Webhook secret</label>
                <input
                  type="password"
                  value={webhookSecret}
                  onChange={(event) => setWebhookSecret(event.target.value)}
                  placeholder="Segredo para validar o postback"
                  className="w-full h-12 px-4 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-ml-blue focus:border-transparent transition-all"
                />
                <p className="text-xs text-gray-400 mt-1">Use este segredo para proteger os retornos automáticos da WestPay.</p>
              </div>
            </div>

            <div className="rounded-md border border-gray-100 bg-gray-50 p-4 space-y-2">
              <p className="text-sm font-medium text-gray-700">Webhook da funcao</p>
              <div className="flex flex-col md:flex-row gap-2">
                <input
                  readOnly
                  value={webhookUrl}
                  className="w-full h-11 px-3 border border-gray-200 rounded-sm bg-white text-xs text-gray-600"
                />
                <Button
                  type="button"
                  onClick={() => navigator.clipboard.writeText(webhookUrl)}
                  className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold px-4 h-11 rounded-sm"
                >
                  Copiar
                </Button>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button
                type="button"
                onClick={save}
                disabled={saving || loading}
                className="bg-ml-blue text-white hover:bg-ml-hover font-semibold py-3 px-6 rounded-sm shadow-sm"
              >
                {saving ? 'Salvando...' : 'Salvar configuracoes'}
              </Button>
              <Button
                type="button"
                onClick={testConnection}
                disabled={loading}
                className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold py-3 px-6 rounded-sm shadow-sm"
              >
                Testar conexao
              </Button>
            </div>

            {message && <p className={`text-sm ${message.includes('sucesso') ? 'text-green-600' : 'text-red-600'}`}>{message}</p>}
            {testMessage && <p className={`text-sm ${testMessage.includes('validada') ? 'text-green-600' : 'text-gray-600'}`}>{testMessage}</p>}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}
