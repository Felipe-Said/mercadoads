import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AtSign, Clock, RefreshCw, Search } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { formatCurrency } from '../lib/data'
import { getTempEmailServices, provisionTempEmailSale, type TempEmailService } from '../lib/tempEmail'
import { supabase } from '../lib/supabase'
import { getWalletBalances } from '../lib/wallet'
import { createWestPayPixInOrThrow, validateWestPayCustomer } from '../lib/westpay'
import { getLinkBioToolSaleFields } from '../lib/affiliateTracking'

function serviceLabel(service: TempEmailService) {
  return (service.name || service.providerName || 'Email temporario').trim()
}

function normalizeCategory(service: TempEmailService) {
  const name = serviceLabel(service)
  const first = name.slice(0, 1).toUpperCase()
  return /^[A-Z0-9]$/.test(first) ? first : 'Outros'
}

function parseStock(value: string) {
  const parsed = Number(String(value ?? '').replace(/[^\d.-]/g, ''))
  return Number.isFinite(parsed) ? parsed : 0
}

function TempEmailCard({
  service,
  buying,
  onBuy,
}: {
  service: TempEmailService
  buying: boolean
  onBuy: (service: TempEmailService) => void
}) {
  const name = serviceLabel(service)
  const stock = parseStock(service.stock)

  return (
    <article className="layout-surface flex h-full flex-col rounded-sm p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--layout-link-color)]">Email temporario</p>
          <h3 className="mt-1 line-clamp-2 text-lg font-bold text-[var(--layout-text-primary)]">{name}</h3>
        </div>
        <span className="rounded-sm bg-[var(--layout-subtle-background)] px-2 py-1 text-xs font-bold text-[var(--layout-success-color)]">
          Disponivel
        </span>
      </div>

      <div className="grid gap-3 text-sm text-[var(--layout-text-muted)]">
        <div className="flex items-center gap-2">
          <AtSign className="h-4 w-4 text-[var(--layout-link-color)]" />
          <span>{service.domain || 'Dominio informado na entrega'}</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-[var(--layout-link-color)]" />
          <span>Uso unico para receber codigo</span>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-2 border-t border-[var(--layout-border-color)] pt-4 text-xs">
        <div>
          <p className="font-bold text-[var(--layout-text-primary)]">Preco</p>
          <p className="mt-1 font-bold text-[var(--layout-price-color)]">{formatCurrency(service.priceAmount)}</p>
        </div>
        <div>
          <p className="font-bold text-[var(--layout-text-primary)]">Estoque</p>
          <p className="mt-1 text-[var(--layout-text-muted)]">{stock > 0 ? stock.toLocaleString('pt-BR') : 'Disponivel'}</p>
        </div>
      </div>

      <button
        type="button"
        onClick={() => onBuy(service)}
        disabled={buying || !service.priceAmount}
        className="layout-primary-button mt-5 h-11 rounded-sm text-sm font-bold disabled:cursor-not-allowed disabled:opacity-60"
      >
        {buying ? 'Processando...' : `Comprar email para ${name}`}
      </button>
    </article>
  )
}

