import React, { useEffect, useState } from 'react'
import { UserLayout } from '../../components/layouts/UserLayout'
import { CheckCircle2, Copy, Package } from 'lucide-react'
import { Card, CardContent } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { formatCurrency, formatDate, getSales, type Sale } from '../../lib/data'
import { useAuth } from '../../contexts/AuthContext'

export function Compras() {
  const { user } = useAuth()
  const [sales, setSales] = useState<Sale[]>([])
  const [copiedSaleId, setCopiedSaleId] = useState<string | null>(null)

  useEffect(() => {
    if (!user) return
    getSales({ buyerId: user.id }).then(setSales).catch(console.error)
  }, [user])

  const handleCopy = async (sale: Sale) => {
    const value = sale.payment_qrcode_text || sale.payment_qrcode
    if (!value) return
    await navigator.clipboard.writeText(value)
    setCopiedSaleId(sale.id)
    setTimeout(() => setCopiedSaleId(null), 2000)
  }

  return (
    <UserLayout>
      <div className="space-y-6">
        <h2 className="text-xl font-light text-ml-dark mb-4">Minhas Compras</h2>

        <div className="space-y-4">
          {sales.map((sale) => (
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
