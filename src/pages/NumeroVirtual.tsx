import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BarChart3, Globe2, LockKeyhole, RefreshCw, Search, ShieldCheck, Smartphone } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { formatCurrency } from '../lib/data'
import { getVirtualNumberServices, provisionVirtualNumberSale, type VirtualNumberService } from '../lib/numeroVirtual'
import { supabase } from '../lib/supabase'
import { getWalletBalances } from '../lib/wallet'
import { createWestPayPixInOrThrow, validateWestPayCustomer } from '../lib/westpay'
import { getLinkBioToolSaleFields } from '../lib/affiliateTracking'

const countryOptions = [
  { code: 'BR', name: 'Brasil' },
  { code: 'US', name: 'Estados Unidos' },
  { code: 'CA', name: 'Canada' },
  { code: 'GB', name: 'Reino Unido' },
  { code: 'PT', name: 'Portugal' },
  { code: 'MX', name: 'Mexico' },
]

const brazilDddOptions = [
  { code: '', name: 'Qualquer DDD' },
  { code: '11', name: 'DDD 11 - Sao Paulo' },
  { code: '12', name: 'DDD 12 - Vale do Paraiba' },
  { code: '13', name: 'DDD 13 - Baixada Santista' },
  { code: '14', name: 'DDD 14 - Bauru / Marilia' },
  { code: '15', name: 'DDD 15 - Sorocaba' },
  { code: '16', name: 'DDD 16 - Ribeirao Preto' },
  { code: '17', name: 'DDD 17 - Sao Jose do Rio Preto' },
  { code: '18', name: 'DDD 18 - Presidente Prudente' },
  { code: '19', name: 'DDD 19 - Campinas' },
  { code: '21', name: 'DDD 21 - Rio de Janeiro' },
  { code: '22', name: 'DDD 22 - Norte Fluminense' },
  { code: '24', name: 'DDD 24 - Sul Fluminense' },
  { code: '27', name: 'DDD 27 - Vitoria' },
  { code: '31', name: 'DDD 31 - Belo Horizonte' },
  { code: '41', name: 'DDD 41 - Curitiba' },
  { code: '47', name: 'DDD 47 - Joinville' },
  { code: '48', name: 'DDD 48 - Florianopolis' },
  { code: '51', name: 'DDD 51 - Porto Alegre' },
  { code: '61', name: 'DDD 61 - Brasilia' },
  { code: '71', name: 'DDD 71 - Salvador' },
  { code: '81', name: 'DDD 81 - Recife' },
  { code: '85', name: 'DDD 85 - Fortaleza' },
  { code: '92', name: 'DDD 92 - Manaus' },
]

function parseStock(value: string) {
  const parsed = Number(String(value ?? '').replace(/[^\d.-]/g, ''))
  return Number.isFinite(parsed) ? parsed : 0
}

function countryLabel(code: string) {
  return countryOptions.find((country) => country.code === code)?.name ?? code
}

function dddLabel(code: string) {
  return brazilDddOptions.find((item) => item.code === code)?.name || (code ? `DDD ${code}` : 'Qualquer DDD')
}

function platformName(service: VirtualNumberService) {
  return (service.name || service.providerName || service.functionName || 'Numero virtual').trim()
}