export function EmailTemporario() {
  const navigate = useNavigate()
  const { user, profile, loading: authLoading } = useAuth()
  const [items, setItems] = useState<TempEmailService[]>([])
  const [configured, setConfigured] = useState(true)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedDomain, setSelectedDomain] = useState('all')
  const [selectedService, setSelectedService] = useState<TempEmailService | null>(null)
  const [paymentMethod, setPaymentMethod] = useState<'pix' | 'wallet'>('pix')
  const [walletBalance, setWalletBalance] = useState(0)
  const [buyerName, setBuyerName] = useState('')
  const [buyerPhone, setBuyerPhone] = useState('')
  const [buyerDocument, setBuyerDocument] = useState('')
  const [buyingId, setBuyingId] = useState<string | null>(null)

  useEffect(() => {
    setBuyerName(profile?.full_name ?? user?.user_metadata?.full_name ?? '')
    setBuyerPhone(profile?.phone ?? '')
  }, [profile?.full_name, profile?.phone, user?.user_metadata?.full_name])

  const loadWalletBalance = async () => {
    if (!user) {
      setWalletBalance(0)
      return 0
    }
    const balances = await getWalletBalances(user.id)
    setWalletBalance(balances.purchaseBalance)
    return balances.purchaseBalance
  }

  useEffect(() => {
    loadWalletBalance().catch(console.error)
  }, [user?.id])

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await getTempEmailServices()
      setConfigured(result.configured)
      setItems(result.items)
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Nao foi possivel carregar os emails agora.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load().catch(console.error)
  }, [])

  const categories = useMemo(() => {
    return ['all', ...Array.from(new Set(items.map(normalizeCategory))).sort()]
  }, [items])

  const domains = useMemo(() => {
    return ['all', ...Array.from(new Set(items.map((item) => item.domain).filter(Boolean))).sort((left, right) => left.localeCompare(right))]
  }, [items])

  const filteredItems = useMemo(() => {
    const term = query.trim().toLowerCase()
    return items.filter((item) => {
      const name = serviceLabel(item)
      const matchesCategory = selectedCategory === 'all' || normalizeCategory(item) === selectedCategory
      const matchesDomain = selectedDomain === 'all' || item.domain === selectedDomain
      const matchesQuery = !term || [name, item.code, item.domain].some((value) => String(value ?? '').toLowerCase().includes(term))
      return matchesCategory && matchesDomain && matchesQuery
    })
  }, [items, query, selectedCategory, selectedDomain])

  const handleBuy = async (service: TempEmailService) => {
    if (authLoading) return
    if (!user) {
      setError('Entre na sua conta para comprar email temporario.')
      return
    }

    setError(null)
    setSelectedService(service)

    if (paymentMethod === 'pix' && (!buyerName.trim() || !buyerPhone.trim() || !buyerDocument.trim())) return

    setBuyingId(service.id)
    let saleId: string | null = null

    try {
      const customer = paymentMethod === 'pix'
        ? validateWestPayCustomer({
          name: buyerName,
          email: user.email ?? '',
          phone: buyerPhone,
          documentNumber: buyerDocument,
        })
        : null

      if (paymentMethod === 'wallet') {
        const balance = await loadWalletBalance()
        if (balance < service.priceAmount) throw new Error('Voce nao possui fundos suficiente')
      }

      const affiliateFields = await getLinkBioToolSaleFields(service.priceAmount, user.id, 'emailTemporario')

      const { data: saleData, error: saleError } = await supabase.from('sales').insert({
        product_id: null,
        buyer_id: user.id,
        seller_id: null,
        amount: service.priceAmount,
        status: 'pending',
        temp_email_service_id: service.id,
        temp_email_service_name: serviceLabel(service),
        temp_email_service_code: service.code,
        temp_email_domain: service.domain || null,
        ...affiliateFields,
      }).select('id').single()

      if (saleError) throw saleError
      saleId = saleData?.id ? String(saleData.id) : null
      if (!saleId) throw new Error('Nao foi possivel gerar o pedido.')

      if (paymentMethod === 'wallet') {
        const { error: spendError } = await supabase.from('wallet_spends').insert({
          user_id: user.id,
          sale_id: saleId,
          amount: service.priceAmount,
        })
        if (spendError) throw spendError
        await provisionTempEmailSale(saleId)
        await loadWalletBalance()
      } else if (customer) {
        await createWestPayPixInOrThrow({
          saleId,
          amount: service.priceAmount,
          customer,
          itemTitle: `Email temporario - ${serviceLabel(service)}`,
        })
      }

      navigate('/painel/usuario/compras', { state: { checkoutSaleIds: [saleId] } })
    } catch (buyError) {
      if (saleId && paymentMethod === 'pix') await supabase.from('sales').delete().eq('id', saleId)
      setError(buyError instanceof Error ? buyError.message : 'Nao foi possivel concluir a compra.')
    } finally {
      setBuyingId(null)
    }
  }

  return (
    <div className="min-h-screen bg-[var(--layout-page-background)] pb-12 text-[var(--layout-text-primary)]">
      <section className="bg-[var(--layout-dashboard-sidebar-header-bg)] text-[var(--layout-dashboard-sidebar-text)]">
        <div className="mx-auto max-w-[1440px] px-4 py-5">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--layout-dashboard-sidebar-kicker-text)]">Cookie Email</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">Emails temporarios</h1>
          <p className="mt-2 max-w-2xl text-sm text-[var(--layout-dashboard-sidebar-muted-text)]">
            Escolha o servico e o dominio disponivel para receber codigos por email.
          </p>
        </div>
      </section>

      <main className="mx-auto max-w-[1440px] px-4 py-6">
        <div className="mb-5 grid gap-3 lg:grid-cols-[minmax(0,1fr)_180px_260px_auto] lg:items-center">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--layout-text-muted)]" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="h-11 w-full rounded-sm border border-[var(--layout-border-color)] bg-[var(--layout-surface-background)] pl-9 pr-3 text-sm outline-none focus:border-[var(--layout-accent-color)]"
              placeholder="Buscar servico ou dominio"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(event) => setSelectedCategory(event.target.value)}
            className="h-11 w-full rounded-sm border border-[var(--layout-border-color)] bg-[var(--layout-surface-background)] px-3 text-sm outline-none focus:border-[var(--layout-accent-color)]"
          >
            {categories.map((item) => (
              <option key={item} value={item}>{item === 'all' ? 'Todos os servicos' : `Servicos ${item}`}</option>
            ))}
          </select>

          <select
            value={selectedDomain}
            onChange={(event) => setSelectedDomain(event.target.value)}
            className="h-11 w-full rounded-sm border border-[var(--layout-border-color)] bg-[var(--layout-surface-background)] px-3 text-sm outline-none focus:border-[var(--layout-accent-color)]"
          >
            {domains.map((item) => (
              <option key={item} value={item}>{item === 'all' ? 'Todos os dominios' : item}</option>
            ))}
          </select>

          <button onClick={load} className="layout-secondary-button inline-flex h-11 items-center justify-center gap-2 rounded-sm px-4 text-sm font-bold" disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </button>
        </div>

        {!configured && (
          <div className="layout-surface rounded-sm p-6 shadow-sm">
            <h2 className="font-bold">Emails temporarios ainda nao configurados</h2>
            <p className="mt-1 text-sm text-[var(--layout-text-muted)]">Ative este servico no painel admin para listar os itens disponiveis.</p>
          </div>
        )}

        {error && <div className="mb-5 rounded-sm border border-red-200 bg-red-50 p-4 text-sm text-red-600">{error}</div>}

        {selectedService && user && (
          <div className="layout-surface mb-5 rounded-sm p-5 shadow-sm">
            <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px] lg:items-end">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--layout-link-color)]">Dados para pagamento</p>
                <h2 className="mt-1 text-lg font-bold text-[var(--layout-text-primary)]">{serviceLabel(selectedService)}</h2>
                <p className="mt-1 text-sm text-[var(--layout-text-muted)]">
                  Dominio: {selectedService.domain || 'informado na entrega'}. O email fica liberado apos a confirmacao.
                </p>
                <div className="mt-4 grid gap-2 md:grid-cols-2">
                  <label className={`flex cursor-pointer items-center justify-between rounded-sm border p-3 text-sm ${paymentMethod === 'pix' ? 'border-[var(--layout-accent-color)] bg-[var(--layout-subtle-background)]' : 'border-[var(--layout-border-color)]'}`}>
                    <span className="font-semibold text-[var(--layout-text-primary)]">Gerar Pix agora</span>
                    <input type="radio" checked={paymentMethod === 'pix'} onChange={() => setPaymentMethod('pix')} />
                  </label>
                  <label className={`flex cursor-pointer items-center justify-between rounded-sm border p-3 text-sm ${paymentMethod === 'wallet' ? 'border-[var(--layout-accent-color)] bg-[var(--layout-subtle-background)]' : 'border-[var(--layout-border-color)]'}`}>
                    <span>
                      <span className="block font-semibold text-[var(--layout-text-primary)]">Fundos da carteira</span>
                      <span className="text-xs text-[var(--layout-text-muted)]">Saldo: {formatCurrency(walletBalance)}</span>
                    </span>
                    <input type="radio" checked={paymentMethod === 'wallet'} onChange={() => setPaymentMethod('wallet')} />
                  </label>
                </div>
                {paymentMethod === 'pix' && (
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
                )}
              </div>
              <button
                type="button"
                onClick={() => handleBuy(selectedService)}
                disabled={Boolean(buyingId)}
                className="layout-primary-button h-12 rounded-sm px-5 text-sm font-bold disabled:cursor-not-allowed disabled:opacity-60"
              >
                {buyingId ? 'Processando...' : `Pagar ${formatCurrency(selectedService.priceAmount)}`}
              </button>
            </div>
          </div>
        )}

        {loading && (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
              <div key={item} className="h-56 animate-pulse rounded-sm bg-[var(--layout-surface-background)]" />
            ))}
          </div>
        )}

        {!loading && configured && !error && filteredItems.length === 0 && (
          <div className="layout-surface rounded-sm p-8 text-center text-sm text-[var(--layout-text-muted)] shadow-sm">
            Nenhum email temporario disponivel no momento.
          </div>
        )}

        {!loading && filteredItems.length > 0 && (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {filteredItems.map((item) => (
              <TempEmailCard key={item.id} service={item} buying={buyingId === item.id} onBuy={handleBuy} />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
