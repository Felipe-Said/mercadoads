import React, { useEffect, useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { UserLayout } from '../../components/layouts/UserLayout'
import { CheckCircle2, Clock, Copy, Package, X, Download, Star } from 'lucide-react'
import { Card, CardContent } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog'
import { supabase } from '../../lib/supabase'
import { formatCurrency, formatDate, getSales, type Sale } from '../../lib/data'
import { useAuth } from '../../contexts/AuthContext'
import { PixQrCode } from '../../components/PixQrCode'

export function Compras() {
  const { user } = useAuth()
  const location = useLocation()
  const [sales, setSales] = useState<Sale[]>([])
  const [copiedSaleId, setCopiedSaleId] = useState<string | null>(null)
  const [cancelingSaleId, setCancelingSaleId] = useState<string | null>(null)
  const [purchaseError, setPurchaseError] = useState<string | null>(null)
  const [saleToCancel, setSaleToCancel] = useState<Sale | null>(null)
  const [cleanupPromptOpen, setCleanupPromptOpen] = useState(false)
  const [downloadingUrl, setDownloadingUrl] = useState<string | null>(null)
  const [reviewDrafts, setReviewDrafts] = useState<Record<string, { rating: number; body: string }>>({})
  const [reviewingSaleId, setReviewingSaleId] = useState<string | null>(null)
  const [reviewMessage, setReviewMessage] = useState<Record<string, string>>({})

  const checkoutSaleIds = useMemo(() => {
    const state = location.state as { checkoutSaleIds?: string[] } | null
    return state?.checkoutSaleIds ?? []
  }, [location.state])

  const checkoutSales = useMemo(() => {
    if (checkoutSaleIds.length === 0) return []
    return sales.filter((sale) => checkoutSaleIds.includes(sale.id))
  }, [sales, checkoutSaleIds])

  const loadSales = async () => {
    if (!user) return
    const nextSales = await getSales({ buyerId: user.id })
    setSales(nextSales)
  }

  useEffect(() => {
    if (!user) return
    loadSales().catch(console.error)
    const timeout = window.setInterval(() => {
      loadSales().catch(console.error)
    }, 5000)

    return () => window.clearInterval(timeout)
  }, [user])

  const handleCopy = async (sale: Sale) => {
    const value = sale.payment_qrcode_text || sale.payment_qrcode
    if (!value) return
    await navigator.clipboard.writeText(value)
    setCopiedSaleId(sale.id)
    setTimeout(() => setCopiedSaleId(null), 2000)
  }

  const handleCancel = async (sale: Sale) => {
    if (!user || sale.status !== 'pending') return

    setCancelingSaleId(sale.id)
    setPurchaseError(null)
    const { error } = await supabase
      .from('sales')
      .delete()
      .eq('id', sale.id)
      .eq('buyer_id', user.id)
      .eq('status', 'pending')

    if (error) {
      setPurchaseError(error.message)
    } else {
      setSales((current) => current.filter((item) => item.id !== sale.id))
    }

    await loadSales()
    setCancelingSaleId(null)
  }

  const handleClearUnpaid = async () => {
    if (!user) return
    const unpaidIds = sales
      .filter((sale) => sale.status === 'pending' && !sale.payment_qrcode_text && !sale.payment_qrcode)
      .map((sale) => sale.id)

    if (unpaidIds.length === 0) return

    setPurchaseError(null)
    const { error } = await supabase
      .from('sales')
      .delete()
      .in('id', unpaidIds)
      .eq('buyer_id', user.id)
      .eq('status', 'pending')

    if (error) {
      setPurchaseError(error.message)
      return
    }

    setSales((current) => current.filter((sale) => !unpaidIds.includes(sale.id)))
    await loadSales()
    setCleanupPromptOpen(false)
  }

  const handleOpenCleanupPrompt = () => {
    const unpaidExists = sales.some((sale) => sale.status === 'pending' && !sale.payment_qrcode_text && !sale.payment_qrcode)
    if (!unpaidExists) return
    setCleanupPromptOpen(true)
  }

  const handleDownload = async (fileUrl: string) => {
    if (fileUrl.startsWith('http')) {
      window.open(fileUrl, '_blank')
      return
    }

    setDownloadingUrl(fileUrl)
    try {
      const { data, error } = await supabase.storage.from('product_files').createSignedUrl(fileUrl, 3600)
      if (error || !data) throw error
      window.open(data.signedUrl, '_blank')
    } catch (err) {
      console.error(err)
      alert('Não foi possível gerar o link de download.')
    } finally {
      setDownloadingUrl(null)
    }
  }

  const handleCopyText = async (value: string, saleId: string) => {
    await navigator.clipboard.writeText(value)
    setCopiedSaleId(saleId)
    setTimeout(() => setCopiedSaleId(null), 2000)
  }

  const handleSubmitReview = async (sale: Sale) => {
    if (!user || !sale.product_id) return
    const draft = reviewDrafts[sale.id]
    if (!draft?.rating) {
      setReviewMessage((current) => ({ ...current, [sale.id]: 'Escolha uma nota de 1 a 5 estrelas.' }))
      return
    }

    setReviewingSaleId(sale.id)
    setReviewMessage((current) => ({ ...current, [sale.id]: '' }))

    const { error } = await supabase.from('product_reviews').insert({
      sale_id: sale.id,
      product_id: sale.product_id,
      user_id: user.id,
      rating: draft.rating,
      body: draft.body.trim() || null,
    })

    if (error) {
      setReviewMessage((current) => ({ ...current, [sale.id]: error.message }))
    } else {
      setReviewMessage((current) => ({ ...current, [sale.id]: 'Avaliacao enviada.' }))
      await loadSales()
    }

    setReviewingSaleId(null)
  }

  return (
    <UserLayout>
      <div className="space-y-6">
        <h2 className="text-xl font-light text-ml-dark mb-4">Minhas Compras</h2>

        {checkoutSales.some((sale) => sale.status === 'pending') && (
          <div className="rounded-md border border-blue-100 bg-blue-50 p-4 text-sm text-blue-700">
            Seu pedido foi gerado. Se o Pix ainda nao apareceu, a plataforma esta atualizando os dados agora.
          </div>
        )}

        {purchaseError && (
          <div className="rounded-md border border-red-100 bg-red-50 p-4 text-sm text-red-700">
            {purchaseError}
          </div>
        )}

        {sales.some((sale) => sale.status === 'pending' && !sale.payment_qrcode_text && !sale.payment_qrcode) && (
          <div className="flex justify-end">
            <Button
              type="button"
              onClick={handleOpenCleanupPrompt}
              variant="outline"
              className="rounded-sm border-gray-300 text-gray-600 hover:bg-gray-50"
            >
              Limpar pedidos sem Pix
            </Button>
          </div>
        )}

        <div className="space-y-4">
          {sales.filter((sale) => sale.status !== 'cancelled').map((sale) => (
            <Card key={sale.id} className="bg-white border-none shadow-sm rounded-md overflow-hidden hover:shadow-md transition-shadow group">
              <div className="border-b border-gray-100 px-6 py-3 flex justify-between items-center bg-gray-50/50">
                <span className="text-sm font-semibold text-green-500">{sale.status}</span>
                <span className="text-sm text-gray-400">{formatDate(sale.created_at)}</span>
              </div>
              <CardContent className="p-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gray-100 rounded-sm flex items-center justify-center overflow-hidden">
                    {sale.products?.image_url ? <img src={sale.products.image_url} alt="" className="w-full h-full object-cover" /> : <Package className="w-8 h-8 text-gray-400" />}
                  </div>
                  <div className="space-y-2">
                    <p className="text-ml-dark font-medium group-hover:text-ml-blue transition-colors">
                      {sale.products?.title
                        ?? sale.proxy_offers?.name
                        ?? (sale.virtual_number_service_name ? `Numero virtual - ${sale.virtual_number_service_name}` : null)
                        ?? (sale.temp_email_service_name ? `Email temporario - ${sale.temp_email_service_name}` : 'Pedido')}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">{formatCurrency(sale.amount)}</p>
                    {sale.status === 'pending' && !(sale.payment_qrcode_text || sale.payment_qrcode) && (
                      <div className="rounded-md border border-yellow-100 bg-yellow-50 p-3 max-w-2xl">
                        <p className="text-sm font-semibold text-yellow-700">Gerando pagamento...</p>
                        <p className="text-xs text-gray-600 mt-1">
                          Estamos preparando o Pix deste pedido. A pagina atualiza sozinha.
                        </p>
                      </div>
                    )}
                    {sale.status === 'pending' && (sale.payment_qrcode_text || sale.payment_qrcode) && (
                      <div className="rounded-md border border-yellow-200 bg-yellow-50 p-4 max-w-4xl">
                        <div className="flex flex-col gap-1 md:flex-row md:items-start md:justify-between">
                          <div>
                            <p className="text-sm font-semibold text-yellow-800">Pix aguardando pagamento</p>
                            <p className="text-xs text-gray-600 mt-1">Pedido reservado enquanto o pagamento fica pendente.</p>
                          </div>
                          <Button
                            type="button"
                            onClick={() => handleCopy(sale)}
                            className="h-9 px-3 rounded-sm bg-white border border-yellow-300 text-yellow-800 hover:bg-yellow-100 text-xs font-semibold flex items-center gap-2 active:scale-[0.98]"
                          >
                            {copiedSaleId === sale.id ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                            {copiedSaleId === sale.id ? 'Copiado' : 'Copiar Pix'}
                          </Button>
                        </div>

                        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-[176px_minmax(0,1fr)] md:items-stretch">
                          <div className="flex justify-center md:justify-start">
                            <PixQrCode value={(sale.payment_qrcode_text || sale.payment_qrcode) as string} />
                          </div>
                          <div className="min-w-0 rounded-md border border-yellow-200 bg-white p-3">
                            <div className="flex items-center justify-between gap-3 mb-2">
                              <p className="text-xs font-semibold uppercase text-gray-500">Codigo Pix copia e cola</p>
                              {sale.payment_qrcode_expires_at && (
                                <span className="text-xs text-gray-500 whitespace-nowrap">
                                  Expira em {new Date(sale.payment_qrcode_expires_at).toLocaleString('pt-BR')}
                                </span>
                              )}
                            </div>
                            <textarea
                              readOnly
                              value={sale.payment_qrcode_text || sale.payment_qrcode || ''}
                              rows={5}
                              className="w-full resize-none rounded-sm border border-gray-100 bg-gray-50 p-3 font-mono text-xs leading-relaxed text-gray-700 outline-none"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                    {sale.status === 'paid' && sale.claim_until && (
                      <div className="space-y-3">
                        <div className="rounded-md border border-green-100 bg-green-50 p-4 max-w-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                          <div>
                            <p className="text-sm font-semibold text-green-700">Pedido confirmado</p>
                            <p className="text-xs text-green-600 mt-1 flex items-center gap-2">
                              <Clock className="w-3 h-3" />
                              Proteção de compra ativa até {new Date(sale.claim_until).toLocaleString('pt-BR')}.
                            </p>
                          </div>
                          
                          {sale.products?.file_url && (
                            <Button 
                              onClick={() => handleDownload(sale.products!.file_url!)}
                              disabled={downloadingUrl === sale.products!.file_url}
                              className="bg-green-600 text-white hover:bg-green-700 h-9 rounded-sm flex items-center gap-2 shadow-sm shrink-0"
                            >
                              <Download className="w-4 h-4" />
                              {downloadingUrl === sale.products!.file_url ? 'Gerando link...' : 'Baixar Arquivo'}
                            </Button>
                          )}
                        </div>

                        {sale.products?.seller_note && (
                          <div className="rounded-md border border-gray-100 bg-gray-50 p-4 max-w-2xl">
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Mensagem do Vendedor</p>
                            <p className="text-sm text-gray-700 whitespace-pre-wrap">{sale.products.seller_note}</p>
                          </div>
                        )}
                        {sale.proxy_deliveries?.map((delivery) => {
                          const proxyLine = `${delivery.host}:${delivery.port}:${delivery.username}:${delivery.password}`
                          if (delivery.status === 'failed') {
                            return (
                              <div key={delivery.username} className="rounded-md border border-yellow-100 bg-yellow-50 p-4 max-w-3xl">
                                <p className="text-sm font-semibold text-yellow-800">Entrega em analise</p>
                                <p className="mt-1 text-xs text-gray-600">O pagamento foi confirmado, mas a credencial ainda nao foi liberada automaticamente. O suporte deve revisar este pedido.</p>
                              </div>
                            )
                          }
                          return (
                            <div key={delivery.username} className="rounded-md border border-blue-100 bg-blue-50 p-4 max-w-3xl">
                              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                                <div>
                                  <p className="text-sm font-semibold text-blue-800">Proxy liberado</p>
                                  <p className="mt-1 text-xs text-blue-700">
                                    {delivery.traffic_limit_gb}GB provisionado. Use o host, porta, usuario e senha abaixo.
                                  </p>
                                </div>
                                <Button
                                  type="button"
                                  onClick={() => handleCopyText(proxyLine, sale.id)}
                                  className="h-9 rounded-sm bg-white border border-blue-200 text-blue-800 hover:bg-blue-100 text-xs font-semibold"
                                >
                                  {copiedSaleId === sale.id ? 'Copiado' : 'Copiar proxy'}
                                </Button>
                              </div>
                              <div className="mt-3 grid gap-2 text-xs md:grid-cols-2">
                                <p><span className="font-semibold text-blue-900">Host:</span> {delivery.host}</p>
                                <p><span className="font-semibold text-blue-900">Porta:</span> {delivery.port}</p>
                                <p><span className="font-semibold text-blue-900">Usuario:</span> {delivery.username}</p>
                                <p><span className="font-semibold text-blue-900">Senha:</span> {delivery.password}</p>
                              </div>
                              <textarea readOnly value={proxyLine} rows={2} className="mt-3 w-full resize-none rounded-sm border border-blue-100 bg-white p-2 font-mono text-xs text-gray-700 outline-none" />
                            </div>
                          )
                        })}

                        {sale.virtual_number_service_id && (!sale.virtual_number_deliveries || sale.virtual_number_deliveries.length === 0) && (
                          <div className="rounded-md border border-yellow-100 bg-yellow-50 p-4 max-w-3xl">
                            <p className="text-sm font-semibold text-yellow-800">Numero em processamento</p>
                            <p className="mt-1 text-xs text-gray-600">O pagamento foi confirmado e a plataforma esta solicitando o numero para {sale.virtual_number_service_name}.</p>
                          </div>
                        )}

                        {sale.virtual_number_deliveries?.map((delivery) => {
                          if (delivery.status === 'failed') {
                            return (
                              <div key={`${delivery.service_name}-${sale.id}`} className="rounded-md border border-yellow-100 bg-yellow-50 p-4 max-w-3xl">
                                <p className="text-sm font-semibold text-yellow-800">Entrega em analise</p>
                                <p className="mt-1 text-xs text-gray-600">O pagamento foi confirmado, mas o numero ainda nao foi liberado automaticamente. O suporte deve revisar este pedido.</p>
                              </div>
                            )
                          }

                          return (
                            <div key={`${delivery.service_name}-${sale.id}`} className="rounded-md border border-blue-100 bg-blue-50 p-4 max-w-3xl">
                              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                                <div>
                                  <p className="text-sm font-semibold text-blue-800">Numero virtual liberado</p>
                                  <p className="mt-1 text-xs text-blue-700">Use este numero para receber o SMS em {delivery.service_name}.</p>
                                </div>
                                {delivery.phone_number && (
                                  <Button
                                    type="button"
                                    onClick={() => handleCopyText(delivery.phone_number || '', sale.id)}
                                    className="h-9 rounded-sm bg-white border border-blue-200 text-blue-800 hover:bg-blue-100 text-xs font-semibold"
                                  >
                                    {copiedSaleId === sale.id ? 'Copiado' : 'Copiar numero'}
                                  </Button>
                                )}
                              </div>
                              <div className="mt-3 grid gap-2 text-xs md:grid-cols-2">
                                <p><span className="font-semibold text-blue-900">Plataforma:</span> {delivery.service_name}</p>
                                <p><span className="font-semibold text-blue-900">Status:</span> {delivery.status}</p>
                                <p><span className="font-semibold text-blue-900">Numero:</span> {delivery.phone_number || 'Aguardando liberacao'}</p>
                                <p><span className="font-semibold text-blue-900">Codigo SMS:</span> {delivery.sms_code || 'Aguardando SMS'}</p>
                              </div>
                              {delivery.expires_at && <p className="mt-2 text-xs text-blue-700">Expira em {new Date(delivery.expires_at).toLocaleString('pt-BR')}</p>}
                            </div>
                          )
                        })}

                        {sale.temp_email_service_id && (!sale.temp_email_deliveries || sale.temp_email_deliveries.length === 0) && (
                          <div className="rounded-md border border-yellow-100 bg-yellow-50 p-4 max-w-3xl">
                            <p className="text-sm font-semibold text-yellow-800">Email em processamento</p>
                            <p className="mt-1 text-xs text-gray-600">O pagamento foi confirmado e a plataforma esta solicitando o email para {sale.temp_email_service_name}.</p>
                          </div>
                        )}

                        {sale.temp_email_deliveries?.map((delivery) => {
                          if (delivery.status === 'failed') {
                            return (
                              <div key={`${delivery.service_name}-${sale.id}`} className="rounded-md border border-yellow-100 bg-yellow-50 p-4 max-w-3xl">
                                <p className="text-sm font-semibold text-yellow-800">Entrega em analise</p>
                                <p className="mt-1 text-xs text-gray-600">O pagamento foi confirmado, mas o email ainda nao foi liberado automaticamente. O suporte deve revisar este pedido.</p>
                              </div>
                            )
                          }

                          return (
                            <div key={`${delivery.service_name}-${sale.id}`} className="rounded-md border border-blue-100 bg-blue-50 p-4 max-w-3xl">
                              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                                <div>
                                  <p className="text-sm font-semibold text-blue-800">Email temporario liberado</p>
                                  <p className="mt-1 text-xs text-blue-700">Use este email para receber o codigo em {delivery.service_name}.</p>
                                </div>
                                {delivery.email && (
                                  <Button
                                    type="button"
                                    onClick={() => handleCopyText(delivery.email || '', sale.id)}
                                    className="h-9 rounded-sm bg-white border border-blue-200 text-blue-800 hover:bg-blue-100 text-xs font-semibold"
                                  >
                                    {copiedSaleId === sale.id ? 'Copiado' : 'Copiar email'}
                                  </Button>
                                )}
                              </div>
                              <div className="mt-3 grid gap-2 text-xs md:grid-cols-2">
                                <p><span className="font-semibold text-blue-900">Servico:</span> {delivery.service_name}</p>
                                <p><span className="font-semibold text-blue-900">Dominio:</span> {delivery.domain || sale.temp_email_domain || 'Informado na entrega'}</p>
                                <p><span className="font-semibold text-blue-900">Email:</span> {delivery.email || 'Aguardando liberacao'}</p>
                                <p><span className="font-semibold text-blue-900">Codigo:</span> {delivery.code || 'Aguardando codigo'}</p>
                              </div>
                              {delivery.expires_at && <p className="mt-2 text-xs text-blue-700">Expira em {new Date(delivery.expires_at).toLocaleString('pt-BR')}</p>}
                            </div>
                          )
                        })}

                        {sale.product_id && new Date(sale.claim_until).getTime() <= Date.now() && (
                          <div className="rounded-md border border-gray-100 bg-white p-4 max-w-2xl">
                            {sale.product_reviews?.length ? (
                              <div>
                                <p className="text-sm font-semibold text-ml-dark">Voce ja avaliou este produto</p>
                                <div className="mt-2 flex text-[var(--layout-rating-color)]">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <Star key={star} className={`h-4 w-4 ${star <= Number(sale.product_reviews?.[0]?.rating ?? 0) ? 'fill-current' : ''}`} />
                                  ))}
                                </div>
                                {sale.product_reviews[0]?.body && <p className="mt-2 text-sm text-gray-600">{sale.product_reviews[0].body}</p>}
                              </div>
                            ) : (
                              <div className="space-y-3">
                                <div>
                                  <p className="text-sm font-semibold text-ml-dark">Avalie sua compra</p>
                                  <p className="text-xs text-gray-500">A nota por estrela e obrigatoria. O comentario e opcional.</p>
                                </div>
                                <div className="flex gap-1">
                                  {[1, 2, 3, 4, 5].map((star) => {
                                    const currentRating = reviewDrafts[sale.id]?.rating ?? 0
                                    return (
                                      <button
                                        key={star}
                                        type="button"
                                        onClick={() => setReviewDrafts((current) => ({ ...current, [sale.id]: { rating: star, body: current[sale.id]?.body ?? '' } }))}
                                        className="rounded-sm p-1 text-[var(--layout-rating-color)] transition hover:bg-yellow-50"
                                        aria-label={`${star} estrela${star > 1 ? 's' : ''}`}
                                      >
                                        <Star className={`h-6 w-6 ${star <= currentRating ? 'fill-current' : ''}`} />
                                      </button>
                                    )
                                  })}
                                </div>
                                <textarea
                                  value={reviewDrafts[sale.id]?.body ?? ''}
                                  onChange={(event) => setReviewDrafts((current) => ({ ...current, [sale.id]: { rating: current[sale.id]?.rating ?? 0, body: event.target.value } }))}
                                  rows={3}
                                  placeholder="Comentario opcional sobre o vendedor e o produto..."
                                  className="w-full resize-y rounded-sm border border-gray-200 p-3 text-sm outline-none focus:border-ml-blue"
                                />
                                {reviewMessage[sale.id] && (
                                  <p className={`text-sm ${reviewMessage[sale.id].includes('enviada') ? 'text-green-600' : 'text-red-600'}`}>{reviewMessage[sale.id]}</p>
                                )}
                                <Button
                                  type="button"
                                  onClick={() => handleSubmitReview(sale)}
                                  disabled={reviewingSaleId === sale.id}
                                  className="h-10 rounded-sm bg-ml-blue px-5 text-white hover:bg-ml-hover"
                                >
                                  {reviewingSaleId === sale.id ? 'Enviando...' : 'Enviar avaliacao'}
                                </Button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                    {sale.status === 'pending' && (
                      <Button
                        type="button"
                        onClick={() => setSaleToCancel(sale)}
                        disabled={cancelingSaleId === sale.id}
                        variant="outline"
                        className="h-9 px-3 rounded-sm border-gray-300 text-gray-600 hover:bg-gray-50 text-xs font-semibold flex items-center gap-2 mt-2"
                      >
                        <X className="w-4 h-4" />
                        {cancelingSaleId === sale.id ? 'Cancelando...' : 'Cancelar pedido'}
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          {sales.length === 0 && <p className="bg-white rounded-md p-8 text-center text-gray-500 shadow-sm">Nenhuma compra encontrada.</p>}
        </div>
      </div>

      <Dialog open={Boolean(saleToCancel)} onOpenChange={(open) => !open && setSaleToCancel(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-ml-dark">Cancelar pedido</DialogTitle>
            <DialogDescription>
              Este pedido vai ser removido da sua lista e o Pix pendente será descartado.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setSaleToCancel(null)}
              className="rounded-sm border-gray-300 text-gray-700"
            >
              Voltar
            </Button>
            <Button
              type="button"
              onClick={async () => {
                if (!saleToCancel) return
                const currentSale = saleToCancel
                setSaleToCancel(null)
                await handleCancel(currentSale)
              }}
              className="rounded-sm bg-red-600 text-white hover:bg-red-700"
            >
              Cancelar pedido
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={cleanupPromptOpen} onOpenChange={setCleanupPromptOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-ml-dark">Limpar pedidos sem Pix</DialogTitle>
            <DialogDescription>
              Remover pedidos pendentes sem código Pix gerado ainda.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setCleanupPromptOpen(false)}
              className="rounded-sm border-gray-300 text-gray-700"
            >
              Voltar
            </Button>
            <Button
              type="button"
              onClick={handleClearUnpaid}
              className="rounded-sm bg-ml-blue text-white hover:bg-ml-hover"
            >
              Confirmar limpeza
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </UserLayout>
  )
}
