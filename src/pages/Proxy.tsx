import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Copy, Globe2, LockKeyhole, RefreshCw, Search, Server, ShieldCheck, Wifi } from 'lucide-react'
import { createProxyTopupSale, getDecodoProxyCatalog, getMyProxyDeliveries, type DecodoProxyDelivery, type DecodoProxyOffer } from '../lib/decodo'
import { useAuth } from '../contexts/AuthContext'
import { createWestPayPixInOrThrow, validateWestPayCustomer } from '../lib/westpay'
import { supabase } from '../lib/supabase'
import { formatCurrency } from '../lib/data'

function displayValue(value: string, fallback = 'Consultar') {
  return value?.trim() || fallback
}

type ProxyCountry = {
  code: string
  name: string
  endpoint: string
  port: string
}

const proxyCountries: ProxyCountry[] = [
  { code: 'global', name: 'Global / aleatorio', endpoint: 'gate.decodo.com', port: '7000' },
  { code: 'br', name: 'Brasil', endpoint: 'br.decodo.com', port: '10000' },
  { code: 'us', name: 'Estados Unidos', endpoint: 'us.decodo.com', port: '10000' },
  { code: 'pt', name: 'Portugal', endpoint: 'pt.decodo.com', port: '20000' },
  { code: 'es', name: 'Espanha', endpoint: 'es.decodo.com', port: '10000' },
  { code: 'gb', name: 'Reino Unido', endpoint: 'gb.decodo.com', port: '30000' },
  { code: 'ca', name: 'Canada', endpoint: 'ca.decodo.com', port: '20000' },
  { code: 'mx', name: 'Mexico', endpoint: 'mx.decodo.com', port: '20000' },
  { code: 'ar', name: 'Argentina', endpoint: 'ar.decodo.com', port: '10000' },
  { code: 'cl', name: 'Chile', endpoint: 'cl.decodo.com', port: '30000' },
  { code: 'co', name: 'Colombia', endpoint: 'co.decodo.com', port: '30000' },
  { code: 'pe', name: 'Peru', endpoint: 'pe.decodo.com', port: '40000' },
  { code: 'fr', name: 'Franca', endpoint: 'fr.decodo.com', port: '40000' },
  { code: 'de', name: 'Alemanha', endpoint: 'de.decodo.com', port: '20000' },
  { code: 'it', name: 'Italia', endpoint: 'it.decodo.com', port: '20000' },
  { code: 'nl', name: 'Holanda', endpoint: 'nl.decodo.com', port: '10000' },
  { code: 'pl', name: 'Polonia', endpoint: 'pl.decodo.com', port: '20000' },
  { code: 'se', name: 'Suecia', endpoint: 'se.decodo.com', port: '20000' },
  { code: 'au', name: 'Australia', endpoint: 'au.decodo.com', port: '30000' },
  { code: 'jp', name: 'Japao', endpoint: 'jp.decodo.com', port: '30000' },
  { code: 'in', name: 'India', endpoint: 'in.decodo.com', port: '10000' },
  { code: 'sg', name: 'Singapura', endpoint: 'sg.decodo.com', port: '10000' },
]

function getProxyCountry(code?: string) {
  return proxyCountries.find((country) => country.code === code) ?? proxyCountries[0]
}

function formatGb(value: number | null | undefined) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return 'Atualizando'
  return `${Number(value).toLocaleString('pt-BR', { maximumFractionDigits: 2 })}GB`
}

