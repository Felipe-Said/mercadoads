import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BarChart3, CheckCircle2, MessageSquareText, RefreshCw, Search, Sparkles, Target, Zap } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { formatCurrency } from '../lib/data'
import { getSmmServices, provisionSmmSale, type SmmService } from '../lib/smm'
import { supabase } from '../lib/supabase'
import { getWalletBalances } from '../lib/wallet'
import { createWestPayPixInOrThrow, validateWestPayCustomer } from '../lib/westpay'

function serviceNeedsComments(service: SmmService) {
  const type = service.type.toLowerCase()
  return type.includes('custom comment') || type.includes('comments')
}

function serviceNeedsUsername(service: SmmService) {
  return service.type.toLowerCase().includes('comment likes')
}

function serviceNeedsAnswer(service: SmmService) {
  return service.type.toLowerCase().includes('poll')
}

function platformFromCategory(category: string) {
  const normalized = category.toLowerCase()
  if (normalized.includes('instagram')) return 'Instagram'
  if (normalized.includes('tiktok')) return 'TikTok'
  if (normalized.includes('youtube')) return 'YouTube'
  if (normalized.includes('facebook')) return 'Facebook'
  if (normalized.includes('telegram')) return 'Telegram'
  if (normalized.includes('twitter') || normalized.includes('x ')) return 'X'
  if (normalized.includes('spotify')) return 'Spotify'
  return category.split(/[-|]/)[0]?.trim() || 'Outros'
}

function ServiceCard({
  service,
  selected,
  onSelect,
}: {
  service: SmmService
  selected: boolean
  onSelect: (service: SmmService) => void
}) {
  return (
    <article className={`layout-surface flex h-full flex-col rounded-sm p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${selected ? 'ring-2 ring-[var(--layout-accent-color)]' : ''}`}>
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--layout-link-color)]">{platformFromCategory(service.category)}</p>
          <h3 className="mt-1 line-clamp-3 text-lg font-bold text-[var(--layout-text-primary)]">{service.name}</h3>
        </div>
        <span className="rounded-sm bg-[var(--layout-subtle-background)] px-2 py-1 text-xs font-bold text-[var(--layout-success-color)]">
          Ativo
        </span>
      </div>

      <div className="grid gap-3 text-sm text-[var(--layout-text-muted)]">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-[var(--layout-link-color)]" />
          <span>{service.type || 'Servico digital'}</span>
        </div>
        <div className="flex items-center gap-2">
          <Target className="h-4 w-4 text-[var(--layout-link-color)]" />
          <span>Min. {service.min.toLocaleString('pt-BR')} / Max. {service.max.toLocaleString('pt-BR')}</span>
        </div>
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-[var(--layout-link-color)]" />
          <span>{service.refill ? 'Reposicao disponivel' : 'Sem reposicao'}{service.cancel ? ' - Cancelavel' : ''}</span>
        </div>
      </div>

      <div className="mt-5 border-t border-[var(--layout-border-color)] pt-4">
        <p className="text-xs font-bold uppercase tracking-[0.08em] text-[var(--layout-text-muted)]">Preco por 1.000</p>
        <p className="mt-1 text-2xl font-bold text-[var(--layout-price-color)]">{service.priceLabel}</p>
      </div>

      <button
        type="button"
        onClick={() => onSelect(service)}
        className="layout-primary-button mt-5 h-11 rounded-sm text-sm font-bold"
      >
        {selected ? 'Servico selecionado' : 'Selecionar servico'}
      </button>
    </article>
  )
}

