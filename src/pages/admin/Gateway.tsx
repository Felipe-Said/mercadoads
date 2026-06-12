import React, { useEffect, useMemo, useState } from 'react'
import { AdminLayout } from '../../components/layouts/AdminLayout'
import { Card, CardContent } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { supabase } from '../../lib/supabase'
import { getDecodoProxyCatalog } from '../../lib/decodo'
import { getSmmBalance, getSmmServices } from '../../lib/smm'
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

type ProxyOfferSettings = {
  id?: number
  name: string
  type: string
  country: string
  city: string
  protocol: string
  endpoint: string
  port: string
  price: string
  price_amount: number | null
  traffic: string
  traffic_limit_gb: number
  stock: string
  status: string
  service_type: string
  auto_disable: boolean
  sort_order: number
  is_active: boolean
}

type SmmSettings = {
  id: number
  active: boolean
  api_base_url: string | null
  api_key: string | null
  default_markup_percent: number | null
}

type SmmServiceOverride = {
  id?: number
  service_id: string
  custom_name: string
  custom_category: string
  price_per_1000: number | null
  markup_percent: number | null
  is_active: boolean
  sort_order: number
}

const emptyProxyOffer: ProxyOfferSettings = {
  name: '',
  type: 'Pool premium',
  country: 'Global',
  city: '',
  protocol: 'HTTP(S) / SOCKS5',
  endpoint: '',
  port: '',
  price: '',
  price_amount: null,
  traffic: '',
  traffic_limit_gb: 5,
  stock: 'Disponivel',
  status: 'Disponivel',
  service_type: 'residential_proxies',
  auto_disable: true,
  sort_order: 10,
  is_active: true,
}

const defaultUserAgent = 'Cookie market/1.0 (+suporte@mercadoads.com)'

