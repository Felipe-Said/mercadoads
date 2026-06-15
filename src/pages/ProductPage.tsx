import React, { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Check, Clock3, MessageSquare, PackageCheck, Shield, Star, Trophy } from 'lucide-react'
import { RegistrationModal } from '../components/RegistrationModal'
import { Button } from '../components/ui/button'
import { useAuth } from '../contexts/AuthContext'
import { useCart } from '../contexts/CartContext'
import { formatCurrency, getProduct, recordProductClick, type Product } from '../lib/data'
import { createWestPayPixInOrThrow, validateWestPayCustomer } from '../lib/westpay'
import { supabase } from '../lib/supabase'
import { getWalletBalances } from '../lib/wallet'
import { getAffiliateSaleFields } from '../lib/affiliateTracking'

type Question = {
  id: string
  question: string
  answer: string | null
  created_at: string
  profiles?: { full_name: string | null; avatar_url: string | null } | null
}

type Review = {
  id: string
  rating: number
  title: string | null
  body: string | null
  created_at: string
  profiles?: { full_name: string | null; avatar_url: string | null } | null
}

export function ProductPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user, profile, loading: authLoading } = useAuth()
  const { addToCart } = useCart()
  const [product, setProduct] = useState<Product | null>(null)
  const [selectedImage, setSelectedImage] = useState('')
  const [questions, setQuestions] = useState<Question[]>([])
  const [reviews, setReviews] = useState<Review[]>([])
  const [question, setQuestion] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [addedToCart, setAddedToCart] = useState(false)
  const [buying, setBuying] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [buyerName, setBuyerName] = useState('')
  const [buyerPhone, setBuyerPhone] = useState('')
  const [buyerDocument, setBuyerDocument] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<'pix' | 'wallet'>('pix')
  const [walletBalance, setWalletBalance] = useState(0)
  const [affiliateLoading, setAffiliateLoading] = useState(false)
  const [affiliateMessage, setAffiliateMessage] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return

    async function load() {
      setLoading(true)
      const [productData, questionsResult, reviewsResult] = await Promise.all([
        getProduct(id),
        supabase.from('product_questions').select('id, question, answer, created_at, profiles:user_id(full_name, avatar_url)').eq('product_id', id).order('created_at', { ascending: false }).limit(5),
        supabase.from('product_reviews').select('id, rating, title, body, created_at, profiles:user_id(full_name, avatar_url)').eq('product_id', id).order('created_at', { ascending: false }).limit(10),
      ])

      setProduct(productData)
      if (productData) recordProductClick(productData, user?.id).catch(console.error)
      if (questionsResult.error) throw questionsResult.error
      if (reviewsResult.error) throw reviewsResult.error
      setQuestions((questionsResult.data ?? []) as Question[])
      setReviews((reviewsResult.data ?? []) as Review[])
    }

    load()
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false))
  }, [id])

  useEffect(() => {
    setBuyerName(profile?.full_name ?? user?.user_metadata?.full_name ?? '')
    setBuyerPhone(profile?.phone ?? '')
  }, [profile?.full_name, profile?.phone, user?.user_metadata?.full_name])

  useEffect(() => {
    setSelectedImage(product?.images?.[0] || product?.image || '')
  }, [product?.id, product?.image, product?.images])

  useEffect(() => {
    if (!user) {
      setWalletBalance(0)
      return
    }
    getWalletBalances(user.id).then((balances) => setWalletBalance(balances.purchaseBalance)).catch(console.error)
  }, [user])

  const handleAddToCart = async () => {
    if (!product) return
    setError(null)

    try {
      await addToCart({
        id: Number(product.id),
        title: product.title,
        price: product.price,
        image: product.image,
        quantity: 1,
      })
      setAddedToCart(true)
      setTimeout(() => setAddedToCart(false), 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Nao foi possivel adicionar ao carrinho.')
    }
  }

  const handleBuyNow = async () => {
    if (!product || authLoading || buying) return

    if (!user) {
      setIsModalOpen(true)
      return
    }

    setError(null)
    setBuying(true)

    let saleId: string | null = null

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
        if (balances.purchaseBalance < product.price) {
          throw new Error('Você não possui fundos suficiente')
        }
      }

      const affiliateFields = await getAffiliateSaleFields(product.seller_id, product.price, product.id, user.id)

      const { data: saleData, error: saleError } = await supabase.from('sales').insert({
        product_id: Number(product.id),
        buyer_id: user.id,
        seller_id: product.seller_id,
        amount: product.price,
        status: 'pending',
        ...affiliateFields,
      }).select('id').single()

      if (saleError) throw saleError

      saleId = saleData?.id ? String(saleData.id) : null
      if (!saleId) throw new Error('Nao foi possivel gerar o pedido.')

      if (paymentMethod === 'wallet') {
        const { error: spendError } = await supabase.from('wallet_spends').insert({
          user_id: user.id,
          sale_id: saleId,
          amount: product.price,
        })
        if (spendError) throw spendError
      } else if (westPayCustomer) {
        await createWestPayPixInOrThrow({
          saleId,
          amount: product.price,
          customer: westPayCustomer,
          itemTitle: product.title,
        })
      }
    } catch (err) {
      if (saleId && paymentMethod === 'pix') await supabase.from('sales').delete().eq('id', saleId)
      setError(err instanceof Error ? err.message : 'Nao foi possivel concluir a compra.')
      setBuying(false)
      return
    }

    setBuying(false)
    navigate('/painel/usuario/compras')
  }

  const handleQuestion = async () => {
    if (!product || !question.trim()) return
    if (authLoading) return

    const { data: sessionData, error: sessionError } = await supabase.auth.getUser()
    if (sessionError) {
      setError(sessionError.message)
      return
    }

    const sessionUser = sessionData.user
    if (!sessionUser) {
      setError('Entre na sua conta para perguntar ao vendedor.')
      return
    }

    setError(null)

    const { data, error: insertError } = await supabase
      .from('product_questions')
      .insert({ product_id: product.id, user_id: sessionUser.id, question: question.trim() })
      .select('id, question, answer, created_at, profiles:user_id(full_name, avatar_url)')
      .single()

    if (insertError) {
      setError(insertError.message)
      return
    }

    setQuestions((current) => [data as Question, ...current])
    setQuestion('')
  }

  const handleAffiliateProduct = async () => {
    if (!product || authLoading || affiliateLoading) return

    if (!user) {
      setError('Entre na sua conta para se afiliar a este produto.')
      return
    }

    if (user.id === product.seller_id) {
      setError('Voce nao pode se afiliar ao proprio produto.')
      return
    }

    if (!product.seller_id) {
      setError('Este produto ainda nao possui vendedor valido para afiliacao.')
      return
    }

    if (!product.allow_affiliates || Number(product.default_commission ?? 0) <= 0) {
      setError('Este produto nao aceita afiliados no momento.')
      return
    }

    setError(null)
    setAffiliateMessage(null)
    setAffiliateLoading(true)

    const { data: existingAffiliate, error: existingError } = await supabase
      .from('affiliates')
      .select('id, status')
      .eq('user_id', user.id)
      .eq('product_id', Number(product.id))
      .maybeSingle()

    if (existingError) {
      setAffiliateLoading(false)
      setError(existingError.message)
      return
    }

    const link = `https://cookiemarket.lat/produto/${product.id}?ref=${user.id}`

    if (existingAffiliate) {
      setAffiliateLoading(false)
      try {
        await navigator.clipboard.writeText(link)
        setAffiliateMessage('Voce ja esta afiliado a este produto. Link copiado.')
      } catch {
        setAffiliateMessage(`Voce ja esta afiliado a este produto. Seu link: ${link}`)
      }
      return
    }

    const payload = {
      user_id: user.id,
      seller_id: product.seller_id,
      product_id: Number(product.id),
      commission_percent: Number(product.default_commission ?? 0),
      status: 'active',
    }

    const { error: affiliateError } = await supabase
      .from('affiliates')
      .insert(payload)

    setAffiliateLoading(false)

    if (affiliateError) {
      setError(affiliateError.message)
      return
    }

    try {
      await navigator.clipboard.writeText(link)
      setAffiliateMessage('Afiliacao criada. Link copiado para sua area de transferencia.')
    } catch {
      setAffiliateMessage(`Afiliacao criada. Seu link: ${link}`)
    }
  }

  if (loading) {
    return <div className="mx-auto max-w-7xl px-4 py-16 text-center text-gray-500">Carregando produto...</div>
  }

  if (!product) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 text-center">
        <h1 className="mb-4 text-2xl font-bold text-[var(--layout-text-primary)]">Produto nao encontrado</h1>
        {error && <p className="mb-4 text-sm text-red-500">{error}</p>}
        <Link to="/" className="font-semibold text-[var(--layout-link-color)] hover:text-[var(--layout-link-hover-color)]">Voltar a pagina inicial</Link>
      </div>
    )
  }

  const sellerStoreName = product.seller?.store_name || product.seller?.full_name || 'Vendedor verificado'
  const sellerSubtitle = product.seller?.seller_category || product.seller?.full_name || 'Loja verificada'
  const sellerAvatar = product.seller?.avatar_url
  const averageRating = reviews.length ? reviews.reduce((sum, item) => sum + Number(item.rating), 0) / reviews.length : 0
  const productImages = product.images?.length ? product.images : product.image ? [product.image] : []
  const activeProductImage = selectedImage || productImages[0] || '/favicon.svg'

  return (
    <div className="min-h-screen bg-[var(--layout-page-background)] pb-16">
      <div className="mx-auto max-w-[1440px] px-4 pt-4">
        <div className="mb-3 flex flex-wrap items-center gap-2 text-sm">
          <Link to="/" className="font-semibold text-[var(--layout-link-color)] hover:text-[var(--layout-link-hover-color)]">Cookie market</Link>
          <span className="text-gray-400">/</span>
          <Link to="/" className="text-[var(--layout-link-color)] hover:text-[var(--layout-link-hover-color)]">Inicio</Link>
          <span className="text-gray-400">/</span>
          <span className="text-gray-600">{product.category ?? 'Ativos Digitais'}</span>
        </div>

        {error && <p className="mb-4 rounded-sm border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700">{error}</p>}

        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_390px]">
          <section className="overflow-hidden rounded-sm border border-[var(--layout-border-color)] bg-[var(--layout-surface-background)] shadow-sm">
            <div className="grid lg:grid-cols-[88px_minmax(0,1fr)]">
              <div className="hidden border-r border-gray-100 bg-gray-50 p-3 lg:block">
                <div className="space-y-2">
                  {productImages.map((image) => (
                    <button
                      key={image}
                      type="button"
                      onClick={() => setSelectedImage(image)}
                      className={`flex h-16 w-16 items-center justify-center overflow-hidden rounded-sm border bg-white p-1 transition-colors ${
                        activeProductImage === image ? 'border-[var(--layout-accent-color)]' : 'border-gray-200 hover:border-gray-400'
                      }`}
                    >
                      <img src={image || '/favicon.svg'} alt={product.title} className="max-h-full max-w-full object-contain" />
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid gap-0 xl:grid-cols-[minmax(0,1fr)_360px]">
                <div className="flex min-h-[420px] items-center justify-center bg-white p-6 md:min-h-[610px]">
                  <img src={activeProductImage} alt={product.title} className="max-h-full max-w-full object-contain" />
                </div>
                {productImages.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto border-t border-gray-100 bg-gray-50 p-3 lg:hidden">
                    {productImages.map((image) => (
                      <button
                        key={image}
                        type="button"
                        onClick={() => setSelectedImage(image)}
                        className={`flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-sm border bg-white p-1 transition-colors ${
                          activeProductImage === image ? 'border-[var(--layout-accent-color)]' : 'border-gray-200'
                        }`}
                      >
                        <img src={image || '/favicon.svg'} alt={product.title} className="max-h-full max-w-full object-contain" />
                      </button>
                    ))}
                  </div>
                )}

                <div className="border-t border-gray-200 p-6 xl:border-l xl:border-t-0">
                  <div className="mb-2 text-sm text-gray-500">Novo | +{product.sales_count} vendidos</div>
                  <h1 className="text-2xl font-bold leading-tight tracking-tight text-[var(--layout-text-primary)]">{product.title}</h1>
                  <div className="mt-3 flex items-center gap-2">
                    <div className="flex text-[var(--layout-rating-color)]">
                      {[1, 2, 3, 4, 5].map((star) => <Star key={star} className="h-4 w-4 fill-current" />)}
                    </div>
                    <span className="text-xs font-semibold text-[var(--layout-link-color)]">Produto verificado</span>
                  </div>

                  <div className="my-5 border-y border-gray-100 py-5">
                    {product.originalPrice && <div className="text-sm text-gray-500 line-through">{formatCurrency(product.originalPrice)}</div>}
                    <div className="mt-1 flex items-end gap-2">
                      <span className="text-4xl font-bold tracking-tight text-[var(--layout-text-primary)]">{formatCurrency(product.price)}</span>
                    </div>
                    <p className="mt-2 text-sm font-bold text-[var(--layout-success-color)]">Pagamento via Pix com acompanhamento interno</p>
                  </div>

                  <div className="grid gap-3 text-sm">
                    <div className="flex gap-3 rounded-sm bg-[var(--layout-subtle-background)] p-3">
                      <PackageCheck className="h-5 w-5 shrink-0 text-[var(--layout-link-color)]" />
                      <div>
                        <p className="font-bold text-[var(--layout-text-primary)]">Estoque disponivel</p>
                        <p className="text-gray-600">{product.stock ?? 0} unidades prontas para venda.</p>
                      </div>
                    </div>
                    <div className="flex gap-3 rounded-sm bg-[var(--layout-subtle-background)] p-3">
                      <Clock3 className="h-5 w-5 shrink-0 text-[var(--layout-link-color)]" />
                      <div>
                        <p className="font-bold text-[var(--layout-text-primary)]">Protecao de compra</p>
                        <p className="text-gray-600">Depois do pagamento, o comprador tem 24 horas para reclamar.</p>
                      </div>
                    </div>
                    <div className="flex gap-3 rounded-sm bg-[var(--layout-subtle-background)] p-3">
                      <Shield className="h-5 w-5 shrink-0 text-[var(--layout-link-color)]" />
                      <div>
                        <p className="font-bold text-[var(--layout-text-primary)]">Vendedor verificado</p>
                        <p className="text-gray-600">{sellerStoreName}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200 p-6 md:p-8">
              <h2 className="text-2xl font-bold tracking-tight text-[var(--layout-text-primary)]">Descricao</h2>
              <p className="mt-4 whitespace-pre-line text-[16px] leading-relaxed text-gray-700">
                {product.description || 'Este vendedor ainda nao cadastrou uma descricao detalhada para o anuncio.'}
              </p>
            </div>

            <div className="border-t border-gray-200 p-6 md:p-8">
              <h2 className="text-2xl font-bold tracking-tight text-[var(--layout-text-primary)]">Perguntas e respostas</h2>

              <div className="mt-5 rounded-sm border border-gray-200 bg-[var(--layout-subtle-background)] p-4">
                <p className="mb-3 text-sm font-bold text-[var(--layout-text-primary)]">Pergunte ao vendedor</p>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <input
                    value={question}
                    onChange={(event) => setQuestion(event.target.value)}
                    type="text"
                    placeholder={user ? 'Escreva sua pergunta...' : 'Entre para perguntar'}
                    disabled={!user}
                    className="h-11 w-full rounded-sm border border-gray-300 px-4 text-sm transition-colors focus:border-[var(--layout-accent-color)] focus:outline-none disabled:bg-gray-50 disabled:text-gray-400"
                  />
                  <Button onClick={handleQuestion} disabled={!user || authLoading} className="layout-primary-button h-11 rounded-sm px-8 font-bold transition-colors disabled:opacity-60">
                    Perguntar
                  </Button>
                </div>
                {!user && <p className="mt-2 text-xs text-gray-500">Faca login para enviar perguntas ao vendedor.</p>}
              </div>

              <div className="mt-6 space-y-4">
                <h3 className="font-bold text-[var(--layout-text-primary)]">Ultimas perguntas</h3>
                {questions.length === 0 && <p className="rounded-sm border border-dashed border-gray-200 bg-gray-50 p-4 text-sm text-gray-500">Ainda nao existem perguntas para este produto.</p>}
                {questions.map((item) => (
                  <div key={item.id} className="rounded-sm border border-gray-100 bg-white p-4">
                    <div className="mb-2 flex items-start gap-2">
                      <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[var(--layout-subtle-background)] text-[11px] font-bold text-[var(--layout-link-color)]">
                        {item.profiles?.avatar_url ? <img src={item.profiles.avatar_url} alt="" className="h-full w-full object-cover" /> : (item.profiles?.full_name?.slice(0, 1) || 'U')}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-[var(--layout-text-muted)]">{item.profiles?.full_name || 'Usuario'}</p>
                        <p className="text-sm font-medium text-[var(--layout-text-primary)]">{item.question}</p>
                      </div>
                    </div>
                    {item.answer && (
                      <div className="ml-9 rounded-sm border-l-2 border-[var(--layout-link-color)] bg-[var(--layout-subtle-background)] px-3 py-2">
                        <p className="text-xs font-bold text-[var(--layout-link-color)]">Vendedor</p>
                        <p className="text-sm text-gray-600">{item.answer}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-gray-200 p-6 md:p-8">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h2 className="text-2xl font-bold tracking-tight text-[var(--layout-text-primary)]">Reviews do produto</h2>
                  <p className="mt-1 text-sm text-gray-500">Avaliacoes de compradores apos o periodo de protecao.</p>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="flex text-[var(--layout-rating-color)]">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} className={`h-4 w-4 ${star <= Math.round(averageRating) ? 'fill-current' : ''}`} />
                    ))}
                  </div>
                  <span className="font-bold text-[var(--layout-text-primary)]">{averageRating ? averageRating.toFixed(1) : '0.0'}</span>
                  <span className="text-gray-500">({reviews.length})</span>
                </div>
              </div>

              <div className="mt-5 space-y-3">
                {reviews.length === 0 && <p className="rounded-sm border border-dashed border-gray-200 bg-gray-50 p-4 text-sm text-gray-500">Ainda nao existem reviews para este produto.</p>}
                {reviews.map((review) => (
                  <div key={review.id} className="rounded-sm border border-gray-100 bg-white p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[var(--layout-subtle-background)] text-xs font-bold text-[var(--layout-link-color)]">
                        {review.profiles?.avatar_url ? <img src={review.profiles.avatar_url} alt="" className="h-full w-full object-cover" /> : (review.profiles?.full_name?.slice(0, 1) || 'U')}
                      </div>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-sm font-bold text-[var(--layout-text-primary)]">{review.profiles?.full_name || 'Comprador'}</p>
                          <div className="flex text-[var(--layout-rating-color)]">
                            {[1, 2, 3, 4, 5].map((star) => <Star key={star} className={`h-3.5 w-3.5 ${star <= review.rating ? 'fill-current' : ''}`} />)}
                          </div>
                        </div>
                        {review.title && <p className="mt-1 text-sm font-semibold text-[var(--layout-text-primary)]">{review.title}</p>}
                        {review.body && <p className="mt-1 whitespace-pre-line text-sm text-gray-600">{review.body}</p>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <aside className="space-y-4 lg:sticky lg:top-28 lg:self-start">
            <div className="rounded-sm border border-gray-200 bg-white p-5 shadow-sm">
              {user && (
                <div className="mb-5 space-y-3">
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
                          <span className="text-xs text-gray-500">Saldo: {formatCurrency(walletBalance)}</span>
                        </span>
                        <input type="radio" checked={paymentMethod === 'wallet'} onChange={() => setPaymentMethod('wallet')} />
                      </label>
                    </div>
                  </div>
                  {paymentMethod === 'pix' && (
                    <>
                  <div>
                    <label className="mb-1 block text-sm font-bold text-gray-700">Nome completo</label>
                    <input
                      value={buyerName}
                      onChange={(event) => setBuyerName(event.target.value)}
                      className="h-11 w-full rounded-sm border border-gray-300 px-3 text-sm focus:border-[var(--layout-accent-color)] focus:outline-none"
                      placeholder="Nome do comprador"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-bold text-gray-700">WhatsApp</label>
                    <input
                      value={buyerPhone}
                      onChange={(event) => setBuyerPhone(event.target.value)}
                      className="h-11 w-full rounded-sm border border-gray-300 px-3 text-sm focus:border-[var(--layout-accent-color)] focus:outline-none"
                      placeholder="DDD + numero"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-bold text-gray-700">CPF ou CNPJ</label>
                    <input
                      value={buyerDocument}
                      onChange={(event) => setBuyerDocument(event.target.value)}
                      className="h-11 w-full rounded-sm border border-gray-300 px-3 text-sm focus:border-[var(--layout-accent-color)] focus:outline-none"
                      placeholder="Somente numeros"
                    />
                  </div>
                    </>
                  )}
                </div>
              )}

              <div className="mb-5 rounded-sm bg-[var(--layout-subtle-background)] p-4">
                <p className="text-xs font-bold uppercase tracking-[0.08em] text-gray-500">Total do produto</p>
                <p className="mt-1 text-3xl font-bold tracking-tight text-[var(--layout-text-primary)]">{formatCurrency(product.price)}</p>
                <p className="mt-1 text-sm font-semibold text-[var(--layout-success-color)]">Pix liberado no checkout</p>
              </div>

              <div className="flex flex-col gap-2">
                <Button onClick={handleBuyNow} disabled={authLoading || buying} className="layout-primary-button h-12 w-full rounded-sm text-base font-bold shadow-sm transition-colors">
                  {buying ? 'Registrando compra...' : 'Comprar agora'}
                </Button>
                <Button onClick={handleAddToCart} className={`flex h-12 w-full items-center justify-center gap-2 rounded-sm text-base font-bold transition-colors ${addedToCart ? 'bg-green-100 text-green-700 hover:bg-green-100' : 'layout-secondary-button'}`}>
                  {addedToCart ? <><Check className="h-5 w-5" /> Adicionado</> : 'Adicionar ao carrinho'}
                </Button>
              </div>

              <div className="mt-5 space-y-3 border-t border-gray-100 pt-5">
                <div className="flex gap-3">
                  <Shield className="h-5 w-5 shrink-0 text-[var(--layout-link-color)]" />
                  <p className="text-[13px] leading-tight text-gray-600"><span className="font-bold text-[var(--layout-link-color)]">Compra Garantida</span>, receba o produto combinado ou solicite suporte.</p>
                </div>
                <div className="flex gap-3">
                  <Trophy className="h-5 w-5 shrink-0 text-[var(--layout-link-color)]" />
                  <p className="text-[13px] leading-tight text-gray-600">Pedido registrado com acompanhamento interno da plataforma.</p>
                </div>
              </div>
            </div>

            <div className="rounded-sm border border-gray-200 bg-white p-5 shadow-sm">
              <h3 className="text-lg font-bold text-[var(--layout-text-primary)]">Informacoes sobre o vendedor</h3>
              <div className="mt-4 flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--layout-subtle-background)]">
                  {sellerAvatar ? <img src={sellerAvatar} alt="" className="h-full w-full rounded-full object-cover" /> : <Shield className="h-5 w-5 text-[var(--layout-link-color)]" />}
                </div>
                <div>
                  <p className="text-sm font-bold text-[var(--layout-text-primary)]">{sellerStoreName}</p>
                  <p className="text-[13px] text-gray-500">{sellerSubtitle}</p>
                </div>
              </div>
              <div className="mt-5 grid grid-cols-3 divide-x divide-gray-200 rounded-sm border border-gray-100 bg-[var(--layout-subtle-background)] text-center text-[12px] text-gray-600">
                <div className="p-3">
                  <p className="mb-1 text-xl font-bold text-[var(--layout-text-primary)]">{product.sales_count}</p>
                  <p className="leading-tight">Vendas</p>
                </div>
                <div className="p-3 font-semibold">Bom atendimento</div>
                <div className="p-3 font-semibold">Suporte interno</div>
              </div>
              {product.allow_affiliates && Number(product.default_commission ?? 0) > 0 && (
                <div className="mt-4 rounded-sm border border-gray-100 bg-[var(--layout-subtle-background)] p-3">
                  <p className="text-xs font-semibold text-gray-500">Comissao deste produto</p>
                  <p className="mt-1 text-lg font-bold text-[var(--layout-price-color)]">{product.default_commission}%</p>
                  <Button onClick={handleAffiliateProduct} disabled={affiliateLoading || authLoading} className="mt-3 h-10 w-full rounded-sm font-bold">
                    {affiliateLoading ? 'Afiliando...' : 'Afiliar a este produto'}
                  </Button>
                  {affiliateMessage && <p className="mt-2 text-xs font-medium text-green-600">{affiliateMessage}</p>}
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>

      <RegistrationModal open={isModalOpen} onOpenChange={setIsModalOpen} product={product} />
    </div>
  )
}