function VirtualNumberCard({
  service,
  selectedCountry,
  selectedDdd,
  buying,
  onBuy,
}: {
  service: VirtualNumberService
  selectedCountry: string
  selectedDdd: string
  buying: boolean
  onBuy: (service: VirtualNumberService) => void
}) {
  const name = platformName(service)
  const stock = parseStock(service.stock)

  return (
    <article className="layout-surface flex h-full flex-col rounded-sm p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--layout-link-color)]">Numero virtual</p>
          <h3 className="mt-1 line-clamp-2 text-lg font-bold text-[var(--layout-text-primary)]">{name}</h3>
        </div>
        <span className="rounded-sm bg-[var(--layout-subtle-background)] px-2 py-1 text-xs font-bold text-[var(--layout-success-color)]">
          Disponivel
        </span>
      </div>

      <div className="grid gap-3 text-sm text-[var(--layout-text-muted)]">
        <div className="flex items-center gap-2">
          <Globe2 className="h-4 w-4 text-[var(--layout-link-color)]" />
          <span>{countryLabel(selectedCountry)}</span>
        </div>
        <div className="flex items-center gap-2">
          <Smartphone className="h-4 w-4 text-[var(--layout-link-color)]" />
          <span>{selectedCountry === 'BR' ? dddLabel(selectedDdd) : 'Numero internacional'}</span>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-2 border-t border-[var(--layout-border-color)] pt-4 text-xs">
        <div>
          <p className="font-bold text-[var(--layout-text-primary)]">Preco</p>
          <p className="mt-1 font-bold text-[var(--layout-price-color)]">{formatCurrency(service.priceAmount)}</p>
        </div>
        <div>
          <p className="font-bold text-[var(--layout-text-primary)]">Disponiveis</p>
          <p className="mt-1 text-[var(--layout-text-muted)]">{stock > 0 ? stock.toLocaleString('pt-BR') : 'Disponivel'}</p>
        </div>
      </div>

      <button
        type="button"
        onClick={() => onBuy(service)}
        disabled={buying || !service.priceAmount}
        className="layout-primary-button mt-5 h-11 rounded-sm text-sm font-bold disabled:cursor-not-allowed disabled:opacity-60"
      >
        {buying ? 'Processando...' : `Comprar ${name}`}
      </button>
    </article>
  )
}