function ProxyCard({
  proxy,
  onBuy,
  buying,
  selectedCountry,
  onCountryChange,
}: {
  proxy: DecodoProxyOffer
  onBuy: (proxy: DecodoProxyOffer, country: ProxyCountry) => void
  buying: boolean
  selectedCountry: ProxyCountry
  onCountryChange: (country: ProxyCountry) => void
}) {
  return (
    <article className="layout-surface flex h-full flex-col rounded-sm p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--layout-link-color)]">{displayValue(proxy.type, 'Proxy premium')}</p>
          <h3 className="mt-1 line-clamp-2 text-lg font-bold text-[var(--layout-text-primary)]">{displayValue(proxy.name, 'Proxy disponivel')}</h3>
        </div>
        <span className="rounded-sm bg-[var(--layout-subtle-background)] px-2 py-1 text-xs font-bold text-[var(--layout-success-color)]">
          {displayValue(proxy.status, 'Disponivel')}
        </span>
      </div>

      <div className="grid gap-3 text-sm text-[var(--layout-text-muted)]">
        <div className="flex items-center gap-2">
          <Globe2 className="h-4 w-4 text-[var(--layout-link-color)]" />
          <span>{[proxy.country, proxy.city].filter(Boolean).join(' / ') || 'Localidade sob demanda'}</span>
        </div>
        <div className="flex items-center gap-2">
          <Wifi className="h-4 w-4 text-[var(--layout-link-color)]" />
          <span>{displayValue(proxy.protocol, 'HTTP(S) / SOCKS5')}</span>
        </div>
        <div className="flex items-center gap-2">
          <Server className="h-4 w-4 text-[var(--layout-link-color)]" />
          <span>{selectedCountry.endpoint}:{selectedCountry.port}</span>
        </div>
      </div>

      <label className="mt-4 block">
        <span className="mb-1 block text-xs font-bold uppercase tracking-[0.08em] text-[var(--layout-text-muted)]">Pais da proxy</span>
        <select
          value={selectedCountry.code}
          onChange={(event) => onCountryChange(getProxyCountry(event.target.value))}
          className="h-11 w-full rounded-sm border border-[var(--layout-border-color)] bg-[var(--layout-surface-background)] px-3 text-sm text-[var(--layout-text-primary)] outline-none focus:border-[var(--layout-accent-color)]"
        >
          {proxyCountries.map((country) => (
            <option key={country.code} value={country.code}>{country.name}</option>
          ))}
        </select>
      </label>

      <div className="mt-5 grid grid-cols-3 gap-2 border-t border-[var(--layout-border-color)] pt-4 text-xs">
        <div>
          <p className="font-bold text-[var(--layout-text-primary)]">Preco</p>
          <p className="mt-1 text-[var(--layout-price-color)]">{proxy.priceAmount ? formatCurrency(proxy.priceAmount) : displayValue(proxy.price)}</p>
        </div>
        <div>
          <p className="font-bold text-[var(--layout-text-primary)]">Trafego</p>
          <p className="mt-1 text-[var(--layout-text-muted)]">{displayValue(proxy.traffic)}</p>
        </div>
        <div>
          <p className="font-bold text-[var(--layout-text-primary)]">Estoque</p>
          <p className="mt-1 text-[var(--layout-text-muted)]">{displayValue(proxy.stock)}</p>
        </div>
      </div>

      <button
        type="button"
        onClick={() => onBuy(proxy, selectedCountry)}
        disabled={buying || !proxy.priceAmount}
        className="layout-primary-button mt-5 h-11 rounded-sm text-sm font-bold disabled:cursor-not-allowed disabled:opacity-60"
      >
        {buying ? 'Gerando Pix...' : 'Comprar proxy'}
      </button>
    </article>
  )
}

