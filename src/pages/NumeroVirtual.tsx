import React, { useEffect, useMemo, useState } from 'react'
import { BarChart3, ChevronDown, Info, RefreshCw, Search, ShieldCheck, Smartphone, Star } from 'lucide-react'
import { getVirtualNumberServices, type VirtualNumberService } from '../lib/numeroVirtual'

type ServiceGroup = {
  key: string
  title: string
  initial: string
  totalStock: number
  minPrice: number
  services: VirtualNumberService[]
}

function parseStock(value: string) {
  const parsed = Number(String(value ?? '').replace(/[^\d.-]/g, ''))
  return Number.isFinite(parsed) ? parsed : 0
}

function serviceTitle(service: VirtualNumberService) {
  return (service.name || service.providerName || service.code || 'Numero virtual').trim()
}

function buildServiceGroups(items: VirtualNumberService[]) {
  const groups = new Map<string, VirtualNumberService[]>()

  items.forEach((service) => {
    const title = serviceTitle(service)
    const key = title.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    groups.set(key, [...(groups.get(key) ?? []), service])
  })

  return Array.from(groups.entries())
    .map(([key, services]) => {
      const title = serviceTitle(services[0])
      const stocks = services.map((service) => parseStock(service.stock))
      const prices = services.map((service) => Number(service.priceAmount || 0)).filter(Boolean)
      return {
        key,
        title,
        initial: title.slice(0, 1).toUpperCase(),
        totalStock: stocks.reduce((sum, stock) => sum + stock, 0),
        minPrice: prices.length ? Math.min(...prices) : 0,
        services: services.sort((left, right) => {
          return left.priceAmount - right.priceAmount || left.country.localeCompare(right.country)
        }),
      } as ServiceGroup
    })
    .sort((left, right) => left.title.localeCompare(right.title))
}

function ServiceOption({ service }: { service: VirtualNumberService }) {
  const functionName = service.functionName || `Receber SMS para ${serviceTitle(service)}`
  const descriptors = [
    functionName,
    service.option || 'Ativacao por SMS',
    service.country || 'BR',
  ].filter(Boolean)

  return (
    <div className="rounded-sm border border-[var(--layout-border-color)] bg-[var(--layout-surface-background)] p-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="min-w-0">
          <p className="text-sm font-black text-[var(--layout-text-primary)]">{functionName}</p>
          <p className="mt-1 text-xs text-[var(--layout-text-muted)]">{descriptors.join(' / ')}</p>
          {service.code && <p className="mt-1 text-[11px] font-bold uppercase tracking-[0.08em] text-[var(--layout-link-color)]">Codigo do servico: {service.code}</p>}
        </div>
        <div className="grid grid-cols-2 gap-3 text-xs md:min-w-[240px]">
          <div>
            <p className="font-bold uppercase text-[var(--layout-text-muted)]">Disponiveis</p>
            <p className="mt-1 font-semibold text-[var(--layout-success-color)]">{service.stock || 'Disponivel'}</p>
          </div>
          <div>
            <p className="font-bold uppercase text-[var(--layout-text-muted)]">Preco</p>
            <p className="mt-1 font-black text-[var(--layout-price-color)]">{service.priceLabel}</p>
          </div>
        </div>
      </div>
      <button type="button" className="layout-primary-button mt-4 h-10 w-full rounded-sm text-sm font-bold md:w-auto md:px-5">
        Solicitar numero
      </button>
    </div>
  )
}

