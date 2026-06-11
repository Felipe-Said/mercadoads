import React, { useEffect, useMemo, useState } from 'react'
import { Globe2, LockKeyhole, RefreshCw, Search, Server, ShieldCheck, Wifi } from 'lucide-react'
import { getDecodoProxyCatalog, type DecodoProxyOffer } from '../lib/decodo'

function displayValue(value: string, fallback = 'Consultar') {
  return value?.trim() || fallback
}

function ProxyCard({ proxy }: { proxy: DecodoProxyOffer }) {
  return (
    <article className="layout-surface flex h-full flex-col rounded-sm p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--layout-link-color)]">{displayValue(proxy.type, 'Proxy Decodo')}</p>
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
          <span>{proxy.endpoint ? `${proxy.endpoint}${proxy.port ? `:${proxy.port}` : ''}` : 'Endpoint liberado apos compra'}</span>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-3 gap-2 border-t border-[var(--layout-border-color)] pt-4 text-xs">
        <div>
          <p className="font-bold text-[var(--layout-text-primary)]">Preco</p>
          <p className="mt-1 text-[var(--layout-price-color)]">{displayValue(proxy.price)}</p>
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

      <button className="layout-primary-button mt-5 h-11 rounded-sm text-sm font-bold">
        Solicitar proxy
      </button>
    </article>
  )
}

export function Proxy() {
  const [items, setItems] = useState<DecodoProxyOffer[]>([])
  const [configured, setConfigured] = useState(true)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [query, setQuery] = useState('')

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await getDecodoProxyCatalog()
      setConfigured(result.configured)
      setItems(result.items)
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Nao foi possivel carregar os proxies da Decodo.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load().catch(console.error)
  }, [])

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

  return (
    <div className="min-h-screen bg-[var(--layout-page-background)] pb-12 text-[var(--layout-text-primary)]">
      <section className="bg-[var(--layout-dashboard-sidebar-header-bg)] text-[var(--layout-dashboard-sidebar-text)]">
        <div className="mx-auto max-w-[1440px] px-4 py-8">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-end">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--layout-dashboard-sidebar-kicker-text)]">Decodo Proxy</p>
              <h1 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">Proxies disponiveis</h1>
              <p className="mt-3 max-w-2xl text-sm text-[var(--layout-dashboard-sidebar-muted-text)]">
                Catalogo conectado a Decodo para vender proxies com disponibilidade atualizada pela API.
              </p>
            </div>
            <div className="layout-surface rounded-sm p-4 text-[var(--layout-text-primary)] shadow-sm">
              <div className="flex gap-3">
                <ShieldCheck className="h-9 w-9 text-[var(--layout-success-color)]" />
                <div>
                  <p className="font-bold">Conexao protegida</p>
                  <p className="mt-1 text-sm text-[var(--layout-text-muted)]">Credenciais ficam no Supabase e as chamadas passam pela Edge Function.</p>
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

        {!configured && (
          <div className="layout-surface rounded-sm p-6 shadow-sm">
            <div className="flex gap-3">
              <LockKeyhole className="h-6 w-6 text-[var(--layout-link-color)]" />
              <div>
                <h2 className="font-bold">Decodo ainda nao configurada</h2>
                <p className="mt-1 text-sm text-[var(--layout-text-muted)]">
                  Configure API Key ou usuario/senha em Painel Admin &gt; Gateway para listar os proxies disponiveis.
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

        {loading && (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <div key={item} className="h-72 animate-pulse rounded-sm bg-[var(--layout-surface-background)]" />
            ))}
          </div>
        )}

        {!loading && configured && !error && filteredItems.length === 0 && (
          <div className="layout-surface rounded-sm p-8 text-center text-sm text-[var(--layout-text-muted)] shadow-sm">
            Nenhum proxy retornado pela Decodo no momento.
          </div>
        )}

        {!loading && filteredItems.length > 0 && (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filteredItems.map((item, index) => (
              <ProxyCard key={`${item.id}-${index}`} proxy={item} />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
