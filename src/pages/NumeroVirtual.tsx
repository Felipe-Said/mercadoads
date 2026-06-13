import React, { useEffect, useMemo, useState } from 'react'
import { BarChart3, CheckCircle2, RefreshCw, Search, ShieldCheck, Smartphone, Sparkles } from 'lucide-react'
import { getVirtualNumberServices, type VirtualNumberService } from '../lib/numeroVirtual'

function ServiceCard({ service }: { service: VirtualNumberService }) {
  return (
    <article className="layout-surface flex h-full flex-col rounded-sm p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--layout-link-color)]">{service.category}</p>
          <h3 className="mt-1 line-clamp-3 text-lg font-bold text-[var(--layout-text-primary)]">{service.name}</h3>
        </div>
        <span className="rounded-sm bg-[var(--layout-subtle-background)] px-2 py-1 text-xs font-bold text-[var(--layout-success-color)]">
          Ativo
        </span>
      </div>

      <div className="grid gap-3 text-sm text-[var(--layout-text-muted)]">
        <div className="flex items-center gap-2">
          <Smartphone className="h-4 w-4 text-[var(--layout-link-color)]" />
          <span>{service.country || 'Global'}</span>
        </div>
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-[var(--layout-link-color)]" />
          <span>{service.stock || 'Disponivel'}</span>
        </div>
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-[var(--layout-link-color)]" />
          <span>Codigo recebido dentro da plataforma</span>
        </div>
      </div>

      <div className="mt-5 border-t border-[var(--layout-border-color)] pt-4">
        <p className="text-xs font-bold uppercase tracking-[0.08em] text-[var(--layout-text-muted)]">Preco</p>
        <p className="mt-1 text-2xl font-bold text-[var(--layout-price-color)]">{service.priceLabel}</p>
      </div>

      <button className="layout-primary-button mt-5 h-11 rounded-sm text-sm font-bold">
        Solicitar numero
      </button>
    </article>
  )
}

export function NumeroVirtual() {
  const [items, setItems] = useState<VirtualNumberService[]>([])
  const [configured, setConfigured] = useState(true)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('all')

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await getVirtualNumberServices()
      setConfigured(result.configured)
      setItems(result.items)
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Nao foi possivel carregar os numeros agora.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load().catch(console.error)
  }, [])

  const categories = useMemo(() => {
    return ['all', ...Array.from(new Set(items.map((item) => item.category).filter(Boolean))).slice(0, 40)]
  }, [items])

  const filteredItems = useMemo(() => {
    const term = query.trim().toLowerCase()
    return items.filter((item) => {
      const matchesCategory = category === 'all' || item.category === category
      const matchesQuery = !term || [item.name, item.category, item.country, item.stock].some((value) => value.toLowerCase().includes(term))
      return matchesCategory && matchesQuery
    })
  }, [items, query, category])

  return (
    <div className="min-h-screen bg-[var(--layout-page-background)] pb-12 text-[var(--layout-text-primary)]">
      <section className="bg-[var(--layout-dashboard-sidebar-header-bg)] text-[var(--layout-dashboard-sidebar-text)]">
        <div className="mx-auto max-w-[1440px] px-4 py-8">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-end">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--layout-dashboard-sidebar-kicker-text)]">Cookie Numero</p>
              <h1 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">Numeros virtuais</h1>
              <p className="mt-3 max-w-2xl text-sm text-[var(--layout-dashboard-sidebar-muted-text)]">
                Numeros temporarios para verificacoes, com disponibilidade atualizada pela plataforma.
              </p>
            </div>
            <div className="layout-surface rounded-sm p-4 text-[var(--layout-text-primary)] shadow-sm">
              <div className="flex gap-3">
                <ShieldCheck className="h-9 w-9 text-[var(--layout-success-color)]" />
                <div>
                  <p className="font-bold">Entrega protegida</p>
                  <p className="mt-1 text-sm text-[var(--layout-text-muted)]">O numero e os codigos ficam vinculados ao seu pedido.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-[1440px] px-4 py-6">
        <div className="mb-5 grid gap-3 lg:grid-cols-[minmax(0,420px)_minmax(0,1fr)_auto] lg:items-center">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--layout-text-muted)]" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="h-11 w-full rounded-sm border border-[var(--layout-border-color)] bg-[var(--layout-surface-background)] pl-9 pr-3 text-sm outline-none focus:border-[var(--layout-accent-color)]"
              placeholder="Buscar por app, pais ou status"
            />
          </div>

          <select
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            className="h-11 w-full rounded-sm border border-[var(--layout-border-color)] bg-[var(--layout-surface-background)] px-3 text-sm outline-none focus:border-[var(--layout-accent-color)]"
          >
            {categories.map((item) => (
              <option key={item} value={item}>{item === 'all' ? 'Todas as categorias' : item}</option>
            ))}
          </select>

          <button onClick={load} className="layout-secondary-button inline-flex h-11 items-center justify-center gap-2 rounded-sm px-4 text-sm font-bold" disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </button>
        </div>

        {!configured && (
          <div className="layout-surface rounded-sm p-6 shadow-sm">
            <div className="flex gap-3">
              <Smartphone className="h-6 w-6 text-[var(--layout-link-color)]" />
              <div>
                <h2 className="font-bold">Numeros virtuais ainda nao configurados</h2>
                <p className="mt-1 text-sm text-[var(--layout-text-muted)]">
                  Configure a chave em Painel Admin &gt; Gateway para listar os servicos.
                </p>
              </div>
            </div>
          </div>
        )}

        {error && <div className="rounded-sm border border-red-200 bg-red-50 p-4 text-sm text-red-600">{error}</div>}

        {loading && (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <div key={item} className="h-72 animate-pulse rounded-sm bg-[var(--layout-surface-background)]" />
            ))}
          </div>
        )}

        {!loading && configured && !error && filteredItems.length === 0 && (
          <div className="layout-surface rounded-sm p-8 text-center text-sm text-[var(--layout-text-muted)] shadow-sm">
            <BarChart3 className="mx-auto mb-3 h-8 w-8" />
            Nenhum numero virtual disponivel no momento.
          </div>
        )}

        {!loading && filteredItems.length > 0 && (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filteredItems.map((item) => <ServiceCard key={item.id} service={item} />)}
          </div>
        )}
      </main>
    </div>
  )
}
