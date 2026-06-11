import React, { useEffect, useMemo, useState } from 'react'
import { AdminLayout } from '../../components/layouts/AdminLayout'
import { Card, CardContent } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { supabase } from '../../lib/supabase'
import { getDecodoProxyCatalog } from '../../lib/decodo'
import { westPayStatus } from '../../lib/westpay'

type GatewaySettings = {
  id: number
  active: boolean
  westpay_api_key: string | null
  westpay_public_key: string | null
  westpay_user_agent: string | null
  westpay_webhook_secret: string | null
}

type DecodoSettings = {
  id: number
  active: boolean
  api_base_url: string | null
  products_path: string | null
  api_key: string | null
  username: string | null
  password: string | null
}

const defaultUserAgent = 'Cookie market/1.0 (+suporte@mercadoads.com)'

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
  const [decodoActive, setDecodoActive] = useState(false)
  const [decodoBaseUrl, setDecodoBaseUrl] = useState('https://api.decodo.com')
  const [decodoProductsPath, setDecodoProductsPath] = useState('/v1/proxies')
  const [decodoApiKey, setDecodoApiKey] = useState('')
  const [decodoUsername, setDecodoUsername] = useState('')
  const [decodoPassword, setDecodoPassword] = useState('')
  const [decodoMessage, setDecodoMessage] = useState<string | null>(null)
  const [decodoTestMessage, setDecodoTestMessage] = useState<string | null>(null)

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

    Promise.all([
      supabase
      .from('payment_gateway_settings')
      .select('id, active, westpay_api_key, westpay_public_key, westpay_user_agent, westpay_webhook_secret')
      .eq('id', 1)
      .maybeSingle(),
      supabase
        .from('decodo_settings')
        .select('id, active, api_base_url, products_path, api_key, username, password')
        .eq('id', 1)
        .maybeSingle(),
    ])
      .then(([gatewayResult, decodoResult]) => {
        if (!mounted) return
        if (gatewayResult.error) throw gatewayResult.error
        if (decodoResult.error) throw decodoResult.error

        const settings = gatewayResult.data as GatewaySettings | null
        setActive(settings?.active ?? true)
        setApiKey(settings?.westpay_api_key ?? '')
        setPublicKey(settings?.westpay_public_key ?? '')
        setUserAgent(settings?.westpay_user_agent ?? defaultUserAgent)
        setWebhookSecret(settings?.westpay_webhook_secret ?? '')

        const decodoSettings = decodoResult.data as DecodoSettings | null
        setDecodoActive(decodoSettings?.active ?? false)
        setDecodoBaseUrl(decodoSettings?.api_base_url ?? 'https://api.decodo.com')
        setDecodoProductsPath(decodoSettings?.products_path ?? '/v1/proxies')
        setDecodoApiKey(decodoSettings?.api_key ?? '')
        setDecodoUsername(decodoSettings?.username ?? '')
        setDecodoPassword(decodoSettings?.password ?? '')
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

    const { data: savedSettings, error: reloadError } = await supabase
      .from('payment_gateway_settings')
      .select('active, westpay_api_key, westpay_public_key, westpay_user_agent, westpay_webhook_secret')
      .eq('id', 1)
      .maybeSingle()

    if (reloadError) {
      setMessage(`Gateway salvo, mas nao foi possivel confirmar no banco: ${reloadError.message}`)
      setSaving(false)
      return
    }

    const settings = savedSettings as Omit<GatewaySettings, 'id'> | null
    setActive(settings?.active ?? active)
    setApiKey(settings?.westpay_api_key ?? '')
    setPublicKey(settings?.westpay_public_key ?? '')
    setUserAgent(settings?.westpay_user_agent ?? defaultUserAgent)
    setWebhookSecret(settings?.westpay_webhook_secret ?? '')
    setMessage(settings?.westpay_api_key && settings?.westpay_public_key
      ? 'Gateway salvo e credenciais confirmadas no banco.'
      : 'Gateway salvo, mas API Key ou Public Key continuam vazias no banco.')
    setSaving(false)
  }

  const testConnection = async () => {
    setTestMessage('Testando conexao...')
    try {
      await westPayStatus()
      setTestMessage('Funcao WestPay ativa e credenciais encontradas no banco.')
    } catch (error) {
      setTestMessage(error instanceof Error ? error.message : 'Nao foi possivel validar a conexao.')
    }
  }

  const saveDecodo = async () => {
    setSaving(true)
    setDecodoMessage(null)

    const { error } = await supabase.from('decodo_settings').upsert({
      id: 1,
      active: decodoActive,
      api_base_url: decodoBaseUrl.trim() || 'https://api.decodo.com',
      products_path: decodoProductsPath.trim() || '/v1/proxies',
      api_key: decodoApiKey.trim() || null,
      username: decodoUsername.trim() || null,
      password: decodoPassword.trim() || null,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'id' })

    if (error) {
      setDecodoMessage(error.message)
      setSaving(false)
      return
    }

    const { data, error: reloadError } = await supabase
      .from('decodo_settings')
      .select('active, api_base_url, products_path, api_key, username, password')
      .eq('id', 1)
      .maybeSingle()

    if (reloadError) {
      setDecodoMessage(`Decodo salva, mas nao foi possivel confirmar no banco: ${reloadError.message}`)
      setSaving(false)
      return
    }

    const settings = data as Omit<DecodoSettings, 'id'> | null
    setDecodoActive(settings?.active ?? decodoActive)
    setDecodoBaseUrl(settings?.api_base_url ?? 'https://api.decodo.com')
    setDecodoProductsPath(settings?.products_path ?? '/v1/proxies')
    setDecodoApiKey(settings?.api_key ?? '')
    setDecodoUsername(settings?.username ?? '')
    setDecodoPassword(settings?.password ?? '')
    setDecodoMessage(settings?.api_key || (settings?.username && settings?.password)
      ? 'Decodo salva e credenciais confirmadas no banco.'
      : 'Decodo salva, mas sem API Key ou usuario/senha.')
    setSaving(false)
  }

  const testDecodoConnection = async () => {
    setDecodoTestMessage('Testando Decodo...')
    try {
      const result = await getDecodoProxyCatalog()
      setDecodoTestMessage(result.configured
        ? `Conexao com Decodo validada. Itens retornados: ${result.items.length}.`
        : 'Funcao Decodo ativa, mas sem credenciais salvas.')
    } catch (error) {
      setDecodoTestMessage(error instanceof Error ? error.message : 'Nao foi possivel validar a Decodo.')
    }
  }

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-4xl">
        <h2 className="mb-4 text-xl font-light text-[var(--layout-text-primary)]">Gateways e APIs</h2>

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

            {message && <p className={`text-sm ${message.includes('confirmadas') ? 'text-green-600' : 'text-red-600'}`}>{message}</p>}
            {testMessage && <p className={`text-sm ${testMessage.includes('ativa') ? 'text-green-600' : 'text-red-600'}`}>{testMessage}</p>}
          </CardContent>
        </Card>

        <Card className="bg-white border-none shadow-sm rounded-md">
          <CardContent className="p-6 space-y-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-medium text-ml-dark">Decodo</h3>
                <p className="text-sm text-gray-500">API para listar proxies disponiveis na pagina /proxy.</p>
              </div>
              <label className="flex items-center gap-2 text-sm text-gray-600">
                <input
                  type="checkbox"
                  checked={decodoActive}
                  onChange={(event) => setDecodoActive(event.target.checked)}
                  className="h-4 w-4 accent-ml-blue"
                />
                Ativo
              </label>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Base URL</label>
                <input
                  type="url"
                  value={decodoBaseUrl}
                  onChange={(event) => setDecodoBaseUrl(event.target.value)}
                  placeholder="https://api.decodo.com"
                  className="w-full h-12 px-4 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-ml-blue focus:border-transparent transition-all"
                />
                <p className="text-xs text-gray-400 mt-1">Use a URL base indicada no playground da Decodo.</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Endpoint de catalogo</label>
                <input
                  type="text"
                  value={decodoProductsPath}
                  onChange={(event) => setDecodoProductsPath(event.target.value)}
                  placeholder="/v1/proxies"
                  className="w-full h-12 px-4 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-ml-blue focus:border-transparent transition-all"
                />
                <p className="text-xs text-gray-400 mt-1">Cole aqui o path que retorna os proxies/planos disponiveis.</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">API Key</label>
                <input
                  type="password"
                  value={decodoApiKey}
                  onChange={(event) => setDecodoApiKey(event.target.value)}
                  placeholder="Token da Decodo, se o endpoint usar Bearer/X-API-Key"
                  className="w-full h-12 px-4 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-ml-blue focus:border-transparent transition-all"
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Usuario</label>
                  <input
                    type="text"
                    value={decodoUsername}
                    onChange={(event) => setDecodoUsername(event.target.value)}
                    placeholder="Usuario, se usar Basic Auth"
                    className="w-full h-12 px-4 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-ml-blue focus:border-transparent transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
                  <input
                    type="password"
                    value={decodoPassword}
                    onChange={(event) => setDecodoPassword(event.target.value)}
                    placeholder="Senha, se usar Basic Auth"
                    className="w-full h-12 px-4 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-ml-blue focus:border-transparent transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="rounded-md border border-gray-100 bg-gray-50 p-4 space-y-2">
              <p className="text-sm font-medium text-gray-700">Endpoint publico da plataforma</p>
              <div className="flex flex-col md:flex-row gap-2">
                <input
                  readOnly
                  value={functionBaseUrl ? `${functionBaseUrl}/decodo` : ''}
                  className="w-full h-11 px-3 border border-gray-200 rounded-sm bg-white text-xs text-gray-600"
                />
                <Button
                  type="button"
                  onClick={() => navigator.clipboard.writeText(functionBaseUrl ? `${functionBaseUrl}/decodo` : '')}
                  className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold px-4 h-11 rounded-sm"
                >
                  Copiar
                </Button>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button
                type="button"
                onClick={saveDecodo}
                disabled={saving || loading}
                className="bg-ml-blue text-white hover:bg-ml-hover font-semibold py-3 px-6 rounded-sm shadow-sm"
              >
                {saving ? 'Salvando...' : 'Salvar Decodo'}
              </Button>
              <Button
                type="button"
                onClick={testDecodoConnection}
                disabled={loading}
                className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold py-3 px-6 rounded-sm shadow-sm"
              >
                Testar Decodo
              </Button>
            </div>

            {decodoMessage && <p className={`text-sm ${decodoMessage.includes('confirmadas') ? 'text-green-600' : 'text-red-600'}`}>{decodoMessage}</p>}
            {decodoTestMessage && <p className={`text-sm ${decodoTestMessage.includes('ativa') ? 'text-green-600' : 'text-red-600'}`}>{decodoTestMessage}</p>}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}
