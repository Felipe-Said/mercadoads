import React, { useEffect, useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { UserLayout } from '../../components/layouts/UserLayout'
import { CheckCircle2, Clock, Copy, Package, X, Download } from 'lucide-react'
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
                    <p className="text-ml-dark font-medium group-hover:text-ml-blue transition-colors">{sale.products?.title ?? 'Produto removido'}</p>
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