export function NumeroVirtual() {
  const navigate = useNavigate()
  const { user, profile, loading: authLoading } = useAuth()
  const [items, setItems] = useState<VirtualNumberService[]>([])
  const [configured, setConfigured] = useState(true)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [selectedCountry, setSelectedCountry] = useState('BR')
  const [selectedDdd, setSelectedDdd] = useState('')
  const [selectedPlatform, setSelectedPlatform] = useState('all')
  const [selectedService, setSelectedService] = useState<VirtualNumberService | null>(null)
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
      const result = await getVirtualNumberServices(selectedCountry)
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
  }, [selectedCountry])

  const platformOptions = useMemo(() => {
    return ['all', ...Array.from(new Set(items.map((item) => platformName(item)).filter(Boolean))).sort((left, right) => left.localeCompare(right))]
  }, [items])

  const filteredItems = useMemo(() => {
    const term = query.trim().toLowerCase()
    return items.filter((item) => {
      const name = platformName(item)
      const matchesPlatform = selectedPlatform === 'all' || name === selectedPlatform
      const matchesQuery = !term || [
        name,
        item.code,
        item.country,
        item.stock,
      ].some((value) => String(value ?? '').toLowerCase().includes(term))
      return matchesPlatform && matchesQuery
    })
  }, [items, query, selectedPlatform])

  const handleBuy = async (service: VirtualNumberService) => {
    if (authLoading) return
    if (!user) {
      setError('Entre na sua conta para comprar numero virtual.')
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

      const affiliateFields = await getLinkBioToolSaleFields(service.priceAmount, user.id, 'numeroVirtual')

      const { data: saleData, error: saleError } = await supabase.from('sales').insert({
        product_id: null,
        buyer_id: user.id,
        seller_id: null,
        amount: service.priceAmount,
        status: 'pending',
        virtual_number_service_id: service.id,
        virtual_number_service_name: platformName(service),
        virtual_number_service_code: service.code,
        virtual_number_country_code: selectedCountry,
        virtual_number_country_name: countryLabel(selectedCountry),
        virtual_number_ddd: selectedCountry === 'BR' ? selectedDdd || null : null,
        virtual_number_operator: selectedCountry === 'BR' ? dddLabel(selectedDdd) : null,
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
        await provisionVirtualNumberSale(saleId)
        await loadWalletBalance()
      } else if (customer) {
        await createWestPayPixInOrThrow({
          saleId,
          amount: service.priceAmount,
          customer,
          itemTitle: `Numero virtual - ${platformName(service)}`,
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
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--layout-dashboard-sidebar-kicker-text)]">Cookie Numero</p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">Numeros virtuais</h1>
            <p className="mt-2 max-w-2xl text-sm text-[var(--layout-dashboard-sidebar-muted-text)]">
              Escolha a plataforma, o pais e o DDD para receber o codigo SMS.
            </p>
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-[1440px] px-4 py-6">
        <div className="mb-5 grid gap-3 lg:grid-cols-[minmax(0,1fr)_220px_170px_220px_auto] lg:items-center">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--layout-text-muted)]" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="h-11 w-full rounded-sm border border-[var(--layout-border-color)] bg-[var(--layout-surface-background)] pl-9 pr-3 text-sm outline-none focus:border-[var(--layout-accent-color)]"
              placeholder="Buscar plataforma"
            />
          </div>

          <select
            value={selectedPlatform}
            onChange={(event) => setSelectedPlatform(event.target.value)}
            className="h-11 w-full rounded-sm border border-[var(--layout-border-color)] bg-[var(--layout-surface-background)] px-3 text-sm outline-none focus:border-[var(--layout-accent-color)]"
          >
            {platformOptions.map((item) => (
              <option key={item} value={item}>{item === 'all' ? 'Todas as plataformas' : item}</option>
            ))}
          </select>

          <select
            value={selectedCountry}
            onChange={(event) => {
              setSelectedCountry(event.target.value)
              setSelectedDdd('')
              setSelectedService(null)
            }}
            className="h-11 w-full rounded-sm border border-[var(--layout-border-color)] bg-[var(--layout-surface-background)] px-3 text-sm outline-none focus:border-[var(--layout-accent-color)]"
          >
            {countryOptions.map((item) => (
              <option key={item.code} value={item.code}>{item.name}</option>
            ))}
          </select>

          <select
            value={selectedDdd}
            onChange={(event) => setSelectedDdd(event.target.value)}
            disabled={selectedCountry !== 'BR'}
            className="h-11 w-full rounded-sm border border-[var(--layout-border-color)] bg-[var(--layout-surface-background)] px-3 text-sm outline-none focus:border-[var(--layout-accent-color)] disabled:opacity-60"
          >
            {brazilDddOptions.map((item) => (
              <option key={item.code || 'any'} value={item.code}>{item.name}</option>
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
              <LockKeyhole className="h-6 w-6 text-[var(--layout-link-color)]" />
              <div>
                <h2 className="font-bold">Numeros virtuais ainda nao configurados</h2>
                <p className="mt-1 text-sm text-[var(--layout-text-muted)]">
                  Configure a chave em Painel Admin &gt; Gateway para listar as plataformas disponiveis.
                </p>
              </div>
            </div>
          </div>
        )}

        {error && <div className="mb-5 rounded-sm border border-red-200 bg-red-50 p-4 text-sm text-red-600">{error}</div>}

        {selectedService && user && (
          <div className="layout-surface mb-5 rounded-sm p-5 shadow-sm">
            <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px] lg:items-end">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--layout-link-color)]">Dados para pagamento</p>
                <h2 className="mt-1 text-lg font-bold text-[var(--layout-text-primary)]">{platformName(selectedService)}</h2>
                <p className="mt-1 text-sm text-[var(--layout-text-muted)]">
                  {countryLabel(selectedCountry)} {selectedCountry === 'BR' ? `- ${dddLabel(selectedDdd)}` : ''}. O numero fica liberado apos a confirmacao.
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
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <div key={item} className="h-56 animate-pulse rounded-sm bg-[var(--layout-surface-background)]" />
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
            {filteredItems.map((item) => (
              <VirtualNumberCard
                key={item.id}
                service={item}
                selectedCountry={selectedCountry}
                selectedDdd={selectedDdd}
                buying={buyingId === item.id}
                onBuy={handleBuy}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