export function Proxy() {
  const navigate = useNavigate()
  const { user, profile, loading: authLoading } = useAuth()
  const [items, setItems] = useState<DecodoProxyOffer[]>([])
  const [deliveries, setDeliveries] = useState<DecodoProxyDelivery[]>([])
  const [configured, setConfigured] = useState(true)
  const [loading, setLoading] = useState(true)
  const [deliveriesLoading, setDeliveriesLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [deliveryError, setDeliveryError] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [activeTab, setActiveTab] = useState<'catalog' | 'mine'>('catalog')
  const [selectedProxy, setSelectedProxy] = useState<DecodoProxyOffer | null>(null)
  const [selectedTopupDelivery, setSelectedTopupDelivery] = useState<DecodoProxyDelivery | null>(null)
  const [selectedTopupOfferId, setSelectedTopupOfferId] = useState('')
  const [buyerName, setBuyerName] = useState('')
  const [buyerPhone, setBuyerPhone] = useState('')
  const [buyerDocument, setBuyerDocument] = useState('')
  const [buyingId, setBuyingId] = useState<string | null>(null)
  const [topupBuyingId, setTopupBuyingId] = useState<string | null>(null)
  const [selectedCountries, setSelectedCountries] = useState<Record<string, string>>({})
  const [selectedCountry, setSelectedCountry] = useState<ProxyCountry>(proxyCountries[0])

  useEffect(() => {
    setBuyerName(profile?.full_name ?? user?.user_metadata?.full_name ?? '')
    setBuyerPhone(profile?.phone ?? '')
  }, [profile?.full_name, profile?.phone, user?.user_metadata?.full_name])

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await getDecodoProxyCatalog()
      setConfigured(result.configured)
      setItems(result.items)
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Nao foi possivel carregar os proxies agora.')
    } finally {
      setLoading(false)
    }
  }

  const loadDeliveries = async () => {
    if (!user) return
    setDeliveriesLoading(true)
    setDeliveryError(null)
    try {
      const result = await getMyProxyDeliveries()
      setDeliveries(result.items)
    } catch (loadError) {
      setDeliveryError(loadError instanceof Error ? loadError.message : 'Nao foi possivel carregar suas proxies agora.')
    } finally {
      setDeliveriesLoading(false)
    }
  }

  useEffect(() => {
    load().catch(console.error)
  }, [])

  useEffect(() => {
    if (activeTab === 'mine' && user) loadDeliveries().catch(console.error)
  }, [activeTab, user?.id])

  const filteredItems = useMemo(() => {
    const term = query.trim().toLowerCase()
    if (!term) return items
    return items.filter((item) => [
      item.name,
      item.type,
      item.country,
      item.city,
      item.protocol,
      item.endpoint,
      item.status,
    ].some((value) => value.toLowerCase().includes(term)))
  }, [items, query])

  const handleBuy = async (proxy: DecodoProxyOffer, country = getProxyCountry(selectedCountries[proxy.id])) => {
    if (authLoading) return
    if (!user) {
      setError('Entre na sua conta para comprar proxy.')
      return
    }

    setError(null)
    setSelectedProxy(proxy)
    setSelectedCountry(country)

    if (!buyerName.trim() || !buyerPhone.trim() || !buyerDocument.trim()) return

    setBuyingId(proxy.id)
    let saleId: string | null = null

    try {
      const customer = validateWestPayCustomer({
        name: buyerName,
        email: user.email ?? '',
        phone: buyerPhone,
        documentNumber: buyerDocument,
      })

      const { data: saleData, error: saleError } = await supabase.from('sales').insert({
        product_id: null,
        proxy_offer_id: Number(proxy.id),
        buyer_id: user.id,
        seller_id: null,
        amount: proxy.priceAmount,
        status: 'pending',
        proxy_country_code: country.code,
        proxy_country_name: country.name,
        proxy_endpoint: country.endpoint,
        proxy_port: country.port,
      }).select('id').single()

      if (saleError) throw saleError
      saleId = saleData?.id ? String(saleData.id) : null
      if (!saleId) throw new Error('Nao foi possivel gerar o pedido.')

      await createWestPayPixInOrThrow({
        saleId,
        amount: proxy.priceAmount,
        customer,
        itemTitle: proxy.name,
      })

      navigate('/painel/usuario/compras', { state: { checkoutSaleIds: [saleId] } })
    } catch (buyError) {
      if (saleId) await supabase.from('sales').delete().eq('id', saleId)
      setError(buyError instanceof Error ? buyError.message : 'Nao foi possivel gerar o Pix.')
    } finally {
      setBuyingId(null)
    }
  }

  const handleTopup = async (delivery: DecodoProxyDelivery, offerId: string) => {
    if (authLoading) return
    if (!user) {
      setDeliveryError('Entre na sua conta para recarregar proxy.')
      return
    }

    const offer = items.find((item) => item.id === offerId)
    if (!offer) {
      setDeliveryError('Escolha um pacote de GB para recarregar.')
      return
    }

    setDeliveryError(null)
    setSelectedProxy(null)
    setSelectedTopupDelivery(delivery)
    setSelectedTopupOfferId(offerId)

    if (!buyerName.trim() || !buyerPhone.trim() || !buyerDocument.trim()) return

    setTopupBuyingId(delivery.id)
    let saleId: string | null = null

    try {
      const customer = validateWestPayCustomer({
        name: buyerName,
        email: user.email ?? '',
        phone: buyerPhone,
        documentNumber: buyerDocument,
      })

      const result = await createProxyTopupSale(delivery.id, offerId)
      saleId = result.sale?.id ? String(result.sale.id) : null
      if (!saleId) throw new Error('Nao foi possivel gerar o pedido de recarga.')

      await createWestPayPixInOrThrow({
        saleId,
        amount: offer.priceAmount,
        customer,
        itemTitle: `Recarga ${offer.traffic} - ${delivery.username}`,
      })

      navigate('/painel/usuario/compras', { state: { checkoutSaleIds: [saleId] } })
    } catch (topupError) {
      if (saleId) await supabase.from('sales').delete().eq('id', saleId)
      setDeliveryError(topupError instanceof Error ? topupError.message : 'Nao foi possivel gerar o Pix da recarga.')
    } finally {
      setTopupBuyingId(null)
    }
  }

  return (
    <div className="min-h-screen bg-[var(--layout-page-background)] pb-12 text-[var(--layout-text-primary)]">
      <section className="bg-[var(--layout-dashboard-sidebar-header-bg)] text-[var(--layout-dashboard-sidebar-text)]">
        <div className="mx-auto max-w-[1440px] px-4 py-8">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-end">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--layout-dashboard-sidebar-kicker-text)]">Cookie Proxy</p>
              <h1 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">Proxies disponiveis</h1>
              <p className="mt-3 max-w-2xl text-sm text-[var(--layout-dashboard-sidebar-muted-text)]">
                Catalogo de proxies com disponibilidade atualizada automaticamente.
              </p>
            </div>
            <div className="layout-surface rounded-sm p-4 text-[var(--layout-text-primary)] shadow-sm">
              <div className="flex gap-3">
                <ShieldCheck className="h-9 w-9 text-[var(--layout-success-color)]" />
                <div>
                  <p className="font-bold">Conexao protegida</p>
                  <p className="mt-1 text-sm text-[var(--layout-text-muted)]">As credenciais ficam protegidas e as consultas passam pela estrutura da plataforma.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-[1440px] px-4 py-6">
        <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="relative w-full md:max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--layout-text-muted)]" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="h-11 w-full rounded-sm border border-[var(--layout-border-color)] bg-[var(--layout-surface-background)] pl-9 pr-3 text-sm outline-none focus:border-[var(--layout-accent-color)]"
              placeholder="Buscar por pais, tipo ou protocolo"
            />
          </div>
          <button onClick={load} className="layout-secondary-button inline-flex h-11 items-center justify-center gap-2 rounded-sm px-4 text-sm font-bold" disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </button>
        </div>

        <div className="mb-5 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('catalog')}
            className={`rounded-sm px-4 py-2 text-sm font-bold ${activeTab === 'catalog' ? 'layout-primary-button' : 'layout-secondary-button'}`}
          >
            Comprar proxy
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('mine')}
            className={`rounded-sm px-4 py-2 text-sm font-bold ${activeTab === 'mine' ? 'layout-primary-button' : 'layout-secondary-button'}`}
          >
            Minhas proxies
          </button>
        </div>

        {!configured && (
          <div className="layout-surface rounded-sm p-6 shadow-sm">
            <div className="flex gap-3">
              <LockKeyhole className="h-6 w-6 text-[var(--layout-link-color)]" />
              <div>
                <h2 className="font-bold">Catalogo de proxies ainda nao configurado</h2>
                <p className="mt-1 text-sm text-[var(--layout-text-muted)]">
                  Configure as credenciais em Painel Admin &gt; Gateway para listar os proxies disponiveis.
                </p>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="rounded-sm border border-red-200 bg-red-50 p-4 text-sm text-red-600">
            {error}
          </div>
        )}

        {deliveryError && (
          <div className="mb-5 rounded-sm border border-red-200 bg-red-50 p-4 text-sm text-red-600">
            {deliveryError}
          </div>
        )}

        {selectedProxy && user && (
          <div className="layout-surface mb-5 rounded-sm p-5 shadow-sm">
            <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px] lg:items-end">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--layout-link-color)]">Dados para pagamento</p>
                <h2 className="mt-1 text-lg font-bold text-[var(--layout-text-primary)]">{selectedProxy.name}</h2>
                <p className="mt-1 text-sm text-[var(--layout-text-muted)]">
                {selectedProxy.traffic} de trafego em {selectedCountry.name}. A credencial exclusiva e liberada depois da confirmacao do pagamento.
                </p>
                <div className="mt-4 grid gap-3 md:grid-cols-3">
                  <label className="block">
                    <span className="mb-1 block text-sm font-bold text-[var(--layout-text-primary)]">Nome completo</span>
                    <input value={buyerName} onChange={(event) => setBuyerName(event.target.value)} className="h-11 w-full rounded-sm border border-[var(--layout-border-color)] px-3 text-sm outline-none focus:border-[var(--layout-accent-color)]" />
                  </label>
                  <label className="block">
                    <span className="mb-1 block text-sm font-bold text-[var(--layout-text-primary)]">WhatsApp</span>
                    <input value={buyerPhone} onChange={(event) => setBuyerPhone(event.target.value)} className="h-11 w-full rounded-sm border border-[var(--layout-border-color)] px-3 text-sm outline-none focus:border-[var(--layout-accent-color)]" placeholder="DDD + numero" />
                  </label>
                  <label className="block">
                    <span className="mb-1 block text-sm font-bold text-[var(--layout-text-primary)]">CPF ou CNPJ</span>
                    <input value={buyerDocument} onChange={(event) => setBuyerDocument(event.target.value)} className="h-11 w-full rounded-sm border border-[var(--layout-border-color)] px-3 text-sm outline-none focus:border-[var(--layout-accent-color)]" placeholder="Somente numeros" />
                  </label>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleBuy(selectedProxy, selectedCountry)}
                disabled={Boolean(buyingId)}
                className="layout-primary-button h-12 rounded-sm px-5 text-sm font-bold disabled:cursor-not-allowed disabled:opacity-60"
              >
                {buyingId ? 'Gerando Pix...' : `Pagar ${formatCurrency(selectedProxy.priceAmount)}`}
              </button>
            </div>
          </div>
        )}

        {selectedTopupDelivery && user && (
          <div className="layout-surface mb-5 rounded-sm p-5 shadow-sm">
            <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px] lg:items-end">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--layout-link-color)]">Recarga de proxy</p>
                <h2 className="mt-1 text-lg font-bold text-[var(--layout-text-primary)]">{selectedTopupDelivery.username}</h2>
                <p className="mt-1 text-sm text-[var(--layout-text-muted)]">
                  O pacote escolhido sera somado ao limite da mesma credencial apos a confirmacao do pagamento.
                </p>
                <div className="mt-4 grid gap-3 md:grid-cols-3">
                  <label className="block">
                    <span className="mb-1 block text-sm font-bold text-[var(--layout-text-primary)]">Nome completo</span>
                    <input value={buyerName} onChange={(event) => setBuyerName(event.target.value)} className="h-11 w-full rounded-sm border border-[var(--layout-border-color)] px-3 text-sm outline-none focus:border-[var(--layout-accent-color)]" />
                  </label>
                  <label className="block">
                    <span className="mb-1 block text-sm font-bold text-[var(--layout-text-primary)]">WhatsApp</span>
                    <input value={buyerPhone} onChange={(event) => setBuyerPhone(event.target.value)} className="h-11 w-full rounded-sm border border-[var(--layout-border-color)] px-3 text-sm outline-none focus:border-[var(--layout-accent-color)]" placeholder="DDD + numero" />
                  </label>
                  <label className="block">
                    <span className="mb-1 block text-sm font-bold text-[var(--layout-text-primary)]">CPF ou CNPJ</span>
                    <input value={buyerDocument} onChange={(event) => setBuyerDocument(event.target.value)} className="h-11 w-full rounded-sm border border-[var(--layout-border-color)] px-3 text-sm outline-none focus:border-[var(--layout-accent-color)]" placeholder="Somente numeros" />
                  </label>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleTopup(selectedTopupDelivery, selectedTopupOfferId)}
                disabled={Boolean(topupBuyingId)}
                className="layout-primary-button h-12 rounded-sm px-5 text-sm font-bold disabled:cursor-not-allowed disabled:opacity-60"
              >
                {topupBuyingId ? 'Gerando Pix...' : 'Pagar recarga'}
              </button>
            </div>
          </div>
        )}

        {activeTab === 'catalog' && loading && (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <div key={item} className="h-72 animate-pulse rounded-sm bg-[var(--layout-surface-background)]" />
            ))}
          </div>
        )}

        {activeTab === 'catalog' && !loading && configured && !error && filteredItems.length === 0 && (
          <div className="layout-surface rounded-sm p-8 text-center text-sm text-[var(--layout-text-muted)] shadow-sm">
            Nenhum proxy disponivel no momento.
          </div>
        )}

        {activeTab === 'catalog' && !loading && filteredItems.length > 0 && (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filteredItems.map((item, index) => (
              <ProxyCard
                key={`${item.id}-${index}`}
                proxy={item}
                onBuy={handleBuy}
                buying={buyingId === item.id}
                selectedCountry={getProxyCountry(selectedCountries[item.id])}
                onCountryChange={(country) => setSelectedCountries((current) => ({ ...current, [item.id]: country.code }))}
              />
            ))}
          </div>
        )}

        {activeTab === 'mine' && !user && (
          <div className="layout-surface rounded-sm p-8 text-center text-sm text-[var(--layout-text-muted)] shadow-sm">
            Entre na sua conta para ver suas proxies.
          </div>
        )}

        {activeTab === 'mine' && user && deliveriesLoading && (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {[1, 2, 3].map((item) => (
              <div key={item} className="h-80 animate-pulse rounded-sm bg-[var(--layout-surface-background)]" />
            ))}
          </div>
        )}

        {activeTab === 'mine' && user && !deliveriesLoading && deliveries.length === 0 && (
          <div className="layout-surface rounded-sm p-8 text-center text-sm text-[var(--layout-text-muted)] shadow-sm">
            Nenhuma proxy ativa encontrada na sua conta.
          </div>
        )}

        {activeTab === 'mine' && user && !deliveriesLoading && deliveries.length > 0 && (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {deliveries.map((delivery) => {
              const selectedOffer = items.find((item) => item.id === (selectedTopupDelivery?.id === delivery.id ? selectedTopupOfferId : '')) ?? items[0]
              const proxyLine = `${delivery.host}:${delivery.port}:${delivery.username}:${delivery.password}`

              return (
                <article key={delivery.id} className="layout-surface rounded-sm p-5 shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--layout-link-color)]">Proxy ativa</p>
                      <h3 className="mt-1 truncate text-lg font-bold text-[var(--layout-text-primary)]">{delivery.offer?.name ?? delivery.username}</h3>
                    </div>
                    <span className="rounded-sm bg-[var(--layout-subtle-background)] px-2 py-1 text-xs font-bold text-[var(--layout-success-color)]">
                      {delivery.providerStatus || delivery.status}
                    </span>
                  </div>

                  <div className="mt-4 grid gap-2 text-sm text-[var(--layout-text-muted)]">
                    <p><strong className="text-[var(--layout-text-primary)]">Endpoint:</strong> {delivery.host}:{delivery.port}</p>
                    <p><strong className="text-[var(--layout-text-primary)]">Usuario:</strong> {delivery.username}</p>
                    <p><strong className="text-[var(--layout-text-primary)]">Senha:</strong> {delivery.password}</p>
                  </div>

                  <div className="mt-4 grid grid-cols-3 gap-2 border-t border-[var(--layout-border-color)] pt-4 text-xs">
                    <div>
                      <p className="font-bold text-[var(--layout-text-primary)]">Limite</p>
                      <p className="mt-1 text-[var(--layout-text-muted)]">{formatGb(delivery.trafficLimitGb)}</p>
                    </div>
                    <div>
                      <p className="font-bold text-[var(--layout-text-primary)]">Usado</p>
                      <p className="mt-1 text-[var(--layout-text-muted)]">{formatGb(delivery.trafficUsedGb)}</p>
                    </div>
                    <div>
                      <p className="font-bold text-[var(--layout-text-primary)]">Restante</p>
                      <p className="mt-1 text-[var(--layout-price-color)]">{formatGb(delivery.trafficRemainingGb)}</p>
                    </div>
                  </div>

                  {delivery.providerError && <p className="mt-3 text-xs text-amber-700">{delivery.providerError}</p>}

                  <div className="mt-4 flex gap-2">
                    <button
                      type="button"
                      onClick={() => navigator.clipboard.writeText(proxyLine)}
                      className="layout-secondary-button inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-sm px-3 text-sm font-bold"
                    >
                      <Copy className="h-4 w-4" />
                      Copiar
                    </button>
                    <button
                      type="button"
                      onClick={loadDeliveries}
                      className="layout-secondary-button inline-flex h-10 items-center justify-center rounded-sm px-3 text-sm font-bold"
                    >
                      Testar
                    </button>
                  </div>

                  <label className="mt-4 block">
                    <span className="mb-1 block text-xs font-bold uppercase tracking-[0.08em] text-[var(--layout-text-muted)]">Adicionar GB</span>
                    <select
                      value={selectedTopupDelivery?.id === delivery.id ? selectedTopupOfferId : selectedOffer?.id ?? ''}
                      onChange={(event) => {
                        setSelectedTopupDelivery(delivery)
                        setSelectedTopupOfferId(event.target.value)
                      }}
                      className="h-11 w-full rounded-sm border border-[var(--layout-border-color)] bg-[var(--layout-surface-background)] px-3 text-sm text-[var(--layout-text-primary)] outline-none focus:border-[var(--layout-accent-color)]"
                    >
                      {items.map((item) => (
                        <option key={item.id} value={item.id}>{item.traffic} - {formatCurrency(item.priceAmount)}</option>
                      ))}
                    </select>
                  </label>
                  <button
                    type="button"
                    onClick={() => handleTopup(delivery, selectedTopupDelivery?.id === delivery.id ? selectedTopupOfferId : selectedOffer?.id ?? '')}
                    disabled={!items.length || topupBuyingId === delivery.id}
                    className="layout-primary-button mt-3 h-11 w-full rounded-sm text-sm font-bold disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {topupBuyingId === delivery.id ? 'Gerando Pix...' : 'Recarregar esta proxy'}
                  </button>
                </article>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