const emptySmmOverride: SmmServiceOverride = {
  service_id: '',
  custom_name: '',
  custom_category: '',
  price_per_1000: null,
  markup_percent: null,
  is_active: true,
  sort_order: 10,
}

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
  const [decodoBaseUrl, setDecodoBaseUrl] = useState('https://api.decodo.com/v2')
  const [decodoProductsPath, setDecodoProductsPath] = useState('/subscriptions')
  const [decodoApiKey, setDecodoApiKey] = useState('')
  const [decodoUsername, setDecodoUsername] = useState('')
  const [decodoPassword, setDecodoPassword] = useState('')
  const [proxyProviderMessage, setProxyProviderMessage] = useState<string | null>(null)
  const [proxyProviderTestMessage, setProxyProviderTestMessage] = useState<string | null>(null)
  const [proxyOffers, setProxyOffers] = useState<ProxyOfferSettings[]>([])
  const [proxyOfferForm, setProxyOfferForm] = useState<ProxyOfferSettings>(emptyProxyOffer)
  const [proxyOfferMessage, setProxyOfferMessage] = useState<string | null>(null)
  const [smmActive, setSmmActive] = useState(false)
  const [smmBaseUrl, setSmmBaseUrl] = useState('https://mitikboost.com/api/v2')
  const [smmApiKey, setSmmApiKey] = useState('')
  const [smmMarkup, setSmmMarkup] = useState(50)
  const [smmMessage, setSmmMessage] = useState<string | null>(null)
  const [smmTestMessage, setSmmTestMessage] = useState<string | null>(null)
  const [smmOverrides, setSmmOverrides] = useState<SmmServiceOverride[]>([])
  const [smmOverrideForm, setSmmOverrideForm] = useState<SmmServiceOverride>(emptySmmOverride)

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
      supabase
        .from('proxy_offers')
        .select('id, name, type, country, city, protocol, endpoint, port, price, price_amount, traffic, traffic_limit_gb, stock, status, service_type, auto_disable, sort_order, is_active')
        .order('sort_order', { ascending: true })
        .order('id', { ascending: true }),
      supabase
        .from('smm_settings')
        .select('id, active, api_base_url, api_key, default_markup_percent')
        .eq('id', 1)
        .maybeSingle(),
      supabase
        .from('smm_service_overrides')
        .select('id, service_id, custom_name, custom_category, price_per_1000, markup_percent, is_active, sort_order')
        .order('sort_order', { ascending: true })
        .order('id', { ascending: true }),
    ])
      .then(([gatewayResult, decodoResult, proxyOffersResult, smmResult, smmOverridesResult]) => {
        if (!mounted) return
        if (gatewayResult.error) throw gatewayResult.error
        if (decodoResult.error) throw decodoResult.error
        if (proxyOffersResult.error) throw proxyOffersResult.error
        if (smmResult.error) throw smmResult.error
        if (smmOverridesResult.error) throw smmOverridesResult.error

        const settings = gatewayResult.data as GatewaySettings | null
        setActive(settings?.active ?? true)
        setApiKey(settings?.westpay_api_key ?? '')
        setPublicKey(settings?.westpay_public_key ?? '')
        setUserAgent(settings?.westpay_user_agent ?? defaultUserAgent)
        setWebhookSecret(settings?.westpay_webhook_secret ?? '')

        const decodoSettings = decodoResult.data as DecodoSettings | null
        setDecodoActive(decodoSettings?.active ?? false)
        setDecodoBaseUrl(decodoSettings?.api_base_url ?? 'https://api.decodo.com/v2')
        setDecodoProductsPath(decodoSettings?.products_path ?? '/subscriptions')
        setDecodoApiKey(decodoSettings?.api_key ?? '')
        setDecodoUsername(decodoSettings?.username ?? '')
        setDecodoPassword(decodoSettings?.password ?? '')
        setProxyOffers((proxyOffersResult.data ?? []) as ProxyOfferSettings[])

        const smmSettings = smmResult.data as SmmSettings | null
        setSmmActive(smmSettings?.active ?? false)
        setSmmBaseUrl(smmSettings?.api_base_url ?? 'https://mitikboost.com/api/v2')
        setSmmApiKey(smmSettings?.api_key ?? '')
        setSmmMarkup(Number(smmSettings?.default_markup_percent ?? 50))
        setSmmOverrides(((smmOverridesResult.data ?? []) as Array<Record<string, unknown>>).map((item) => ({
          id: item.id as number | undefined,
          service_id: String(item.service_id ?? ''),
          custom_name: String(item.custom_name ?? ''),
          custom_category: String(item.custom_category ?? ''),
          price_per_1000: item.price_per_1000 == null ? null : Number(item.price_per_1000),
          markup_percent: item.markup_percent == null ? null : Number(item.markup_percent),
          is_active: Boolean(item.is_active ?? true),
          sort_order: Number(item.sort_order ?? 0),
        })))
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
      setMessage(`Gateway salvo, mas nao foi possivel confirmar os dados: ${reloadError.message}`)
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
      ? 'Gateway salvo e credenciais confirmadas.'
      : 'Gateway salvo, mas API Key ou Public Key continuam vazias.')
    setSaving(false)
  }

  const testConnection = async () => {
    setTestMessage('Testando conexao...')
    try {
      await westPayStatus()
      setTestMessage('Gateway ativo e credenciais encontradas.')
    } catch (error) {
      setTestMessage(error instanceof Error ? error.message : 'Nao foi possivel validar a conexao.')
    }
  }

  const saveSmm = async () => {
    setSaving(true)
    setSmmMessage(null)

    const { error } = await supabase.from('smm_settings').upsert({
      id: 1,
      active: smmActive,
      api_base_url: smmBaseUrl.trim() || 'https://mitikboost.com/api/v2',
      api_key: smmApiKey.trim() || null,
      default_markup_percent: Number(smmMarkup) || 0,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'id' })

    if (error) {
      setSmmMessage(error.message)
      setSaving(false)
      return
    }

    setSmmMessage(smmApiKey.trim() ? 'SMM salvo e chave registrada.' : 'SMM salvo, mas sem chave configurada.')
    setSaving(false)
  }

  const testSmmConnection = async () => {
    setSmmTestMessage('Testando servicos...')
    try {
      const [services, balance] = await Promise.all([
        getSmmServices(),
        getSmmBalance().catch(() => null),
      ])
      const balanceData = balance?.data as { balance?: string; currency?: string } | undefined
      setSmmTestMessage(services.configured
        ? `Servicos validados: ${services.items.length}.${balanceData?.balance ? ` Saldo: ${balanceData.balance} ${balanceData.currency ?? ''}` : ''}`
        : 'SMM ativo, mas sem chave salva.')
    } catch (error) {
      setSmmTestMessage(error instanceof Error ? error.message : 'Nao foi possivel validar os servicos.')
    }
  }

  const resetSmmOverrideForm = () => {
    setSmmOverrideForm({ ...emptySmmOverride, sort_order: (smmOverrides.length + 1) * 10 })
  }

  const saveSmmOverride = async () => {
    setSmmMessage(null)
    const payload = {
      service_id: smmOverrideForm.service_id.trim(),
      custom_name: smmOverrideForm.custom_name.trim() || null,
      custom_category: smmOverrideForm.custom_category.trim() || null,
      price_per_1000: smmOverrideForm.price_per_1000,
      markup_percent: smmOverrideForm.markup_percent,
      is_active: smmOverrideForm.is_active,
      sort_order: Number(smmOverrideForm.sort_order) || 0,
      updated_at: new Date().toISOString(),
    }

    if (!payload.service_id) {
      setSmmMessage('Informe o ID do servico.')
      return
    }

    const request = smmOverrideForm.id
      ? supabase.from('smm_service_overrides').update(payload).eq('id', smmOverrideForm.id)
      : supabase.from('smm_service_overrides').insert(payload)

    const { error } = await request
    if (error) {
      setSmmMessage(error.message)
      return
    }

    const { data, error: reloadError } = await supabase
      .from('smm_service_overrides')
      .select('id, service_id, custom_name, custom_category, price_per_1000, markup_percent, is_active, sort_order')
      .order('sort_order', { ascending: true })
      .order('id', { ascending: true })

    if (reloadError) {
      setSmmMessage(reloadError.message)
      return
    }

    setSmmOverrides(((data ?? []) as Array<Record<string, unknown>>).map((item) => ({
      id: item.id as number | undefined,
      service_id: String(item.service_id ?? ''),
      custom_name: String(item.custom_name ?? ''),
      custom_category: String(item.custom_category ?? ''),
      price_per_1000: item.price_per_1000 == null ? null : Number(item.price_per_1000),
      markup_percent: item.markup_percent == null ? null : Number(item.markup_percent),
      is_active: Boolean(item.is_active ?? true),
      sort_order: Number(item.sort_order ?? 0),
    })))
    setSmmMessage('Servico SMM salvo.')
    resetSmmOverrideForm()
  }

  const editSmmOverride = (override: SmmServiceOverride) => {
    setSmmOverrideForm({ ...override })
  }

  const deleteSmmOverride = async (id?: number) => {
    if (!id) return
    const { error } = await supabase.from('smm_service_overrides').delete().eq('id', id)
    if (error) {
      setSmmMessage(error.message)
      return
    }
    setSmmOverrides((current) => current.filter((item) => item.id !== id))
    setSmmMessage('Servico SMM removido.')
    if (smmOverrideForm.id === id) resetSmmOverrideForm()
  }

  const updateSmmOverrideForm = <K extends keyof SmmServiceOverride>(key: K, value: SmmServiceOverride[K]) => {
    setSmmOverrideForm((current) => ({ ...current, [key]: value }))
  }

  const saveDecodo = async () => {
    setSaving(true)
    setProxyProviderMessage(null)

    const { error } = await supabase.from('decodo_settings').upsert({
      id: 1,
      active: decodoActive,
      api_base_url: decodoBaseUrl.trim() || 'https://api.decodo.com/v2',
      products_path: decodoProductsPath.trim() || '/subscriptions',
      api_key: decodoApiKey.trim() || null,
      username: decodoUsername.trim() || null,
      password: decodoPassword.trim() || null,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'id' })

    if (error) {
      setProxyProviderMessage(error.message)
      setSaving(false)
      return
    }

    const { data, error: reloadError } = await supabase
      .from('decodo_settings')
      .select('active, api_base_url, products_path, api_key, username, password')
      .eq('id', 1)
      .maybeSingle()

    if (reloadError) {
      setProxyProviderMessage(`Configuracao salva, mas nao foi possivel confirmar os dados: ${reloadError.message}`)
      setSaving(false)
      return
    }

    const settings = data as Omit<DecodoSettings, 'id'> | null
    setDecodoActive(settings?.active ?? decodoActive)
    setDecodoBaseUrl(settings?.api_base_url ?? 'https://api.decodo.com/v2')
    setDecodoProductsPath(settings?.products_path ?? '/subscriptions')
    setDecodoApiKey(settings?.api_key ?? '')
    setDecodoUsername(settings?.username ?? '')
    setDecodoPassword(settings?.password ?? '')
    setProxyProviderMessage(settings?.api_key || (settings?.username && settings?.password)
      ? 'Configuração salva e credenciais confirmadas.'
      : 'Configuração salva, mas sem API Key ou usuario/senha.')
    setSaving(false)
  }

  const testDecodoConnection = async () => {
    setProxyProviderTestMessage('Testando catálogo...')
    try {
      const result = await getDecodoProxyCatalog()
      setProxyProviderTestMessage(result.configured
        ? `Catálogo validado. Itens retornados: ${result.items.length}.`
        : 'Integracao ativa, mas sem credenciais salvas.')
    } catch (error) {
      setProxyProviderTestMessage(error instanceof Error ? error.message : 'Nao foi possivel validar o catálogo.')
    }
  }

  const resetProxyOfferForm = () => {
    setProxyOfferForm({ ...emptyProxyOffer, sort_order: (proxyOffers.length + 1) * 10 })
  }

  const saveProxyOffer = async () => {
    setProxyOfferMessage(null)
    const payload = {
      name: proxyOfferForm.name.trim(),
      type: proxyOfferForm.type.trim() || 'Pool premium',
      country: proxyOfferForm.country.trim() || 'Global',
      city: proxyOfferForm.city.trim() || null,
      protocol: proxyOfferForm.protocol.trim() || 'HTTP(S) / SOCKS5',
      endpoint: proxyOfferForm.endpoint.trim() || null,
      port: proxyOfferForm.port.trim() || null,
      price: proxyOfferForm.price.trim() || 'Sob consulta',
      price_amount: Number(proxyOfferForm.price_amount) || null,
      traffic: proxyOfferForm.traffic.trim() || 'Conforme plano',
      traffic_limit_gb: Number(proxyOfferForm.traffic_limit_gb) || 1,
      stock: proxyOfferForm.stock.trim() || 'Disponivel',
      status: proxyOfferForm.status.trim() || 'Disponivel',
      service_type: proxyOfferForm.service_type.trim() || 'residential_proxies',
      auto_disable: proxyOfferForm.auto_disable,
      sort_order: Number(proxyOfferForm.sort_order) || 0,
      is_active: proxyOfferForm.is_active,
      updated_at: new Date().toISOString(),
    }

    if (!payload.name) {
      setProxyOfferMessage('Informe o nome do plano.')
      return
    }
    if (!payload.price_amount) {
      setProxyOfferMessage('Informe o valor cobrado do cliente.')
      return
    }
    if (!payload.traffic_limit_gb) {
      setProxyOfferMessage('Informe quantos GB serao provisionados.')
      return
    }

    const request = proxyOfferForm.id
      ? supabase.from('proxy_offers').update(payload).eq('id', proxyOfferForm.id)
      : supabase.from('proxy_offers').insert(payload)

    const { error } = await request
    if (error) {
      setProxyOfferMessage(error.message)
      return
    }

    const { data, error: reloadError } = await supabase
      .from('proxy_offers')
      .select('id, name, type, country, city, protocol, endpoint, port, price, price_amount, traffic, traffic_limit_gb, stock, status, service_type, auto_disable, sort_order, is_active')
      .order('sort_order', { ascending: true })
      .order('id', { ascending: true })

    if (reloadError) {
      setProxyOfferMessage(reloadError.message)
      return
    }

    setProxyOffers((data ?? []) as ProxyOfferSettings[])
    setProxyOfferMessage('Plano salvo.')
    setProxyOfferForm({ ...emptyProxyOffer, sort_order: ((data?.length ?? 0) + 1) * 10 })
  }

  const editProxyOffer = (offer: ProxyOfferSettings) => {
    setProxyOfferForm({
      ...offer,
      city: offer.city ?? '',
      endpoint: offer.endpoint ?? '',
      port: offer.port ?? '',
      price_amount: offer.price_amount ?? null,
      traffic_limit_gb: offer.traffic_limit_gb ?? 1,
      service_type: offer.service_type ?? 'residential_proxies',
      auto_disable: offer.auto_disable ?? true,
    })
  }

  const deleteProxyOffer = async (id?: number) => {
    if (!id) return
    const { error } = await supabase.from('proxy_offers').delete().eq('id', id)
    if (error) {
      setProxyOfferMessage(error.message)
      return
    }
    setProxyOffers((current) => current.filter((offer) => offer.id !== id))
    setProxyOfferMessage('Plano removido.')
    if (proxyOfferForm.id === id) resetProxyOfferForm()
  }

  const updateProxyOfferForm = <K extends keyof ProxyOfferSettings>(key: K, value: ProxyOfferSettings[K]) => {
    setProxyOfferForm((current) => ({ ...current, [key]: value }))
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
                <h3 className="text-lg font-medium text-ml-dark">SMM</h3>
                <p className="text-sm text-gray-500">Catalogo de servicos, saldo e precos exibidos na pagina /smm.</p>
              </div>
              <label className="flex items-center gap-2 text-sm text-gray-600">
                <input
                  type="checkbox"
                  checked={smmActive}
                  onChange={(event) => setSmmActive(event.target.checked)}
                  className="h-4 w-4 accent-ml-blue"
                />
                Ativo
              </label>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <GatewayField label="Base URL">
                <input
                  type="url"
                  value={smmBaseUrl}
                  onChange={(event) => setSmmBaseUrl(event.target.value)}
                  placeholder="https://mitikboost.com/api/v2"
                  className="w-full h-12 px-4 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-ml-blue focus:border-transparent transition-all"
                />
              </GatewayField>
              <GatewayField label="API Key">
                <input
                  type="password"
                  value={smmApiKey}
                  onChange={(event) => setSmmApiKey(event.target.value)}
                  placeholder="Chave da API SMM"
                  className="w-full h-12 px-4 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-ml-blue focus:border-transparent transition-all"
                />
              </GatewayField>
              <GatewayField label="Margem global (%)">
                <input
                  type="number"
                  step="0.01"
                  value={smmMarkup}
                  onChange={(event) => setSmmMarkup(Number(event.target.value))}
                  className="w-full h-12 px-4 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-ml-blue focus:border-transparent transition-all"
                />
              </GatewayField>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button
                type="button"
                onClick={saveSmm}
                disabled={saving || loading}
                className="bg-ml-blue text-white hover:bg-ml-hover font-semibold py-3 px-6 rounded-sm shadow-sm"
              >
                {saving ? 'Salvando...' : 'Salvar SMM'}
              </Button>
              <Button
                type="button"
                onClick={testSmmConnection}
                disabled={loading}
                className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold py-3 px-6 rounded-sm shadow-sm"
              >
                Testar servicos
              </Button>
            </div>

            {smmMessage && <p className={`text-sm ${smmMessage.includes('salvo') || smmMessage.includes('registrada') || smmMessage.includes('removido') ? 'text-green-600' : 'text-red-600'}`}>{smmMessage}</p>}
            {smmTestMessage && <p className={`text-sm ${smmTestMessage.includes('validados') ? 'text-green-600' : 'text-red-600'}`}>{smmTestMessage}</p>}

            <div className="rounded-md border border-gray-100 bg-gray-50 p-4">
              <div className="mb-4">
                <h4 className="font-semibold text-gray-900">Precos por servico</h4>
                <p className="text-sm text-gray-500">Use o ID do servico retornado pela API. Se nao houver override, vale a margem global.</p>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <GatewayField label="ID do servico">
                  <input value={smmOverrideForm.service_id} onChange={(event) => updateSmmOverrideForm('service_id', event.target.value)} placeholder="Ex: 1234" className="w-full h-11 px-3 border border-gray-300 rounded-sm" />
                </GatewayField>
                <GatewayField label="Nome exibido">
                  <input value={smmOverrideForm.custom_name} onChange={(event) => updateSmmOverrideForm('custom_name', event.target.value)} placeholder="Opcional" className="w-full h-11 px-3 border border-gray-300 rounded-sm" />
                </GatewayField>
                <GatewayField label="Categoria exibida">
                  <input value={smmOverrideForm.custom_category} onChange={(event) => updateSmmOverrideForm('custom_category', event.target.value)} placeholder="Opcional" className="w-full h-11 px-3 border border-gray-300 rounded-sm" />
                </GatewayField>
                <GatewayField label="Preco por 1.000 (R$)">
                  <input type="number" step="0.0001" value={smmOverrideForm.price_per_1000 ?? ''} onChange={(event) => updateSmmOverrideForm('price_per_1000', event.target.value ? Number(event.target.value) : null)} placeholder="Opcional" className="w-full h-11 px-3 border border-gray-300 rounded-sm" />
                </GatewayField>
                <GatewayField label="Margem especifica (%)">
                  <input type="number" step="0.01" value={smmOverrideForm.markup_percent ?? ''} onChange={(event) => updateSmmOverrideForm('markup_percent', event.target.value ? Number(event.target.value) : null)} placeholder="Opcional" className="w-full h-11 px-3 border border-gray-300 rounded-sm" />
                </GatewayField>
                <GatewayField label="Ordem">
                  <input type="number" value={smmOverrideForm.sort_order} onChange={(event) => updateSmmOverrideForm('sort_order', Number(event.target.value))} className="w-full h-11 px-3 border border-gray-300 rounded-sm" />
                </GatewayField>
              </div>
              <label className="mt-4 flex items-center gap-2 text-sm text-gray-700">
                <input type="checkbox" checked={smmOverrideForm.is_active} onChange={(event) => updateSmmOverrideForm('is_active', event.target.checked)} className="h-4 w-4 accent-ml-blue" />
                Mostrar este servico na pagina SMM
              </label>
              <div className="mt-4 flex flex-wrap gap-3">
                <Button type="button" onClick={saveSmmOverride} className="bg-ml-blue text-white hover:bg-ml-hover font-semibold py-3 px-6 rounded-sm shadow-sm">
                  {smmOverrideForm.id ? 'Salvar servico' : 'Adicionar override'}
                </Button>
                <Button type="button" onClick={resetSmmOverrideForm} className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold py-3 px-6 rounded-sm shadow-sm">
                  Novo override
                </Button>
              </div>
            </div>

            <div className="overflow-hidden rounded-sm border border-gray-100">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 text-gray-500">
                  <tr>
                    <th className="px-4 py-3 font-medium">Servico</th>
                    <th className="px-4 py-3 font-medium">Preco 1.000</th>
                    <th className="px-4 py-3 font-medium">Margem</th>
                    <th className="px-4 py-3 font-medium">Ativo</th>
                    <th className="px-4 py-3 font-medium text-right">Acoes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {smmOverrides.map((override) => (
                    <tr key={override.id}>
                      <td className="px-4 py-3">
                        <p className="font-semibold text-gray-900">#{override.service_id}</p>
                        <p className="text-xs text-gray-500">{override.custom_name || 'Nome original da API'}</p>
                      </td>
                      <td className="px-4 py-3 text-gray-700">{override.price_per_1000 ?? '-'}</td>
                      <td className="px-4 py-3 text-gray-700">{override.markup_percent ?? '-'}</td>
                      <td className="px-4 py-3 text-gray-700">{override.is_active ? 'Sim' : 'Nao'}</td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-2">
                          <button type="button" onClick={() => editSmmOverride(override)} className="text-ml-blue hover:underline">Editar</button>
                          <button type="button" onClick={() => deleteSmmOverride(override.id)} className="text-red-500 hover:underline">Remover</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {smmOverrides.length === 0 && (
                    <tr>
                      <td className="px-4 py-6 text-center text-gray-500" colSpan={5}>Nenhum override cadastrado.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-none shadow-sm rounded-md">
          <CardContent className="p-6 space-y-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-medium text-ml-dark">Fornecedor de proxies</h3>
                <p className="text-sm text-gray-500">Integração para listar proxies disponiveis na pagina /proxy.</p>
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
                  placeholder="https://api.decodo.com/v2"
                  className="w-full h-12 px-4 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-ml-blue focus:border-transparent transition-all"
                />
                <p className="text-xs text-gray-400 mt-1">Use somente o dominio da API do fornecedor.</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Endpoint de catalogo</label>
                <input
                  type="text"
                  value={decodoProductsPath}
                  onChange={(event) => setDecodoProductsPath(event.target.value)}
                  placeholder="/subscriptions"
                  className="w-full h-12 px-4 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-ml-blue focus:border-transparent transition-all"
                />
                <p className="text-xs text-gray-400 mt-1">Esse endpoint valida a assinatura e o trafego antes de liberar planos vendaveis.</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">API Key</label>
                <input
                  type="password"
                  value={decodoApiKey}
                  onChange={(event) => setDecodoApiKey(event.target.value)}
                  placeholder="Chave publica da API do fornecedor"
                  className="w-full h-12 px-4 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-ml-blue focus:border-transparent transition-all"
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2 opacity-60">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Usuario</label>
                  <input
                    type="text"
                    value={decodoUsername}
                    onChange={(event) => setDecodoUsername(event.target.value)}
                    placeholder="Nao usado para provisionamento"
                    className="w-full h-12 px-4 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-ml-blue focus:border-transparent transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
                  <input
                    type="password"
                    value={decodoPassword}
                    onChange={(event) => setDecodoPassword(event.target.value)}
                    placeholder="Nao usado para provisionamento"
                    className="w-full h-12 px-4 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-ml-blue focus:border-transparent transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="rounded-md border border-gray-100 bg-gray-50 p-4 space-y-2">
              <p className="text-sm font-medium text-gray-700">Endpoint interno da plataforma</p>
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
                {saving ? 'Salvando...' : 'Salvar fornecedor'}
              </Button>
              <Button
                type="button"
                onClick={testDecodoConnection}
                disabled={loading}
                className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold py-3 px-6 rounded-sm shadow-sm"
              >
                Testar catálogo
              </Button>
            </div>

            {proxyProviderMessage && <p className={`text-sm ${proxyProviderMessage.includes('confirmadas') ? 'text-green-600' : 'text-red-600'}`}>{proxyProviderMessage}</p>}
            {proxyProviderTestMessage && <p className={`text-sm ${proxyProviderTestMessage.includes('validado') ? 'text-green-600' : 'text-red-600'}`}>{proxyProviderTestMessage}</p>}
          </CardContent>
        </Card>

        <Card className="bg-white border-none shadow-sm rounded-md">
          <CardContent className="p-6 space-y-6">
            <div>
              <h3 className="text-lg font-medium text-ml-dark">Planos de proxy</h3>
              <p className="text-sm text-gray-500">Cadastre preco e limite. A pagina so mostra planos que cabem no trafego disponivel do fornecedor.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <GatewayField label="Nome do plano">
                <input value={proxyOfferForm.name} onChange={(event) => updateProxyOfferForm('name', event.target.value)} placeholder="Proxy premium 10GB" className="w-full h-11 px-3 border border-gray-300 rounded-sm" />
              </GatewayField>
              <GatewayField label="Tipo">
                <input value={proxyOfferForm.type} onChange={(event) => updateProxyOfferForm('type', event.target.value)} placeholder="Pool premium" className="w-full h-11 px-3 border border-gray-300 rounded-sm" />
              </GatewayField>
              <GatewayField label="Pais/localidade">
                <input value={proxyOfferForm.country} onChange={(event) => updateProxyOfferForm('country', event.target.value)} placeholder="Global, Brasil, EUA..." className="w-full h-11 px-3 border border-gray-300 rounded-sm" />
              </GatewayField>
              <GatewayField label="Cidade">
                <input value={proxyOfferForm.city} onChange={(event) => updateProxyOfferForm('city', event.target.value)} placeholder="Opcional" className="w-full h-11 px-3 border border-gray-300 rounded-sm" />
              </GatewayField>
              <GatewayField label="Protocolo">
                <input value={proxyOfferForm.protocol} onChange={(event) => updateProxyOfferForm('protocol', event.target.value)} placeholder="HTTP(S) / SOCKS5" className="w-full h-11 px-3 border border-gray-300 rounded-sm" />
              </GatewayField>
              <GatewayField label="Preco">
                <input value={proxyOfferForm.price} onChange={(event) => updateProxyOfferForm('price', event.target.value)} placeholder="R$ 139,90" className="w-full h-11 px-3 border border-gray-300 rounded-sm" />
              </GatewayField>
              <GatewayField label="Valor cobrado (R$)">
                <input type="number" step="0.01" value={proxyOfferForm.price_amount ?? ''} onChange={(event) => updateProxyOfferForm('price_amount', event.target.value ? Number(event.target.value) : null)} placeholder="139.90" className="w-full h-11 px-3 border border-gray-300 rounded-sm" />
              </GatewayField>
              <GatewayField label="Trafego">
                <input value={proxyOfferForm.traffic} onChange={(event) => updateProxyOfferForm('traffic', event.target.value)} placeholder="10GB" className="w-full h-11 px-3 border border-gray-300 rounded-sm" />
              </GatewayField>
              <GatewayField label="GB provisionado">
                <input type="number" step="0.1" value={proxyOfferForm.traffic_limit_gb} onChange={(event) => updateProxyOfferForm('traffic_limit_gb', Number(event.target.value))} placeholder="10" className="w-full h-11 px-3 border border-gray-300 rounded-sm" />
              </GatewayField>
              <GatewayField label="Estoque/status curto">
                <input value={proxyOfferForm.stock} onChange={(event) => updateProxyOfferForm('stock', event.target.value)} placeholder="Disponivel" className="w-full h-11 px-3 border border-gray-300 rounded-sm" />
              </GatewayField>
              <GatewayField label="Endpoint exibido">
                <input value={proxyOfferForm.endpoint} onChange={(event) => updateProxyOfferForm('endpoint', event.target.value)} placeholder="Liberado apos compra" className="w-full h-11 px-3 border border-gray-300 rounded-sm" />
              </GatewayField>
              <GatewayField label="Porta">
                <input value={proxyOfferForm.port} onChange={(event) => updateProxyOfferForm('port', event.target.value)} placeholder="Opcional" className="w-full h-11 px-3 border border-gray-300 rounded-sm" />
              </GatewayField>
              <GatewayField label="Ordem">
                <input type="number" value={proxyOfferForm.sort_order} onChange={(event) => updateProxyOfferForm('sort_order', Number(event.target.value))} className="w-full h-11 px-3 border border-gray-300 rounded-sm" />
              </GatewayField>
              <GatewayField label="Status">
                <input value={proxyOfferForm.status} onChange={(event) => updateProxyOfferForm('status', event.target.value)} placeholder="Disponivel" className="w-full h-11 px-3 border border-gray-300 rounded-sm" />
              </GatewayField>
              <GatewayField label="Tipo provisionado">
                <input value={proxyOfferForm.service_type} onChange={(event) => updateProxyOfferForm('service_type', event.target.value)} placeholder="residential_proxies" className="w-full h-11 px-3 border border-gray-300 rounded-sm" />
              </GatewayField>
            </div>

            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input type="checkbox" checked={proxyOfferForm.is_active} onChange={(event) => updateProxyOfferForm('is_active', event.target.checked)} className="h-4 w-4 accent-ml-blue" />
              Mostrar plano na pagina de proxies
            </label>
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input type="checkbox" checked={proxyOfferForm.auto_disable} onChange={(event) => updateProxyOfferForm('auto_disable', event.target.checked)} className="h-4 w-4 accent-ml-blue" />
              Desativar automaticamente ao atingir o limite de trafego
            </label>

            <div className="flex flex-wrap gap-3">
              <Button type="button" onClick={saveProxyOffer} className="bg-ml-blue text-white hover:bg-ml-hover font-semibold py-3 px-6 rounded-sm shadow-sm">
                {proxyOfferForm.id ? 'Salvar alteracoes' : 'Adicionar plano'}
              </Button>
              <Button type="button" onClick={resetProxyOfferForm} className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold py-3 px-6 rounded-sm shadow-sm">
                Novo plano
              </Button>
            </div>

            {proxyOfferMessage && <p className={`text-sm ${proxyOfferMessage.includes('salvo') || proxyOfferMessage.includes('removido') ? 'text-green-600' : 'text-red-600'}`}>{proxyOfferMessage}</p>}

            <div className="overflow-hidden rounded-sm border border-gray-100">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 text-gray-500">
                  <tr>
                    <th className="px-4 py-3 font-medium">Plano</th>
                    <th className="px-4 py-3 font-medium">Preco</th>
                    <th className="px-4 py-3 font-medium">Trafego</th>
                    <th className="px-4 py-3 font-medium">Ativo</th>
                    <th className="px-4 py-3 font-medium text-right">Acoes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {proxyOffers.map((offer) => (
                    <tr key={offer.id}>
                      <td className="px-4 py-3">
                        <p className="font-semibold text-gray-900">{offer.name}</p>
                        <p className="text-xs text-gray-500">{offer.country} {offer.city ? `/ ${offer.city}` : ''}</p>
                      </td>
                      <td className="px-4 py-3 text-gray-700">{offer.price}</td>
                      <td className="px-4 py-3 text-gray-700">{offer.traffic}</td>
                      <td className="px-4 py-3 text-gray-700">{offer.is_active ? 'Sim' : 'Nao'}</td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-2">
                          <button type="button" onClick={() => editProxyOffer(offer)} className="text-ml-blue hover:underline">Editar</button>
                          <button type="button" onClick={() => deleteProxyOffer(offer.id)} className="text-red-500 hover:underline">Remover</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {proxyOffers.length === 0 && (
                    <tr>
                      <td className="px-4 py-6 text-center text-gray-500" colSpan={5}>Nenhum plano cadastrado.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}

function GatewayField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-gray-700">{label}</span>
      {children}
    </label>
  )
}