function ServiceGroupRow({ group, open, onToggle }: { group: ServiceGroup; open: boolean; onToggle: () => void }) {
  return (
    <article className="overflow-hidden rounded-md border border-emerald-100 bg-[var(--layout-surface-background)] shadow-sm">
      <button
        type="button"
        onClick={onToggle}
        className="flex min-h-[70px] w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-[var(--layout-subtle-background)]"
      >
        <Star className="h-5 w-5 flex-none text-emerald-600" />
        <span className="grid h-10 w-10 flex-none place-items-center rounded-sm bg-emerald-500 text-sm font-black text-white">
          {group.initial}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-base font-black text-[var(--layout-text-primary)]">{group.title}</span>
          <span className="mt-0.5 block text-xs text-[var(--layout-text-muted)]">
            Funcao de SMS
            {group.services.length > 1 ? ` / ${group.services.length} opcoes` : ''}
            {group.totalStock ? ` / ${group.totalStock} disponiveis` : ''}
            {group.minPrice > 0 ? ` / a partir de ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(group.minPrice)}` : ''}
          </span>
        </span>
        <ChevronDown className={`h-5 w-5 flex-none text-[var(--layout-text-muted)] transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="border-t border-[var(--layout-border-color)] bg-[var(--layout-subtle-background)] p-4">
          <div className="grid gap-3">
            {group.services.map((service) => (
              <ServiceOption key={service.id} service={service} />
            ))}
          </div>
        </div>
      )}
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
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({})

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
      const matchesQuery = !term || [
        item.name,
        item.providerName,
        item.category,
        item.country,
        item.stock,
        item.functionName,
        item.option,
        item.code,
      ].some((value) => String(value ?? '').toLowerCase().includes(term))
      return matchesCategory && matchesQuery
    })
  }, [items, query, category])

  const groups = useMemo(() => buildServiceGroups(filteredItems), [filteredItems])

  useEffect(() => {
    if (!query.trim() && category === 'all') return
    setOpenGroups(Object.fromEntries(groups.slice(0, 12).map((group) => [group.key, true])))
  }, [query, category, groups])

  return (
    <div className="min-h-screen bg-[var(--layout-page-background)] pb-12 text-[var(--layout-text-primary)]">
      <section className="bg-[var(--layout-dashboard-sidebar-header-bg)] text-[var(--layout-dashboard-sidebar-text)]">
        <div className="mx-auto max-w-[1440px] px-4 py-6">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_330px] lg:items-end">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--layout-dashboard-sidebar-kicker-text)]">Cookie Numero</p>
              <h1 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">Numeros virtuais</h1>
              <p className="mt-3 max-w-2xl text-sm text-[var(--layout-dashboard-sidebar-muted-text)]">
                Escolha a funcao do numero, como WhatsApp, Facebook ou Google, e solicite um numero proprio para receber SMS.
              </p>
            </div>
            <div className="layout-surface rounded-sm p-4 text-[var(--layout-text-primary)] shadow-sm">
              <div className="flex gap-3">
                <ShieldCheck className="h-9 w-9 text-[var(--layout-success-color)]" />
                <div>
                  <p className="font-bold">Entrega protegida</p>
                  <p className="mt-1 text-sm text-[var(--layout-text-muted)]">Numero e SMS ficam vinculados ao pedido.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-[980px] px-4 py-6">
        <div className="mb-5 grid gap-3 md:grid-cols-[minmax(0,1fr)_220px_auto_auto] md:items-center">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--layout-text-muted)]" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="h-12 w-full rounded-md border border-[var(--layout-border-color)] bg-[var(--layout-surface-background)] pl-10 pr-3 text-sm outline-none focus:border-[var(--layout-accent-color)]"
              placeholder="Pesquisar por app ou funcao"
            />
          </div>

          <select
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            className="h-12 w-full rounded-md border border-[var(--layout-border-color)] bg-[var(--layout-surface-background)] px-3 text-sm outline-none focus:border-[var(--layout-accent-color)]"
          >
            {categories.map((item) => (
              <option key={item} value={item}>{item === 'all' ? 'Todas as funcoes' : item}</option>
            ))}
          </select>

          <button type="button" className="layout-secondary-button inline-flex h-12 w-12 items-center justify-center rounded-md" aria-label="Informacoes">
            <Info className="h-5 w-5" />
          </button>

          <button onClick={load} className="layout-secondary-button inline-flex h-12 items-center justify-center gap-2 rounded-md px-4 text-sm font-bold" disabled={loading}>
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
                  Configure a chave em Painel Admin &gt; Gateway para listar as funcoes de SMS.
                </p>
              </div>
            </div>
          </div>
        )}

        {error && <div className="rounded-sm border border-red-200 bg-red-50 p-4 text-sm text-red-600">{error}</div>}

        {loading && (
          <div className="grid gap-3">
            {[1, 2, 3, 4, 5, 6, 7].map((item) => (
              <div key={item} className="h-[72px] animate-pulse rounded-md bg-[var(--layout-surface-background)]" />
            ))}
          </div>
        )}

        {!loading && configured && !error && groups.length === 0 && (
          <div className="layout-surface rounded-sm p-8 text-center text-sm text-[var(--layout-text-muted)] shadow-sm">
            <BarChart3 className="mx-auto mb-3 h-8 w-8" />
            Nenhum numero virtual disponivel no momento.
          </div>
        )}

        {!loading && groups.length > 0 && (
          <div className="grid gap-3">
            {groups.map((group) => (
              <ServiceGroupRow
                key={group.key}
                group={group}
                open={Boolean(openGroups[group.key])}
                onToggle={() => setOpenGroups((current) => ({ ...current, [group.key]: !current[group.key] }))}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