export function SMM() {
  const navigate = useNavigate()
  const { user, profile, loading: authLoading } = useAuth()
  const [items, setItems] = useState<SmmService[]>([])
  const [configured, setConfigured] = useState(true)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('all')
  const [selectedService, setSelectedService] = useState<SmmService | null>(null)
  const [link, setLink] = useState('')
  const [quantity, setQuantity] = useState('')
  const [comments, setComments] = useState('')
  const [username, setUsername] = useState('')
  const [answerNumber, setAnswerNumber] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<'pix' | 'wallet'>('pix')
  const [walletBalance, setWalletBalance] = useState(0)
  const [buyerName, setBuyerName] = useState('')
  const [buyerPhone, setBuyerPhone] = useState('')
  const [buyerDocument, setBuyerDocument] = useState('')
  const [buying, setBuying] = useState(false)

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
      const result = await getSmmServices()
      setConfigured(result.configured)
      setItems(result.items)
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Nao foi possivel carregar os servicos agora.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load().catch(console.error)
  }, [])

  const categories = useMemo(() => {
    const platforms = items.map((item) => platformFromCategory(item.category)).filter(Boolean)
    return ['all', ...Array.from(new Set(platforms)).sort((left, right) => left.localeCompare(right))]
  }, [items])

  const filteredItems = useMemo(() => {
    const term = query.trim().toLowerCase()
    return items.filter((item) => {
      const platform = platformFromCategory(item.category)
      const matchesCategory = category === 'all' || platform === category
      const matchesQuery = !term || [item.name, item.category, item.type, platform].some((value) => value.toLowerCase().includes(term))
      return matchesCategory && matchesQuery
    })
  }, [items, query, category])

  const parsedQuantity = Number(quantity)
  const totalAmount = selectedService && Number.isFinite(parsedQuantity)
    ? Math.max((selectedService.pricePer1000 * parsedQuantity) / 1000, 0)
    : 0

  const selectService = (service: SmmService) => {
    setSelectedService(service)
    setQuantity(String(service.min || 1))
    setComments('')
    setUsername('')
    setAnswerNumber('')
    setError(null)
  }

  const validateOrder = () => {
    if (!selectedService) return 'Selecione um servico.'
    if (!link.trim()) return 'Informe o link que vai receber o servico.'
    if (!Number.isFinite(parsedQuantity) || parsedQuantity < selectedService.min || parsedQuantity > selectedService.max) {
      return `A quantidade precisa ficar entre ${selectedService.min.toLocaleString('pt-BR')} e ${selectedService.max.toLocaleString('pt-BR')}.`
    }
    if (serviceNeedsComments(selectedService) && !comments.trim()) return 'Informe os comentarios, um por linha.'
    if (serviceNeedsUsername(selectedService) && !username.trim()) return 'Informe o usuario dono do comentario.'
    if (serviceNeedsAnswer(selectedService) && !answerNumber.trim()) return 'Informe o numero da resposta da enquete.'
    if (paymentMethod === 'pix' && (!buyerName.trim() || !buyerPhone.trim() || !buyerDocument.trim())) return 'Informe nome, WhatsApp e CPF/CNPJ para gerar o Pix.'
    return null
  }

  const handleBuy = async () => {
    if (authLoading || !selectedService) return
    if (!user) {
      setError('Entre na sua conta para comprar servicos SMM.')
      return
    }

    const validationError = validateOrder()
    if (validationError) {
      setError(validationError)
      return
    }

    setBuying(true)
    setError(null)
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
        if (balance < totalAmount) throw new Error('Voce nao possui fundos suficiente')
      }

      const { data: saleData, error: saleError } = await supabase.from('sales').insert({
        product_id: null,
        buyer_id: user.id,
        seller_id: null,
        amount: totalAmount,
        status: 'pending',
        smm_service_id: selectedService.id,
        smm_service_name: selectedService.name,
        smm_service_type: selectedService.type,
        smm_service_category: selectedService.category,
        smm_link: link.trim(),
        smm_quantity: parsedQuantity,
        smm_comments: comments.trim() || null,
        smm_username: username.trim() || null,
        smm_answer_number: answerNumber.trim() || null,
      }).select('id').single()

      if (saleError) throw saleError
      saleId = saleData?.id ? String(saleData.id) : null
      if (!saleId) throw new Error('Nao foi possivel gerar o pedido.')

      if (paymentMethod === 'wallet') {
        const { error: spendError } = await supabase.from('wallet_spends').insert({
          user_id: user.id,
          sale_id: saleId,
          amount: totalAmount,
        })
        if (spendError) throw spendError
        await provisionSmmSale(saleId)
        await loadWalletBalance()
      } else if (customer) {
        await createWestPayPixInOrThrow({
          saleId,
          amount: totalAmount,
          customer,
          itemTitle: `SMM - ${selectedService.name}`,
        })
      }

      navigate('/painel/usuario/compras', { state: { checkoutSaleIds: [saleId] } })
    } catch (buyError) {
      if (saleId && paymentMethod === 'pix') await supabase.from('sales').delete().eq('id', saleId)
      setError(buyError instanceof Error ? buyError.message : 'Nao foi possivel concluir a compra.')
    } finally {
      setBuying(false)
    }
  }

  return (
    <div className="min-h-screen bg-[var(--layout-page-background)] pb-12 text-[var(--layout-text-primary)]">
      <section className="bg-[var(--layout-dashboard-sidebar-header-bg)] text-[var(--layout-dashboard-sidebar-text)]">
        <div className="mx-auto max-w-[1440px] px-4 py-5">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--layout-dashboard-sidebar-kicker-text)]">Cookie SMM</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">Servicos SMM</h1>
          <p className="mt-2 max-w-2xl text-sm text-[var(--layout-dashboard-sidebar-muted-text)]">
            Escolha o servico, informe o link e a quantidade para gerar o pedido.
          </p>
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
              placeholder="Buscar por servico, categoria ou plataforma"
            />
          </div>

          <select
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            className="h-11 w-full rounded-sm border border-[var(--layout-border-color)] bg-[var(--layout-surface-background)] px-3 text-sm outline-none focus:border-[var(--layout-accent-color)]"
          >
            {categories.map((item) => (
              <option key={item} value={item}>{item === 'all' ? 'Todas as plataformas' : item}</option>
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
              <Zap className="h-6 w-6 text-[var(--layout-link-color)]" />
              <div>
                <h2 className="font-bold">Catalogo SMM ainda nao configurado</h2>
                <p className="mt-1 text-sm text-[var(--layout-text-muted)]">
                  Configure a chave em Painel Admin &gt; Gateway para listar os servicos.
                </p>
              </div>
            </div>
          </div>
        )}

        {error && <div className="mb-5 rounded-sm border border-red-200 bg-red-50 p-4 text-sm text-red-600">{error}</div>}

        {selectedService && (
          <div className="layout-surface mb-5 rounded-sm p-5 shadow-sm">
            <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_280px] xl:items-end">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--layout-link-color)]">Pedido selecionado</p>
                <h2 className="mt-1 text-lg font-bold text-[var(--layout-text-primary)]">{selectedService.name}</h2>
                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  <label className="block md:col-span-2">
                    <span className="mb-1 block text-sm font-bold text-[var(--layout-text-primary)]">Link</span>
                    <input value={link} onChange={(event) => setLink(event.target.value)} className="h-11 w-full rounded-sm border border-[var(--layout-border-color)] px-3 text-sm outline-none focus:border-[var(--layout-accent-color)]" placeholder="Cole o link do perfil, post, video ou pagina" />
                  </label>
                  <label className="block">
                    <span className="mb-1 block text-sm font-bold text-[var(--layout-text-primary)]">Quantidade</span>
                    <input type="number" min={selectedService.min} max={selectedService.max} value={quantity} onChange={(event) => setQuantity(event.target.value)} className="h-11 w-full rounded-sm border border-[var(--layout-border-color)] px-3 text-sm outline-none focus:border-[var(--layout-accent-color)]" />
                  </label>
                  <div className="rounded-sm border border-[var(--layout-border-color)] bg-[var(--layout-subtle-background)] p-3 text-sm">
                    <p className="font-bold text-[var(--layout-text-primary)]">Total</p>
                    <p className="mt-1 text-xl font-bold text-[var(--layout-price-color)]">{formatCurrency(totalAmount)}</p>
                  </div>
                  {serviceNeedsComments(selectedService) && (
                    <label className="block md:col-span-2">
                      <span className="mb-1 block text-sm font-bold text-[var(--layout-text-primary)]">Comentarios</span>
                      <textarea value={comments} onChange={(event) => setComments(event.target.value)} rows={4} className="w-full rounded-sm border border-[var(--layout-border-color)] px-3 py-2 text-sm outline-none focus:border-[var(--layout-accent-color)]" placeholder="Um comentario por linha" />
                    </label>
                  )}
                  {serviceNeedsUsername(selectedService) && (
                    <label className="block">
                      <span className="mb-1 block text-sm font-bold text-[var(--layout-text-primary)]">Usuario do comentario</span>
                      <input value={username} onChange={(event) => setUsername(event.target.value)} className="h-11 w-full rounded-sm border border-[var(--layout-border-color)] px-3 text-sm outline-none focus:border-[var(--layout-accent-color)]" />
                    </label>
                  )}
                  {serviceNeedsAnswer(selectedService) && (
                    <label className="block">
                      <span className="mb-1 block text-sm font-bold text-[var(--layout-text-primary)]">Resposta da enquete</span>
                      <input value={answerNumber} onChange={(event) => setAnswerNumber(event.target.value)} className="h-11 w-full rounded-sm border border-[var(--layout-border-color)] px-3 text-sm outline-none focus:border-[var(--layout-accent-color)]" />
                    </label>
                  )}
                </div>

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
                onClick={handleBuy}
                disabled={buying || totalAmount <= 0}
                className="layout-primary-button h-12 rounded-sm px-5 text-sm font-bold disabled:cursor-not-allowed disabled:opacity-60"
              >
                {buying ? 'Processando...' : 'Continuar compra'}
              </button>
            </div>
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
            <BarChart3 className="mx-auto mb-3 h-8 w-8" />
            Nenhum servico disponivel no momento.
          </div>
        )}

        {!loading && filteredItems.length > 0 && (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filteredItems.map((item) => (
              <ServiceCard key={item.id} service={item} selected={selectedService?.id === item.id} onSelect={selectService} />
            ))}
          </div>
        )}

        {!loading && configured && filteredItems.length > 0 && (
          <div className="mt-5 flex items-center gap-2 text-xs text-[var(--layout-text-muted)]">
            <MessageSquareText className="h-4 w-4" />
            Alguns servicos exigem campos extras, como comentarios ou resposta de enquete. Esses campos aparecem depois de selecionar o servico.
          </div>
        )}
      </main>
    </div>
  )
}
