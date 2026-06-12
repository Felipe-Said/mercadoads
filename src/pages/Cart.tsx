import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../contexts/CartContext'
import { Trash2, Plus, Minus, ShoppingBag, ShieldCheck, CreditCard, Clock3 } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { createWestPayPixInOrThrow, validateWestPayCustomer } from '../lib/westpay'
import { getWalletBalances } from '../lib/wallet'

export function Cart() {
  const navigate = useNavigate()
  const { user, profile } = useAuth()
  const { cart, removeFromCart, updateQuantity, totalItems, clearCart } = useCart()
  const [checkoutLoading, setCheckoutLoading] = useState(false)
  const [checkoutError, setCheckoutError] = useState<string | null>(null)
  const [buyerName, setBuyerName] = useState('')
  const [buyerPhone, setBuyerPhone] = useState('')
  const [buyerDocument, setBuyerDocument] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<'pix' | 'wallet'>('pix')
  const [walletBalance, setWalletBalance] = useState(0)

  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0)
  const total = subtotal

  useEffect(() => {
    setBuyerName(profile?.full_name ?? user?.user_metadata?.full_name ?? '')
    setBuyerPhone(profile?.phone ?? '')
  }, [profile?.full_name, profile?.phone, user?.user_metadata?.full_name])

  useEffect(() => {
    if (!user) {
      setWalletBalance(0)
      return
    }
    getWalletBalances(user.id).then((balances) => setWalletBalance(balances.purchaseBalance)).catch(console.error)
  }, [user])

  const handleContinuePurchase = async () => {
    if (checkoutLoading) return

    if (!user) {
      navigate('/login', { state: { from: '/carrinho' } })
      return
    }

    if (cart.length === 0) return

    setCheckoutLoading(true)
    setCheckoutError(null)
    const createdSaleIds: string[] = []

    try {
      const westPayCustomer = paymentMethod === 'pix'
        ? validateWestPayCustomer({
          name: buyerName,
          email: user.email ?? '',
          phone: buyerPhone,
          documentNumber: buyerDocument,
        })
        : null

      if (paymentMethod === 'wallet') {
        const balances = await getWalletBalances(user.id)
        setWalletBalance(balances.purchaseBalance)
        if (balances.purchaseBalance < total) {
          throw new Error('Você não possui fundos suficiente')
        }
      }

      const productIds = cart.map((item) => item.id)
      const { data: products, error } = await supabase
        .from('products')
        .select('id, title, price, seller_id, status, hidden_by_admin')
        .in('id', productIds)

      if (error) throw error

      const productMap = new Map((products ?? []).map((product) => [Number(product.id), product]))
      const missingIds = productIds.filter((id) => !productMap.has(id))
      if (missingIds.length > 0) {
        throw new Error('Alguns produtos do carrinho nao estao mais disponiveis.')
      }

      for (const item of cart) {
        const product = productMap.get(item.id)
        if (!product) continue

        const amount = Number(product.price ?? item.price) * item.quantity
        const { data: saleData, error: saleError } = await supabase.from('sales').insert({
          product_id: product.id,
          buyer_id: user.id,
          seller_id: product.seller_id,
          amount,
          status: 'pending',
        }).select('id').single()

        if (saleError) throw saleError

        const saleId = saleData?.id ? String(saleData.id) : null
        if (!saleId) throw new Error('Nao foi possivel gerar o pedido.')
        createdSaleIds.push(saleId)

        if (paymentMethod === 'wallet') {
          const { error: spendError } = await supabase.from('wallet_spends').insert({
            user_id: user.id,
            sale_id: saleId,
            amount,
          })
          if (spendError) throw spendError
        } else if (westPayCustomer) {
          await createWestPayPixInOrThrow({
            saleId,
            amount,
            customer: westPayCustomer,
            itemTitle: product.title,
          })
        }
      }

      await clearCart()
      navigate('/painel/usuario/compras', { state: { checkoutSaleIds: createdSaleIds } })
    } catch (err) {
      if (createdSaleIds.length > 0 && paymentMethod === 'pix') await supabase.from('sales').delete().in('id', createdSaleIds)
      setCheckoutError(err instanceof Error ? err.message : 'Nao foi possivel concluir a compra.')
    } finally {
      setCheckoutLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[var(--layout-page-background)]">
      <main className="mx-auto max-w-[1440px] px-4 py-5">
        <div className="mb-4 flex flex-wrap items-center gap-2 text-sm">
          <Link to="/" className="font-semibold text-[var(--layout-link-color)] hover:text-[var(--layout-link-hover-color)]">Cookie market</Link>
          <span className="text-gray-400">/</span>
          <span className="text-[var(--layout-text-muted)]">Carrinho</span>
        </div>

        <div className="mb-4 rounded-sm border border-[var(--layout-border-color)] bg-[var(--layout-surface-background)] px-5 py-4 shadow-sm">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--layout-link-color)]">Checkout</p>
              <h1 className="text-2xl font-bold tracking-tight text-[var(--layout-text-primary)]">Carrinho ({totalItems})</h1>
            </div>
            <p className="text-sm text-gray-500">Produtos digitais prontos para gerar Pix com validacao do comprador.</p>
          </div>
        </div>

        {cart.length === 0 ? (
          <div className="rounded-sm border border-gray-200 bg-white px-6 py-16 text-center shadow-sm">
            <ShoppingBag className="mx-auto mb-4 h-16 w-16 text-gray-300" />
            <h2 className="text-xl font-bold text-[var(--layout-text-primary)]">Seu carrinho esta vazio</h2>
            <p className="mx-auto mt-2 max-w-md text-gray-500">Produtos digitais prontos para entrega dentro da plataforma.</p>
            <Link to="/" className="layout-primary-button mt-6 inline-flex rounded-sm px-6 py-3 font-bold shadow-sm transition">
              Descobrir ofertas
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_390px]">
            <section className="overflow-hidden rounded-sm border border-gray-200 bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-gray-100 bg-[var(--layout-subtle-background)] px-5 py-4 text-xs font-bold uppercase tracking-[0.08em] text-[var(--layout-text-muted)]">
                <span>Produtos</span>
                <span className="hidden md:block">Quantidade</span>
                <span className="hidden md:block">Preco</span>
              </div>

              <div className="divide-y divide-gray-100">
                {cart.map((item) => (
                  <article key={item.id} className="grid gap-4 px-5 py-5 md:grid-cols-[96px_minmax(0,1fr)_260px] md:items-center">
                    <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-sm border border-gray-200 bg-gray-50 p-2">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="max-h-full max-w-full object-contain"
                      />
                    </div>

                    <div className="min-w-0">
                      <h3 className="line-clamp-2 text-base font-bold leading-snug text-[var(--layout-text-primary)]">{item.title}</h3>
                      <div className="mt-3 flex flex-wrap items-center gap-3">
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="inline-flex items-center gap-1 text-sm font-semibold text-[var(--layout-link-color)] hover:text-[var(--layout-link-hover-color)]"
                        >
                          <Trash2 className="h-3.5 w-3.5" /> Excluir
                        </button>
                      </div>
                    </div>

                    <div className="flex flex-col gap-4 md:items-end">
                      <div className="flex items-center rounded-sm border border-gray-300 bg-white">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                          className="flex h-10 w-10 items-center justify-center text-[var(--layout-link-color)] transition hover:bg-gray-50 disabled:text-gray-300"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="w-10 text-center text-sm font-bold text-[var(--layout-text-primary)]">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="flex h-10 w-10 items-center justify-center text-[var(--layout-link-color)] transition hover:bg-gray-50"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>

                      <div className="text-right">
                        <div className="text-2xl font-bold tracking-tight text-[var(--layout-text-primary)]">
                          R$ {item.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </div>
                        {item.quantity > 1 && (
                          <div className="mt-1 text-xs text-gray-500">
                            R$ {(item.price * item.quantity).toLocaleString('pt-BR', { minimumFractionDigits: 2 })} no total
                          </div>
                        )}
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </section>

            <aside className="space-y-4">
              <div className="rounded-sm border border-gray-200 bg-white p-5 shadow-sm">
                <h2 className="text-lg font-bold tracking-tight text-[var(--layout-text-primary)]">Resumo da compra</h2>
                <div className="mt-4 space-y-3 rounded-sm bg-[var(--layout-subtle-background)] p-4 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Produtos ({totalItems})</span>
                    <span className="font-semibold text-[var(--layout-text-primary)]">R$ {subtotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex items-center justify-between border-t border-gray-200 pt-3">
                    <span className="text-base font-bold text-[var(--layout-text-primary)]">Total</span>
                    <span className="text-2xl font-bold tracking-tight text-[var(--layout-text-primary)]">R$ {total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>

                <div className="mt-4 grid gap-3 rounded-sm border border-gray-100 bg-white p-4 text-sm text-gray-600">
                  <div className="flex gap-3">
                    <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-[var(--layout-link-color)]" />
                    <p><strong className="text-[var(--layout-text-primary)]">Compra segura:</strong> pedido acompanha o fluxo interno da plataforma.</p>
                  </div>
                  <div className="flex gap-3">
                    <CreditCard className="mt-0.5 h-5 w-5 shrink-0 text-[var(--layout-link-color)]" />
                    <p><strong className="text-[var(--layout-text-primary)]">Pix via gateway:</strong> pagamento gerado com QR Code e copia e cola.</p>
                  </div>
                  <div className="flex gap-3">
                    <Clock3 className="mt-0.5 h-5 w-5 shrink-0 text-[var(--layout-link-color)]" />
                    <p><strong className="text-[var(--layout-text-primary)]">Protecao:</strong> o cliente tem 24 horas para reclamar depois da compra.</p>
                  </div>
                </div>

                <div className="mt-5 space-y-3">
                  <div className="rounded-sm border border-gray-200 p-3">
                    <p className="mb-2 text-sm font-bold text-gray-700">Forma de pagamento</p>
                    <div className="grid gap-2">
                      <label className={`flex cursor-pointer items-center justify-between rounded-sm border p-3 text-sm ${paymentMethod === 'pix' ? 'border-[var(--layout-accent-color)] bg-[var(--layout-subtle-background)]' : 'border-gray-200'}`}>
                        <span className="font-semibold text-[var(--layout-text-primary)]">Gerar Pix agora</span>
                        <input type="radio" checked={paymentMethod === 'pix'} onChange={() => setPaymentMethod('pix')} />
                      </label>
                      <label className={`flex cursor-pointer items-center justify-between rounded-sm border p-3 text-sm ${paymentMethod === 'wallet' ? 'border-[var(--layout-accent-color)] bg-[var(--layout-subtle-background)]' : 'border-gray-200'}`}>
                        <span>
                          <span className="block font-semibold text-[var(--layout-text-primary)]">Fundos da carteira</span>
                          <span className="text-xs text-gray-500">Saldo: R$ {walletBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                        </span>
                        <input type="radio" checked={paymentMethod === 'wallet'} onChange={() => setPaymentMethod('wallet')} />
                      </label>
                    </div>
                  </div>

                  {paymentMethod === 'pix' && <div>
                    <label className="mb-1 block text-sm font-bold text-gray-700">Nome completo</label>
                    <input
                      value={buyerName}
                      onChange={(event) => setBuyerName(event.target.value)}
                      className="h-11 w-full rounded-sm border border-gray-300 px-3 text-sm focus:border-[var(--layout-accent-color)] focus:outline-none focus:ring-2 focus:ring-[var(--layout-accent-color)]"
                      placeholder="Nome do comprador"
                    />
                  </div>}
                  {paymentMethod === 'pix' && <div>
                    <label className="mb-1 block text-sm font-bold text-gray-700">WhatsApp</label>
                    <input
                      value={buyerPhone}
                      onChange={(event) => setBuyerPhone(event.target.value)}
                      className="h-11 w-full rounded-sm border border-gray-300 px-3 text-sm focus:border-[var(--layout-accent-color)] focus:outline-none focus:ring-2 focus:ring-[var(--layout-accent-color)]"
                      placeholder="DDD + numero"
                    />
                  </div>}
                  {paymentMethod === 'pix' && <div>
                    <label className="mb-1 block text-sm font-bold text-gray-700">CPF ou CNPJ</label>
                    <input
                      value={buyerDocument}
                      onChange={(event) => setBuyerDocument(event.target.value)}
                      className="h-11 w-full rounded-sm border border-gray-300 px-3 text-sm focus:border-[var(--layout-accent-color)] focus:outline-none focus:ring-2 focus:ring-[var(--layout-accent-color)]"
                      placeholder="Somente numeros"
                    />
                  </div>}
                </div>

                {checkoutError && <p className="mt-4 rounded-sm border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700">{checkoutError}</p>}
                <button
                  type="button"
                  onClick={handleContinuePurchase}
                  disabled={checkoutLoading}
                  className="layout-primary-button mt-4 w-full rounded-sm py-3.5 font-bold shadow-sm transition disabled:opacity-60"
                >
                  {checkoutLoading ? 'Processando...' : 'Continuar a compra'}
                </button>
              </div>
            </aside>
          </div>
        )}
      </main>
    </div>
  )
}
