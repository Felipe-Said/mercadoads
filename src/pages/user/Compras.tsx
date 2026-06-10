import React, { useEffect, useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { UserLayout } from '../../components/layouts/UserLayout'
import { CheckCircle2, Clock, Copy, Package, X } from 'lucide-react'
import { Card, CardContent } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { supabase } from '../../lib/supabase'
import { formatCurrency, formatDate, getSales, type Sale } from '../../lib/data'
import { useAuth } from '../../contexts/AuthContext'

export function Compras() {
  const { user } = useAuth()
  const location = useLocation()
  const [sales, setSales] = useState<Sale[]>([])
  const [copiedSaleId, setCopiedSaleId] = useState<string | null>(null)
  const [cancelingSaleId, setCancelingSaleId] = useState<string | null>(null)

  const checkoutSaleIds = useMemo(() => {
    const state = location.state as { checkoutSaleIds?: string[] } | null
    return state?.checkoutSaleIds ?? []
  }, [location.state])

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
    if (!window.confirm('Cancelar este pedido?')) return

    setCancelingSaleId(sale.id)
    const { error } = await supabase
      .from('sales')
      .update({
        status: 'cancelled',
        payment_gateway: null,
        payment_external_ref: null,
        payment_transaction_id: null,
        payment_qrcode: null,
        payment_qrcode_text: null,
        payment_qrcode_expires_at: null,
        gateway_payload: null,
        paid_at: null,
        claim_until: null,
      })
      .eq('id', sale.id)
      .eq('buyer_id', user.id)

    if (error) {
      console.error(error)
    }

    await loadSales()
    setCancelingSaleId(null)
  }

  return (
    <UserLayout>
      <div className="space-y-6">
        <h2 className="text-xl font-light text-ml-dark mb-4">Minhas Compras</h2>

        {checkoutSaleIds.length > 0 && (
          <div className="rounded-md border border-blue-100 bg-blue-50 p-4 text-sm text-blue-700">
            Seu pedido foi gerado. Se o Pix ainda nao apareceu, a plataforma esta atualizando os dados agora.
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
                      <div className="rounded-md border border-yellow-100 bg-yellow-50 p-3 space-y-2 max-w-2xl">
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-sm font-semibold text-yellow-700">Pix aguardando pagamento</p>
                          <Button
                            type="button"
                            onClick={() => handleCopy(sale)}
                            className="h-8 px-3 rounded-sm bg-white border border-yellow-200 text-yellow-700 hover:bg-yellow-100 text-xs font-semibold flex items-center gap-2"
                          >
                            {copiedSaleId === sale.id ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                            {copiedSaleId === sale.id ? 'Copiado' : 'Copiar Pix'}
                          </Button>
                        </div>
                        <p className="break-all text-xs text-gray-700 font-mono">{sale.payment_qrcode_text || sale.payment_qrcode}</p>
                        {sale.payment_qrcode_expires_at && (
                          <p className="text-xs text-gray-500">
                            Expira em {new Date(sale.payment_qrcode_expires_at).toLocaleString('pt-BR')}
                          </p>
                        )}
                      </div>
                    )}
                    {sale.status === 'paid' && sale.claim_until && (
                      <div className="rounded-md border border-green-100 bg-green-50 p-3 max-w-2xl">
                        <p className="text-sm font-semibold text-green-700">Pedido confirmado</p>
                        <p className="text-xs text-gray-600 mt-1 flex items-center gap-2">
                          <Clock className="w-3 h-3" />
                          Cliente pode reclamar ate {new Date(sale.claim_until).toLocaleString('pt-BR')}.
                        </p>
                      </div>
                    )}
                    {sale.status === 'pending' && (
                      <Button
                        type="button"
                        onClick={() => handleCancel(sale)}
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
    </UserLayout>
  )
}
